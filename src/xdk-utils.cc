// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/v8.h"

#include "src/frames-inl.h"
#include "src/strings-storage.h"
#include "src/xdk-utils.h"

namespace v8 {
namespace internal {

static bool AddressesMatch(void* key1, void* key2) {
  return key1 == key2;
}


static uint32_t CharAddressHash(char* addr) {
  return ComputeIntegerHash(static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(addr)),
      v8::internal::kZeroHashSeed);
}


static uint32_t AddressHash(Address addr) {
  return ComputeIntegerHash(static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(addr)),
      v8::internal::kZeroHashSeed);
}


ClassNames::ClassNames(StringsStorage* names, Heap* heap)
    : counter_(0),
    char_to_idx_(AddressesMatch),
    names_(names),
    heap_(heap) {
  id_native_bind_ = registerName(names->GetCopy("native_bind"));
  id_conc_string_ = registerName(names->GetCopy("(concatenated string)"));
  id_sliced_string_ = registerName(names->GetCopy("(sliced string)"));
  id_string_ = registerName(names->GetCopy("String"));
  id_symbol_ = registerName(names->GetCopy("(symbol)"));
  id_code_ = registerName(names->GetCopy("(compiled code)"));
  id_system_ncontext_ =
      registerName(names->GetCopy("(system / NativeContext)"));
  id_system_context_ = registerName(names->GetCopy("(system / Context)"));
  id_array_ = registerName(names->GetCopy("(array)"));
  id_number_ = registerName(names->GetCopy("(number)"));
  id_system_ = registerName(names->GetCopy("(system)"));
  id_shared_fi_ = registerName(names->GetCopy("(shared function info)"));
  id_script_ = registerName(names->GetCopy("(script)"));
  id_regexp_ = registerName(names->GetCopy("RegExp"));
  id_function_bindings_ =
      registerName(names->GetCopy("(function bindings)"));
  id_function_literals_ = registerName(names->GetCopy("(function literals)"));
  id_objects_properties_ = registerName(names->GetCopy("(object properties)"));
  id_objects_elements_ = registerName(names->GetCopy("(object elements)"));
  id_shared_function_info_ =
      registerName(names->GetCopy("(shared function info)"));
  id_context_ = registerName(names->GetCopy("(context)"));
  id_code_relocation_info_ =
      registerName(names->GetCopy("(code relocation info)"));
  id_code_deopt_data_ = registerName(names->GetCopy("(code deopt data)"));
}


unsigned ClassNames::registerName(const char* name) {
  // since const char is retained outside and cannot be moved, we rely on this
  // and just compare the pointers. It should be enough for the strings from the
  // only one StringStorage
  if (!name) {
    return -2;
  }

  unsigned counter;
  HashMap::Entry* entry = char_to_idx_.LookupOrInsert(const_cast<char*>(name),
      CharAddressHash(const_cast<char*>(name)));
  if (entry->value == NULL) {
    counter = ++counter_;
    entry->value = reinterpret_cast<void*>(counter);
  } else {
    counter = static_cast<unsigned>(reinterpret_cast<uintptr_t>(entry->value));
  }
  return counter;
}


std::string ClassNames::SerializeChunk() {
  std::stringstream serialized;
  for (HashMap::Entry* p = char_to_idx_.Start(); p != NULL;
      p = char_to_idx_.Next(p)) {
    serialized << static_cast<unsigned>(
        reinterpret_cast<uintptr_t>(p->value)) << "," <<
        reinterpret_cast<char*>(p->key) << std::endl;
  }

  return serialized.str();
}


bool ClassNames::IsEssentialObject(Object* object) {
  return object->IsHeapObject()
      && !object->IsOddball()
      && object != heap_->empty_byte_array()
      && object != heap_->empty_fixed_array()
      && object != heap_->empty_descriptor_array()
      && object != heap_->fixed_array_map()
      && object != heap_->cell_map()
      && object != heap_->global_property_cell_map()
      && object != heap_->shared_function_info_map()
      && object != heap_->free_space_map()
      && object != heap_->one_pointer_filler_map()
      && object != heap_->two_pointer_filler_map();
}


