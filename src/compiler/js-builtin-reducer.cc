// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/compiler/diamond.h"
#include "src/compiler/js-builtin-reducer.h"
#include "src/compiler/js-graph.h"
#include "src/compiler/node-matchers.h"
#include "src/compiler/node-properties.h"
#include "src/types.h"

namespace v8 {
namespace internal {
namespace compiler {


// Helper method that assumes replacement nodes are pure values that don't
// produce an effect. Replaces {node} with {reduction} and relaxes effects.
static Reduction ReplaceWithPureReduction(Node* node, Reduction reduction) {
  if (reduction.Changed()) {
    NodeProperties::ReplaceWithValue(node, reduction.replacement());
    return reduction;
  }
  return Reducer::NoChange();
}


// Helper class to access JSCallFunction nodes that are potential candidates
// for reduction when they have a BuiltinFunctionId associated with them.
class JSCallReduction {
 public:
  explicit JSCallReduction(Node* node) : node_(node) {}

  // Determines whether the node is a JSCallFunction operation that targets a
  // constant callee being a well-known builtin with a BuiltinFunctionId.
  bool HasBuiltinFunctionId() {
    if (node_->opcode() != IrOpcode::kJSCallFunction) return false;
    HeapObjectMatcher<Object> m(NodeProperties::GetValueInput(node_, 0));
    if (!m.HasValue() || !m.Value().handle()->IsJSFunction()) return false;
    Handle<JSFunction> function = Handle<JSFunction>::cast(m.Value().handle());
    return function->shared()->HasBuiltinFunctionId();
  }

  // Retrieves the BuiltinFunctionId as described above.
  BuiltinFunctionId GetBuiltinFunctionId() {
    DCHECK_EQ(IrOpcode::kJSCallFunction, node_->opcode());
    HeapObjectMatcher<Object> m(NodeProperties::GetValueInput(node_, 0));
    Handle<JSFunction> function = Handle<JSFunction>::cast(m.Value().handle());
    return function->shared()->builtin_function_id();
  }

  // Determines whether the call takes zero inputs.
  bool InputsMatchZero() { return GetJSCallArity() == 0; }

  // Determines whether the call takes one input of the given type.
  bool InputsMatchOne(Type* t1) {
    return GetJSCallArity() == 1 &&
           NodeProperties::GetBounds(GetJSCallInput(0)).upper->Is(t1);
  }

  // Determines whether the call takes two inputs of the given types.
  bool InputsMatchTwo(Type* t1, Type* t2) {
    return GetJSCallArity() == 2 &&
           NodeProperties::GetBounds(GetJSCallInput(0)).upper->Is(t1) &&
           NodeProperties::GetBounds(GetJSCallInput(1)).upper->Is(t2);
  }

  // Determines whether the call takes inputs all of the given type.
  bool InputsMatchAll(Type* t) {
    for (int i = 0; i < GetJSCallArity(); i++) {
      if (!NodeProperties::GetBounds(GetJSCallInput(i)).upper->Is(t)) {
        return false;
      }
    }
    return true;
  }

  Node* left() { return GetJSCallInput(0); }
  Node* right() { return GetJSCallInput(1); }

  int GetJSCallArity() {
    DCHECK_EQ(IrOpcode::kJSCallFunction, node_->opcode());
    // Skip first (i.e. callee) and second (i.e. receiver) operand.
    return node_->op()->ValueInputCount() - 2;
  }

  Node* GetJSCallInput(int index) {
    DCHECK_EQ(IrOpcode::kJSCallFunction, node_->opcode());
    DCHECK_LT(index, GetJSCallArity());
    // Skip first (i.e. callee) and second (i.e. receiver) operand.
    return NodeProperties::GetValueInput(node_, index + 2);
  }

