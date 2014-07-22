// Copyright 2012 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/v8.h"

#include "src/disassembler.h"
#include "src/disasm.h"
#include "src/jsregexp.h"
#include "src/objects-visiting.h"

namespace v8 {
namespace internal {

#ifdef OBJECT_PRINT

void Object::Print() {
  Print(stdout);
}


void Object::Print(FILE* out) {
  if (IsSmi()) {
    Smi::cast(this)->SmiPrint(out);
  } else {
    HeapObject::cast(this)->HeapObjectPrint(out);
  }
  Flush(out);
}


void Object::PrintLn() {
  PrintLn(stdout);
}


void Object::PrintLn(FILE* out) {
  Print(out);
  PrintF(out, "\n");
}


void HeapObject::PrintHeader(FILE* out, const char* id) {
  PrintF(out, "%p: [%s]\n", reinterpret_cast<void*>(this), id);
}


void HeapObject::HeapObjectPrint(FILE* out) {
  InstanceType instance_type = map()->instance_type();

  HandleScope scope(GetIsolate());
  if (instance_type < FIRST_NONSTRING_TYPE) {
    String::cast(this)->StringPrint(out);
    return;
  }

  switch (instance_type) {
    case SYMBOL_TYPE:
      Symbol::cast(this)->SymbolPrint(out);
      break;
    case MAP_TYPE:
      Map::cast(this)->MapPrint(out);
      break;
    case HEAP_NUMBER_TYPE:
      HeapNumber::cast(this)->HeapNumberPrint(out);
      break;
    case FLOAT32x4_TYPE:
      Float32x4::cast(this)->Float32x4Print(out);
      break;
    case FLOAT64x2_TYPE:
      Float64x2::cast(this)->Float64x2Print(out);
      break;
    case INT32x4_TYPE:
      Int32x4::cast(this)->Int32x4Print(out);
      break;
    case FIXED_DOUBLE_ARRAY_TYPE:
      FixedDoubleArray::cast(this)->FixedDoubleArrayPrint(out);
      break;
    case CONSTANT_POOL_ARRAY_TYPE:
      ConstantPoolArray::cast(this)->ConstantPoolArrayPrint(out);
      break;
    case FIXED_ARRAY_TYPE:
      FixedArray::cast(this)->FixedArrayPrint(out);
      break;
    case BYTE_ARRAY_TYPE:
      ByteArray::cast(this)->ByteArrayPrint(out);
      break;
    case FREE_SPACE_TYPE:
      FreeSpace::cast(this)->FreeSpacePrint(out);
      break;

#define PRINT_EXTERNAL_ARRAY(Type, type, TYPE, ctype, size)                    \
    case EXTERNAL_##TYPE##_ARRAY_TYPE:                                         \
      External##Type##Array::cast(this)->External##Type##ArrayPrint(out);      \
      break;

     TYPED_ARRAYS(PRINT_EXTERNAL_ARRAY)
#undef PRINT_EXTERNAL_ARRAY

#define PRINT_FIXED_TYPED_ARRAY(Type, type, TYPE, ctype, size)                 \
    case Fixed##Type##Array::kInstanceType:                                    \
      Fixed##Type##Array::cast(this)->FixedTypedArrayPrint(out);               \
      break;

    TYPED_ARRAYS(PRINT_FIXED_TYPED_ARRAY)
#undef PRINT_FIXED_TYPED_ARRAY

    case FILLER_TYPE:
      PrintF(out, "filler");
      break;
    case JS_OBJECT_TYPE:  // fall through
    case JS_CONTEXT_EXTENSION_OBJECT_TYPE:
    case JS_ARRAY_TYPE:
    case JS_GENERATOR_OBJECT_TYPE:
    case JS_REGEXP_TYPE:
      JSObject::cast(this)->JSObjectPrint(out);
      break;
    case ODDBALL_TYPE:
      Oddball::cast(this)->to_string()->Print(out);
      break;
    case JS_MODULE_TYPE:
      JSModule::cast(this)->JSModulePrint(out);
      break;
    case JS_FUNCTION_TYPE:
      JSFunction::cast(this)->JSFunctionPrint(out);
      break;
    case JS_GLOBAL_PROXY_TYPE:
      JSGlobalProxy::cast(this)->JSGlobalProxyPrint(out);
      break;
    case JS_GLOBAL_OBJECT_TYPE:
      JSGlobalObject::cast(this)->JSGlobalObjectPrint(out);
      break;
    case JS_BUILTINS_OBJECT_TYPE:
      JSBuiltinsObject::cast(this)->JSBuiltinsObjectPrint(out);
      break;
    case JS_VALUE_TYPE:
      PrintF(out, "Value wrapper around:");
      JSValue::cast(this)->value()->Print(out);
      break;
    case JS_DATE_TYPE:
      JSDate::cast(this)->JSDatePrint(out);
      break;
    case CODE_TYPE:
      Code::cast(this)->CodePrint(out);
      break;
    case JS_PROXY_TYPE:
      JSProxy::cast(this)->JSProxyPrint(out);
      break;
    case JS_FUNCTION_PROXY_TYPE:
      JSFunctionProxy::cast(this)->JSFunctionProxyPrint(out);
      break;
    case JS_SET_TYPE:
      JSSet::cast(this)->JSSetPrint(out);
      break;
    case JS_MAP_TYPE:
      JSMap::cast(this)->JSMapPrint(out);
      break;
    case JS_SET_ITERATOR_TYPE:
      JSSetIterator::cast(this)->JSSetIteratorPrint(out);
      break;
    case JS_MAP_ITERATOR_TYPE:
      JSMapIterator::cast(this)->JSMapIteratorPrint(out);
      break;
    case JS_WEAK_MAP_TYPE:
      JSWeakMap::cast(this)->JSWeakMapPrint(out);
      break;
    case JS_WEAK_SET_TYPE:
      JSWeakSet::cast(this)->JSWeakSetPrint(out);
      break;
    case FOREIGN_TYPE:
      Foreign::cast(this)->ForeignPrint(out);
      break;
    case SHARED_FUNCTION_INFO_TYPE:
      SharedFunctionInfo::cast(this)->SharedFunctionInfoPrint(out);
      break;
    case JS_MESSAGE_OBJECT_TYPE:
      JSMessageObject::cast(this)->JSMessageObjectPrint(out);
      break;
    case CELL_TYPE:
      Cell::cast(this)->CellPrint(out);
      break;
    case PROPERTY_CELL_TYPE:
      PropertyCell::cast(this)->PropertyCellPrint(out);
      break;
    case JS_ARRAY_BUFFER_TYPE:
      JSArrayBuffer::cast(this)->JSArrayBufferPrint(out);
      break;
    case JS_TYPED_ARRAY_TYPE:
      JSTypedArray::cast(this)->JSTypedArrayPrint(out);
      break;
    case JS_DATA_VIEW_TYPE:
      JSDataView::cast(this)->JSDataViewPrint(out);
      break;
#define MAKE_STRUCT_CASE(NAME, Name, name) \
  case NAME##_TYPE:                        \
    Name::cast(this)->Name##Print(out);    \
    break;
  STRUCT_LIST(MAKE_STRUCT_CASE)
#undef MAKE_STRUCT_CASE

    default:
      PrintF(out, "UNKNOWN TYPE %d", map()->instance_type());
      UNREACHABLE();
      break;
  }
}


void ByteArray::ByteArrayPrint(FILE* out) {
  PrintF(out, "byte array, data starts at %p", GetDataStartAddress());
}


void FreeSpace::FreeSpacePrint(FILE* out) {
  PrintF(out, "free space, size %d", Size());
}


#define EXTERNAL_ARRAY_PRINTER(Type, type, TYPE, ctype, size)                 \
  void External##Type##Array::External##Type##ArrayPrint(FILE* out) {         \
    PrintF(out, "external " #type " array");                                  \
  }

TYPED_ARRAYS(EXTERNAL_ARRAY_PRINTER)

#undef EXTERNAL_ARRAY_PRINTER


template <class Traits>
void FixedTypedArray<Traits>::FixedTypedArrayPrint(FILE* out) {
  PrintF(out, "fixed %s", Traits::Designator());
}


void JSObject::PrintProperties(FILE* out) {
  if (HasFastProperties()) {
    DescriptorArray* descs = map()->instance_descriptors();
    for (int i = 0; i < map()->NumberOfOwnDescriptors(); i++) {
      PrintF(out, "   ");
      descs->GetKey(i)->NamePrint(out);
      PrintF(out, ": ");
      switch (descs->GetType(i)) {
        case FIELD: {
          FieldIndex index = FieldIndex::ForDescriptor(map(), i);
          RawFastPropertyAt(index)->ShortPrint(out);
          PrintF(out, " (field at offset %d)\n", index.property_index());
          break;
        }
        case CONSTANT:
          descs->GetConstant(i)->ShortPrint(out);
          PrintF(out, " (constant)\n");
          break;
        case CALLBACKS:
          descs->GetCallbacksObject(i)->ShortPrint(out);
          PrintF(out, " (callback)\n");
          break;
        case NORMAL:  // only in slow mode
        case HANDLER:  // only in lookup results, not in descriptors
        case INTERCEPTOR:  // only in lookup results, not in descriptors
        // There are no transitions in the descriptor array.
        case NONEXISTENT:
          UNREACHABLE();
          break;
      }
    }
  } else {
    property_dictionary()->Print(out);
  }
}


template<class T>
static void DoPrintElements(FILE *out, Object* object) {
  T* p = T::cast(object);
  for (int i = 0; i < p->length(); i++) {
    PrintF(out, "   %d: %d\n", i, p->get_scalar(i));
  }
}


template<class T>
static void DoPrintDoubleElements(FILE* out, Object* object) {
  T* p = T::cast(object);
  for (int i = 0; i < p->length(); i++) {
    PrintF(out, "   %d: %f\n", i, p->get_scalar(i));
  }
}


template<class T>
static void DoPrintFloat32x4Elements(FILE* out, Object* object) {
  T* p = T::cast(object);
  for (int i = 0; i < p->length(); i++) {
    float32x4_value_t value =  p->get_scalar(i);
    PrintF(out, "   %d: (%f, %f, %f, %f)\n",
           i, value.storage[0], value.storage[1],
           value.storage[2], value.storage[3]);
  }
}


template<class T>
static void DoPrintFloat64x2Elements(FILE* out, Object* object) {
  T* p = T::cast(object);
  for (int i = 0; i < p->length(); i++) {
    float64x2_value_t value =  p->get_scalar(i);
    PrintF(out, "   %d: (%f, %f)\n", i, value.storage[0], value.storage[1]);
  }
}


template<class T>
static void DoPrintInt32x4Elements(FILE* out, Object* object) {
  T* p = T::cast(object);
  for (int i = 0; i < p->length(); i++) {
    int32x4_value_t value =  p->get_scalar(i);
    PrintF(out, "   %d: (%d, %d, %d, %d)\n",
           i, value.storage[0], value.storage[1],
           value.storage[2], value.storage[3]);
  }
}


void JSObject::PrintElements(FILE* out) {
  // Don't call GetElementsKind, its validation code can cause the printer to
  // fail when debugging.
  switch (map()->elements_kind()) {
    case FAST_HOLEY_SMI_ELEMENTS:
    case FAST_SMI_ELEMENTS:
    case FAST_HOLEY_ELEMENTS:
    case FAST_ELEMENTS: {
      // Print in array notation for non-sparse arrays.
      FixedArray* p = FixedArray::cast(elements());
      for (int i = 0; i < p->length(); i++) {
        PrintF(out, "   %d: ", i);
        p->get(i)->ShortPrint(out);
        PrintF(out, "\n");
      }
      break;
    }
    case FAST_HOLEY_DOUBLE_ELEMENTS:
    case FAST_DOUBLE_ELEMENTS: {
      // Print in array notation for non-sparse arrays.
      if (elements()->length() > 0) {
        FixedDoubleArray* p = FixedDoubleArray::cast(elements());
        for (int i = 0; i < p->length(); i++) {
          if (p->is_the_hole(i)) {
            PrintF(out, "   %d: <the hole>", i);
          } else {
            PrintF(out, "   %d: %g", i, p->get_scalar(i));
          }
          PrintF(out, "\n");
        }
      }
      break;
    }


#define PRINT_ELEMENTS(Kind, Type)                                          \
    case Kind: {                                                            \
      DoPrintElements<Type>(out, elements());                               \
      break;                                                                \
    }

#define PRINT_DOUBLE_ELEMENTS(Kind, Type)                                   \
    case Kind: {                                                            \
      DoPrintDoubleElements<Type>(out, elements());                         \
      break;                                                                \
    }

#define PRINT_FLOAT32x4_ELEMENTS(Kind, Type)                                \
    case Kind: {                                                            \
      DoPrintFloat32x4Elements<Type>(out, elements());                      \
      break;                                                                \
    }

#define PRINT_FLOAT64x2_ELEMENTS(Kind, Type)                                \
    case Kind: {                                                            \
      DoPrintFloat64x2Elements<Type>(out, elements());                      \
      break;                                                                \
    }

#define PRINT_INT32x4_ELEMENTS(Kind, Type)                                  \
    case Kind: {                                                            \
      DoPrintInt32x4Elements<Type>(out, elements());                        \
      break;                                                                \
    }

    PRINT_ELEMENTS(EXTERNAL_UINT8_CLAMPED_ELEMENTS, ExternalUint8ClampedArray)
    PRINT_ELEMENTS(EXTERNAL_INT8_ELEMENTS, ExternalInt8Array)
    PRINT_ELEMENTS(EXTERNAL_UINT8_ELEMENTS,
        ExternalUint8Array)
    PRINT_ELEMENTS(EXTERNAL_INT16_ELEMENTS, ExternalInt16Array)
    PRINT_ELEMENTS(EXTERNAL_UINT16_ELEMENTS,
        ExternalUint16Array)
    PRINT_ELEMENTS(EXTERNAL_INT32_ELEMENTS, ExternalInt32Array)
    PRINT_ELEMENTS(EXTERNAL_UINT32_ELEMENTS,
        ExternalUint32Array)
    PRINT_DOUBLE_ELEMENTS(EXTERNAL_FLOAT32_ELEMENTS, ExternalFloat32Array)
    PRINT_DOUBLE_ELEMENTS(EXTERNAL_FLOAT64_ELEMENTS, ExternalFloat64Array)
    PRINT_FLOAT32x4_ELEMENTS(EXTERNAL_FLOAT32x4_ELEMENTS,
        ExternalFloat32x4Array)
    PRINT_FLOAT64x2_ELEMENTS(EXTERNAL_FLOAT64x2_ELEMENTS,
        ExternalFloat64x2Array)
    PRINT_INT32x4_ELEMENTS(EXTERNAL_INT32x4_ELEMENTS, ExternalInt32x4Array)


    PRINT_ELEMENTS(UINT8_ELEMENTS, FixedUint8Array)
    PRINT_ELEMENTS(UINT8_CLAMPED_ELEMENTS, FixedUint8ClampedArray)
    PRINT_ELEMENTS(INT8_ELEMENTS, FixedInt8Array)
    PRINT_ELEMENTS(UINT16_ELEMENTS, FixedUint16Array)
    PRINT_ELEMENTS(INT16_ELEMENTS, FixedInt16Array)
    PRINT_ELEMENTS(UINT32_ELEMENTS, FixedUint32Array)
    PRINT_ELEMENTS(INT32_ELEMENTS, FixedInt32Array)
    PRINT_DOUBLE_ELEMENTS(FLOAT32_ELEMENTS, FixedFloat32Array)
    PRINT_DOUBLE_ELEMENTS(FLOAT64_ELEMENTS, FixedFloat64Array)
    PRINT_FLOAT32x4_ELEMENTS(FLOAT32x4_ELEMENTS, FixedFloat32x4Array)
    PRINT_FLOAT64x2_ELEMENTS(FLOAT64x2_ELEMENTS, FixedFloat64x2Array)
    PRINT_INT32x4_ELEMENTS(INT32x4_ELEMENTS, FixedInt32x4Array)

#undef PRINT_DOUBLE_ELEMENTS
#undef PRINT_ELEMENTS

    case DICTIONARY_ELEMENTS:
      elements()->Print(out);
      break;
    case SLOPPY_ARGUMENTS_ELEMENTS: {
      FixedArray* p = FixedArray::cast(elements());
      PrintF(out, "   parameter map:");
      for (int i = 2; i < p->length(); i++) {
        PrintF(out, " %d:", i - 2);
        p->get(i)->ShortPrint(out);
      }
      PrintF(out, "\n   context: ");
      p->get(0)->ShortPrint(out);
      PrintF(out, "\n   arguments: ");
      p->get(1)->ShortPrint(out);
      PrintF(out, "\n");
      break;
    }
  }
}


void JSObject::PrintTransitions(FILE* out) {
  if (!map()->HasTransitionArray()) return;
  TransitionArray* transitions = map()->transitions();
  for (int i = 0; i < transitions->number_of_transitions(); i++) {
    Name* key = transitions->GetKey(i);
    PrintF(out, "   ");
    key->NamePrint(out);
    PrintF(out, ": ");
    if (key == GetHeap()->frozen_symbol()) {
      PrintF(out, " (transition to frozen)\n");
    } else if (key == GetHeap()->elements_transition_symbol()) {
      PrintF(out, " (transition to ");
      PrintElementsKind(out, transitions->GetTarget(i)->elements_kind());
      PrintF(out, ")\n");
    } else if (key == GetHeap()->observed_symbol()) {
      PrintF(out, " (transition to Object.observe)\n");
    } else {
      switch (transitions->GetTargetDetails(i).type()) {
        case FIELD: {
          PrintF(out, " (transition to field)\n");
          break;
        }
        case CONSTANT:
          PrintF(out, " (transition to constant)\n");
          break;
        case CALLBACKS:
          PrintF(out, " (transition to callback)\n");
          break;
        // Values below are never in the target descriptor array.
        case NORMAL:
        case HANDLER:
        case INTERCEPTOR:
        case NONEXISTENT:
          UNREACHABLE();
          break;
      }
    }
  }
}


void JSObject::JSObjectPrint(FILE* out) {
  PrintF(out, "%p: [JSObject]\n", reinterpret_cast<void*>(this));
  PrintF(out, " - map = %p [", reinterpret_cast<void*>(map()));
  // Don't call GetElementsKind, its validation code can cause the printer to
  // fail when debugging.
  PrintElementsKind(out, this->map()->elements_kind());
  PrintF(out,
         "]\n - prototype = %p\n",
         reinterpret_cast<void*>(GetPrototype()));
  PrintF(out, " {\n");
  PrintProperties(out);
  PrintTransitions(out);
  PrintElements(out);
  PrintF(out, " }\n");
}


void JSModule::JSModulePrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSModule");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - context = ");
  context()->Print(out);
  PrintF(out, " - scope_info = ");
  scope_info()->ShortPrint(out);
  PrintElementsKind(out, this->map()->elements_kind());
  PrintF(out, " {\n");
  PrintProperties(out);
  PrintElements(out);
  PrintF(out, " }\n");
}