void ClassNames::registerNameForDependent(HeapObject* object,
                                          RuntimeInfo* runtime_info,
                                          unsigned id) {
  if (object && IsEssentialObject(object)) {
    PostCollectedInfo* info =
      runtime_info->FindPostCollectedInfo(object->address());
    // TODO(amalyshe) here we are loosing some information because
    // *some* of the objects are allocated without notification of explicit
    // allocation and no XDKAllocationTracker::OnAlloc will be called for them.
    // But these objects exist in the heap and can be achieved if we iterate
    // through the heap. We cannot add here them explicitly because if
    // XDKAllocationTracker::OnAlloc is called for this address, it will remove
    // all useful information about type and even report wrong data because
    // during removal these objects will be added to statistic and will be
    // counted twice
    if (info) {
      info->className_ = id;
    }
  }
}

unsigned ClassNames::GetConstructorName(Address address,
                                           RuntimeInfo* runtime_info) {
  unsigned id = (unsigned)-2;
  HeapObject* heap_object = HeapObject::FromAddress(address);

  // support of all type, if some are built-in, we add hard-coded values
  if (heap_object->IsJSObject()) {
    JSObject* object = JSObject::cast(heap_object);
    if (object->IsJSFunction()) {
      Heap* heap = object->GetHeap();
      const char* name = names_->GetName(String::cast(heap->closure_string()));
      id = registerName(name);
      JSFunction* js_fun = JSFunction::cast(object);
      SharedFunctionInfo* shared_info = js_fun->shared();
      bool bound = shared_info->bound();
      HeapObject* obj = js_fun->literals_or_bindings();
      unsigned lob_id = bound ? id_function_bindings_ : id_function_literals_;
      registerNameForDependent(obj, runtime_info, lob_id);
      registerNameForDependent(shared_info, runtime_info,
                               id_shared_function_info_);
      registerNameForDependent(js_fun->context(), runtime_info,
                               id_context_);
    } else {
      const char* name = names_->GetName(object->constructor_name());
      id = registerName(name);
    }
    HeapObject* prop = reinterpret_cast<HeapObject*>(object->properties());
    registerNameForDependent(prop, runtime_info, id_objects_properties_);
    HeapObject* elements = reinterpret_cast<HeapObject*>(object->elements());
    registerNameForDependent(elements, runtime_info, id_objects_elements_);
  } else if (heap_object->IsJSFunction()) {
    JSFunction* func = JSFunction::cast(heap_object);
    SharedFunctionInfo* shared = func->shared();
    id = shared->bound() ? id_native_bind_ :
        registerName(names_->GetName(String::cast(shared->name())));
  } else if (heap_object->IsJSRegExp()) {
      id = id_regexp_;
  } else if (heap_object->IsString()) {
    String* string = String::cast(heap_object);
    if (string->IsConsString())
      id = id_conc_string_;
    else if (string->IsSlicedString())
      id = id_sliced_string_;
    else
      id = id_string_;
  } else if (heap_object->IsSymbol()) {
    id = id_symbol_;
  } else if (heap_object->IsCode()) {
    Code* code = Code::cast(heap_object);
    registerNameForDependent(code->relocation_info(), runtime_info,
                               id_code_relocation_info_);
    registerNameForDependent(code->deoptimization_data(), runtime_info,
                               id_code_deopt_data_);
    id = id_code_;
  } else if (heap_object->IsSharedFunctionInfo()) {
      id = id_shared_fi_;
  } else if (heap_object->IsScript()) {
    id = id_script_;
  } else if (heap_object->IsNativeContext()) {
    id = id_system_ncontext_;
  } else if (heap_object->IsContext()) {
    id = id_system_context_;
  } else if (heap_object->IsFixedArray() ||
             heap_object->IsFixedDoubleArray() ||
             heap_object->IsByteArray()) {
    id = id_array_;
  } else if (heap_object->IsHeapNumber()) {
    id = id_number_;
  } else {
    id = id_system_;
  }

  return id;
}