 private:
  Node* node_;
};


JSBuiltinReducer::JSBuiltinReducer(JSGraph* jsgraph)
    : jsgraph_(jsgraph), simplified_(jsgraph->zone()) {
}


// ECMA-262, section 15.8.2.11.
Reduction JSBuiltinReducer::ReduceMathMax(Node* node) {
  JSCallReduction r(node);
  if (r.InputsMatchZero()) {
    // Math.max() -> -Infinity
    return Replace(jsgraph()->Constant(-V8_INFINITY));
  }
  if (r.InputsMatchOne(Type::Number())) {
    // Math.max(a:number) -> a
    return Replace(r.left());
  }
  if (r.InputsMatchAll(Type::Integral32())) {
    // Math.max(a:int32, b:int32, ...)
    Node* value = r.GetJSCallInput(0);
    for (int i = 1; i < r.GetJSCallArity(); i++) {
      Node* const input = r.GetJSCallInput(i);
      value = graph()->NewNode(
          common()->Select(kMachNone),
          graph()->NewNode(simplified()->NumberLessThan(), input, value), value,
          input);
    }
    return Replace(value);
  }
  return NoChange();
}


// ES6 draft 08-24-14, section 20.2.2.19.
Reduction JSBuiltinReducer::ReduceMathImul(Node* node) {
  JSCallReduction r(node);
  if (r.InputsMatchTwo(Type::Integral32(), Type::Integral32())) {
    // Math.imul(a:int32, b:int32) -> Int32Mul(a, b)
    Node* value = graph()->NewNode(machine()->Int32Mul(), r.left(), r.right());
    return Replace(value);
  }
  return NoChange();
}


// ES6 draft 08-24-14, section 20.2.2.17.
Reduction JSBuiltinReducer::ReduceMathFround(Node* node) {
  JSCallReduction r(node);
  if (r.InputsMatchOne(Type::Number())) {
    // Math.fround(a:number) -> TruncateFloat64ToFloat32(a)
    Node* value =
        graph()->NewNode(machine()->TruncateFloat64ToFloat32(), r.left());
    return Replace(value);
  }
  return NoChange();
}


#define SIMD_WARNING(opcode, node)                                 \
  if (FLAG_simd_warning) {                                         \
    fprintf(stderr, "Warning: %s[#%d] is not inlined!\n", #opcode, \
            node->id());                                           \
  }


#define REDUCED_SIMD_BINARY_OPERATIONS(V)                        \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4Add)                \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4Sub)                \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4Mul)                \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4Div)                \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4Max)                \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4Min)                \
  V(GetFloat32x4(), Type::Number(), Float32x4Scale)              \
  V(GetFloat32x4(), Type::Number(), Float32x4WithX)              \
  V(GetFloat32x4(), Type::Number(), Float32x4WithY)              \
  V(GetFloat32x4(), Type::Number(), Float32x4WithZ)              \
  V(GetFloat32x4(), Type::Number(), Float32x4WithW)              \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4Equal)              \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4NotEqual)           \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4GreaterThan)        \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4GreaterThanOrEqual) \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4LessThan)           \
  V(GetFloat32x4(), GetFloat32x4(), Float32x4LessThanOrEqual)    \
  V(GetInt32x4(), GetInt32x4(), Int32x4Add)                      \
  V(GetInt32x4(), GetInt32x4(), Int32x4And)                      \
  V(GetInt32x4(), GetInt32x4(), Int32x4Sub)                      \
  V(GetInt32x4(), GetInt32x4(), Int32x4Mul)                      \
  V(GetInt32x4(), GetInt32x4(), Int32x4Or)                       \
  V(GetInt32x4(), GetInt32x4(), Int32x4Xor)                      \
  V(GetInt32x4(), Type::Number(), Int32x4ShiftLeft)              \
  V(GetInt32x4(), Type::Number(), Int32x4ShiftRight)             \
  V(GetInt32x4(), Type::Number(), Int32x4ShiftRightArithmetic)   \
  V(GetInt32x4(), GetInt32x4(), Int32x4Equal)                    \
  V(GetInt32x4(), GetInt32x4(), Int32x4GreaterThan)              \
  V(GetInt32x4(), GetInt32x4(), Int32x4LessThan)                 \
  V(GetInt32x4(), Type::Integral32(), Int32x4WithX)              \
  V(GetInt32x4(), Type::Integral32(), Int32x4WithY)              \
  V(GetInt32x4(), Type::Integral32(), Int32x4WithZ)              \
  V(GetInt32x4(), Type::Integral32(), Int32x4WithW)              \
  V(GetFloat64x2(), GetFloat64x2(), Float64x2Add)                \
  V(GetFloat64x2(), GetFloat64x2(), Float64x2Sub)                \
  V(GetFloat64x2(), GetFloat64x2(), Float64x2Mul)                \
  V(GetFloat64x2(), GetFloat64x2(), Float64x2Div)                \
  V(GetFloat64x2(), GetFloat64x2(), Float64x2Min)                \
  V(GetFloat64x2(), GetFloat64x2(), Float64x2Max)                \
  V(GetFloat64x2(), Type::Number(), Float64x2Scale)              \
  V(GetFloat64x2(), Type::Number(), Float64x2WithX)              \
  V(GetFloat64x2(), Type::Number(), Float64x2WithY)


#define DECLARE_REDUCE_BINARY_SIMD_OPERATION(type1, type2, opcode)    \
  Reduction JSBuiltinReducer::Reduce##opcode(Node* node) {            \
    JSCallReduction r(node);                                          \
                                                                      \
    if (r.InputsMatchTwo(type1, type2)) {                             \
      Node* value =                                                   \
          graph()->NewNode(machine()->opcode(), r.left(), r.right()); \
      return Replace(value);                                          \
    }                                                                 \
                                                                      \
    SIMD_WARNING(opcode, node)                                        \
    return NoChange();                                                \
  }


#if V8_TARGET_ARCH_IA32 || V8_TARGET_ARCH_X64
REDUCED_SIMD_BINARY_OPERATIONS(DECLARE_REDUCE_BINARY_SIMD_OPERATION)