static const char* TypeToString(InstanceType type) {
  switch (type) {
#define TYPE_TO_STRING(TYPE) case TYPE: return #TYPE;
  INSTANCE_TYPE_LIST(TYPE_TO_STRING)
#undef TYPE_TO_STRING
  }
  UNREACHABLE();
  return "UNKNOWN";  // Keep the compiler happy.
}


void Symbol::SymbolPrint(FILE* out) {
  HeapObject::PrintHeader(out, "Symbol");
  PrintF(out, " - hash: %d\n", Hash());
  PrintF(out, " - name: ");
  name()->ShortPrint();
  PrintF(out, " - private: %d\n", is_private());
  PrintF(out, "\n");
}


void Map::MapPrint(FILE* out) {
  HeapObject::PrintHeader(out, "Map");
  PrintF(out, " - type: %s\n", TypeToString(instance_type()));
  PrintF(out, " - instance size: %d\n", instance_size());
  PrintF(out, " - inobject properties: %d\n", inobject_properties());
  PrintF(out, " - elements kind: ");
  PrintElementsKind(out, elements_kind());
  PrintF(out, "\n - pre-allocated property fields: %d\n",
      pre_allocated_property_fields());
  PrintF(out, " - unused property fields: %d\n", unused_property_fields());
  if (is_hidden_prototype()) {
    PrintF(out, " - hidden_prototype\n");
  }
  if (has_named_interceptor()) {
    PrintF(out, " - named_interceptor\n");
  }
  if (has_indexed_interceptor()) {
    PrintF(out, " - indexed_interceptor\n");
  }
  if (is_undetectable()) {
    PrintF(out, " - undetectable\n");
  }
  if (has_instance_call_handler()) {
    PrintF(out, " - instance_call_handler\n");
  }
  if (is_access_check_needed()) {
    PrintF(out, " - access_check_needed\n");
  }
  if (is_frozen()) {
    PrintF(out, " - frozen\n");
  } else if (!is_extensible()) {
    PrintF(out, " - sealed\n");
  }
  PrintF(out, " - back pointer: ");
  GetBackPointer()->ShortPrint(out);
  PrintF(out, "\n - instance descriptors %s#%i: ",
         owns_descriptors() ? "(own) " : "",
         NumberOfOwnDescriptors());
  instance_descriptors()->ShortPrint(out);
  if (HasTransitionArray()) {
    PrintF(out, "\n - transitions: ");
    transitions()->ShortPrint(out);
  }
  PrintF(out, "\n - prototype: ");
  prototype()->ShortPrint(out);
  PrintF(out, "\n - constructor: ");
  constructor()->ShortPrint(out);
  PrintF(out, "\n - code cache: ");
  code_cache()->ShortPrint(out);
  PrintF(out, "\n - dependent code: ");
  dependent_code()->ShortPrint(out);
  PrintF(out, "\n");
}