// -----------------------------------------------------------------------------
ShadowStack::ShadowStack() {
  last_index_ = 1;
  serializedCounter_ = last_index_;
  root_.index_ = 0;
  root_.parent_ = NULL;
  root_.callsite_ = 0;
}


ShadowStack::~ShadowStack() {
  // erasing all objects from the current container
  std::map<unsigned, CallTree*>::iterator eit = allNodes_.begin();
  while (eit != allNodes_.end()) {
    delete eit->second;
    eit++;
  }
}


unsigned ShadowStack::registerStack(const List<unsigned>& shadow_stack_) {
    // look for the latest node
    CallTree* pNode = &root_;
    // go over all entries and add them to the tree if they are not in the map
    int i, j;
    for (i = shadow_stack_.length()-1; i != -1; i--) {
      std::map<unsigned, CallTree*>::iterator it =
          pNode->children_.find(shadow_stack_[i]);
      if (it == pNode->children_.end())
          break;
      pNode = it->second;
    }
    // verification if we need to add something or not
    for (j = i; j != -1; j--) {
      CallTree* pNodeTmp = new CallTree;
      pNodeTmp->index_ = last_index_++;
      pNodeTmp->parent_ = pNode;
      pNodeTmp->callsite_ = shadow_stack_[j];
      pNode->children_[shadow_stack_[j]] = pNodeTmp;
      allNodes_[pNodeTmp->index_] = pNodeTmp;
      pNode = pNodeTmp;
    }
    return pNode->index_;
}


std::string ShadowStack::SerializeChunk() {
  std::stringstream str;
  std::map<unsigned, CallTree*>::iterator it =
      allNodes_.find(serializedCounter_);
  while (it!= allNodes_.end()) {
    str << it->first << "," << it->second->callsite_ << "," <<
        it->second->parent_->index_ << std::endl;
    it++;
  }

  serializedCounter_ = last_index_;
  return str.str();
}


// -----------------------------------------------------------------------------
static bool SymInfoMatch(void* key1, void* key2) {
  SymInfoKey* key_c1 = reinterpret_cast<SymInfoKey*>(key1);
  SymInfoKey* key_c2 = reinterpret_cast<SymInfoKey*>(key2);
  return *key_c1 == *key_c2;
}


static uint32_t SymInfoHash(const SymInfoKey& key) {
  uint32_t hash = 0;
  // take the low 16 bits of function_id_
  hash |= (key.function_id_ & 0xffff);
  // take the low 8 bits of line_ and column_ and init highest bits
  hash |= ((key.line_ & 0xff) << 16);
  hash |= ((key.column_ & 0xff) << 14);

  return hash;
}


struct SymbolCached {
  unsigned int symbol_id_;
  uintptr_t function_;
};


SymbolsStorage::SymbolsStorage(Heap* heap, StringsStorage* names) :
  symbols_(SymInfoMatch),
  curSym_(1),
  sym_info_hash_(AddressesMatch),
  heap_(heap),
  names_(names) {
  reserved_key_ = new SymInfoKey();
}


SymbolsStorage::~SymbolsStorage() {
  // go over map and delete all keys and values
  for (HashMap::Entry* p = symbols_.Start(); p != NULL; p = symbols_.Next(p)) {
    delete reinterpret_cast<SymInfoValue*>(p->value);
    delete reinterpret_cast<SymInfoKey*>(p->key);
  }
  delete reserved_key_;
}


