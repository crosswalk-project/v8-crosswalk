// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_COMPILER_JS_TYPED_LOWERING_H_
#define V8_COMPILER_JS_TYPED_LOWERING_H_

#include "src/compiler/graph-reducer.h"
#include "src/compiler/simplified-operator.h"

namespace v8 {
namespace internal {
namespace compiler {

// Forward declarations.
class CommonOperatorBuilder;
class JSGraph;
class JSOperatorBuilder;
class MachineOperatorBuilder;


// Lowers JS-level operators to simplified operators based on types.
class JSTypedLowering FINAL : public Reducer {
 public:
  JSTypedLowering(JSGraph* jsgraph, Zone* zone);
  ~JSTypedLowering() FINAL {}

  Reduction Reduce(Node* node) FINAL;

 private:
  friend class JSBinopReduction;

  Reduction ReplaceEagerly(Node* old, Node* node);
  Reduction ReduceJSAdd(Node* node);
  Reduction ReduceJSBitwiseOr(Node* node);
  Reduction ReduceJSMultiply(Node* node);
  Reduction ReduceJSComparison(Node* node);
  Reduction ReduceJSLoadProperty(Node* node);
  Reduction ReduceJSLoadNamed(Node* node);
  Reduction ReduceJSStoreProperty(Node* node);
  Reduction ReduceJSLoadContext(Node* node);
  Reduction ReduceJSStoreContext(Node* node);
  Reduction ReduceJSEqual(Node* node, bool invert);
  Reduction ReduceJSStrictEqual(Node* node, bool invert);
  Reduction ReduceJSUnaryNot(Node* node);
  Reduction ReduceJSToBoolean(Node* node);
  Reduction ReduceJSToNumberInput(Node* input);
  Reduction ReduceJSToNumber(Node* node);
#if V8_TARGET_ARCH_IA32 || V8_TARGET_ARCH_X64
  Reduction ReduceJSToFloat32x4Obj(Node* node);
  Reduction ReduceJSToInt32x4Obj(Node* node);
  Reduction ReduceJSToFloat64x2Obj(Node* node);
#endif
  Reduction ReduceJSToStringInput(Node* input);
  Reduction ReduceJSToString(Node* node);
  Reduction ReduceNumberBinop(Node* node, const Operator* numberOp);
  Reduction ReduceInt32Binop(Node* node, const Operator* intOp);
  Reduction ReduceUI32Shift(Node* node, Signedness left_signedness,
                            const Operator* shift_op);

  Node* ConvertPrimitiveToNumber(Node* input);
  template <IrOpcode::Value>
  Node* FindConversion(Node* input);
  void InsertConversion(Node* conversion);

  Node* Word32Shl(Node* const lhs, int32_t const rhs);

  Factory* factory() const;
  Graph* graph() const;
  JSGraph* jsgraph() const { return jsgraph_; }
  JSOperatorBuilder* javascript() const;
  CommonOperatorBuilder* common() const;
  SimplifiedOperatorBuilder* simplified() { return &simplified_; }
  MachineOperatorBuilder* machine() const;
  Type* GetFloat32x4();
  Type* GetInt32x4();
  Type* GetFloat64x2();

  JSGraph* jsgraph_;
  SimplifiedOperatorBuilder simplified_;
  ZoneVector<Node*> conversions_;  // Cache inserted JSToXXX() conversions.
  Type* zero_range_;
  Type* one_range_;
  Type* zero_thirtyone_range_;
  SetOncePointer<Type> float32x4_;
  SetOncePointer<Type> int32x4_;
  SetOncePointer<Type> float64x2_;
  Type* shifted_int32_ranges_[4];
};

}  // namespace compiler
}  // namespace internal
}  // namespace v8

#endif  // V8_COMPILER_JS_TYPED_LOWERING_H_