void CodeCache::CodeCachePrint(FILE* out) {
  HeapObject::PrintHeader(out, "CodeCache");
  PrintF(out, "\n - default_cache: ");
  default_cache()->ShortPrint(out);
  PrintF(out, "\n - normal_type_cache: ");
  normal_type_cache()->ShortPrint(out);
}


void PolymorphicCodeCache::PolymorphicCodeCachePrint(FILE* out) {
  HeapObject::PrintHeader(out, "PolymorphicCodeCache");
  PrintF(out, "\n - cache: ");
  cache()->ShortPrint(out);
}


void TypeFeedbackInfo::TypeFeedbackInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "TypeFeedbackInfo");
  PrintF(out, " - ic_total_count: %d, ic_with_type_info_count: %d\n",
         ic_total_count(), ic_with_type_info_count());
}


void AliasedArgumentsEntry::AliasedArgumentsEntryPrint(FILE* out) {
  HeapObject::PrintHeader(out, "AliasedArgumentsEntry");
  PrintF(out, "\n - aliased_context_slot: %d", aliased_context_slot());
}


void FixedArray::FixedArrayPrint(FILE* out) {
  HeapObject::PrintHeader(out, "FixedArray");
  PrintF(out, " - length: %d", length());
  for (int i = 0; i < length(); i++) {
    PrintF(out, "\n  [%d]: ", i);
    get(i)->ShortPrint(out);
  }
  PrintF(out, "\n");
}


