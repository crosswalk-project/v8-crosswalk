// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/types.h"

#include "src/string-stream.h"
#include "src/types-inl.h"

namespace v8 {
namespace internal {

// -----------------------------------------------------------------------------
// Glb and lub computation.

// The largest bitset subsumed by this type.
template<class Config>
int TypeImpl<Config>::BitsetType::Glb(TypeImpl* type) {
  DisallowHeapAllocation no_allocation;
  if (type->IsBitset()) {
    return type->AsBitset();
  } else if (type->IsUnion()) {
    UnionHandle unioned = handle(type->AsUnion());
    int bitset = kNone;
    for (int i = 0; i < unioned->Length(); ++i) {
      bitset |= unioned->Get(i)->BitsetGlb();
    }
    return bitset;
  } else if (type->IsClass()) {
    // Little hack to avoid the need for a region for handlification here...
    return REPRESENTATION(Config::is_class(type)
        ? Lub(*Config::as_class(type))
        : type->AsClass()->Bound(NULL)->AsBitset());
  } else if (type->IsConstant()) {
    return REPRESENTATION(type->AsConstant()->Bound()->AsBitset());
  } else if (type->IsContext()) {
    return REPRESENTATION(type->AsContext()->Bound()->AsBitset());
  } else if (type->IsArray()) {
    return REPRESENTATION(type->AsArray()->Bound()->AsBitset());
  } else if (type->IsFunction()) {
    return REPRESENTATION(type->AsFunction()->Bound()->AsBitset());
  } else {
    UNREACHABLE();
    return kNone;
  }
}


// The smallest bitset subsuming this type.
template<class Config>
int TypeImpl<Config>::BitsetType::Lub(TypeImpl* type) {
  DisallowHeapAllocation no_allocation;
  if (type->IsBitset()) {
    return type->AsBitset();
  } else if (type->IsUnion()) {
    UnionHandle unioned = handle(type->AsUnion());
    int bitset = kNone;
    for (int i = 0; i < unioned->Length(); ++i) {
      bitset |= unioned->Get(i)->BitsetLub();
    }
    return bitset;
  } else if (type->IsClass()) {
    // Little hack to avoid the need for a region for handlification here...
    return Config::is_class(type) ? Lub(*Config::as_class(type)) :
        type->AsClass()->Bound(NULL)->AsBitset();
  } else if (type->IsConstant()) {
    return type->AsConstant()->Bound()->AsBitset();
  } else if (type->IsContext()) {
    return type->AsContext()->Bound()->AsBitset();
  } else if (type->IsArray()) {
    return type->AsArray()->Bound()->AsBitset();
  } else if (type->IsFunction()) {
    return type->AsFunction()->Bound()->AsBitset();
  } else {
    UNREACHABLE();
    return kNone;
  }
}


// The smallest bitset subsuming this type, ignoring explicit bounds.
template<class Config>
int TypeImpl<Config>::BitsetType::InherentLub(TypeImpl* type) {
  DisallowHeapAllocation no_allocation;
  if (type->IsBitset()) {
    return type->AsBitset();
  } else if (type->IsUnion()) {
    UnionHandle unioned = handle(type->AsUnion());
    int bitset = kNone;
    for (int i = 0; i < unioned->Length(); ++i) {
      bitset |= unioned->Get(i)->InherentBitsetLub();
    }
    return bitset;
  } else if (type->IsClass()) {
    return Lub(*type->AsClass()->Map());
  } else if (type->IsConstant()) {
    return Lub(*type->AsConstant()->Value());
  } else if (type->IsContext()) {
    return kInternal & kTaggedPtr;
  } else if (type->IsArray()) {
    return kArray;
  } else if (type->IsFunction()) {
    return kFunction;
  } else {
    UNREACHABLE();
    return kNone;
  }
}


template<class Config>
int TypeImpl<Config>::BitsetType::Lub(i::Object* value) {
  DisallowHeapAllocation no_allocation;
  if (value->IsNumber()) {
    return Lub(value->Number()) & (value->IsSmi() ? kTaggedInt : kTaggedPtr);
  }
  return Lub(i::HeapObject::cast(value)->map());
}


template<class Config>
int TypeImpl<Config>::BitsetType::Lub(double value) {
  DisallowHeapAllocation no_allocation;
  if (i::IsMinusZero(value)) return kMinusZero;
  if (std::isnan(value)) return kNaN;
  if (IsUint32Double(value)) return Lub(FastD2UI(value));
  if (IsInt32Double(value)) return Lub(FastD2I(value));
  return kOtherNumber;
}


template<class Config>
int TypeImpl<Config>::BitsetType::Lub(int32_t value) {
  if (value >= 0x40000000) {
    return i::SmiValuesAre31Bits() ? kOtherUnsigned31 : kUnsignedSmall;
  }
  if (value >= 0) return kUnsignedSmall;
  if (value >= -0x40000000) return kOtherSignedSmall;
  return i::SmiValuesAre31Bits() ? kOtherSigned32 : kOtherSignedSmall;
}


template<class Config>
int TypeImpl<Config>::BitsetType::Lub(uint32_t value) {
  DisallowHeapAllocation no_allocation;
  if (value >= 0x80000000u) return kOtherUnsigned32;
  if (value >= 0x40000000u) {
    return i::SmiValuesAre31Bits() ? kOtherUnsigned31 : kUnsignedSmall;
  }
  return kUnsignedSmall;
}


template<class Config>
int TypeImpl<Config>::BitsetType::Lub(i::Map* map) {
  DisallowHeapAllocation no_allocation;
  switch (map->instance_type()) {
    case STRING_TYPE:
    case ASCII_STRING_TYPE:
    case CONS_STRING_TYPE:
    case CONS_ASCII_STRING_TYPE:
    case SLICED_STRING_TYPE:
    case SLICED_ASCII_STRING_TYPE:
    case EXTERNAL_STRING_TYPE:
    case EXTERNAL_ASCII_STRING_TYPE:
    case EXTERNAL_STRING_WITH_ONE_BYTE_DATA_TYPE:
    case SHORT_EXTERNAL_STRING_TYPE:
    case SHORT_EXTERNAL_ASCII_STRING_TYPE:
    case SHORT_EXTERNAL_STRING_WITH_ONE_BYTE_DATA_TYPE:
    case INTERNALIZED_STRING_TYPE:
    case ASCII_INTERNALIZED_STRING_TYPE:
    case EXTERNAL_INTERNALIZED_STRING_TYPE:
    case EXTERNAL_ASCII_INTERNALIZED_STRING_TYPE:
    case EXTERNAL_INTERNALIZED_STRING_WITH_ONE_BYTE_DATA_TYPE:
    case SHORT_EXTERNAL_INTERNALIZED_STRING_TYPE:
    case SHORT_EXTERNAL_ASCII_INTERNALIZED_STRING_TYPE:
    case SHORT_EXTERNAL_INTERNALIZED_STRING_WITH_ONE_BYTE_DATA_TYPE:
      return kString;
    case SYMBOL_TYPE:
      return kSymbol;
    case ODDBALL_TYPE: {
      Heap* heap = map->GetHeap();
      if (map == heap->undefined_map()) return kUndefined;
      if (map == heap->the_hole_map()) return kAny;  // TODO(rossberg): kNone?
      if (map == heap->null_map()) return kNull;
      if (map == heap->boolean_map()) return kBoolean;
      ASSERT(map == heap->uninitialized_map() ||
             map == heap->no_interceptor_result_sentinel_map() ||
             map == heap->termination_exception_map() ||
             map == heap->arguments_marker_map());
      return kInternal & kTaggedPtr;
    }
    case HEAP_NUMBER_TYPE:
      return kNumber & kTaggedPtr;
    case JS_VALUE_TYPE:
    case JS_DATE_TYPE:
    case JS_OBJECT_TYPE:
    case JS_CONTEXT_EXTENSION_OBJECT_TYPE:
    case JS_GENERATOR_OBJECT_TYPE:
    case JS_MODULE_TYPE:
    case JS_GLOBAL_OBJECT_TYPE:
    case JS_BUILTINS_OBJECT_TYPE:
    case JS_GLOBAL_PROXY_TYPE:
    case JS_ARRAY_BUFFER_TYPE:
    case JS_TYPED_ARRAY_TYPE:
    case JS_DATA_VIEW_TYPE:
    case JS_SET_TYPE:
    case JS_MAP_TYPE:
    case JS_SET_ITERATOR_TYPE:
    case JS_MAP_ITERATOR_TYPE:
    case JS_WEAK_MAP_TYPE:
    case JS_WEAK_SET_TYPE:
    case FLOAT32x4_TYPE:
    case FLOAT64x2_TYPE:
    case INT32x4_TYPE:
      if (map->is_undetectable()) return kUndetectable;
      return kOtherObject;
    case JS_ARRAY_TYPE:
      return kArray;
    case JS_FUNCTION_TYPE:
      return kFunction;
    case JS_REGEXP_TYPE:
      return kRegExp;
    case JS_PROXY_TYPE:
    case JS_FUNCTION_PROXY_TYPE:
      return kProxy;
    case MAP_TYPE:
      // When compiling stub templates, the meta map is used as a place holder
      // for the actual map with which the template is later instantiated.
      // We treat it as a kind of type variable whose upper bound is Any.
      // TODO(rossberg): for caching of CompareNilIC stubs to work correctly,
      // we must exclude Undetectable here. This makes no sense, really,
      // because it means that the template isn't actually parametric.
      // Also, it doesn't apply elsewhere. 8-(
      // We ought to find a cleaner solution for compiling stubs parameterised
      // over type or class variables, esp ones with bounds...
      return kDetectable;
    case DECLARED_ACCESSOR_INFO_TYPE:
    case EXECUTABLE_ACCESSOR_INFO_TYPE:
    case SHARED_FUNCTION_INFO_TYPE:
    case ACCESSOR_PAIR_TYPE:
    case FIXED_ARRAY_TYPE:
    case FOREIGN_TYPE:
      return kInternal & kTaggedPtr;
    default:
      UNREACHABLE();
      return kNone;
  }
}


// -----------------------------------------------------------------------------
// Predicates.

// Check this <= that.
template<class Config>
bool TypeImpl<Config>::SlowIs(TypeImpl* that) {
  DisallowHeapAllocation no_allocation;

  // Fast path for bitsets.
  if (this->IsNone()) return true;
  if (that->IsBitset()) {
    return (BitsetType::Lub(this) | that->AsBitset()) == that->AsBitset();
  }
  if (this->IsBitset() && SEMANTIC(this->AsBitset()) == BitsetType::kNone) {
    // Bitsets only have non-bitset supertypes along the representation axis.
    int that_bitset = that->BitsetGlb();
    return (this->AsBitset() | that_bitset) == that_bitset;
  }

  if (that->IsClass()) {
    return this->IsClass()
        && *this->AsClass()->Map() == *that->AsClass()->Map()
        && ((Config::is_class(that) && Config::is_class(this)) ||
            BitsetType::New(this->BitsetLub())->Is(
                BitsetType::New(that->BitsetLub())));
  }
  if (that->IsConstant()) {
    return this->IsConstant()
        && *this->AsConstant()->Value() == *that->AsConstant()->Value()
        && this->AsConstant()->Bound()->Is(that->AsConstant()->Bound());
  }
  if (that->IsContext()) {
    return this->IsContext()
        && this->AsContext()->Outer()->Equals(that->AsContext()->Outer());
  }
  if (that->IsArray()) {
    return this->IsArray()
        && this->AsArray()->Element()->Equals(that->AsArray()->Element());
  }
  if (that->IsFunction()) {
    // We currently do not allow for any variance here, in order to keep
    // Union and Intersect operations simple.
    if (!this->IsFunction()) return false;
    FunctionType* this_fun = this->AsFunction();
    FunctionType* that_fun = that->AsFunction();
    if (this_fun->Arity() != that_fun->Arity() ||
        !this_fun->Result()->Equals(that_fun->Result()) ||
        !that_fun->Receiver()->Equals(this_fun->Receiver())) {
      return false;
    }
    for (int i = 0; i < this_fun->Arity(); ++i) {
      if (!that_fun->Parameter(i)->Equals(this_fun->Parameter(i))) return false;
    }
    return true;
  }

  // (T1 \/ ... \/ Tn) <= T  <=>  (T1 <= T) /\ ... /\ (Tn <= T)
  if (this->IsUnion()) {
    UnionHandle unioned = handle(this->AsUnion());
    for (int i = 0; i < unioned->Length(); ++i) {
      if (!unioned->Get(i)->Is(that)) return false;
    }
    return true;
  }

  // T <= (T1 \/ ... \/ Tn)  <=>  (T <= T1) \/ ... \/ (T <= Tn)
  // (iff T is not a union)
  ASSERT(!this->IsUnion());
  if (that->IsUnion()) {
    UnionHandle unioned = handle(that->AsUnion());
    for (int i = 0; i < unioned->Length(); ++i) {
      if (this->Is(unioned->Get(i))) return true;
      if (this->IsBitset()) break;  // Fast fail, only first field is a bitset.
    }
    return false;
  }

  return false;
}


template<class Config>
bool TypeImpl<Config>::NowIs(TypeImpl* that) {
  DisallowHeapAllocation no_allocation;

  // TODO(rossberg): this is incorrect for
  //   Union(Constant(V), T)->NowIs(Class(M))
  // but fuzzing does not cover that!
  if (this->IsConstant()) {
    i::Object* object = *this->AsConstant()->Value();
    if (object->IsHeapObject()) {
      i::Map* map = i::HeapObject::cast(object)->map();
      for (Iterator<i::Map> it = that->Classes(); !it.Done(); it.Advance()) {
        if (*it.Current() == map) return true;
      }
    }
  }
  return this->Is(that);
}


// Check if this contains only (currently) stable classes.
template<class Config>
bool TypeImpl<Config>::NowStable() {
  DisallowHeapAllocation no_allocation;
  for (Iterator<i::Map> it = this->Classes(); !it.Done(); it.Advance()) {
    if (!it.Current()->is_stable()) return false;
  }
  return true;
}


// Check this overlaps that.
template<class Config>
bool TypeImpl<Config>::Maybe(TypeImpl* that) {
  DisallowHeapAllocation no_allocation;

  // (T1 \/ ... \/ Tn) overlaps T <=> (T1 overlaps T) \/ ... \/ (Tn overlaps T)
  if (this->IsUnion()) {
    UnionHandle unioned = handle(this->AsUnion());
    for (int i = 0; i < unioned->Length(); ++i) {
      if (unioned->Get(i)->Maybe(that)) return true;
    }
    return false;
  }

  // T overlaps (T1 \/ ... \/ Tn) <=> (T overlaps T1) \/ ... \/ (T overlaps Tn)
  if (that->IsUnion()) {
    UnionHandle unioned = handle(that->AsUnion());
    for (int i = 0; i < unioned->Length(); ++i) {
      if (this->Maybe(unioned->Get(i))) return true;
    }
    return false;
  }

  ASSERT(!this->IsUnion() && !that->IsUnion());
  if (this->IsBitset()) {
    return BitsetType::IsInhabited(this->AsBitset() & that->BitsetLub());
  }
  if (that->IsBitset()) {
    return BitsetType::IsInhabited(this->BitsetLub() & that->AsBitset());
  }
  if (this->IsClass()) {
    return that->IsClass()
        && *this->AsClass()->Map() == *that->AsClass()->Map();
  }
  if (this->IsConstant()) {
    return that->IsConstant()
        && *this->AsConstant()->Value() == *that->AsConstant()->Value();
  }
  if (this->IsContext()) {
    return this->Equals(that);
  }
  if (this->IsArray()) {
    // There is no variance!
    return this->Equals(that);
  }
  if (this->IsFunction()) {
    // There is no variance!
    return this->Equals(that);
  }

  return false;
}


// Check if value is contained in (inhabits) type.
template<class Config>
bool TypeImpl<Config>::Contains(i::Object* value) {
  DisallowHeapAllocation no_allocation;
  for (Iterator<i::Object> it = this->Constants(); !it.Done(); it.Advance()) {
    if (*it.Current() == value) return true;
  }
  return BitsetType::New(BitsetType::Lub(value))->Is(this);
}


template<class Config>
bool TypeImpl<Config>::UnionType::Wellformed() {
  ASSERT(this->Length() >= 2);
  for (int i = 0; i < this->Length(); ++i) {
    ASSERT(!this->Get(i)->IsUnion());
    if (i > 0) ASSERT(!this->Get(i)->IsBitset());
    for (int j = 0; j < this->Length(); ++j) {
      if (i != j) ASSERT(!this->Get(i)->Is(this->Get(j)));
    }
  }
  return true;
}


// -----------------------------------------------------------------------------
// Union and intersection

template<class Config>
typename TypeImpl<Config>::TypeHandle TypeImpl<Config>::Narrow(
    int bitset, Region* region) {
  TypeHandle bound = BitsetType::New(bitset, region);
  if (this->IsClass()) {
    return ClassType::New(this->AsClass()->Map(), bound, region);
  } else if (this->IsConstant()) {
    return ConstantType::New(this->AsConstant()->Value(), bound, region);
  } else if (this->IsContext()) {
    return ContextType::New(this->AsContext()->Outer(), bound, region);
  } else if (this->IsArray()) {
    return ArrayType::New(this->AsArray()->Element(), bound, region);
  } else if (this->IsFunction()) {
    FunctionType* function = this->AsFunction();
    int arity = function->Arity();
    FunctionHandle type = FunctionType::New(
        function->Result(), function->Receiver(), bound, arity, region);
    for (int i = 0; i < arity; ++i) {
      type->InitParameter(i, function->Parameter(i));
    }
    return type;
  }
  UNREACHABLE();
  return TypeHandle();
}


template<class Config>
int TypeImpl<Config>::BoundBy(TypeImpl* that) {
  ASSERT(!this->IsUnion());
  if (that->IsUnion()) {
    UnionType* unioned = that->AsUnion();
    int length = unioned->Length();
    int bitset = BitsetType::kNone;
    for (int i = 0; i < length; ++i) {
      bitset |= BoundBy(unioned->Get(i)->unhandle());
    }
    return bitset;
  } else if (that->IsClass() && this->IsClass() &&
      *this->AsClass()->Map() == *that->AsClass()->Map()) {
    return that->BitsetLub();
  } else if (that->IsConstant() && this->IsConstant() &&
      *this->AsConstant()->Value() == *that->AsConstant()->Value()) {
    return that->AsConstant()->Bound()->AsBitset();
  } else if (that->IsContext() && this->IsContext() && this->Is(that)) {
    return that->AsContext()->Bound()->AsBitset();
  } else if (that->IsArray() && this->IsArray() && this->Is(that)) {
    return that->AsArray()->Bound()->AsBitset();
  } else if (that->IsFunction() && this->IsFunction() && this->Is(that)) {
    return that->AsFunction()->Bound()->AsBitset();
  }
  return that->BitsetGlb();
}


template<class Config>
int TypeImpl<Config>::IndexInUnion(
    int bound, UnionHandle unioned, int current_size) {
  ASSERT(!this->IsUnion());
  for (int i = 0; i < current_size; ++i) {
    TypeHandle that = unioned->Get(i);
    if (that->IsBitset()) {
      if ((bound | that->AsBitset()) == that->AsBitset()) return i;
    } else if (that->IsClass() && this->IsClass()) {
      if (*this->AsClass()->Map() == *that->AsClass()->Map()) return i;
    } else if (that->IsConstant() && this->IsConstant()) {
      if (*this->AsConstant()->Value() == *that->AsConstant()->Value())
        return i;
    } else if (that->IsContext() && this->IsContext()) {
      if (this->Is(that)) return i;
    } else if (that->IsArray() && this->IsArray()) {
      if (this->Is(that)) return i;
    } else if (that->IsFunction() && this->IsFunction()) {
      if (this->Is(that)) return i;
    }
  }
  return -1;
}


// Get non-bitsets from type, bounded by upper.
// Store at result starting at index. Returns updated index.
template<class Config>
int TypeImpl<Config>::ExtendUnion(
    UnionHandle result, int size, TypeHandle type,
    TypeHandle other, bool is_intersect, Region* region) {
  int old_size = size;
  if (type->IsUnion()) {
    UnionHandle unioned = handle(type->AsUnion());
    for (int i = 0; i < unioned->Length(); ++i) {
      TypeHandle type_i = unioned->Get(i);
      ASSERT(i == 0 || !(type_i->IsBitset() || type_i->Is(unioned->Get(0))));
      if (!type_i->IsBitset()) {
        size = ExtendUnion(result, size, type_i, other, is_intersect, region);
      }
    }
  } else if (!type->IsBitset()) {
    ASSERT(type->IsClass() || type->IsConstant() ||
           type->IsArray() || type->IsFunction() || type->IsContext());
    int inherent_bound = type->InherentBitsetLub();
    int old_bound = type->BitsetLub();
    int other_bound = type->BoundBy(other->unhandle()) & inherent_bound;
    int new_bound =
        is_intersect ? (old_bound & other_bound) : (old_bound | other_bound);
    if (new_bound != BitsetType::kNone) {
      int i = type->IndexInUnion(new_bound, result, old_size);
      if (i == -1) {
        i = size++;
      } else if (result->Get(i)->IsBitset()) {
        return size;  // Already fully subsumed.
      } else {
        int type_i_bound = result->Get(i)->BitsetLub();
        new_bound |= type_i_bound;
        if (new_bound == type_i_bound) return size;
      }
      if (new_bound != old_bound) type = type->Narrow(new_bound, region);
      result->Set(i, type);
    }
  }
  return size;
}


// If bitset is subsumed by another entry in the result, remove it.
// (Only bitsets with empty semantic axis can be subtypes of non-bitsets.)
template<class Config>
int TypeImpl<Config>::NormalizeUnion(UnionHandle result, int size, int bitset) {
  if (bitset != BitsetType::kNone && SEMANTIC(bitset) == BitsetType::kNone) {
    for (int i = 1; i < size; ++i) {
      int glb = result->Get(i)->BitsetGlb();
      if ((bitset | glb) == glb) {
        for (int j = 1; j < size; ++j) {
          result->Set(j - 1, result->Get(j));
        }
        --size;
        break;
      }
    }
  }
  return size;
}


// Union is O(1) on simple bitsets, but O(n*m) on structured unions.
template<class Config>
typename TypeImpl<Config>::TypeHandle TypeImpl<Config>::Union(
    TypeHandle type1, TypeHandle type2, Region* region) {
  // Fast case: bit sets.
  if (type1->IsBitset() && type2->IsBitset()) {
    return BitsetType::New(type1->AsBitset() | type2->AsBitset(), region);
  }

  // Fast case: top or bottom types.
  if (type1->IsAny() || type2->IsNone()) return type1;
  if (type2->IsAny() || type1->IsNone()) return type2;

  // Semi-fast case: Unioned objects are neither involved nor produced.
  if (!(type1->IsUnion() || type2->IsUnion())) {
    if (type1->Is(type2)) return type2;
    if (type2->Is(type1)) return type1;
  }

  // Slow case: may need to produce a Unioned object.
  int size = 0;
  if (!type1->IsBitset()) {
    size += (type1->IsUnion() ? type1->AsUnion()->Length() : 1);
  }
  if (!type2->IsBitset()) {
    size += (type2->IsUnion() ? type2->AsUnion()->Length() : 1);
  }
  int bitset = type1->BitsetGlb() | type2->BitsetGlb();
  if (bitset != BitsetType::kNone) ++size;
  ASSERT(size >= 1);

  UnionHandle unioned = UnionType::New(size, region);
  size = 0;
  if (bitset != BitsetType::kNone) {
    unioned->Set(size++, BitsetType::New(bitset, region));
  }
  size = ExtendUnion(unioned, size, type1, type2, false, region);
  size = ExtendUnion(unioned, size, type2, type1, false, region);
  size = NormalizeUnion(unioned, size, bitset);

  if (size == 1) {
    return unioned->Get(0);
  } else {
    unioned->Shrink(size);
    ASSERT(unioned->Wellformed());
    return unioned;
  }
}


// Intersection is O(1) on simple bitsets, but O(n*m) on structured unions.
template<class Config>
typename TypeImpl<Config>::TypeHandle TypeImpl<Config>::Intersect(
    TypeHandle type1, TypeHandle type2, Region* region) {
  // Fast case: bit sets.
  if (type1->IsBitset() && type2->IsBitset()) {
    return BitsetType::New(type1->AsBitset() & type2->AsBitset(), region);
  }

  // Fast case: top or bottom types.
  if (type1->IsNone() || type2->IsAny()) return type1;
  if (type2->IsNone() || type1->IsAny()) return type2;

  // Semi-fast case: Unioned objects are neither involved nor produced.
  if (!(type1->IsUnion() || type2->IsUnion())) {
    if (type1->Is(type2)) return type1;
    if (type2->Is(type1)) return type2;
  }

  // Slow case: may need to produce a Unioned object.
  int size = 0;
  if (!type1->IsBitset()) {
    size += (type1->IsUnion() ? type1->AsUnion()->Length() : 1);
  }
  if (!type2->IsBitset()) {
    size += (type2->IsUnion() ? type2->AsUnion()->Length() : 1);
  }
  int bitset = type1->BitsetGlb() & type2->BitsetGlb();
  if (bitset != BitsetType::kNone) ++size;
  ASSERT(size >= 1);

  UnionHandle unioned = UnionType::New(size, region);
  size = 0;
  if (bitset != BitsetType::kNone) {
    unioned->Set(size++, BitsetType::New(bitset, region));
  }
  size = ExtendUnion(unioned, size, type1, type2, true, region);
  size = ExtendUnion(unioned, size, type2, type1, true, region);
  size = NormalizeUnion(unioned, size, bitset);

  if (size == 0) {
    return None(region);
  } else if (size == 1) {
    return unioned->Get(0);
  } else {
    unioned->Shrink(size);
    ASSERT(unioned->Wellformed());
    return unioned;
  }
}


// -----------------------------------------------------------------------------
// Iteration.

template<class Config>
int TypeImpl<Config>::NumClasses() {
  DisallowHeapAllocation no_allocation;
  if (this->IsClass()) {
    return 1;
  } else if (this->IsUnion()) {
    UnionHandle unioned = handle(this->AsUnion());
    int result = 0;
    for (int i = 0; i < unioned->Length(); ++i) {
      if (unioned->Get(i)->IsClass()) ++result;
    }
    return result;
  } else {
    return 0;
  }
}


template<class Config>
int TypeImpl<Config>::NumConstants() {
  DisallowHeapAllocation no_allocation;
  if (this->IsConstant()) {
    return 1;
  } else if (this->IsUnion()) {
    UnionHandle unioned = handle(this->AsUnion());
    int result = 0;
    for (int i = 0; i < unioned->Length(); ++i) {
      if (unioned->Get(i)->IsConstant()) ++result;
    }
    return result;
  } else {
    return 0;
  }
}


template<class Config> template<class T>
typename TypeImpl<Config>::TypeHandle
TypeImpl<Config>::Iterator<T>::get_type() {
  ASSERT(!Done());
  return type_->IsUnion() ? type_->AsUnion()->Get(index_) : type_;
}


// C++ cannot specialise nested templates, so we have to go through this
// contortion with an auxiliary template to simulate it.
template<class Config, class T>
struct TypeImplIteratorAux {
  static bool matches(typename TypeImpl<Config>::TypeHandle type);
  static i::Handle<T> current(typename TypeImpl<Config>::TypeHandle type);
};

template<class Config>
struct TypeImplIteratorAux<Config, i::Map> {
  static bool matches(typename TypeImpl<Config>::TypeHandle type) {
    return type->IsClass();
  }
  static i::Handle<i::Map> current(typename TypeImpl<Config>::TypeHandle type) {
    return type->AsClass()->Map();
  }
};

template<class Config>
struct TypeImplIteratorAux<Config, i::Object> {
  static bool matches(typename TypeImpl<Config>::TypeHandle type) {
    return type->IsConstant();
  }
  static i::Handle<i::Object> current(
      typename TypeImpl<Config>::TypeHandle type) {
    return type->AsConstant()->Value();
  }
};

template<class Config> template<class T>
bool TypeImpl<Config>::Iterator<T>::matches(TypeHandle type) {
  return TypeImplIteratorAux<Config, T>::matches(type);
}

template<class Config> template<class T>
i::Handle<T> TypeImpl<Config>::Iterator<T>::Current() {
  return TypeImplIteratorAux<Config, T>::current(get_type());
}


template<class Config> template<class T>
void TypeImpl<Config>::Iterator<T>::Advance() {
  DisallowHeapAllocation no_allocation;
  ++index_;
  if (type_->IsUnion()) {
    UnionHandle unioned = handle(type_->AsUnion());
    for (; index_ < unioned->Length(); ++index_) {
      if (matches(unioned->Get(index_))) return;
    }
  } else if (index_ == 0 && matches(type_)) {
    return;
  }
  index_ = -1;
}


// -----------------------------------------------------------------------------
// Conversion between low-level representations.

template<class Config>
template<class OtherType>
typename TypeImpl<Config>::TypeHandle TypeImpl<Config>::Convert(
    typename OtherType::TypeHandle type, Region* region) {
  if (type->IsBitset()) {
    return BitsetType::New(type->AsBitset(), region);
  } else if (type->IsClass()) {
    return ClassType::New(
        type->AsClass()->Map(),
        BitsetType::New(type->BitsetLub(), region), region);
  } else if (type->IsConstant()) {
    return ConstantType::New(
        type->AsConstant()->Value(),
        Convert<OtherType>(type->AsConstant()->Bound(), region), region);
  } else if (type->IsContext()) {
    TypeHandle outer = Convert<OtherType>(type->AsContext()->Outer(), region);
    return ContextType::New(outer, region);
  } else if (type->IsUnion()) {
    int length = type->AsUnion()->Length();
    UnionHandle unioned = UnionType::New(length, region);
    for (int i = 0; i < length; ++i) {
      unioned->Set(i, Convert<OtherType>(type->AsUnion()->Get(i), region));
    }
    return unioned;
  } else if (type->IsArray()) {
    return ArrayType::New(
        Convert<OtherType>(type->AsArray()->Element(), region),
        Convert<OtherType>(type->AsArray()->Bound(), region), region);
  } else if (type->IsFunction()) {
    FunctionHandle function = FunctionType::New(
        Convert<OtherType>(type->AsFunction()->Result(), region),
        Convert<OtherType>(type->AsFunction()->Receiver(), region),
        Convert<OtherType>(type->AsFunction()->Bound(), region),
        type->AsFunction()->Arity(), region);
    for (int i = 0; i < function->Arity(); ++i) {
      function->InitParameter(i,
          Convert<OtherType>(type->AsFunction()->Parameter(i), region));
    }
    return function;
  } else {
    UNREACHABLE();
    return None(region);
  }
}


// -----------------------------------------------------------------------------
// Printing.

template<class Config>
const char* TypeImpl<Config>::BitsetType::Name(int bitset) {
  switch (bitset) {
    case REPRESENTATION(kAny): return "Any";
    #define RETURN_NAMED_REPRESENTATION_TYPE(type, value) \
    case REPRESENTATION(k##type): return #type;
    REPRESENTATION_BITSET_TYPE_LIST(RETURN_NAMED_REPRESENTATION_TYPE)
    #undef RETURN_NAMED_REPRESENTATION_TYPE

    #define RETURN_NAMED_SEMANTIC_TYPE(type, value) \
    case SEMANTIC(k##type): return #type;
    SEMANTIC_BITSET_TYPE_LIST(RETURN_NAMED_SEMANTIC_TYPE)
    #undef RETURN_NAMED_SEMANTIC_TYPE

    default:
      return NULL;
  }
}


template<class Config>
void TypeImpl<Config>::BitsetType::PrintTo(StringStream* stream, int bitset) {
  DisallowHeapAllocation no_allocation;
  const char* name = Name(bitset);
  if (name != NULL) {
    stream->Add("%s", name);
  } else {
    static const int named_bitsets[] = {
      #define BITSET_CONSTANT(type, value) REPRESENTATION(k##type),
      REPRESENTATION_BITSET_TYPE_LIST(BITSET_CONSTANT)
      #undef BITSET_CONSTANT

      #define BITSET_CONSTANT(type, value) SEMANTIC(k##type),
      SEMANTIC_BITSET_TYPE_LIST(BITSET_CONSTANT)
      #undef BITSET_CONSTANT
    };

    bool is_first = true;
    stream->Add("(");
    for (int i(ARRAY_SIZE(named_bitsets) - 1); bitset != 0 && i >= 0; --i) {
      int subset = named_bitsets[i];
      if ((bitset & subset) == subset) {
        if (!is_first) stream->Add(" | ");
        is_first = false;
        stream->Add("%s", Name(subset));
        bitset -= subset;
      }
    }
    ASSERT(bitset == 0);
    stream->Add(")");
  }
}


template<class Config>
void TypeImpl<Config>::PrintTo(StringStream* stream, PrintDimension dim) {
  DisallowHeapAllocation no_allocation;
  if (dim != REPRESENTATION_DIM) {
    if (this->IsBitset()) {
      BitsetType::PrintTo(stream, SEMANTIC(this->AsBitset()));
    } else if (this->IsClass()) {
      stream->Add("Class(%p < ", static_cast<void*>(*this->AsClass()->Map()));
      BitsetType::New(BitsetType::Lub(this))->PrintTo(stream, dim);
      stream->Add(")");
      return;
    } else if (this->IsConstant()) {
      stream->Add("Constant(%p : ",
             static_cast<void*>(*this->AsConstant()->Value()));
      BitsetType::New(BitsetType::Lub(this))->PrintTo(stream, dim);
      stream->Add(")");
      return;
    } else if (this->IsContext()) {
      stream->Add("Context(");
      this->AsContext()->Outer()->PrintTo(stream, dim);
      stream->Add(")");
    } else if (this->IsUnion()) {
      stream->Add("(");
      UnionHandle unioned = handle(this->AsUnion());
      for (int i = 0; i < unioned->Length(); ++i) {
        TypeHandle type_i = unioned->Get(i);
        if (i > 0) stream->Add(" | ");
        type_i->PrintTo(stream, dim);
      }
      stream->Add(")");
      return;
    } else if (this->IsArray()) {
      stream->Add("Array(");
      AsArray()->Element()->PrintTo(stream, dim);
      stream->Add(")");
    } else if (this->IsFunction()) {
      if (!this->AsFunction()->Receiver()->IsAny()) {
        this->AsFunction()->Receiver()->PrintTo(stream, dim);
        stream->Add(".");
      }
      stream->Add("(");
      for (int i = 0; i < this->AsFunction()->Arity(); ++i) {
        if (i > 0) stream->Add(", ");
        this->AsFunction()->Parameter(i)->PrintTo(stream, dim);
      }
      stream->Add(")->");
      this->AsFunction()->Result()->PrintTo(stream, dim);
    } else {
      UNREACHABLE();
    }
  }
  if (dim == BOTH_DIMS) {
    stream->Add("/");
  }
  if (dim != SEMANTIC_DIM) {
    BitsetType::PrintTo(stream, REPRESENTATION(this->BitsetLub()));
  }
}


template<class Config>
void TypeImpl<Config>::TypePrint(FILE* out, PrintDimension dim) {
  HeapStringAllocator allocator;
  StringStream stream(&allocator);
  PrintTo(&stream, dim);
  stream.OutputToFile(out);
}


template<class Config>
void TypeImpl<Config>::TypePrint(PrintDimension dim) {
  TypePrint(stdout, dim);
  PrintF(stdout, "\n");
  Flush(stdout);
}


// -----------------------------------------------------------------------------
// Instantiations.

template class TypeImpl<ZoneTypeConfig>;
template class TypeImpl<ZoneTypeConfig>::Iterator<i::Map>;
template class TypeImpl<ZoneTypeConfig>::Iterator<i::Object>;

template class TypeImpl<HeapTypeConfig>;
template class TypeImpl<HeapTypeConfig>::Iterator<i::Map>;
template class TypeImpl<HeapTypeConfig>::Iterator<i::Object>;

template TypeImpl<ZoneTypeConfig>::TypeHandle
  TypeImpl<ZoneTypeConfig>::Convert<HeapType>(
    TypeImpl<HeapTypeConfig>::TypeHandle, TypeImpl<ZoneTypeConfig>::Region*);
template TypeImpl<HeapTypeConfig>::TypeHandle
  TypeImpl<HeapTypeConfig>::Convert<Type>(
    TypeImpl<ZoneTypeConfig>::TypeHandle, TypeImpl<HeapTypeConfig>::Region*);

} }  // namespace v8::internal
