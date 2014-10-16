// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_XDK_ALLOCATION_H_
#define V8_XDK_ALLOCATION_H_

#include <map>
#include <string>
#include "src/base/platform/time.h"
#include "src/heap-snapshot-generator-inl.h"

namespace v8 {
namespace internal {

class HeapObjectsMap;
class HeapEventXDK;
class ClassNames;
class ShadowStack;
class SymbolsStorage;
class AggregatedChunks;
class RuntimeInfo;
class References;
struct RefSet;
struct PostCollectedInfo;


class XDKSnapshotFiller: public SnapshotFiller {
 public:
  explicit XDKSnapshotFiller(HeapObjectsMap* heap_object_map,
                             StringsStorage* names,
                             XDKAllocationTracker* allocation_tracker)
      : names_(names),
      allocation_tracker_(allocation_tracker),
      heap_entries_(HashMap::PointersMatch),
      index_to_address_(HashMap::PointersMatch) {}
  virtual ~XDKSnapshotFiller() {}

  HeapEntry* AddEntry(HeapThing ptr, HeapEntriesAllocator* allocator);
  HeapEntry* FindEntry(HeapThing thing);
  HeapEntry* FindOrAddEntry(HeapThing ptr, HeapEntriesAllocator* allocator);
  void SetIndexedReference(HeapGraphEdge::Type type,
                           int parent,
                           int index,
                           HeapEntry* child_entry);
  void SetIndexedAutoIndexReference(HeapGraphEdge::Type type,
                                    int parent,
                                    HeapEntry* child_entry);
  void SetNamedReference(HeapGraphEdge::Type type,
                         int parent,
                         const char* reference_name,
                         HeapEntry* child_entry);
  void SetNamedAutoIndexReference(HeapGraphEdge::Type type,
                                  int parent,
                                  HeapEntry* child_entry);

 private:
  StringsStorage* names_;
  XDKAllocationTracker* allocation_tracker_;
  HashMap heap_entries_;
  HashMap index_to_address_;


  List<HeapEntry> heap_entries_list_;

  HeapEntry* AddEntry(HeapThing thing,
                      HeapObject* object,
                      HeapEntry::Type type,
                      const char* name);

  static uint32_t Hash(HeapThing thing) {
    return ComputeIntegerHash(
        static_cast<uint32_t>(reinterpret_cast<uintptr_t>(thing)),
        v8::internal::kZeroHashSeed);
  }
  static uint32_t HashInt(int key) {
    return ComputeIntegerHash(key, v8::internal::kZeroHashSeed);
  }
};


struct InfoToResolve {
  Address address_;
  PostCollectedInfo* info_;
};


class XDKAllocationTracker {
 public:
  XDKAllocationTracker(HeapProfiler* heap_profiler,
                       HeapObjectsMap* ids,
                       StringsStorage* names,
                       int stackDepth,
                       bool collectRetention,
                       bool strict_collection);
  ~XDKAllocationTracker();

  void OnAlloc(Address addr, int size);
  void OnMove(Address from, Address to, int size);
  void CollectFreedObjects(bool bAll = false, bool initPreCollect = false);
  HeapEventXDK* stopTracking();
  OutputStream::WriteResult  SendChunk(OutputStream* stream);
  unsigned GetTraceNodeId(Address address);
  void clearIndividualReteiners();
  std::map<Address, RefSet>* GetIndividualReteiners();

  unsigned FindOrInitClassName(Address address, unsigned ts);

 private:
  static const int RETAINED_DELTA = 1000;

  // external object
  HeapProfiler* heap_profiler_;
  HeapObjectsMap* ids_;
  StringsStorage* names_;

  AggregatedChunks* aggregated_chunks_;
  RuntimeInfo* runtime_info_;
  void SerializeChunk(std::string* symbols, std::string* types,
                      std::string* frames, std::string* chunks,
                      std::string* retentions, bool final = false);

  unsigned FindClassName(Address address);
  unsigned InitClassName(Address address, unsigned ts, unsigned size);
  unsigned InitClassName(Address address, PostCollectedInfo* info);

  SymbolsStorage* symbols_;
  ShadowStack* collectedStacks_;
  ClassNames* classNames_;

  unsigned outOfContextFrame_;
  unsigned AllocatedBeforeCollectionFrame_;

  v8::base::Time baseTime_;
  unsigned latest_delta_;
  unsigned int GetTimeDelta();

  int stackDepth_;
  bool collectRetention_;
  bool strict_collection_;
  References* references_;
  std::map<Address, RefSet> individualReteiners_;

  // here is a loop container which stores the elements not more than
  // a_treshold_ and when the capacity is reduced we start
  // 1. resolve the a_current_ object's types
  // 2. store new allocated object to the a_current_ position
  // increas a_current_ until a_treshold_. At the moment when it reach the
  // a_treshold_, a_current_ is assigned to 0
  // It id required because some types are defined as a analysis of another
  // object and the allocation sequence might be different. Sometimes dependent
  // object is allocated first, sometimes parent object is allocated first.
  // We cannot find type of latest element, all dependent objects must be
  // created
  List<InfoToResolve> latest_allocations_;
  int a_treshold_;
  int a_current_;
};


class HeapEventXDK {
 public:
  HeapEventXDK(unsigned int duration,
               const std::string& symbols, const std::string& types,
               const std::string& frames, const std::string& chunks,
               const std::string& retentions) :
    symbols_(symbols), types_(types), frames_(frames), chunks_(chunks),
    duration_(duration), retentions_(retentions) {
  }

  unsigned int duration() const {return duration_; }
  const char* symbols() const { return symbols_.c_str(); }
  const char* types() const { return types_.c_str(); }
  const char* frames() const { return frames_.c_str(); }
  const char* chunks() const { return chunks_.c_str(); }
  const char* retentions()  const { return retentions_.c_str(); }

 private:
  std::string symbols_;
  std::string types_;
  std::string frames_;
  std::string chunks_;
  unsigned int duration_;
  std::string retentions_;
  DISALLOW_COPY_AND_ASSIGN(HeapEventXDK);
};

} }  // namespace v8::internal

#endif  // V8_XDK_ALLOCATION_H_