void FixedDoubleArray::FixedDoubleArrayPrint(FILE* out) {
  HeapObject::PrintHeader(out, "FixedDoubleArray");
  PrintF(out, " - length: %d", length());
  for (int i = 0; i < length(); i++) {
    if (is_the_hole(i)) {
      PrintF(out, "\n  [%d]: <the hole>", i);
    } else {
      PrintF(out, "\n  [%d]: %g", i, get_scalar(i));
    }
  }
  PrintF(out, "\n");
}


void ConstantPoolArray::ConstantPoolArrayPrint(FILE* out) {
  HeapObject::PrintHeader(out, "ConstantPoolArray");
  PrintF(out, " - length: %d", length());
  for (int i = 0; i <= last_index(INT32, SMALL_SECTION); i++) {
    if (i < last_index(INT64, SMALL_SECTION)) {
      PrintF(out, "\n  [%d]: double: %g", i, get_int64_entry_as_double(i));
    } else if (i <= last_index(CODE_PTR, SMALL_SECTION)) {
      PrintF(out, "\n  [%d]: code target pointer: %p", i,
             reinterpret_cast<void*>(get_code_ptr_entry(i)));
    } else if (i <= last_index(HEAP_PTR, SMALL_SECTION)) {
      PrintF(out, "\n  [%d]: heap pointer: %p", i,
             reinterpret_cast<void*>(get_heap_ptr_entry(i)));
    } else if (i <= last_index(INT32, SMALL_SECTION)) {
      PrintF(out, "\n  [%d]: int32: %d", i, get_int32_entry(i));
    }
  }
  if (is_extended_layout()) {
    PrintF(out, "\n  Extended section:");
    for (int i = first_extended_section_index();
         i <= last_index(INT32, EXTENDED_SECTION); i++) {
    if (i < last_index(INT64, EXTENDED_SECTION)) {
      PrintF(out, "\n  [%d]: double: %g", i, get_int64_entry_as_double(i));
    } else if (i <= last_index(CODE_PTR, EXTENDED_SECTION)) {
      PrintF(out, "\n  [%d]: code target pointer: %p", i,
             reinterpret_cast<void*>(get_code_ptr_entry(i)));
    } else if (i <= last_index(HEAP_PTR, EXTENDED_SECTION)) {
      PrintF(out, "\n  [%d]: heap pointer: %p", i,
             reinterpret_cast<void*>(get_heap_ptr_entry(i)));
    } else if (i <= last_index(INT32, EXTENDED_SECTION)) {
      PrintF(out, "\n  [%d]: int32: %d", i, get_int32_entry(i));
    }
  }
  }
  PrintF(out, "\n");
}