unsigned SymbolsStorage::registerSymInfo(size_t functionId,
                                         std::string functionName,
                                         std::string sourceName,
                                         unsigned line,
                                         unsigned column) {
  if (sourceName.empty()) {
    sourceName = "unknown";
  }

  reserved_key_->function_id_ = functionId;
  reserved_key_->line_ = line;
  reserved_key_->column_ = column;

  HashMap::Entry* entry = symbols_.LookupOrInsert(reserved_key_,
                                          SymInfoHash(*reserved_key_));
  if (entry->value) {
    return reinterpret_cast<SymInfoValue*>(entry->value)->symId_;
  }

  // else initialize by new one
  SymInfoValue* value = new SymInfoValue;
  value->symId_ = curSym_++;
  value->funcName_ = functionName;
  value->sourceFile_ = sourceName;
  entry->value = value;

  // compensation for registered one
  reserved_key_ = new SymInfoKey();

  return value->symId_;
}


std::string SymbolsStorage::SerializeChunk() {
  std::stringstream serialized;
  for (HashMap::Entry* p = symbols_.Start(); p != NULL; p = symbols_.Next(p)) {
    SymInfoValue* v = reinterpret_cast<SymInfoValue*>(p->value);
    SymInfoKey* k = reinterpret_cast<SymInfoKey*>(p->key);
    serialized << v->symId_ << "," << k->function_id_ << "," <<
        v->funcName_ << "," << v->sourceFile_ << "," <<
        k->line_ << "," << k->column_ << std::endl;
  }

  return serialized.str();
}


unsigned SymbolsStorage::FindOrRegisterFrame(JavaScriptFrame* frame) {
  SharedFunctionInfo *shared = frame->function()->shared();
  DCHECK(shared);
  Isolate *isolate = heap_->isolate();

  Address pc = frame->pc();
  unsigned int symbolId = 0;

  // We don't rely on the address only. Since this is JIT based language,
  // the address might be occupied by other function
  // thus we are verifying if the same function takes this place
  // before we take symbol info from the cache
  HashMap::Entry* sym_entry = sym_info_hash_.LookupOrInsert(
          reinterpret_cast<void*>(pc), AddressHash(pc));
  if (sym_entry->value == NULL ||
      (reinterpret_cast<SymbolCached*>(sym_entry->value)->function_ !=
        reinterpret_cast<uintptr_t>(frame->function()))) {
    if (sym_entry->value) {
      delete reinterpret_cast<SymbolCached*>(sym_entry->value);
    }

    const char *s = names_->GetFunctionName(shared->DebugName());
    // trying to get the source name and line#
    Code *code = Code::cast(isolate->FindCodeObject(pc));
    if (code) {
      int source_pos = code->SourcePosition(pc);
      Object *maybe_script = shared->script();
      if (maybe_script && maybe_script->IsScript()) {
        Handle<Script> script(Script::cast(maybe_script));
        if (!script.is_null()) {
          int line = script->GetLineNumber(source_pos) + 1;
          // TODO(amalyshe): check if this can be used:
          // int line = GetScriptLineNumberSafe(script, source_pos) + 1;
          // TODO(amalyshe): add column number getting
          int column = 0;  // GetScriptColumnNumber(script, source_pos);
          Object *script_name_raw = script->name();
          if (script_name_raw->IsString()) {
            String *script_name = String::cast(script->name());
            base::SmartArrayPointer<char> c_script_name =
              script_name->ToCString(DISALLOW_NULLS, ROBUST_STRING_TRAVERSAL);
            symbolId = registerSymInfo((size_t)frame->function(), s,
                                       c_script_name.get(), line, column);
          }
        }
      }
    }
    if (symbolId == 0) {
      symbolId = registerSymInfo((size_t)frame->function(), s, "", 0, 0);
    }

    SymbolCached* symCached = new SymbolCached;
    symCached->function_ = reinterpret_cast<uintptr_t>(frame->function());
    symCached->symbol_id_ = symbolId;
    sym_entry->value = symCached;
  } else {
    symbolId = reinterpret_cast<SymbolCached*>(sym_entry->value)->symbol_id_;
  }
  return symbolId;
}


// -----------------------------------------------------------------------------
RuntimeInfo::RuntimeInfo(AggregatedChunks* aggregated_chunks):
  working_set_hash_(AddressesMatch),
  aggregated_chunks_(aggregated_chunks),
  AllocatedBeforeCollectionFrame_(0) {
}


