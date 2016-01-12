// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include <sstream>
#include <string>

#include "src/v8.h"

#include "src/xdk-allocation.h"

#include "src/frames-inl.h"
#include "src/xdk-utils.h"

namespace v8 {
namespace internal {

static List<InfoToResolve>* g_la_list = NULL;
void XDKGCPrologueCallback(v8::Isolate*, GCType, GCCallbackFlags) {
  if (g_la_list) {
    g_la_list->Clear();
  }
}


XDKAllocationTracker::XDKAllocationTracker(HeapProfiler* heap_profiler,
                                           HeapObjectsMap *ids,
                                           StringsStorage *names,
                                           int stackDepth,
                                           bool collectRetention,
                                           bool strict_collection)
    : heap_profiler_(heap_profiler),
    ids_(ids),
    names_(names),
    stackDepth_(stackDepth),
    collectRetention_(collectRetention),
    strict_collection_(strict_collection),
    a_treshold_(50),
    a_current_(0) {
  references_ = new References();
  aggregated_chunks_ = new AggregatedChunks();
  runtime_info_ = new RuntimeInfo(aggregated_chunks_);
  symbols_ = new SymbolsStorage(ids_->heap(), names_);
  collectedStacks_ = new ShadowStack();
  classNames_ = new ClassNames(names_, ids_->heap());

  List<unsigned> stack_ooc;
  stack_ooc.Add(symbols_->registerSymInfo(1, "OutOfContext", "NoSource",
                                          0, 0));
  outOfContextFrame_ = collectedStacks_->registerStack(stack_ooc);

  List<unsigned> stack_abc;
  stack_abc.Add(symbols_->registerSymInfo(2, "AllocatedBeforeCollection",
                                          "NoSource", 0, 0));
  AllocatedBeforeCollectionFrame_ = collectedStacks_->registerStack(stack_abc);

  runtime_info_->InitABCFrame(AllocatedBeforeCollectionFrame_);

  baseTime_ = v8::base::Time::Now();
  latest_delta_ = 0;

  g_la_list = &this->latest_allocations_;
  v8::Isolate::GCCallback e =
      (v8::Isolate::GCCallback) &XDKGCPrologueCallback;
  ids_->heap()->AddGCPrologueCallback(e, kGCTypeAll, false);
}


XDKAllocationTracker::~XDKAllocationTracker() {
  delete collectedStacks_;
  delete classNames_;
  delete aggregated_chunks_;
  delete runtime_info_;
  delete symbols_;
  delete references_;
  g_la_list = NULL;
}


// Heap profiler regularly takes time for storing when object was allocated,
// deallocated, when object's retention snapshot was taken, etc
unsigned int XDKAllocationTracker::GetTimeDelta() {
  v8::base::TimeDelta td = v8::base::Time::Now() - baseTime_;
  return static_cast<unsigned int>(td.InMilliseconds());
}


void XDKAllocationTracker::OnAlloc(Address addr, int size) {
  DisallowHeapAllocation no_alloc;
  Heap *heap = ids_->heap();

  // below call saves from the crash during StackTraceFrameIterator creation
  // Mark the new block as FreeSpace to make sure the heap is iterable
  // while we are capturing stack trace.
  heap->CreateFillerObjectAt(addr, size);

  Isolate *isolate = heap->isolate();
  StackTraceFrameIterator it(isolate);
  List<unsigned> stack;

  // TODO(amalyshe): checking of isolate->handle_scope_data()->level is quite
  // artificial. need to understand when we can have such behaviour
  // if level == 0 we will crash in getting of source info
  while (isolate->handle_scope_data()->level && !it.done() &&
      stack.length() < stackDepth_) {
    JavaScriptFrame *frame = it.frame();
    if (!frame->function())
      break;
    SharedFunctionInfo *shared = frame->function()->shared();
    if (!shared)
      break;

    stack.Add(symbols_->FindOrRegisterFrame(frame));
    it.Advance();
  }

  unsigned sid;
  if (!stack.is_empty()) {
    sid = collectedStacks_->registerStack(stack);
  } else {
    sid = outOfContextFrame_;
  }

  latest_delta_ = GetTimeDelta();

  PostCollectedInfo* info = runtime_info_->AddPostCollectedInfo(addr,
                                                                latest_delta_);
  info->size_ = size;
  info->timeStamp_ = latest_delta_;
  info->stackId_ = sid;
  info->className_ = (unsigned int)-1;
  info->dirty_ = false;

  // init the type info for previous allocated object
  if (latest_allocations_.length() == a_treshold_) {
    // resolve next allocation to process
    InfoToResolve& allocation = latest_allocations_.at(a_current_);
    InitClassName(allocation.address_, allocation.info_);
    a_current_++;
    if (a_current_ >= a_treshold_) {
      a_current_ = 0;
    }
  }

  if (latest_allocations_.length() < a_treshold_) {
    InfoToResolve allocation;
    allocation.address_ = addr;
    allocation.info_ = info;
    latest_allocations_.Add(allocation);
  } else {
    unsigned allocation_to_update =
        a_current_ ? a_current_ - 1 : a_treshold_ - 1;
    InfoToResolve& allocation =
        latest_allocations_.at(allocation_to_update);
    allocation.address_ = addr;
    allocation.info_ = info;
  }
}


void XDKAllocationTracker::OnMove(Address from, Address to, int size) {
  DisallowHeapAllocation no_alloc;
  // look for the prev address
  PostCollectedInfo* info_from = runtime_info_->FindPostCollectedInfo(from);
  if (info_from == NULL) {
    return;
  }

  runtime_info_->AddPostCollectedInfo(to, latest_delta_, info_from);
  runtime_info_->RemoveInfo(from);
}


HeapEventXDK* XDKAllocationTracker::stopTracking() {
  std::string symbols, types, frames, chunks, retentions;
  SerializeChunk(&symbols, &types, &frames, &chunks, &retentions);
  CollectFreedObjects(true);
  std::string symbolsA, typesA, framesA, chunksA, retentionsA;
  SerializeChunk(&symbolsA, &typesA, &framesA, &chunksA, &retentionsA, true);

  // TODO(amalyshe): check who releases this object - new HeapEventXDK
  return (new HeapEventXDK(GetTimeDelta(), symbols+symbolsA, types+typesA,
      frames+framesA, chunks+chunksA, ""));
}


void XDKAllocationTracker::CollectFreedObjects(bool bAll, bool initPreCollect) {
  clearIndividualReteiners();
  if (collectRetention_) {
    XDKSnapshotFiller filler(ids_, names_, this);
    HeapSnapshotGenerator generator(heap_profiler_, NULL, NULL, NULL,
                                    ids_->heap(), &filler);
    generator.GenerateSnapshot();
  }

  Heap *heap = ids_->heap();
  if (!heap) {
    return;
  }

  unsigned int ts = GetTimeDelta();
  if (bAll) {
    ts += RETAINED_DELTA;
  }

  // CDT heap profiler calls CollectAllGarbage twice because after the first
  // pass there are weak retained object not collected, but due to perf issues
  // and because we do garbage collection regularly, we leave here only one call
  // only for strict collection like in test where we need to make sure that
  // object is definitely collected, we collect twice
  heap->CollectAllGarbage(
      Heap::kMakeHeapIterableMask,
      "XDKAllocationTracker::CollectFreedObjects");
  if (strict_collection_) {
    heap->CollectAllGarbage(
        Heap::kMakeHeapIterableMask,
        "XDKAllocationTracker::CollectFreedObjects");
  }
  std::map<Address, RefSet> individualReteiners;

  // TODO(amalyshe): check what DisallowHeapAllocation no_alloc means because in
  // standalone v8 this part is crashed if DisallowHeapAllocation is defined
  // DisallowHeapAllocation no_alloc;
  if (!bAll) {
    HeapIterator iterator(heap);
    HeapObject* obj = iterator.next();
    for (;
         obj != NULL;
         obj = iterator.next()) {
      Address addr = obj->address();

      PostCollectedInfo* info = runtime_info_->FindPostCollectedInfo(addr);
      if (!info) {
        // if we don't find info, we consider it as pre collection allocated
        // object. need to add to the full picture for retentions
        if (initPreCollect) {
          info = runtime_info_->AddPreCollectionInfo(addr, obj->Size());
        }
      }

      if (info) {
        info->dirty_ = true;
      }
      // check of the class name and its initialization
      if ((info && info->className_ == (unsigned)-1) || !info) {
        InitClassName(addr, ts, obj->Size());
      }
    }
  }

  if (collectRetention_) {
    std::map<Address, RefSet>::const_iterator citir =
        individualReteiners_.begin();
    while (citir != individualReteiners_.end()) {
      PostCollectedInfo* infoChild =
          runtime_info_->FindPostCollectedInfo(citir->first);
      if (infoChild) {
        RefId rfId;
        rfId.stackId_ = infoChild->stackId_;
        rfId.classId_ = infoChild->className_;

        references_->addReference(rfId, citir->second, infoChild->timeStamp_);
      }
      citir++;
    }
  }

  runtime_info_->CollectGarbaged(ts);
}


void XDKAllocationTracker::SerializeChunk(std::string* symbols,
                                          std::string* types,
                                          std::string* frames,
                                          std::string* chunks,
                                          std::string* retentions,
                                          bool final) {
  if (final) {
    *symbols = symbols_->SerializeChunk();
    *types = classNames_->SerializeChunk();
  }
  *frames = collectedStacks_->SerializeChunk();
  *chunks = aggregated_chunks_->SerializeChunk();

  *retentions = references_->serialize();
  std::stringstream retentionsT;
  retentionsT << GetTimeDelta() << std::endl << retentions->c_str();
  *retentions = retentionsT.str();
  references_->clear();
}


OutputStream::WriteResult XDKAllocationTracker::SendChunk(
    OutputStream* stream) {
  // go over all aggregated_ and send data to the stream
  std::string symbols, types, frames, chunks, retentions;
  SerializeChunk(&symbols, &types, &frames, &chunks, &retentions);

  OutputStream::WriteResult ret = stream->WriteHeapXDKChunk(
      symbols.c_str(), symbols.length(),
      frames.c_str(), frames.length(),
      types.c_str(), types.length(),
      chunks.c_str(), chunks.length(),
      retentions.c_str(), retentions.length());
  return ret;
}


unsigned XDKAllocationTracker::GetTraceNodeId(Address address) {
    PostCollectedInfo* info = runtime_info_->FindPostCollectedInfo(address);
    if (info) {
      return info->stackId_;
    } else {
      return AllocatedBeforeCollectionFrame_;
    }
}


void XDKAllocationTracker::clearIndividualReteiners() {
  individualReteiners_.clear();
}


std::map<Address, RefSet>* XDKAllocationTracker::GetIndividualReteiners() {
  return &individualReteiners_;
}


unsigned XDKAllocationTracker::FindClassName(Address address) {
  PostCollectedInfo* info = runtime_info_->FindPostCollectedInfo(address);
  if (info) {
    return info->className_;
  } else {
    return (unsigned)-1;
  }
}


unsigned XDKAllocationTracker::InitClassName(Address address,
                                             PostCollectedInfo* info) {
  if (info->className_ == (unsigned)-1) {
    info->className_ = classNames_->GetConstructorName(address, runtime_info_);
  }
  return info->className_;
}

unsigned XDKAllocationTracker::InitClassName(Address address, unsigned ts,
                                             unsigned size) {
  PostCollectedInfo* info = runtime_info_->FindPostCollectedInfo(address);
  if (!info) {
    info = runtime_info_->AddPostCollectedInfo(address, ts);
    info->className_ = -1;
    info->stackId_ = outOfContextFrame_;
    info->timeStamp_ = ts;
    info->size_ = size;
  }
  return InitClassName(address, info);
}


unsigned XDKAllocationTracker::FindOrInitClassName(Address address,
                                                   unsigned ts) {
  unsigned id = FindClassName(address);
  if (id == (unsigned)-1) {
    // TODO(amalyshe) check if 0 size here is appropriate
    id = InitClassName(address, ts, 0);
  }
  return id;
}


// -----------------------------------------------------------------------------
// this is almost a copy and duplication of
// V8HeapExplorer::AddEntry. refactoring is impossible because
// heap-snapshot-generator rely on it's structure which is not fully suitable
// for us.
HeapEntry* XDKSnapshotFiller::AddEntry(HeapThing ptr,
                                       HeapEntriesAllocator* allocator) {
  HeapObject* object = reinterpret_cast<HeapObject*>(ptr);
  if (object->IsJSFunction()) {
    JSFunction* func = JSFunction::cast(object);
    SharedFunctionInfo* shared = func->shared();
    const char* name = shared->bound() ? "native_bind" :
        names_->GetName(String::cast(shared->name()));
    return AddEntry(ptr, object, HeapEntry::kClosure, name);
  } else if (object->IsJSRegExp()) {
    JSRegExp* re = JSRegExp::cast(object);
    return AddEntry(ptr, object,
                    HeapEntry::kRegExp,
                    names_->GetName(re->Pattern()));
  } else if (object->IsJSObject()) {
    return AddEntry(ptr, object, HeapEntry::kObject, "");
  } else if (object->IsString()) {
    String* string = String::cast(object);
    if (string->IsConsString())
      return AddEntry(ptr, object,
                      HeapEntry::kConsString,
                      "(concatenated string)");
    if (string->IsSlicedString())
      return AddEntry(ptr, object,
                      HeapEntry::kSlicedString,
                      "(sliced string)");
    return AddEntry(ptr, object,
                    HeapEntry::kString,
                    names_->GetName(String::cast(object)));
  } else if (object->IsSymbol()) {
    return AddEntry(ptr, object, HeapEntry::kSymbol, "symbol");
  } else if (object->IsCode()) {
    return AddEntry(ptr, object, HeapEntry::kCode, "");
  } else if (object->IsSharedFunctionInfo()) {
    String* name = String::cast(SharedFunctionInfo::cast(object)->name());
    return AddEntry(ptr, object,
                    HeapEntry::kCode,
                    names_->GetName(name));
  } else if (object->IsScript()) {
    Object* name = Script::cast(object)->name();
    return AddEntry(ptr, object,
                    HeapEntry::kCode,
                    name->IsString()
                        ? names_->GetName(String::cast(name))
                        : "");
  } else if (object->IsNativeContext()) {
    return AddEntry(ptr, object, HeapEntry::kHidden, "system / NativeContext");
  } else if (object->IsContext()) {
    return AddEntry(ptr, object, HeapEntry::kObject, "system / Context");
  } else if (object->IsFixedArray() ||
             object->IsFixedDoubleArray() ||
             object->IsByteArray()) {
    return AddEntry(ptr, object, HeapEntry::kArray, "");
  } else if (object->IsHeapNumber()) {
    return AddEntry(ptr, object, HeapEntry::kHeapNumber, "number");
  }

  return AddEntry(ptr, object, HeapEntry::kHidden, "system / NOT SUPORTED YET");
}


HeapEntry* XDKSnapshotFiller::AddEntry(HeapThing thing,
                    HeapObject* object,
                    HeapEntry::Type type,
                    const char* name) {
  Address address = object->address();
  unsigned trace_node_id = 0;
  trace_node_id = allocation_tracker_->GetTraceNodeId(address);

  // cannot store pointer in the map because List reallcoates content regularly
  // and the only  one way to find the entry - by index. so, index is cached in
  // the map
  // TODO(amalyshe): need to reuse type. it seems it is important
  HeapEntry entry(NULL, &heap_entries_list_, type, name, 0, 0,
                  trace_node_id);
  heap_entries_list_.Add(entry);
  HeapEntry* pEntry = &heap_entries_list_.last();

  HashMap::Entry* cache_entry =
      heap_entries_.LookupOrInsert(thing, Hash(thing));
  DCHECK(cache_entry->value == NULL);
  int index = pEntry->index();
  cache_entry->value = reinterpret_cast<void*>(static_cast<intptr_t>(index));

  // TODO(amalyshe): it seems this storage might be optimized
  HashMap::Entry* address_entry = index_to_address_.LookupOrInsert(
      reinterpret_cast<void*>(index+1), HashInt(index+1));
  address_entry->value = reinterpret_cast<void*>(address);

  return pEntry;
}


HeapEntry* XDKSnapshotFiller::FindEntry(HeapThing thing) {
  HashMap::Entry* cache_entry = heap_entries_.Lookup(thing, Hash(thing));
  if (cache_entry == NULL) return NULL;
  return &heap_entries_list_[static_cast<int>(
      reinterpret_cast<intptr_t>(cache_entry->value))];
}


HeapEntry* XDKSnapshotFiller::FindOrAddEntry(HeapThing ptr,
                                             HeapEntriesAllocator* allocator) {
  HeapEntry* entry = FindEntry(ptr);
  return entry != NULL ? entry : AddEntry(ptr, allocator);
}


void XDKSnapshotFiller::SetIndexedReference(HeapGraphEdge::Type type,
    int parent,
    int index,
    HeapEntry* child_entry) {
  if (child_entry->trace_node_id() < 3) {
    return;
  }
  HashMap::Entry* address_entry_child = index_to_address_.Lookup(
      reinterpret_cast<void*>(child_entry->index()+1),
      HashInt(child_entry->index()+1));
  DCHECK(address_entry_child != NULL);
  if (!address_entry_child) {
    return;
  }

  Address child_addr = reinterpret_cast<Address>(address_entry_child->value);

  std::map<Address, RefSet>* individualReteiners =
      allocation_tracker_->GetIndividualReteiners();
  // get the parent's address, constructor name and form the RefId
  HashMap::Entry* address_entry = index_to_address_.Lookup(
      reinterpret_cast<void*>(parent+1), HashInt(parent+1));
  DCHECK(address_entry != NULL);
  if (!address_entry) {
    return;
  }
  HeapEntry* parent_entry = &(heap_entries_list_[parent]);
  Address parent_addr = reinterpret_cast<Address>(address_entry->value);
  RefId parent_ref_id;
  parent_ref_id.stackId_ = parent_entry->trace_node_id();
  parent_ref_id.classId_ =
      allocation_tracker_->FindOrInitClassName(parent_addr, 0);

  std::stringstream str;
  str << index << " element in Array";
  parent_ref_id.field_ = str.str();

  (*individualReteiners)[child_addr].references_.insert(parent_ref_id);
}


void XDKSnapshotFiller::SetIndexedAutoIndexReference(HeapGraphEdge::Type type,
    int parent,
    HeapEntry* child_entry) {
}


void XDKSnapshotFiller::SetNamedReference(HeapGraphEdge::Type type,
    int parent,
    const char* reference_name,
    HeapEntry* child_entry) {
  if (child_entry->trace_node_id() < 3) {
    return;
  }

  std::map<Address, RefSet>* individualReteiners =
      allocation_tracker_->GetIndividualReteiners();
  // get the parent's address, constructor name and form the RefId
  HashMap::Entry* address_entry = index_to_address_.Lookup(
      reinterpret_cast<void*>(parent+1), HashInt(parent+1));
  DCHECK(address_entry != NULL);
  if (!address_entry) {
    return;
  }
  HeapEntry* parent_entry = &(heap_entries_list_[parent]);
  Address parent_addr = reinterpret_cast<Address>(address_entry->value);
  RefId parent_ref_id;
  parent_ref_id.stackId_ = parent_entry->trace_node_id();
  // TODO(amalyshe): need to get access to classNames_
  parent_ref_id.classId_ =
      allocation_tracker_->FindOrInitClassName(parent_addr, 0);
  parent_ref_id.field_ = reference_name;

  HashMap::Entry* address_entry_child = index_to_address_.Lookup(
      reinterpret_cast<void*>(child_entry->index()+1),
      HashInt(child_entry->index()+1));
  DCHECK(address_entry_child != NULL);
  if (!address_entry_child) {
    return;
  }
  Address child_addr = reinterpret_cast<Address>(address_entry_child->value);

  (*individualReteiners)[child_addr].references_.insert(parent_ref_id);
}


void XDKSnapshotFiller::SetNamedAutoIndexReference(HeapGraphEdge::Type type,
                                int parent,
                                HeapEntry* child_entry) {
}

}  // namespace internal

}  // namespace v8