void JSValue::JSValuePrint(FILE* out) {
  HeapObject::PrintHeader(out, "ValueObject");
  value()->Print(out);
}


void JSMessageObject::JSMessageObjectPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSMessageObject");
  PrintF(out, " - type: ");
  type()->ShortPrint(out);
  PrintF(out, "\n - arguments: ");
  arguments()->ShortPrint(out);
  PrintF(out, "\n - start_position: %d", start_position());
  PrintF(out, "\n - end_position: %d", end_position());
  PrintF(out, "\n - script: ");
  script()->ShortPrint(out);
  PrintF(out, "\n - stack_frames: ");
  stack_frames()->ShortPrint(out);
  PrintF(out, "\n");
}


void String::StringPrint(FILE* out) {
  if (StringShape(this).IsInternalized()) {
    PrintF(out, "#");
  } else if (StringShape(this).IsCons()) {
    PrintF(out, "c\"");
  } else {
    PrintF(out, "\"");
  }

  const char truncated_epilogue[] = "...<truncated>";
  int len = length();
  if (!FLAG_use_verbose_printer) {
    if (len > 100) {
      len = 100 - sizeof(truncated_epilogue);
    }
  }
  for (int i = 0; i < len; i++) {
    PrintF(out, "%c", Get(i));
  }
  if (len != length()) {
    PrintF(out, "%s", truncated_epilogue);
  }

  if (!StringShape(this).IsInternalized()) PrintF(out, "\"");
}


void Name::NamePrint(FILE* out) {
  if (IsString())
    String::cast(this)->StringPrint(out);
  else
    ShortPrint();
}


// This method is only meant to be called from gdb for debugging purposes.
// Since the string can also be in two-byte encoding, non-ASCII characters
// will be ignored in the output.
char* String::ToAsciiArray() {
  // Static so that subsequent calls frees previously allocated space.
  // This also means that previous results will be overwritten.
  static char* buffer = NULL;
  if (buffer != NULL) free(buffer);
  buffer = new char[length()+1];
  WriteToFlat(this, reinterpret_cast<uint8_t*>(buffer), 0, length());
  buffer[length()] = 0;
  return buffer;
}


static const char* const weekdays[] = {
  "???", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
};


void JSDate::JSDatePrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSDate");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - value = ");
  value()->Print(out);
  if (!year()->IsSmi()) {
    PrintF(out, " - time = NaN\n");
  } else {
    PrintF(out, " - time = %s %04d/%02d/%02d %02d:%02d:%02d\n",
           weekdays[weekday()->IsSmi() ? Smi::cast(weekday())->value() + 1 : 0],
           year()->IsSmi() ? Smi::cast(year())->value() : -1,
           month()->IsSmi() ? Smi::cast(month())->value() : -1,
           day()->IsSmi() ? Smi::cast(day())->value() : -1,
           hour()->IsSmi() ? Smi::cast(hour())->value() : -1,
           min()->IsSmi() ? Smi::cast(min())->value() : -1,
           sec()->IsSmi() ? Smi::cast(sec())->value() : -1);
  }
}


