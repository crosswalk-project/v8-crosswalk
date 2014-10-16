// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef __xdk_utils_h__
#define __xdk_utils_h__

#include <map>
#include <set>
#include <sstream>
#include <string>
#include "src/hashmap.h"

namespace v8 {
namespace internal {

class AggregatedChunks;
class StringsStorage;
class JavaScriptFrame;
class RuntimeInfo;

// --- ClassNames
class ClassNames {
 public:
  explicit ClassNames(StringsStorage* names, Heap* heap);

  unsigned registerName(const char* className);
  std::string SerializeChunk();
  bool IsEssentialObject(Object* object);
  void registerNameForDependent(HeapObject* object,
                                RuntimeInfo* runtime_info,
                                unsigned id);
  unsigned GetConstructorName(Address address, RuntimeInfo* runtime_info);


 private:
  unsigned counter_;
  HashMap char_to_idx_;
  StringsStorage* names_;
  Heap* heap_;

  unsigned id_native_bind_;
  unsigned id_conc_string_;
  unsigned id_sliced_string_;
  unsigned id_string_;
  unsigned id_symbol_;
  unsigned id_code_;
  unsigned id_system_ncontext_;
  unsigned id_system_context_;
  unsigned id_array_;
  unsigned id_number_;
  unsigned id_system_;
  unsigned id_shared_fi_;
  unsigned id_script_;
  unsigned id_regexp_;
  unsigned id_function_bindings_;
  unsigned id_function_literals_;
  unsigned id_objects_properties_;
  unsigned id_objects_elements_;
  unsigned id_shared_function_info_;
  unsigned id_context_;
  unsigned id_code_relocation_info_;
  unsigned id_code_deopt_data_;
};


// --- ShadowStack
class CallTree {
 public:
  // For quick search we use below member. it is not reasnable to use here
  // map because it occupies a lot of space even in empty state and such nodes
  // will be many. In opposite to map, std::map uses binary tree search and
  // don't store buffer, but allocates it dinamically
  std::map<unsigned, CallTree*> children_;

  // This is _not_ the same as index in the children_. This index is
  // incremental value from list of all nodes, but the key in the children_ is
  // callsite
  unsigned index_;
  CallTree* parent_;
  // the only one field which characterize the call point
  unsigned callsite_;
};


class ShadowStack {
  CallTree root_;

  // unsigned here is ok, size_t is not required because even 10 millions
  // objects in this class will lead to the significant memory consumption
  unsigned last_index_;

  // TODO(amalyshe): rewrite using List, storing nodes and use index in the list
  // instead pointer to CallTree in the children_
  std::map<unsigned, CallTree*> allNodes_;
  unsigned serializedCounter_;
 public:
  ShadowStack();
  ~ShadowStack();
  // Returns unique stack id. This method can work with incremental stacks when
  // we have old stack id, new tail and number of functions that we need to
  // unroll.
  unsigned registerStack(const List<unsigned>& shadow_stack_);
  std::string SerializeChunk();
};


// --- SymbolsStorage
struct SymInfoKey {
  size_t function_id_;
  unsigned line_;
  unsigned column_;
};

bool inline operator == (const SymInfoKey& key1, const SymInfoKey& key2) {
  return key1.function_id_ == key2.function_id_ &&
    key1.line_ == key2.line_ &&
    key1.column_ == key2.column_;
}


struct SymInfoValue {
  unsigned symId_;
  std::string funcName_;
  std::string sourceFile_;
};


class SymbolsStorage {
 public:
  unsigned registerSymInfo(size_t functionId,
                               std::string functionName,
                               std::string sourceName, unsigned line,
                               unsigned column);
  unsigned FindOrRegisterFrame(JavaScriptFrame* frame);
  SymbolsStorage(Heap* heap, StringsStorage* names);
  ~SymbolsStorage();
  std::string SerializeChunk();

 private:
  HashMap symbols_;
  unsigned curSym_;
  // fast living storage which duplicate info but is cleaned regularly
  SymInfoKey* reserved_key_;
  HashMap sym_info_hash_;
  Heap* heap_;
  StringsStorage* names_;
};


struct PostCollectedInfo {
  int size_;
  int timeStamp_;
  int stackId_;
  unsigned className_;
  bool dirty_;
};


class RuntimeInfo {
 public:
  explicit RuntimeInfo(AggregatedChunks* aggregated_chunks);
  PostCollectedInfo* FindPostCollectedInfo(Address addr);
  PostCollectedInfo* AddPostCollectedInfo(Address addr,
                                          unsigned time_delta = 0,
                                          PostCollectedInfo* info = NULL);
  PostCollectedInfo* AddPreCollectionInfo(Address addr, unsigned size);
  void RemoveInfo(Address addr);
  void InitABCFrame(unsigned abc_frame);
  void CollectGarbaged(unsigned ts);

 private:
  HashMap working_set_hash_;
  AggregatedChunks* aggregated_chunks_;
  unsigned AllocatedBeforeCollectionFrame_;
};


struct AggregatedKey {
  int stackId_;
  // do we need class here? is not it defined by the stack id?
  unsigned classId_;
  unsigned tsBegin_;
  unsigned tsEnd_;
};

bool inline operator == (const AggregatedKey& key1, const AggregatedKey& key2) {
  return key1.stackId_ == key2.stackId_ &&
    key1.classId_ == key2.classId_ &&
    key1.tsBegin_ == key2.tsBegin_ &&
    key1.tsEnd_ == key2.tsEnd_;
}


struct AggregatedValue {
  unsigned size_;
  unsigned objects_;
};


class AggregatedChunks {
 public:
  AggregatedChunks();
  ~AggregatedChunks();
  void addObjectToAggregated(PostCollectedInfo* info, unsigned td);
  std::string SerializeChunk();

 private:
  HashMap aggregated_map_;
  int bucketSize_;
  AggregatedKey* reserved_key_;
};


struct RefId {
  int stackId_;
  int classId_;
  std::string field_;
};

inline bool operator < (const RefId& first, const RefId& second ) {
  if (first.stackId_ < second.stackId_ )
    return true;
  else if (first.stackId_ > second.stackId_ )
    return false;
  if (first.classId_ < second.classId_ )
    return true;
  if (first.classId_ > second.classId_ )
    return false;
  if (first.field_.compare(second.field_) < 0 )
    return true;

  return false;
}

typedef std::set<RefId> REFERENCESET;


struct RefSet {
  REFERENCESET references_;
};

inline bool operator < (const RefSet& first, const RefSet& second) {
  // compare the sizes first of all
  if (first.references_.size() != second.references_.size() )
    return first.references_.size() < second.references_.size();
  // iterating by the first
  REFERENCESET::const_iterator cit1 = first.references_.begin();
  REFERENCESET::const_iterator cit2 = second.references_.begin();
  while (cit1 != first.references_.end()) {
    if (*cit1 < *cit2 )
      return true;
    if (*cit2 < *cit1 )
      return false;
    cit1++;
    cit2++;
  }
  return false;
}
typedef std::map<unsigned int, int> TIMETOCOUNT;
typedef std::map<RefSet, TIMETOCOUNT> REFERENCESETS;
typedef std::map<RefId, REFERENCESETS> PARENTREFMAP;


class References {
 public:
  void addReference(const RefId& parent,
                    const RefSet& refSet,
                    int parentTime);
  void clear();
  std::string serialize() const;

 private:
  PARENTREFMAP refMap_;
};


} }  // namespace v8::internal
#endif  // __xdk_utils_h__