PostCollectedInfo* RuntimeInfo::FindPostCollectedInfo(Address addr) {
  HashMap::Entry* entry = working_set_hash_.Lookup(
          reinterpret_cast<void*>(addr), AddressHash(addr));
  if (entry && entry->value) {
    PostCollectedInfo* info =
        reinterpret_cast<PostCollectedInfo*>(entry->value);
    return info;
  }
  return NULL;
}


PostCollectedInfo* RuntimeInfo::AddPostCollectedInfo(Address addr,
                                                    unsigned time_delta,
                                                    PostCollectedInfo* info) {
  PostCollectedInfo* info_new = NULL;
  if (!info) {
    info_new = new PostCollectedInfo;
  } else {
    info_new = info;
  }

  HashMap::Entry* entry = working_set_hash_.LookupOrInsert(
          reinterpret_cast<void*>(addr), AddressHash(addr));
  DCHECK(entry);
  if (entry->value != NULL) {
    // compensation of the wrong deallocation place
    // we were not able to work the GC epilogue callback because GC is not
    // iteratable in the prologue
    // thus we need to mark the object as freed
    PostCollectedInfo* info_old =
        static_cast<PostCollectedInfo*>(entry->value);
    aggregated_chunks_->addObjectToAggregated(info_old, time_delta);
    delete info_old;
  }

  entry->value = info_new;
  return info_new;
}


PostCollectedInfo* RuntimeInfo::AddPreCollectionInfo(Address addr,
                                                     unsigned size) {
  PostCollectedInfo* info = AddPostCollectedInfo(addr);
  info->size_ = size;
  info->timeStamp_ = 0;
  info->stackId_ = AllocatedBeforeCollectionFrame_;
  info->className_ = (unsigned)-1;
  return info;
}


void RuntimeInfo::RemoveInfo(Address addr) {
  working_set_hash_.Remove(reinterpret_cast<void*>(addr), AddressHash(addr));
}


void RuntimeInfo::InitABCFrame(unsigned abc_frame) {
  AllocatedBeforeCollectionFrame_ = abc_frame;
}


void RuntimeInfo::CollectGarbaged(unsigned ts) {
  // iteration over the working_set_hash_
  for (HashMap::Entry* p = working_set_hash_.Start(); p != NULL;
      p = working_set_hash_.Next(p)) {
    if (p->value) {
      PostCollectedInfo* info = static_cast<PostCollectedInfo*>(p->value);
      if (info->dirty_ == false) {
        // need to care of allocated during collection.
        // if timeStamp_ == 0 this object was allocated before collection
        // and we don't care of it
        aggregated_chunks_->addObjectToAggregated(info, ts);
        delete info;
        p->value = NULL;
      } else {
        info->dirty_ = false;
      }
    }
  }
}


//------------------------------------------------------------------------------
static bool AggregatedMatch(void* key1, void* key2) {
  // cast to the AggregatedKey
  AggregatedKey* key_c1 = reinterpret_cast<AggregatedKey*>(key1);
  AggregatedKey* key_c2 = reinterpret_cast<AggregatedKey*>(key2);
  return *key_c1 == *key_c2;
}


static uint32_t AggregatedHash(const AggregatedKey& key) {
  uint32_t hash = 0;
  // take the low 8 bits of stackId_
  hash |= (key.stackId_ & 0xff);
  // take the low 8 bits of classId_ and init hash from 8th to 15th bits
  hash |= ((key.classId_ & 0xff) << 8);
  // since times are well graduated it's no sense take the lowest 8 bit
  // instead this we will move to 3 bits and only then take 8 bits
  hash |= (((key.tsBegin_ >> 3) & 0xff) << 16);
  hash |= (((key.tsBegin_ >> 3) & 0xff) << 24);
  return hash;
}


AggregatedChunks::AggregatedChunks() :
  aggregated_map_(AggregatedMatch),
  bucketSize_(500) {
  reserved_key_ = new AggregatedKey();
}