void JSProxy::JSProxyPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSProxy");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - handler = ");
  handler()->Print(out);
  PrintF(out, "\n - hash = ");
  hash()->Print(out);
  PrintF(out, "\n");
}


void JSFunctionProxy::JSFunctionProxyPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSFunctionProxy");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - handler = ");
  handler()->Print(out);
  PrintF(out, "\n - call_trap = ");
  call_trap()->Print(out);
  PrintF(out, "\n - construct_trap = ");
  construct_trap()->Print(out);
  PrintF(out, "\n");
}


void JSSet::JSSetPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSSet");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - table = ");
  table()->ShortPrint(out);
  PrintF(out, "\n");
}


void JSMap::JSMapPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSMap");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - table = ");
  table()->ShortPrint(out);
  PrintF(out, "\n");
}


template<class Derived, class TableType>
void OrderedHashTableIterator<Derived, TableType>::
    OrderedHashTableIteratorPrint(FILE* out) {
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - table = ");
  table()->ShortPrint(out);
  PrintF(out, "\n - index = ");
  index()->ShortPrint(out);
  PrintF(out, "\n - kind = ");
  kind()->ShortPrint(out);
  PrintF(out, "\n");
}


template void
OrderedHashTableIterator<JSSetIterator,
    OrderedHashSet>::OrderedHashTableIteratorPrint(FILE* out);


template void
OrderedHashTableIterator<JSMapIterator,
    OrderedHashMap>::OrderedHashTableIteratorPrint(FILE* out);


void JSSetIterator::JSSetIteratorPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSSetIterator");
  OrderedHashTableIteratorPrint(out);
}


void JSMapIterator::JSMapIteratorPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSMapIterator");
  OrderedHashTableIteratorPrint(out);
}


void JSWeakMap::JSWeakMapPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSWeakMap");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - table = ");
  table()->ShortPrint(out);
  PrintF(out, "\n");
}


void JSWeakSet::JSWeakSetPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSWeakSet");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - table = ");
  table()->ShortPrint(out);
  PrintF(out, "\n");
}


void JSArrayBuffer::JSArrayBufferPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSArrayBuffer");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - backing_store = %p\n", backing_store());
  PrintF(out, " - byte_length = ");
  byte_length()->ShortPrint(out);
  PrintF(out, "\n");
}


void JSTypedArray::JSTypedArrayPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSTypedArray");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - buffer =");
  buffer()->ShortPrint(out);
  PrintF(out, "\n - byte_offset = ");
  byte_offset()->ShortPrint(out);
  PrintF(out, "\n - byte_length = ");
  byte_length()->ShortPrint(out);
  PrintF(out, "\n - length = ");
  length()->ShortPrint(out);
  PrintF(out, "\n");
  PrintElements(out);
}


void JSDataView::JSDataViewPrint(FILE* out) {
  HeapObject::PrintHeader(out, "JSDataView");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - buffer =");
  buffer()->ShortPrint(out);
  PrintF(out, "\n - byte_offset = ");
  byte_offset()->ShortPrint(out);
  PrintF(out, "\n - byte_length = ");
  byte_length()->ShortPrint(out);
  PrintF(out, "\n");
}


void JSFunction::JSFunctionPrint(FILE* out) {
  HeapObject::PrintHeader(out, "Function");
  PrintF(out, " - map = %p\n", reinterpret_cast<void*>(map()));
  PrintF(out, " - initial_map = ");
  if (has_initial_map()) {
    initial_map()->ShortPrint(out);
  }
  PrintF(out, "\n - shared_info = ");
  shared()->ShortPrint(out);
  PrintF(out, "\n   - name = ");
  shared()->name()->Print(out);
  PrintF(out, "\n - context = ");
  context()->ShortPrint(out);
  if (shared()->bound()) {
    PrintF(out, "\n - bindings = ");
    function_bindings()->ShortPrint(out);
  } else {
    PrintF(out, "\n - literals = ");
    literals()->ShortPrint(out);
  }
  PrintF(out, "\n - code = ");
  code()->ShortPrint(out);
  PrintF(out, "\n");

  PrintProperties(out);
  PrintElements(out);

  PrintF(out, "\n");
}


void SharedFunctionInfo::SharedFunctionInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "SharedFunctionInfo");
  PrintF(out, " - name: ");
  name()->ShortPrint(out);
  PrintF(out, "\n - expected_nof_properties: %d", expected_nof_properties());
  PrintF(out, "\n - ast_node_count: %d", ast_node_count());
  PrintF(out, "\n - instance class name = ");
  instance_class_name()->Print(out);
  PrintF(out, "\n - code = ");
  code()->ShortPrint(out);
  if (HasSourceCode()) {
    PrintF(out, "\n - source code = ");
    String* source = String::cast(Script::cast(script())->source());
    int start = start_position();
    int length = end_position() - start;
    SmartArrayPointer<char> source_string =
        source->ToCString(DISALLOW_NULLS,
                          FAST_STRING_TRAVERSAL,
                          start, length, NULL);
    PrintF(out, "%s", source_string.get());
  }
  // Script files are often large, hard to read.
  // PrintF(out, "\n - script =");
  // script()->Print(out);
  PrintF(out, "\n - function token position = %d", function_token_position());
  PrintF(out, "\n - start position = %d", start_position());
  PrintF(out, "\n - end position = %d", end_position());
  PrintF(out, "\n - is expression = %d", is_expression());
  PrintF(out, "\n - debug info = ");
  debug_info()->ShortPrint(out);
  PrintF(out, "\n - length = %d", length());
  PrintF(out, "\n - optimized_code_map = ");
  optimized_code_map()->ShortPrint(out);
  PrintF(out, "\n - feedback_vector = ");
  feedback_vector()->FixedArrayPrint(out);
  PrintF(out, "\n");
}


