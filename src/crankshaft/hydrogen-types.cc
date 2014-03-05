// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/crankshaft/hydrogen-types.h"

#include "src/ostreams.h"
#include "src/property-details.h"
#include "src/types-inl.h"


namespace v8 {
namespace internal {

// static
template <class T>
HType HType::FromType(typename T::TypeHandle type) {
  if (T::Any()->Is(type)) return HType::Any();
  if (!type->IsInhabited()) return HType::None();
  if (type->Is(T::SignedSmall())) return HType::Smi();
  if (type->Is(T::Number())) return HType::TaggedNumber();
  if (type->Is(T::Null())) return HType::Null();
  if (type->Is(T::String())) return HType::String();
  if (type->Is(T::Boolean())) return HType::Boolean();
  if (type->Is(T::Undefined())) return HType::Undefined();
  if (type->Is(T::Object())) return HType::JSObject();
  if (type->Is(T::Receiver())) return HType::JSReceiver();
  return HType::Tagged();
}


// static
template
HType HType::FromType<Type>(Type* type);


// static
template
HType HType::FromType<HeapType>(Handle<HeapType> type);


// static
HType HType::FromValue(Handle<Object> value) {
  if (value->IsSmi()) return HType::Smi();
  if (value->IsNull()) return HType::Null();
  if (value->IsHeapNumber()) {
    double n = Handle<v8::internal::HeapNumber>::cast(value)->value();
    return IsSmiDouble(n) ? HType::Smi() : HType::HeapNumber();
  }
  if (value->IsFloat32x4()) return HType::Float32x4();
  if (value->IsBool32x4()) return HType::Bool32x4();
  if (value->IsInt32x4()) return HType::Int32x4();
  if (value->IsString()) return HType::String();
  if (value->IsBoolean()) return HType::Boolean();
  if (value->IsUndefined()) return HType::Undefined();
  if (value->IsJSArray()) return HType::JSArray();
  if (value->IsJSObject()) return HType::JSObject();
  DCHECK(value->IsHeapObject());
  return HType::HeapObject();
}


// static
HType HType::FromRepresentation(Representation representation) {
  HType result = HType::Tagged();
  if (representation.IsSmi()) {
    result = HType::Smi();
  } else if (representation.IsDouble()) {
    result = HType::HeapNumber();
  } else if (representation.IsFloat32x4()) {
    result = HType::Float32x4();
  } else if (representation.IsBool32x4()) {
    result = HType::Bool32x4();
  } else if (representation.IsInt32x4()) {
    result = HType::Int32x4();
  }
  return result;
}


std::ostream& operator<<(std::ostream& os, const HType& t) {
  // Note: The c1visualizer syntax for locals allows only a sequence of the
  // following characters: A-Za-z0-9_-|:
  switch (t.kind_) {
#define DEFINE_CASE(Name, mask) \
  case HType::k##Name:          \
    return os << #Name;
    HTYPE_LIST(DEFINE_CASE)
#undef DEFINE_CASE
  }
  UNREACHABLE();
  return os;
}

}  // namespace internal
}  // namespace v8