AggregatedChunks::~AggregatedChunks() {
  delete reserved_key_;
}


void AggregatedChunks::addObjectToAggregated(PostCollectedInfo* info,
                                                        unsigned td) {
  reserved_key_->stackId_ = info->stackId_;
  reserved_key_->classId_ = info->className_;
  // get the bucket for the first time
  reserved_key_->tsBegin_ = info->timeStamp_ - (info->timeStamp_ % bucketSize_);
  reserved_key_->tsEnd_ = td - (td % bucketSize_);

  HashMap::Entry* aggregated_entry =
      aggregated_map_.LookupOrInsert(reserved_key_,
                                     AggregatedHash(*reserved_key_));
  if (aggregated_entry->value) {
    // no need to store the latest record in the aggregated_keys_list_
    AggregatedValue* value =
                reinterpret_cast<AggregatedValue*>(aggregated_entry->value);
    value->objects_++;
    value->size_ += info->size_;
  } else {
    reserved_key_ = new AggregatedKey;
    AggregatedValue* value = new AggregatedValue;
    value->objects_ = 1;
    value->size_ = info->size_;
    aggregated_entry->value = value;
  }
}


std::string AggregatedChunks::SerializeChunk() {
  std::stringstream schunks;
  for (HashMap::Entry* p = aggregated_map_.Start(); p != NULL;
      p = aggregated_map_.Next(p)) {
    if (p->key && p->value) {
      AggregatedKey* key = reinterpret_cast<AggregatedKey*>(p->key);
      AggregatedValue* value = reinterpret_cast<AggregatedValue*>(p->value);
      schunks <<
        key->tsBegin_ << "," << key->tsEnd_ << "," <<
        key->stackId_ << "," << key->classId_ << "," <<
        value->size_ << "," << value->objects_ << std::endl;
      delete key;
      delete value;
    }
  }

  aggregated_map_.Clear();

  return schunks.str();
}


// -----------------------------------------------------------------------------
void References::addReference(const RefId& parent, const RefSet& refSet,
                               int parentTime) {
  // looking for the parent in the refMap_
  PARENTREFMAP::iterator cit = refMap_.find(parent);
  if (cit != refMap_.end()) {
    REFERENCESETS& sets = cit->second;
    REFERENCESETS::iterator it = sets.find(refSet);
    if (it != sets.end()) {
      // look for the time
      TIMETOCOUNT::iterator cittc = it->second.find(parentTime);
      if (cittc != it->second.end()) {
        cittc->second++;
      } else {
        it->second[parentTime] = 1;
      }
    } else {
      TIMETOCOUNT tc;
      tc[parentTime] = 1;
      sets[refSet] = tc;
    }
  } else {
    // adding new parent, new sets
    REFERENCESETS sets;
    TIMETOCOUNT tc;
    tc[parentTime] = 1;
    sets[refSet] = tc;
    refMap_[parent] = sets;
  }
}


void References::clear() {
  refMap_.clear();
}


std::string References::serialize() const {
  std::stringstream str;
  PARENTREFMAP::const_iterator citrefs = refMap_.begin();
  while (citrefs != refMap_.end()) {
    REFERENCESETS::const_iterator citsets = citrefs->second.begin();
    while (citsets != citrefs->second.end()) {
      str << citrefs->first.stackId_ << "," << citrefs->first.classId_;
      // output of length, and content of TIMETOCOUNT
      str << "," << citsets->second.size();
      TIMETOCOUNT::const_iterator cittc = citsets->second.begin();
      while (cittc != citsets->second.end()) {
        str << "," << cittc->first << "," << cittc->second;
        cittc++;
      }
      REFERENCESET::const_iterator citset = citsets->first.references_.begin();
      while (citset != citsets->first.references_.end()) {
        str << "," << citset->stackId_ << "," << citset->classId_<< "," <<
          citset->field_;
        citset++;
      }
      str << std::endl;
      citsets++;
    }
    citrefs++;
  }
  return str.str();
}


} }  // namespace v8::internal