void JSGlobalProxy::JSGlobalProxyPrint(FILE* out) {
  PrintF(out, "global_proxy ");
  JSObjectPrint(out);
  PrintF(out, "native context : ");
  native_context()->ShortPrint(out);
  PrintF(out, "\n");
}


void JSGlobalObject::JSGlobalObjectPrint(FILE* out) {
  PrintF(out, "global ");
  JSObjectPrint(out);
  PrintF(out, "native context : ");
  native_context()->ShortPrint(out);
  PrintF(out, "\n");
}


void JSBuiltinsObject::JSBuiltinsObjectPrint(FILE* out) {
  PrintF(out, "builtins ");
  JSObjectPrint(out);
}


void Cell::CellPrint(FILE* out) {
  HeapObject::PrintHeader(out, "Cell");
}


void PropertyCell::PropertyCellPrint(FILE* out) {
  HeapObject::PrintHeader(out, "PropertyCell");
}


void Code::CodePrint(FILE* out) {
  HeapObject::PrintHeader(out, "Code");
#ifdef ENABLE_DISASSEMBLER
  if (FLAG_use_verbose_printer) {
    Disassemble(NULL, out);
  }
#endif
}


void Foreign::ForeignPrint(FILE* out) {
  PrintF(out, "foreign address : %p", foreign_address());
}


void ExecutableAccessorInfo::ExecutableAccessorInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "ExecutableAccessorInfo");
  PrintF(out, "\n - name: ");
  name()->ShortPrint(out);
  PrintF(out, "\n - flag: ");
  flag()->ShortPrint(out);
  PrintF(out, "\n - getter: ");
  getter()->ShortPrint(out);
  PrintF(out, "\n - setter: ");
  setter()->ShortPrint(out);
  PrintF(out, "\n - data: ");
  data()->ShortPrint(out);
}


void DeclaredAccessorInfo::DeclaredAccessorInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "DeclaredAccessorInfo");
  PrintF(out, "\n - name: ");
  name()->ShortPrint(out);
  PrintF(out, "\n - flag: ");
  flag()->ShortPrint(out);
  PrintF(out, "\n - descriptor: ");
  descriptor()->ShortPrint(out);
}


void DeclaredAccessorDescriptor::DeclaredAccessorDescriptorPrint(FILE* out) {
  HeapObject::PrintHeader(out, "DeclaredAccessorDescriptor");
  PrintF(out, "\n - internal field: ");
  serialized_data()->ShortPrint(out);
}


void Box::BoxPrint(FILE* out) {
  HeapObject::PrintHeader(out, "Box");
  PrintF(out, "\n - value: ");
  value()->ShortPrint(out);
}


void AccessorPair::AccessorPairPrint(FILE* out) {
  HeapObject::PrintHeader(out, "AccessorPair");
  PrintF(out, "\n - getter: ");
  getter()->ShortPrint(out);
  PrintF(out, "\n - setter: ");
  setter()->ShortPrint(out);
  PrintF(out, "\n - flag: ");
  access_flags()->ShortPrint(out);
}


void AccessCheckInfo::AccessCheckInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "AccessCheckInfo");
  PrintF(out, "\n - named_callback: ");
  named_callback()->ShortPrint(out);
  PrintF(out, "\n - indexed_callback: ");
  indexed_callback()->ShortPrint(out);
  PrintF(out, "\n - data: ");
  data()->ShortPrint(out);
}


void InterceptorInfo::InterceptorInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "InterceptorInfo");
  PrintF(out, "\n - getter: ");
  getter()->ShortPrint(out);
  PrintF(out, "\n - setter: ");
  setter()->ShortPrint(out);
  PrintF(out, "\n - query: ");
  query()->ShortPrint(out);
  PrintF(out, "\n - deleter: ");
  deleter()->ShortPrint(out);
  PrintF(out, "\n - enumerator: ");
  enumerator()->ShortPrint(out);
  PrintF(out, "\n - data: ");
  data()->ShortPrint(out);
}


void CallHandlerInfo::CallHandlerInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "CallHandlerInfo");
  PrintF(out, "\n - callback: ");
  callback()->ShortPrint(out);
  PrintF(out, "\n - data: ");
  data()->ShortPrint(out);
  PrintF(out, "\n - call_stub_cache: ");
}


void FunctionTemplateInfo::FunctionTemplateInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "FunctionTemplateInfo");
  PrintF(out, "\n - class name: ");
  class_name()->ShortPrint(out);
  PrintF(out, "\n - tag: ");
  tag()->ShortPrint(out);
  PrintF(out, "\n - property_list: ");
  property_list()->ShortPrint(out);
  PrintF(out, "\n - serial_number: ");
  serial_number()->ShortPrint(out);
  PrintF(out, "\n - call_code: ");
  call_code()->ShortPrint(out);
  PrintF(out, "\n - property_accessors: ");
  property_accessors()->ShortPrint(out);
  PrintF(out, "\n - prototype_template: ");
  prototype_template()->ShortPrint(out);
  PrintF(out, "\n - parent_template: ");
  parent_template()->ShortPrint(out);
  PrintF(out, "\n - named_property_handler: ");
  named_property_handler()->ShortPrint(out);
  PrintF(out, "\n - indexed_property_handler: ");
  indexed_property_handler()->ShortPrint(out);
  PrintF(out, "\n - instance_template: ");
  instance_template()->ShortPrint(out);
  PrintF(out, "\n - signature: ");
  signature()->ShortPrint(out);
  PrintF(out, "\n - access_check_info: ");
  access_check_info()->ShortPrint(out);
  PrintF(out, "\n - hidden_prototype: %s",
         hidden_prototype() ? "true" : "false");
  PrintF(out, "\n - undetectable: %s", undetectable() ? "true" : "false");
  PrintF(out, "\n - need_access_check: %s",
         needs_access_check() ? "true" : "false");
}