Reduction JSBuiltinReducer::ReduceFloat32x4Constructor(Node* node) {
  // SIMD.float32x4(x, y, z, w) ->
  // Float32x4(x:float32, y:float32, z:float32, w:float32)
  JSCallReduction r(node);
  if (r.InputsMatchZero()) {
    // SIMD.float32x4() -> SIMD.float32x4(0, 0, 0, 0);
    Node* value =
        graph()->NewNode(machine()->Float32x4Constructor(),
                         jsgraph()->ZeroConstant(), jsgraph()->ZeroConstant(),
                         jsgraph()->ZeroConstant(), jsgraph()->ZeroConstant());
    return Replace(value);
  } else if (r.GetJSCallArity() == 4 && r.InputsMatchAll(Type::Number())) {
    Node* value = graph()->NewNode(machine()->Float32x4Constructor(),
                                   r.GetJSCallInput(0), r.GetJSCallInput(1),
                                   r.GetJSCallInput(2), r.GetJSCallInput(3));
    return Replace(value);
  }

  SIMD_WARNING(Float32x4Constructor, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceFloat32x4Check(Node* node) {
  JSCallReduction r(node);

  if (r.GetJSCallArity() == 1) {
    // SIMD.float32x4.check(v) -> type annotation
    if (r.InputsMatchOne(GetFloat32x4())) {
      return Replace(r.GetJSCallInput(0));
    } else {
      Node* const object = r.GetJSCallInput(0);
      Node* const effect = NodeProperties::GetEffectInput(node);
      Node* const control = NodeProperties::GetControlInput(node);
      Node* const context = NodeProperties::GetContextInput(node);
      Node* value = graph()->NewNode(jsgraph()->javascript()->ToFloat32x4Obj(),
                                     object, context, effect, control);
      return Replace(value);
    }
  }

  SIMD_WARNING(Float32x4Check, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceInt32x4Constructor(Node* node) {
  // SIMD.int32x4(x, y, z, w) ->
  // Int32x4(x:int32, y:int32, z:int32, w:int32)
  JSCallReduction r(node);
  if (r.InputsMatchZero()) {
    // SIMD.Int32x4() -> SIMD.Int32x4(0, 0, 0, 0);
    Node* value =
        graph()->NewNode(machine()->Int32x4Constructor(),
                         jsgraph()->ZeroConstant(), jsgraph()->ZeroConstant(),
                         jsgraph()->ZeroConstant(), jsgraph()->ZeroConstant());
    return Replace(value);
  } else if (r.GetJSCallArity() == 4 && r.InputsMatchAll(Type::Number())) {
    Node* value = graph()->NewNode(machine()->Int32x4Constructor(),
                                   r.GetJSCallInput(0), r.GetJSCallInput(1),
                                   r.GetJSCallInput(2), r.GetJSCallInput(3));
    return Replace(value);
  }

  SIMD_WARNING(Int32x4Constructor, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceInt32x4Check(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 1) {
    // SIMD.int32x4.check(v) -> type annotation
    if (r.InputsMatchOne(GetInt32x4())) {
      return Replace(r.GetJSCallInput(0));
    } else {
      Node* const object = r.GetJSCallInput(0);
      Node* const effect = NodeProperties::GetEffectInput(node);
      Node* const control = NodeProperties::GetControlInput(node);
      Node* const context = NodeProperties::GetContextInput(node);
      Node* value = graph()->NewNode(jsgraph()->javascript()->ToInt32x4Obj(),
                                     object, context, effect, control);
      return Replace(value);
    }
  }

  SIMD_WARNING(Int32x4Check, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceFloat64x2Constructor(Node* node) {
  // SIMD.float64x2(x, y) ->
  // Float64x2(x:float64, y:float64)
  JSCallReduction r(node);
  if (r.InputsMatchZero()) {
    // SIMD.float64x2() -> SIMD.float64x2(0, 0);
    Node* value =
        graph()->NewNode(machine()->Float64x2Constructor(),
                         jsgraph()->ZeroConstant(), jsgraph()->ZeroConstant());
    return Replace(value);
  } else if (r.InputsMatchTwo(Type::Number(), Type::Number())) {
    Node* value = graph()->NewNode(machine()->Float64x2Constructor(),
                                   r.GetJSCallInput(0), r.GetJSCallInput(1));
    return Replace(value);
  }

  SIMD_WARNING(Float64x2Constructor, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceFloat64x2Check(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 1) {
    // SIMD.float64x2.check(...) -> type annotation
    if (r.InputsMatchOne(GetFloat64x2())) {
      return Replace(r.GetJSCallInput(0));
    } else {
      Node* const object = r.GetJSCallInput(0);
      Node* const effect = NodeProperties::GetEffectInput(node);
      Node* const control = NodeProperties::GetControlInput(node);
      Node* const context = NodeProperties::GetContextInput(node);
      Node* value = graph()->NewNode(jsgraph()->javascript()->ToFloat64x2Obj(),
                                     object, context, effect, control);
      return Replace(value);
    }
  }
  SIMD_WARNING(Float64x2Check, node);
  return NoChange();
}


#define REDUCED_SIMD_UNARY_OPERATIONS(V)     \
  V(GetFloat32x4(), Float32x4Abs)            \
  V(GetFloat32x4(), Float32x4Neg)            \
  V(GetFloat32x4(), Float32x4Reciprocal)     \
  V(GetFloat32x4(), Float32x4ReciprocalSqrt) \
  V(GetFloat32x4(), Float32x4Sqrt)           \
  V(Type::Number(), Float32x4Splat)          \
  V(GetInt32x4(), Int32x4Neg)                \
  V(GetInt32x4(), Int32x4Not)                \
  V(Type::Number(), Int32x4Splat)            \
  V(GetInt32x4(), Int32x4BitsToFloat32x4)    \
  V(GetInt32x4(), Int32x4ToFloat32x4)        \
  V(GetFloat32x4(), Float32x4BitsToInt32x4)  \
  V(GetFloat32x4(), Float32x4ToInt32x4)      \
  V(GetFloat64x2(), Float64x2Abs)            \
  V(GetFloat64x2(), Float64x2Neg)            \
  V(GetFloat64x2(), Float64x2Sqrt)

#define DECLARE_REDUCE_UNARY_SIMD_OPERATION(type, opcode)            \
  Reduction JSBuiltinReducer::Reduce##opcode(Node* node) {           \
    JSCallReduction r(node);                                         \
                                                                     \
    if (r.InputsMatchOne(type)) {                                    \
      Node* value = graph()->NewNode(machine()->opcode(), r.left()); \
      return Replace(value);                                         \
    }                                                                \
                                                                     \
    SIMD_WARNING(opcode, node)                                       \
                                                                     \
    return NoChange();                                               \
  }


REDUCED_SIMD_UNARY_OPERATIONS(DECLARE_REDUCE_UNARY_SIMD_OPERATION)


Reduction JSBuiltinReducer::ReduceFloat32x4Clamp(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 3 && r.InputsMatchAll(GetFloat32x4())) {
    Node* value =
        graph()->NewNode(machine()->Float32x4Clamp(), r.GetJSCallInput(0),
                         r.GetJSCallInput(1), r.GetJSCallInput(2));
    return Replace(value);
  }

  SIMD_WARNING(Float32x4Clamp, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceFloat64x2Clamp(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 3 && r.InputsMatchAll(GetFloat64x2())) {
    Node* value =
        graph()->NewNode(machine()->Float64x2Clamp(), r.GetJSCallInput(0),
                         r.GetJSCallInput(1), r.GetJSCallInput(2));
    return Replace(value);
  }

  SIMD_WARNING(Float64x2Clamp, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceFloat32x4Swizzle(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 5) {
    if (NodeProperties::GetBounds(r.GetJSCallInput(0))
            .upper->Is(GetFloat32x4())) {
      for (int i = 1; i < r.GetJSCallArity(); i++) {
        Type* t = NodeProperties::GetBounds(r.GetJSCallInput(i)).upper;
        if (!(t->IsConstant() && t->Is(Type::Number()))) {
          return NoChange();
        }

        Node* value =
            graph()->NewNode(machine()->Float32x4Swizzle(), r.GetJSCallInput(0),
                             r.GetJSCallInput(1), r.GetJSCallInput(2),
                             r.GetJSCallInput(3), r.GetJSCallInput(4));
        return Replace(value);
      }
    }
  }

  SIMD_WARNING(Float32x4Swizzle, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceInt32x4Swizzle(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 5) {
    if (NodeProperties::GetBounds(r.GetJSCallInput(0))
            .upper->Is(GetInt32x4())) {
      for (int i = 1; i < r.GetJSCallArity(); i++) {
        Type* t = NodeProperties::GetBounds(r.GetJSCallInput(i)).upper;
        if (!(t->IsConstant() && t->Is(Type::Number()))) {
          return NoChange();
        }

        Node* value =
            graph()->NewNode(machine()->Int32x4Swizzle(), r.GetJSCallInput(0),
                             r.GetJSCallInput(1), r.GetJSCallInput(2),
                             r.GetJSCallInput(3), r.GetJSCallInput(4));
        return Replace(value);
      }
    }
  }

  SIMD_WARNING(Int32x4Swizzle, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceFloat32x4Select(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 3 &&
      NodeProperties::GetBounds(r.GetJSCallInput(0)).upper->Is(GetInt32x4()) &&
      NodeProperties::GetBounds(r.GetJSCallInput(1))
          .upper->Is(GetFloat32x4()) &&
      NodeProperties::GetBounds(r.GetJSCallInput(2))
          .upper->Is(GetFloat32x4())) {
    Node* value =
        graph()->NewNode(machine()->Float32x4Select(), r.GetJSCallInput(0),
                         r.GetJSCallInput(1), r.GetJSCallInput(2));
    return Replace(value);
  }

  SIMD_WARNING(Float32x4Select, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceInt32x4Select(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 3 && r.InputsMatchAll(GetInt32x4())) {
    Node* value =
        graph()->NewNode(machine()->Int32x4Select(), r.GetJSCallInput(0),
                         r.GetJSCallInput(1), r.GetJSCallInput(2));
    return Replace(value);
  }

  SIMD_WARNING(Int32x4Select, node);
  return NoChange();
}


#define SIMD_LOAD_OPERATION(V)           \
  V(4, GetFloat32x4X, kRepFloat32x4)     \
  V(8, GetFloat32x4XY, kRepFloat32x4)    \
  V(12, GetFloat32x4XYZ, kRepFloat32x4)  \
  V(16, GetFloat32x4XYZW, kRepFloat32x4) \
  V(4, GetInt32x4X, kRepInt32x4)         \
  V(8, GetInt32x4XY, kRepInt32x4)        \
  V(12, GetInt32x4XYZ, kRepInt32x4)      \
  V(16, GetInt32x4XYZW, kRepInt32x4)     \
  V(8, GetFloat64x2X, kRepFloat64x2)     \
  V(16, GetFloat64x2XY, kRepFloat64x2)

#define DECLARE_REDUCE_SIMD_LOAD(partial, opcode, rep)                        \
  Reduction JSBuiltinReducer::Reduce##opcode(Node* node) {                    \
    JSCallReduction r(node);                                                  \
                                                                              \
    if (r.GetJSCallArity() == 2) {                                            \
      Node* base = r.GetJSCallInput(0);                                       \
      Node* index = r.GetJSCallInput(1);                                      \
      HeapObjectMatcher<Object> mbase(base);                                  \
      Type* key_type = NodeProperties::GetBounds(index).upper;                \
                                                                              \
      if (mbase.HasValue() && mbase.Value().handle()->IsJSTypedArray() &&     \
          key_type->Is(Type::Integral32())) {                                 \
        Handle<JSTypedArray> const array =                                    \
            Handle<JSTypedArray>::cast(mbase.Value().handle());               \
        array->GetBuffer()->set_is_neuterable(false);                         \
        BufferAccess const access(array->type());                             \
        size_t const k = ElementSizeLog2Of(access.machine_type());            \
        double const byte_length = array->byte_length()->Number();            \
        Node* offset =                                                        \
            graph()->NewNode(machine()->Word32Shl(), index,                   \
                             jsgraph()->Int32Constant(static_cast<int>(k)));  \
        Node* const offset_ptr =                                              \
            machine()->Is64()                                                 \
                ? graph()->NewNode(machine()->ChangeUint32ToUint64(), offset) \
                : offset;                                                     \
        Node* loaded_bytes = jsgraph()->Int32Constant(partial);               \
        if (IsExternalArrayElementsKind(array->map()->elements_kind()) &&     \
            byte_length <= kMaxInt) {                                         \
          Handle<ExternalArray> elements =                                    \
              Handle<ExternalArray>::cast(handle(array->elements()));         \
          Node* buffer =                                                      \
              jsgraph()->PointerConstant(elements->external_pointer());       \
          Node* length = jsgraph()->Int32Constant(byte_length - partial);     \
          Node* effect = NodeProperties::GetEffectInput(node);                \
          Node* control = NodeProperties::GetControlInput(node);              \
          double const element_length = array->length()->Number();            \
          if (key_type->Min() >= 0 &&                                         \
              key_type->Max() < (element_length - partial / (1 << k))) {      \
            Node* load =                                                      \
                graph()->NewNode(machine()->Load(rep), buffer, offset_ptr,    \
                                 loaded_bytes, effect, control);              \
            NodeProperties::ReplaceWithValue(node, load, load);               \
            return Changed(load);                                             \
          }                                                                   \
                                                                              \
          Node* load = graph()->NewNode(machine()->CheckedLoad(rep), buffer,  \
                                        offset_ptr, length, loaded_bytes,     \
                                        effect, control);                     \
          NodeProperties::ReplaceWithValue(node, load, load);                 \
          return Changed(load);                                               \
        }                                                                     \
      }                                                                       \
    }                                                                         \
                                                                              \
    SIMD_WARNING(opcode, node)                                                \
                                                                              \
    return NoChange();                                                        \
  }


SIMD_LOAD_OPERATION(DECLARE_REDUCE_SIMD_LOAD)


#define SIMD_STORE_OPERATION(V)                          \
  V(GetFloat32x4(), 4, SetFloat32x4X, kRepFloat32x4)     \
  V(GetFloat32x4(), 8, SetFloat32x4XY, kRepFloat32x4)    \
  V(GetFloat32x4(), 12, SetFloat32x4XYZ, kRepFloat32x4)  \
  V(GetFloat32x4(), 16, SetFloat32x4XYZW, kRepFloat32x4) \
  V(GetInt32x4(), 4, SetInt32x4X, kRepInt32x4)           \
  V(GetInt32x4(), 8, SetInt32x4XY, kRepInt32x4)          \
  V(GetInt32x4(), 12, SetInt32x4XYZ, kRepInt32x4)        \
  V(GetInt32x4(), 16, SetInt32x4XYZW, kRepInt32x4)       \
  V(GetFloat64x2(), 8, SetFloat64x2X, kRepFloat64x2)     \
  V(GetFloat64x2(), 16, SetFloat64x2XY, kRepFloat64x2)

#define DECLARE_REDUCE_SIMD_STORE(vtype, partial, opcode, rep)                 \
  Reduction JSBuiltinReducer::Reduce##opcode(Node* node) {                     \
    JSCallReduction r(node);                                                   \
                                                                               \
    if (r.GetJSCallArity() == 3) {                                             \
      Node* base = r.GetJSCallInput(0);                                        \
      Node* index = r.GetJSCallInput(1);                                       \
      Node* value = r.GetJSCallInput(2);                                       \
      Type* key_type = NodeProperties::GetBounds(index).upper;                 \
      Type* val_type = NodeProperties::GetBounds(value).upper;                 \
                                                                               \
      HeapObjectMatcher<Object> mbase(base);                                   \
      if (mbase.HasValue() && mbase.Value().handle()->IsJSTypedArray() &&      \
          key_type->Is(Type::Integral32()) && val_type->Is(vtype)) {           \
        Handle<JSTypedArray> const array =                                     \
            Handle<JSTypedArray>::cast(mbase.Value().handle());                \
        array->GetBuffer()->set_is_neuterable(false);                          \
        BufferAccess const access(array->type());                              \
        size_t const k = ElementSizeLog2Of(access.machine_type());             \
        double const byte_length = array->byte_length()->Number();             \
        Node* offset =                                                         \
            graph()->NewNode(machine()->Word32Shl(), index,                    \
                             jsgraph()->Int32Constant(static_cast<int>(k)));   \
        Node* const offset_ptr =                                               \
            machine()->Is64()                                                  \
                ? graph()->NewNode(machine()->ChangeUint32ToUint64(), offset)  \
                : offset;                                                      \
        Node* stored_bytes = jsgraph()->Int32Constant(partial);                \
        if (IsExternalArrayElementsKind(array->map()->elements_kind()) &&      \
            byte_length <= kMaxInt) {                                          \
          Handle<ExternalArray> elements =                                     \
              Handle<ExternalArray>::cast(handle(array->elements()));          \
          Node* buffer =                                                       \
              jsgraph()->PointerConstant(elements->external_pointer());        \
          Node* length = jsgraph()->Int32Constant(byte_length - partial);      \
          Node* effect = NodeProperties::GetEffectInput(node);                 \
          Node* control = NodeProperties::GetControlInput(node);               \
          double const element_length = array->length()->Number();             \
          if (key_type->Min() >= 0 &&                                          \
              key_type->Max() < (element_length - partial / (1 << k))) {       \
            StoreRepresentation srep =                                         \
                StoreRepresentation(rep, kNoWriteBarrier);                     \
            Node* store =                                                      \
                graph()->NewNode(machine()->Store(srep), buffer, offset_ptr,   \
                                 value, stored_bytes, effect, control);        \
            NodeProperties::ReplaceWithValue(node, store, store);              \
            return Changed(store);                                             \
          }                                                                    \
                                                                               \
          Node* store = graph()->NewNode(machine()->CheckedStore(rep), buffer, \
                                         offset_ptr, length, value,            \
                                         stored_bytes, effect, control);       \
          NodeProperties::ReplaceWithValue(node, store, store);                \
          return Changed(store);                                               \
        }                                                                      \
      }                                                                        \
    }                                                                          \
                                                                               \
    SIMD_WARNING(opcode, node)                                                 \
                                                                               \
    return NoChange();                                                         \
  }


SIMD_STORE_OPERATION(DECLARE_REDUCE_SIMD_STORE)
#endif


Node* JSBuiltinReducer::ToBoolean(Node* input, Node* context) {
  switch (input->opcode()) {
    case IrOpcode::kInt32Constant:
      return jsgraph_->BooleanConstant(!Int32Matcher(input).Is(0));
    case IrOpcode::kFloat64Constant:
      return jsgraph_->BooleanConstant(!Float64Matcher(input).Is(0));
    case IrOpcode::kNumberConstant:
      return jsgraph_->BooleanConstant(!NumberMatcher(input).Is(0));
    case IrOpcode::kHeapConstant: {
      Handle<Object> object = HeapObjectMatcher<Object>(input).Value().handle();
      return jsgraph_->BooleanConstant(object->BooleanValue());
    }
    default:
      break;
  }

  if (NodeProperties::IsTyped(input)) {
    Type* upper = NodeProperties::GetBounds(input).upper;
    if (upper->Is(Type::Boolean())) return input;
  }

  Node* value =
      graph()->NewNode(jsgraph()->javascript()->ToBoolean(), input, context);
  return value;
}


#if V8_TARGET_ARCH_IA32 || V8_TARGET_ARCH_X64
Reduction JSBuiltinReducer::ReduceInt32x4Bool(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 4) {
    Node* const context = NodeProperties::GetContextInput(node);
    Node* x = ToBoolean(r.GetJSCallInput(0), context);
    Node* y = ToBoolean(r.GetJSCallInput(1), context);
    Node* z = ToBoolean(r.GetJSCallInput(2), context);
    Node* w = ToBoolean(r.GetJSCallInput(3), context);
    Node* value = graph()->NewNode(machine()->Int32x4Bool(), x, y, z, w);
    return Replace(value);
  }

  SIMD_WARNING(Int32x4Bool, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceFloat32x4Shuffle(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 6) {
    if (NodeProperties::GetBounds(r.GetJSCallInput(0))
            .upper->Is(GetFloat32x4()) &&
        NodeProperties::GetBounds(r.GetJSCallInput(1))
            .upper->Is(GetFloat32x4())) {
      for (int i = 2; i < r.GetJSCallArity(); i++) {
        Type* t = NodeProperties::GetBounds(r.GetJSCallInput(i)).upper;
        if (!(t->IsConstant() && t->Is(Type::Integral32()))) {
          return NoChange();
        }
      }
      Node* value = graph()->NewNode(machine()->Float32x4Shuffle(),
                                     r.GetJSCallInput(0), r.GetJSCallInput(1),
                                     r.GetJSCallInput(2), r.GetJSCallInput(3),
                                     r.GetJSCallInput(4), r.GetJSCallInput(5));
      return Replace(value);
    }
  }

  SIMD_WARNING(Float32x4Shuffle, node);
  return NoChange();
}


Reduction JSBuiltinReducer::ReduceInt32x4Shuffle(Node* node) {
  JSCallReduction r(node);
  if (r.GetJSCallArity() == 6) {
    if (NodeProperties::GetBounds(r.GetJSCallInput(0))
            .upper->Is(GetInt32x4()) &&
        NodeProperties::GetBounds(r.GetJSCallInput(1))
            .upper->Is(GetInt32x4())) {
      for (int i = 2; i < r.GetJSCallArity(); i++) {
        Type* t = NodeProperties::GetBounds(r.GetJSCallInput(i)).upper;
        if (!(t->IsConstant() && t->Is(Type::Integral32()))) {
          return NoChange();
        }
      }
      Node* value = graph()->NewNode(machine()->Int32x4Shuffle(),
                                     r.GetJSCallInput(0), r.GetJSCallInput(1),
                                     r.GetJSCallInput(2), r.GetJSCallInput(3),
                                     r.GetJSCallInput(4), r.GetJSCallInput(5));
      return Replace(value);
    }
  }

  SIMD_WARNING(Int32x4Shuffle, node);
  return NoChange();
}


Type* JSBuiltinReducer::GetFloat32x4() {
  DCHECK(jsgraph()->isolate()->IsSimdEnabled());
  if (!float32x4_.is_set()) {
    Isolate* isolate = jsgraph()->isolate();
    Handle<Map> float32x4_map =
        handle(isolate->native_context()->float32x4_function()->initial_map(),
               isolate);
    Type* float32x4_type = Type::Class(float32x4_map, jsgraph()->zone());
    float32x4_.set(float32x4_type);
  }

  return float32x4_.get();
}


Type* JSBuiltinReducer::GetInt32x4() {
  DCHECK(jsgraph()->isolate()->IsSimdEnabled());
  if (!int32x4_.is_set()) {
    Isolate* isolate = jsgraph()->isolate();
    Handle<Map> int32x4_map = handle(
        isolate->native_context()->int32x4_function()->initial_map(), isolate);
    Type* int32x4_type = Type::Class(int32x4_map, jsgraph()->zone());
    int32x4_.set(int32x4_type);
  }

  return int32x4_.get();
}


Type* JSBuiltinReducer::GetFloat64x2() {
  DCHECK(jsgraph()->isolate()->IsSimdEnabled());
  if (!float64x2_.is_set()) {
    Isolate* isolate = jsgraph()->isolate();
    Handle<Map> float64x2_map =
        handle(isolate->native_context()->float64x2_function()->initial_map(),
               isolate);
    Type* float64x2_type = Type::Class(float64x2_map, jsgraph()->zone());
    float64x2_.set(float64x2_type);
  }

  return float64x2_.get();
}
#endif


Reduction JSBuiltinReducer::Reduce(Node* node) {
  JSCallReduction r(node);

  // Dispatch according to the BuiltinFunctionId if present.
  if (!r.HasBuiltinFunctionId()) return NoChange();
  switch (r.GetBuiltinFunctionId()) {
    case kMathMax:
      return ReplaceWithPureReduction(node, ReduceMathMax(node));
    case kMathImul:
      return ReplaceWithPureReduction(node, ReduceMathImul(node));
    case kMathFround:
      return ReplaceWithPureReduction(node, ReduceMathFround(node));
#if V8_TARGET_ARCH_IA32 || V8_TARGET_ARCH_X64
    case kFloat32x4Add:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Add(node));
    case kFloat32x4Sub:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Sub(node));
    case kFloat32x4Mul:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Mul(node));
    case kFloat32x4Div:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Div(node));
    case kFloat32x4Constructor:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Constructor(node));
    case kFloat32x4Check:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Check(node));
    case kFloat32x4Min:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Min(node));
    case kFloat32x4Max:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Max(node));
    case kFloat32x4Abs:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Abs(node));
    case kFloat32x4Reciprocal:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Reciprocal(node));
    case kFloat32x4ReciprocalSqrt:
      return ReplaceWithPureReduction(node,
                                      ReduceFloat32x4ReciprocalSqrt(node));
    case kFloat32x4Splat:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Splat(node));
    case kFloat32x4Sqrt:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Sqrt(node));
    case kFloat32x4Scale:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Scale(node));
    case kFloat32x4WithX:
      return ReplaceWithPureReduction(node, ReduceFloat32x4WithX(node));
    case kFloat32x4WithY:
      return ReplaceWithPureReduction(node, ReduceFloat32x4WithY(node));
    case kFloat32x4WithZ:
      return ReplaceWithPureReduction(node, ReduceFloat32x4WithZ(node));
    case kFloat32x4WithW:
      return ReplaceWithPureReduction(node, ReduceFloat32x4WithW(node));
    case kFloat32x4Clamp:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Clamp(node));
    case kFloat32x4Swizzle:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Swizzle(node));
    case kGetFloat32x4X:
      return ReplaceWithPureReduction(node, ReduceGetFloat32x4X(node));
    case kGetFloat32x4XY:
      return ReplaceWithPureReduction(node, ReduceGetFloat32x4XY(node));
    case kGetFloat32x4XYZ:
      return ReplaceWithPureReduction(node, ReduceGetFloat32x4XYZ(node));
    case kGetFloat32x4XYZW:
      return ReplaceWithPureReduction(node, ReduceGetFloat32x4XYZW(node));
    case kSetFloat32x4X:
      return ReplaceWithPureReduction(node, ReduceSetFloat32x4X(node));
    case kSetFloat32x4XY:
      return ReplaceWithPureReduction(node, ReduceSetFloat32x4XY(node));
    case kSetFloat32x4XYZ:
      return ReplaceWithPureReduction(node, ReduceSetFloat32x4XYZ(node));
    case kSetFloat32x4XYZW:
      return ReplaceWithPureReduction(node, ReduceSetFloat32x4XYZW(node));
    case kFloat32x4Equal:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Equal(node));
    case kFloat32x4NotEqual:
      return ReplaceWithPureReduction(node, ReduceFloat32x4NotEqual(node));
    case kFloat32x4GreaterThan:
      return ReplaceWithPureReduction(node, ReduceFloat32x4GreaterThan(node));
    case kFloat32x4GreaterThanOrEqual:
      return ReplaceWithPureReduction(node,
                                      ReduceFloat32x4GreaterThanOrEqual(node));
    case kFloat32x4LessThan:
      return ReplaceWithPureReduction(node, ReduceFloat32x4LessThan(node));
    case kFloat32x4LessThanOrEqual:
      return ReplaceWithPureReduction(node,
                                      ReduceFloat32x4LessThanOrEqual(node));
    case kFloat32x4Select:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Select(node));
    case kFloat32x4Shuffle:
      return ReplaceWithPureReduction(node, ReduceFloat32x4Shuffle(node));
    case kInt32x4Add:
      return ReplaceWithPureReduction(node, ReduceInt32x4Add(node));
    case kInt32x4And:
      return ReplaceWithPureReduction(node, ReduceInt32x4And(node));
    case kInt32x4Sub:
      return ReplaceWithPureReduction(node, ReduceInt32x4Sub(node));
    case kInt32x4Mul:
      return ReplaceWithPureReduction(node, ReduceInt32x4Mul(node));
    case kInt32x4Or:
      return ReplaceWithPureReduction(node, ReduceInt32x4Or(node));
    case kInt32x4Xor:
      return ReplaceWithPureReduction(node, ReduceInt32x4Xor(node));
    case kInt32x4Constructor:
      return ReplaceWithPureReduction(node, ReduceInt32x4Constructor(node));
    case kInt32x4Check:
      return ReplaceWithPureReduction(node, ReduceInt32x4Check(node));
    case kInt32x4Bool:
      return ReplaceWithPureReduction(node, ReduceInt32x4Bool(node));
    case kInt32x4Select:
      return ReplaceWithPureReduction(node, ReduceInt32x4Select(node));
    case kInt32x4Shuffle:
      return ReplaceWithPureReduction(node, ReduceInt32x4Shuffle(node));
    case kGetInt32x4X:
      return ReplaceWithPureReduction(node, ReduceGetInt32x4X(node));
    case kGetInt32x4XY:
      return ReplaceWithPureReduction(node, ReduceGetInt32x4XY(node));
    case kGetInt32x4XYZ:
      return ReplaceWithPureReduction(node, ReduceGetInt32x4XYZ(node));
    case kGetInt32x4XYZW:
      return ReplaceWithPureReduction(node, ReduceGetInt32x4XYZW(node));
    case kSetInt32x4X:
      return ReplaceWithPureReduction(node, ReduceSetInt32x4X(node));
    case kSetInt32x4XY:
      return ReplaceWithPureReduction(node, ReduceSetInt32x4XY(node));
    case kSetInt32x4XYZ:
      return ReplaceWithPureReduction(node, ReduceSetInt32x4XYZ(node));
    case kSetInt32x4XYZW:
      return ReplaceWithPureReduction(node, ReduceSetInt32x4XYZW(node));
    case kInt32x4Neg:
      return ReplaceWithPureReduction(node, ReduceInt32x4Neg(node));
    case kInt32x4Not:
      return ReplaceWithPureReduction(node, ReduceInt32x4Not(node));
    case kInt32x4Splat:
      return ReplaceWithPureReduction(node, ReduceInt32x4Splat(node));
    case kInt32x4Swizzle:
      return ReplaceWithPureReduction(node, ReduceInt32x4Swizzle(node));
    case kInt32x4ShiftLeft:
      return ReplaceWithPureReduction(node, ReduceInt32x4ShiftLeft(node));
    case kInt32x4ShiftRight:
      return ReplaceWithPureReduction(node, ReduceInt32x4ShiftRight(node));
    case kInt32x4ShiftRightArithmetic:
      return ReplaceWithPureReduction(node,
                                      ReduceInt32x4ShiftRightArithmetic(node));
    case kInt32x4BitsToFloat32x4:
      return ReplaceWithPureReduction(node, ReduceInt32x4BitsToFloat32x4(node));
    case kInt32x4ToFloat32x4:
      return ReplaceWithPureReduction(node, ReduceInt32x4ToFloat32x4(node));
    case kFloat32x4BitsToInt32x4:
      return ReplaceWithPureReduction(node, ReduceFloat32x4BitsToInt32x4(node));
    case kFloat32x4ToInt32x4:
      return ReplaceWithPureReduction(node, ReduceFloat32x4ToInt32x4(node));
    case kInt32x4Equal:
      return ReplaceWithPureReduction(node, ReduceInt32x4Equal(node));
    case kInt32x4GreaterThan:
      return ReplaceWithPureReduction(node, ReduceInt32x4GreaterThan(node));
    case kInt32x4LessThan:
      return ReplaceWithPureReduction(node, ReduceInt32x4LessThan(node));
    case kInt32x4WithX:
      return ReplaceWithPureReduction(node, ReduceInt32x4WithX(node));
    case kInt32x4WithY:
      return ReplaceWithPureReduction(node, ReduceInt32x4WithY(node));
    case kInt32x4WithZ:
      return ReplaceWithPureReduction(node, ReduceInt32x4WithZ(node));
    case kInt32x4WithW:
      return ReplaceWithPureReduction(node, ReduceInt32x4WithW(node));
    case kFloat64x2Add:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Add(node));
    case kFloat64x2Sub:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Sub(node));
    case kFloat64x2Mul:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Mul(node));
    case kFloat64x2Div:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Div(node));
    case kFloat64x2Constructor:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Constructor(node));
    case kFloat64x2Check:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Check(node));
    case kFloat64x2Min:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Min(node));
    case kFloat64x2Max:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Max(node));
    case kFloat64x2Abs:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Abs(node));
    case kFloat64x2Neg:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Neg(node));
    case kFloat64x2Sqrt:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Sqrt(node));
    case kFloat64x2Scale:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Scale(node));
    case kFloat64x2WithX:
      return ReplaceWithPureReduction(node, ReduceFloat64x2WithX(node));
    case kFloat64x2WithY:
      return ReplaceWithPureReduction(node, ReduceFloat64x2WithY(node));
    case kFloat64x2Clamp:
      return ReplaceWithPureReduction(node, ReduceFloat64x2Clamp(node));
    case kGetFloat64x2X:
      return ReplaceWithPureReduction(node, ReduceGetFloat64x2X(node));
    case kGetFloat64x2XY:
      return ReplaceWithPureReduction(node, ReduceGetFloat64x2XY(node));
    case kSetFloat64x2X:
      return ReplaceWithPureReduction(node, ReduceSetFloat64x2X(node));
    case kSetFloat64x2XY:
      return ReplaceWithPureReduction(node, ReduceSetFloat64x2XY(node));
#endif
    default:
      break;
  }
  return NoChange();
}


Graph* JSBuiltinReducer::graph() const { return jsgraph()->graph(); }


CommonOperatorBuilder* JSBuiltinReducer::common() const {
  return jsgraph()->common();
}


MachineOperatorBuilder* JSBuiltinReducer::machine() const {
  return jsgraph()->machine();
}

}  // namespace compiler
}  // namespace internal
}  // namespace v8