void ObjectTemplateInfo::ObjectTemplateInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "ObjectTemplateInfo");
  PrintF(out, " - tag: ");
  tag()->ShortPrint(out);
  PrintF(out, "\n - property_list: ");
  property_list()->ShortPrint(out);
  PrintF(out, "\n - property_accessors: ");
  property_accessors()->ShortPrint(out);
  PrintF(out, "\n - constructor: ");
  constructor()->ShortPrint(out);
  PrintF(out, "\n - internal_field_count: ");
  internal_field_count()->ShortPrint(out);
  PrintF(out, "\n");
}


void SignatureInfo::SignatureInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "SignatureInfo");
  PrintF(out, "\n - receiver: ");
  receiver()->ShortPrint(out);
  PrintF(out, "\n - args: ");
  args()->ShortPrint(out);
}


void TypeSwitchInfo::TypeSwitchInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "TypeSwitchInfo");
  PrintF(out, "\n - types: ");
  types()->ShortPrint(out);
}


void AllocationSite::AllocationSitePrint(FILE* out) {
  HeapObject::PrintHeader(out, "AllocationSite");
  PrintF(out, " - weak_next: ");
  weak_next()->ShortPrint(out);
  PrintF(out, "\n - dependent code: ");
  dependent_code()->ShortPrint(out);
  PrintF(out, "\n - nested site: ");
  nested_site()->ShortPrint(out);
  PrintF(out, "\n - memento found count: ");
  Smi::FromInt(memento_found_count())->ShortPrint(out);
  PrintF(out, "\n - memento create count: ");
  Smi::FromInt(memento_create_count())->ShortPrint(out);
  PrintF(out, "\n - pretenure decision: ");
  Smi::FromInt(pretenure_decision())->ShortPrint(out);
  PrintF(out, "\n - transition_info: ");
  if (transition_info()->IsSmi()) {
    ElementsKind kind = GetElementsKind();
    PrintF(out, "Array allocation with ElementsKind ");
    PrintElementsKind(out, kind);
    PrintF(out, "\n");
    return;
  } else if (transition_info()->IsJSArray()) {
    PrintF(out, "Array literal ");
    transition_info()->ShortPrint(out);
    PrintF(out, "\n");
    return;
  }

  PrintF(out, "unknown transition_info");
  transition_info()->ShortPrint(out);
  PrintF(out, "\n");
}


void AllocationMemento::AllocationMementoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "AllocationMemento");
  PrintF(out, " - allocation site: ");
  if (IsValid()) {
    GetAllocationSite()->Print();
  } else {
    PrintF(out, "<invalid>\n");
  }
}


void Script::ScriptPrint(FILE* out) {
  HeapObject::PrintHeader(out, "Script");
  PrintF(out, "\n - source: ");
  source()->ShortPrint(out);
  PrintF(out, "\n - name: ");
  name()->ShortPrint(out);
  PrintF(out, "\n - line_offset: ");
  line_offset()->ShortPrint(out);
  PrintF(out, "\n - column_offset: ");
  column_offset()->ShortPrint(out);
  PrintF(out, "\n - type: ");
  type()->ShortPrint(out);
  PrintF(out, "\n - id: ");
  id()->ShortPrint(out);
  PrintF(out, "\n - context data: ");
  context_data()->ShortPrint(out);
  PrintF(out, "\n - wrapper: ");
  wrapper()->ShortPrint(out);
  PrintF(out, "\n - compilation type: %d", compilation_type());
  PrintF(out, "\n - line ends: ");
  line_ends()->ShortPrint(out);
  PrintF(out, "\n - eval from shared: ");
  eval_from_shared()->ShortPrint(out);
  PrintF(out, "\n - eval from instructions offset: ");
  eval_from_instructions_offset()->ShortPrint(out);
  PrintF(out, "\n");
}


void DebugInfo::DebugInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "DebugInfo");
  PrintF(out, "\n - shared: ");
  shared()->ShortPrint(out);
  PrintF(out, "\n - original_code: ");
  original_code()->ShortPrint(out);
  PrintF(out, "\n - code: ");
  code()->ShortPrint(out);
  PrintF(out, "\n - break_points: ");
  break_points()->Print(out);
}


void BreakPointInfo::BreakPointInfoPrint(FILE* out) {
  HeapObject::PrintHeader(out, "BreakPointInfo");
  PrintF(out, "\n - code_position: %d", code_position()->value());
  PrintF(out, "\n - source_position: %d", source_position()->value());
  PrintF(out, "\n - statement_position: %d", statement_position()->value());
  PrintF(out, "\n - break_point_objects: ");
  break_point_objects()->ShortPrint(out);
}


void DescriptorArray::PrintDescriptors(FILE* out) {
  PrintF(out, "Descriptor array  %d\n", number_of_descriptors());
  for (int i = 0; i < number_of_descriptors(); i++) {
    PrintF(out, " %d: ", i);
    Descriptor desc;
    Get(i, &desc);
    desc.Print(out);
  }
  PrintF(out, "\n");
}


void TransitionArray::PrintTransitions(FILE* out) {
  PrintF(out, "Transition array  %d\n", number_of_transitions());
  for (int i = 0; i < number_of_transitions(); i++) {
    PrintF(out, " %d: ", i);
    GetKey(i)->NamePrint(out);
    PrintF(out, ": ");
    switch (GetTargetDetails(i).type()) {
      case FIELD: {
        PrintF(out, " (transition to field)\n");
        break;
      }
      case CONSTANT:
        PrintF(out, " (transition to constant)\n");
        break;
      case CALLBACKS:
        PrintF(out, " (transition to callback)\n");
        break;
      // Values below are never in the target descriptor array.
      case NORMAL:
      case HANDLER:
      case INTERCEPTOR:
      case NONEXISTENT:
        UNREACHABLE();
        break;
    }
  }
  PrintF(out, "\n");
}


#endif  // OBJECT_PRINT


} }  // namespace v8::internal
