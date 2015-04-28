// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/compiler/machine-operator.h"

#include "src/base/lazy-instance.h"
#include "src/compiler/opcodes.h"
#include "src/compiler/operator.h"

namespace v8 {
namespace internal {
namespace compiler {

std::ostream& operator<<(std::ostream& os, WriteBarrierKind kind) {
  switch (kind) {
    case kNoWriteBarrier:
      return os << "NoWriteBarrier";
    case kFullWriteBarrier:
      return os << "FullWriteBarrier";
  }
  UNREACHABLE();
  return os;
}


bool operator==(StoreRepresentation lhs, StoreRepresentation rhs) {
  return lhs.machine_type() == rhs.machine_type() &&
         lhs.write_barrier_kind() == rhs.write_barrier_kind();
}


bool operator!=(StoreRepresentation lhs, StoreRepresentation rhs) {
  return !(lhs == rhs);
}


size_t hash_value(StoreRepresentation rep) {
  return base::hash_combine(rep.machine_type(), rep.write_barrier_kind());
}


std::ostream& operator<<(std::ostream& os, StoreRepresentation rep) {
  return os << "(" << rep.machine_type() << " : " << rep.write_barrier_kind()
            << ")";
}


StoreRepresentation const& StoreRepresentationOf(Operator const* op) {
  DCHECK_EQ(IrOpcode::kStore, op->opcode());
  return OpParameter<StoreRepresentation>(op);
}


CheckedLoadRepresentation CheckedLoadRepresentationOf(Operator const* op) {
  DCHECK_EQ(IrOpcode::kCheckedLoad, op->opcode());
  return OpParameter<CheckedLoadRepresentation>(op);
}


CheckedStoreRepresentation CheckedStoreRepresentationOf(Operator const* op) {
  DCHECK_EQ(IrOpcode::kCheckedStore, op->opcode());
  return OpParameter<CheckedStoreRepresentation>(op);
}


#if V8_TARGET_ARCH_IA32 || V8_TARGET_ARCH_X64
#define SIMD_PURE_OP_LIST(V)                                                  \
  V(Float32x4Add, Operator::kCommutative, 2, 0, 1)                            \
  V(Float32x4Sub, Operator::kNoProperties, 2, 0, 1)                           \
  V(Float32x4Mul, Operator::kCommutative, 2, 0, 1)                            \
  V(Float32x4Div, Operator::kNoProperties, 2, 0, 1)                           \
  V(Float32x4Constructor, Operator::kNoProperties, 4, 0, 1)                   \
  V(Float32x4Min, Operator::kCommutative, 2, 0, 1)                            \
  V(Float32x4Max, Operator::kCommutative, 2, 0, 1)                            \
  V(Float32x4GetX, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float32x4GetY, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float32x4GetZ, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float32x4GetW, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float32x4GetSignMask, Operator::kNoProperties, 1, 0, 1)                   \
  V(Float32x4Abs, Operator::kNoProperties, 1, 0, 1)                           \
  V(Float32x4Neg, Operator::kNoProperties, 1, 0, 1)                           \
  V(Float32x4Reciprocal, Operator::kNoProperties, 1, 0, 1)                    \
  V(Float32x4ReciprocalSqrt, Operator::kNoProperties, 1, 0, 1)                \
  V(Float32x4Splat, Operator::kNoProperties, 1, 0, 1)                         \
  V(Float32x4Sqrt, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float32x4Scale, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float32x4WithX, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float32x4WithY, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float32x4WithZ, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float32x4WithW, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float32x4Clamp, Operator::kNoProperties, 3, 0, 1)                         \
  V(Float32x4Swizzle, Operator::kNoProperties, 5, 0, 1)                       \
  V(Float32x4Select, Operator::kNoProperties, 3, 0, 1)                        \
  V(Float32x4Shuffle, Operator::kNoProperties, 6, 0, 1)                       \
  V(Int32x4Add, Operator::kCommutative, 2, 0, 1)                              \
  V(Int32x4And, Operator::kCommutative, 2, 0, 1)                              \
  V(Int32x4Sub, Operator::kNoProperties, 2, 0, 1)                             \
  V(Int32x4Mul, Operator::kCommutative, 2, 0, 1)                              \
  V(Int32x4Or, Operator::kCommutative, 2, 0, 1)                               \
  V(Int32x4Xor, Operator::kNoProperties, 2, 0, 1)                             \
  V(Int32x4Constructor, Operator::kNoProperties, 4, 0, 1)                     \
  V(Int32x4GetX, Operator::kNoProperties, 1, 0, 1)                            \
  V(Int32x4GetY, Operator::kNoProperties, 1, 0, 1)                            \
  V(Int32x4GetZ, Operator::kNoProperties, 1, 0, 1)                            \
  V(Int32x4GetW, Operator::kNoProperties, 1, 0, 1)                            \
  V(Int32x4Bool, Operator::kNoProperties, 4, 0, 1)                            \
  V(Int32x4Select, Operator::kNoProperties, 3, 0, 1)                          \
  V(Int32x4Shuffle, Operator::kNoProperties, 6, 0, 1)                         \
  V(Int32x4GetFlagX, Operator::kNoProperties, 1, 0, 1)                        \
  V(Int32x4GetFlagY, Operator::kNoProperties, 1, 0, 1)                        \
  V(Int32x4GetFlagZ, Operator::kNoProperties, 1, 0, 1)                        \
  V(Int32x4GetFlagW, Operator::kNoProperties, 1, 0, 1)                        \
  V(Int32x4GetSignMask, Operator::kNoProperties, 1, 0, 1)                     \
  V(Int32x4Neg, Operator::kNoProperties, 1, 0, 1)                             \
  V(Int32x4Not, Operator::kNoProperties, 1, 0, 1)                             \
  V(Int32x4Splat, Operator::kNoProperties, 1, 0, 1)                           \
  V(Int32x4Swizzle, Operator::kNoProperties, 5, 0, 1)                         \
  V(Int32x4ShiftLeft, Operator::kNoProperties, 2, 0, 1)                       \
  V(Int32x4ShiftRight, Operator::kNoProperties, 2, 0, 1)                      \
  V(Int32x4ShiftRightArithmetic, Operator::kNoProperties, 2, 0, 1)            \
  V(Int32x4BitsToFloat32x4, Operator::kNoProperties, 1, 0, 1)                 \
  V(Int32x4ToFloat32x4, Operator::kNoProperties, 1, 0, 1)                     \
  V(Float32x4BitsToInt32x4, Operator::kNoProperties, 1, 0, 1)                 \
  V(Float32x4ToInt32x4, Operator::kNoProperties, 1, 0, 1)                     \
  V(Int32x4Equal, Operator::kNoProperties, 2, 0, 1)                           \
  V(Int32x4GreaterThan, Operator::kNoProperties, 2, 0, 1)                     \
  V(Int32x4LessThan, Operator::kNoProperties, 2, 0, 1)                        \
  V(Int32x4WithX, Operator::kNoProperties, 2, 0, 1)                           \
  V(Int32x4WithY, Operator::kNoProperties, 2, 0, 1)                           \
  V(Int32x4WithZ, Operator::kNoProperties, 2, 0, 1)                           \
  V(Int32x4WithW, Operator::kNoProperties, 2, 0, 1)                           \
  V(Float64x2Add, Operator::kCommutative, 2, 0, 1)                            \
  V(Float64x2Sub, Operator::kNoProperties, 2, 0, 1)                           \
  V(Float64x2Mul, Operator::kCommutative, 2, 0, 1)                            \
  V(Float64x2Div, Operator::kNoProperties, 2, 0, 1)                           \
  V(Float64x2Constructor, Operator::kNoProperties, 2, 0, 1)                   \
  V(Float64x2Min, Operator::kCommutative, 2, 0, 1)                            \
  V(Float64x2Max, Operator::kCommutative, 2, 0, 1)                            \
  V(Float64x2GetX, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float64x2GetY, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float64x2GetSignMask, Operator::kNoProperties, 1, 0, 1)                   \
  V(Float64x2Abs, Operator::kNoProperties, 1, 0, 1)                           \
  V(Float64x2Neg, Operator::kNoProperties, 1, 0, 1)                           \
  V(Float64x2Sqrt, Operator::kNoProperties, 1, 0, 1)                          \
  V(Float64x2Scale, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float64x2WithX, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float64x2WithY, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float64x2Clamp, Operator::kNoProperties, 3, 0, 1)                         \
  V(Float32x4Equal, Operator::kNoProperties, 2, 0, 1)                         \
  V(Float32x4NotEqual, Operator::kNoProperties, 2, 0, 1)                      \
  V(Float32x4GreaterThan, Operator::kNoProperties, 2, 0, 1)                   \
  V(Float32x4GreaterThanOrEqual, Operator::kNoProperties, 2, 0, 1)            \
  V(Float32x4LessThan, Operator::kNoProperties, 2, 0, 1)                      \
  V(Float32x4LessThanOrEqual, Operator::kNoProperties, 2, 0, 1)
#else
#define SIMD_PURE_OP_LIST(v)
#endif

#define PURE_OP_LIST(V)                                                       \
  V(Word32And, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)      \
  V(Word32Or, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)       \
  V(Word32Xor, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)      \
  V(Word32Shl, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word32Shr, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word32Sar, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word32Ror, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word32Equal, Operator::kCommutative, 2, 0, 1)                             \
  V(Word32Clz, Operator::kNoProperties, 1, 0, 1)                              \
  V(Word64And, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)      \
  V(Word64Or, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)       \
  V(Word64Xor, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)      \
  V(Word64Shl, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word64Shr, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word64Sar, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word64Ror, Operator::kNoProperties, 2, 0, 1)                              \
  V(Word64Equal, Operator::kCommutative, 2, 0, 1)                             \
  V(Int32Add, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)       \
  V(Int32AddWithOverflow, Operator::kAssociative | Operator::kCommutative, 2, \
    0, 2)                                                                     \
  V(Int32Sub, Operator::kNoProperties, 2, 0, 1)                               \
  V(Int32SubWithOverflow, Operator::kNoProperties, 2, 0, 2)                   \
  V(Int32Mul, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)       \
  V(Int32MulHigh, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)   \
  V(Int32Div, Operator::kNoProperties, 2, 1, 1)                               \
  V(Int32Mod, Operator::kNoProperties, 2, 1, 1)                               \
  V(Int32LessThan, Operator::kNoProperties, 2, 0, 1)                          \
  V(Int32LessThanOrEqual, Operator::kNoProperties, 2, 0, 1)                   \
  V(Uint32Div, Operator::kNoProperties, 2, 1, 1)                              \
  V(Uint32LessThan, Operator::kNoProperties, 2, 0, 1)                         \
  V(Uint32LessThanOrEqual, Operator::kNoProperties, 2, 0, 1)                  \
  V(Uint32Mod, Operator::kNoProperties, 2, 1, 1)                              \
  V(Uint32MulHigh, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)  \
  V(Int64Add, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)       \
  V(Int64Sub, Operator::kNoProperties, 2, 0, 1)                               \
  V(Int64Mul, Operator::kAssociative | Operator::kCommutative, 2, 0, 1)       \
  V(Int64Div, Operator::kNoProperties, 2, 0, 1)                               \
  V(Int64Mod, Operator::kNoProperties, 2, 0, 1)                               \
  V(Int64LessThan, Operator::kNoProperties, 2, 0, 1)                          \
  V(Int64LessThanOrEqual, Operator::kNoProperties, 2, 0, 1)                   \
  V(Uint64Div, Operator::kNoProperties, 2, 0, 1)                              \
  V(Uint64LessThan, Operator::kNoProperties, 2, 0, 1)                         \
  V(Uint64Mod, Operator::kNoProperties, 2, 0, 1)                              \
  V(ChangeFloat32ToFloat64, Operator::kNoProperties, 1, 0, 1)                 \
  V(ChangeFloat64ToInt32, Operator::kNoProperties, 1, 0, 1)                   \
  V(ChangeFloat64ToUint32, Operator::kNoProperties, 1, 0, 1)                  \
  V(ChangeInt32ToFloat64, Operator::kNoProperties, 1, 0, 1)                   \
  V(ChangeInt32ToInt64, Operator::kNoProperties, 1, 0, 1)                     \
  V(ChangeUint32ToFloat64, Operator::kNoProperties, 1, 0, 1)                  \
  V(ChangeUint32ToUint64, Operator::kNoProperties, 1, 0, 1)                   \
  V(TruncateFloat64ToFloat32, Operator::kNoProperties, 1, 0, 1)               \
  V(TruncateFloat64ToInt32, Operator::kNoProperties, 1, 0, 1)                 \
  V(TruncateInt64ToInt32, Operator::kNoProperties, 1, 0, 1)                   \
  V(Float64Add, Operator::kCommutative, 2, 0, 1)                              \
  V(Float64Sub, Operator::kNoProperties, 2, 0, 1)                             \
  V(Float64Mul, Operator::kCommutative, 2, 0, 1)                              \
  V(Float64Div, Operator::kNoProperties, 2, 0, 1)                             \
  V(Float64Mod, Operator::kNoProperties, 2, 0, 1)                             \
  V(Float64Sqrt, Operator::kNoProperties, 1, 0, 1)                            \
  V(Float64RoundDown, Operator::kNoProperties, 1, 0, 1)                       \
  V(Float64RoundTruncate, Operator::kNoProperties, 1, 0, 1)                   \
  V(Float64RoundTiesAway, Operator::kNoProperties, 1, 0, 1)                   \
  V(Float64Equal, Operator::kCommutative, 2, 0, 1)                            \
  V(Float64LessThan, Operator::kNoProperties, 2, 0, 1)                        \
  V(Float64LessThanOrEqual, Operator::kNoProperties, 2, 0, 1)                 \
  V(Float64ExtractLowWord32, Operator::kNoProperties, 1, 0, 1)                \
  V(Float64ExtractHighWord32, Operator::kNoProperties, 1, 0, 1)               \
  V(Float64InsertLowWord32, Operator::kNoProperties, 2, 0, 1)                 \
  V(Float64InsertHighWord32, Operator::kNoProperties, 2, 0, 1)                \
  V(Float64Max, Operator::kNoProperties, 2, 0, 1)                             \
  V(Float64Min, Operator::kNoProperties, 2, 0, 1)                             \
  V(LoadStackPointer, Operator::kNoProperties, 0, 0, 1)                       \
  SIMD_PURE_OP_LIST(V)


#define MACHINE_TYPE_LIST(V) \
  V(MachFloat32)             \
  V(MachFloat64)             \
  V(MachInt8)                \
  V(MachUint8)               \
  V(MachInt16)               \
  V(MachUint16)              \
  V(MachInt32)               \
  V(MachUint32)              \
  V(MachInt64)               \
  V(MachUint64)              \
  V(MachAnyTagged)           \
  V(RepBit)                  \
  V(RepWord8)                \
  V(RepWord16)               \
  V(RepWord32)               \
  V(RepWord64)               \
  V(RepFloat32)              \
  V(RepFloat64)              \
  V(RepTagged)

#define MACHINE_SIMD_TYPE_LIST(V) \
  V(RepFloat32x4)                 \
  V(MachFloat32x4)                \
  V(RepInt32x4)                   \
  V(MachInt32x4)                  \
  V(RepFloat64x2)                 \
  V(MachFloat64x2)

struct MachineOperatorGlobalCache {
#define PURE(Name, properties, value_input_count, control_input_count,         \
             output_count)                                                     \
  struct Name##Operator FINAL : public Operator {                              \
    Name##Operator()                                                           \
        : Operator(IrOpcode::k##Name, Operator::kPure | properties, #Name,     \
                   value_input_count, 0, control_input_count, output_count, 0, \
                   0) {}                                                       \
  };                                                                           \
  Name##Operator k##Name;
  PURE_OP_LIST(PURE)
#undef PURE

#define LOAD(Type)                                                             \
  struct Load##Type##Operator FINAL : public Operator1<LoadRepresentation> {   \
    Load##Type##Operator()                                                     \
        : Operator1<LoadRepresentation>(                                       \
              IrOpcode::kLoad, Operator::kNoThrow | Operator::kNoWrite,        \
              "Load", 2, 1, 1, 1, 1, 0, k##Type) {}                            \
  };                                                                           \
  struct CheckedLoad##Type##Operator FINAL                                     \
      : public Operator1<CheckedLoadRepresentation> {                          \
    CheckedLoad##Type##Operator()                                              \
        : Operator1<CheckedLoadRepresentation>(                                \
              IrOpcode::kCheckedLoad, Operator::kNoThrow | Operator::kNoWrite, \
              "CheckedLoad", 3, 1, 1, 1, 1, 0, k##Type) {}                     \
  };                                                                           \
  Load##Type##Operator kLoad##Type;                                            \
  CheckedLoad##Type##Operator kCheckedLoad##Type;
  MACHINE_TYPE_LIST(LOAD)
#undef LOAD

#define STORE(Type)                                                            \
  struct Store##Type##Operator : public Operator1<StoreRepresentation> {       \
    explicit Store##Type##Operator(WriteBarrierKind write_barrier_kind)        \
        : Operator1<StoreRepresentation>(                                      \
              IrOpcode::kStore, Operator::kNoRead | Operator::kNoThrow,        \
              "Store", 3, 1, 1, 0, 1, 0,                                       \
              StoreRepresentation(k##Type, write_barrier_kind)) {}             \
  };                                                                           \
  struct Store##Type##NoWriteBarrier##Operator FINAL                           \
      : public Store##Type##Operator {                                         \
    Store##Type##NoWriteBarrier##Operator()                                    \
        : Store##Type##Operator(kNoWriteBarrier) {}                            \
  };                                                                           \
  struct Store##Type##FullWriteBarrier##Operator FINAL                         \
      : public Store##Type##Operator {                                         \
    Store##Type##FullWriteBarrier##Operator()                                  \
        : Store##Type##Operator(kFullWriteBarrier) {}                          \
  };                                                                           \
  struct CheckedStore##Type##Operator FINAL                                    \
      : public Operator1<CheckedStoreRepresentation> {                         \
    CheckedStore##Type##Operator()                                             \
        : Operator1<CheckedStoreRepresentation>(                               \
              IrOpcode::kCheckedStore, Operator::kNoRead | Operator::kNoThrow, \
              "CheckedStore", 4, 1, 1, 0, 1, 0, k##Type) {}                    \
  };                                                                           \
  Store##Type##NoWriteBarrier##Operator kStore##Type##NoWriteBarrier;          \
  Store##Type##FullWriteBarrier##Operator kStore##Type##FullWriteBarrier;      \
  CheckedStore##Type##Operator kCheckedStore##Type;
  MACHINE_TYPE_LIST(STORE)
#undef STORE

#define SIMD_LOAD(Type)                                                        \
  struct Load##Type##Operator FINAL : public Operator1<LoadRepresentation> {   \
    Load##Type##Operator()                                                     \
        : Operator1<LoadRepresentation>(                                       \
              IrOpcode::kLoad, Operator::kNoThrow | Operator::kNoWrite,        \
              "Load", 3, 1, 1, 1, 1, 0, k##Type) {}                            \
  };                                                                           \
  struct CheckedLoad##Type##Operator FINAL                                     \
      : public Operator1<CheckedLoadRepresentation> {                          \
    CheckedLoad##Type##Operator()                                              \
        : Operator1<CheckedLoadRepresentation>(                                \
              IrOpcode::kCheckedLoad, Operator::kNoThrow | Operator::kNoWrite, \
              "CheckedLoad", 4, 1, 1, 1, 1, 0, k##Type) {}                     \
  };                                                                           \
  Load##Type##Operator kLoad##Type;                                            \
  CheckedLoad##Type##Operator kCheckedLoad##Type;
  MACHINE_SIMD_TYPE_LIST(SIMD_LOAD)
#undef SIMD_LOAD

#define SIMD_STORE(Type)                                                       \
  struct Store##Type##Operator : public Operator1<StoreRepresentation> {       \
    explicit Store##Type##Operator(WriteBarrierKind write_barrier_kind)        \
        : Operator1<StoreRepresentation>(                                      \
              IrOpcode::kStore, Operator::kNoRead | Operator::kNoThrow,        \
              "Store", 4, 1, 1, 0, 1, 0,                                       \
              StoreRepresentation(k##Type, write_barrier_kind)) {}             \
  };                                                                           \
  struct Store##Type##NoWriteBarrier##Operator FINAL                           \
      : public Store##Type##Operator {                                         \
    Store##Type##NoWriteBarrier##Operator()                                    \
        : Store##Type##Operator(kNoWriteBarrier) {}                            \
  };                                                                           \
  struct Store##Type##FullWriteBarrier##Operator FINAL                         \
      : public Store##Type##Operator {                                         \
    Store##Type##FullWriteBarrier##Operator()                                  \
        : Store##Type##Operator(kFullWriteBarrier) {}                          \
  };                                                                           \
  struct CheckedStore##Type##Operator FINAL                                    \
      : public Operator1<CheckedStoreRepresentation> {                         \
    CheckedStore##Type##Operator()                                             \
        : Operator1<CheckedStoreRepresentation>(                               \
              IrOpcode::kCheckedStore, Operator::kNoRead | Operator::kNoThrow, \
              "CheckedStore", 5, 1, 1, 0, 1, 0, k##Type) {}                    \
  };                                                                           \
  Store##Type##NoWriteBarrier##Operator kStore##Type##NoWriteBarrier;          \
  Store##Type##FullWriteBarrier##Operator kStore##Type##FullWriteBarrier;      \
  CheckedStore##Type##Operator kCheckedStore##Type;
  MACHINE_SIMD_TYPE_LIST(SIMD_STORE)
#undef STORE
};


static base::LazyInstance<MachineOperatorGlobalCache>::type kCache =
    LAZY_INSTANCE_INITIALIZER;


MachineOperatorBuilder::MachineOperatorBuilder(Zone* zone, MachineType word,
                                               Flags flags)
    : zone_(zone), cache_(kCache.Get()), word_(word), flags_(flags) {
  DCHECK(word == kRepWord32 || word == kRepWord64);
}


#define PURE(Name, properties, value_input_count, control_input_count, \
             output_count)                                             \
  const Operator* MachineOperatorBuilder::Name() { return &cache_.k##Name; }
PURE_OP_LIST(PURE)
#undef PURE


const Operator* MachineOperatorBuilder::Load(LoadRepresentation rep) {
  switch (rep) {
#define LOAD(Type) \
  case k##Type:    \
    return &cache_.kLoad##Type;
    MACHINE_TYPE_LIST(LOAD)
    MACHINE_SIMD_TYPE_LIST(LOAD)
#undef LOAD
    default:
      break;
  }
  // Uncached.
  return new (zone_) Operator1<LoadRepresentation>(  // --
      IrOpcode::kLoad, Operator::kNoThrow | Operator::kNoWrite, "Load", 2, 1, 1,
      1, 1, 0, rep);
}


const Operator* MachineOperatorBuilder::Store(StoreRepresentation rep) {
  switch (rep.machine_type()) {
#define STORE(Type)                                      \
  case k##Type:                                          \
    switch (rep.write_barrier_kind()) {                  \
      case kNoWriteBarrier:                              \
        return &cache_.k##Store##Type##NoWriteBarrier;   \
      case kFullWriteBarrier:                            \
        return &cache_.k##Store##Type##FullWriteBarrier; \
    }                                                    \
    break;
    MACHINE_TYPE_LIST(STORE)
    MACHINE_SIMD_TYPE_LIST(STORE)
#undef STORE

    default:
      break;
  }
  // Uncached.
  return new (zone_) Operator1<StoreRepresentation>(  // --
      IrOpcode::kStore, Operator::kNoRead | Operator::kNoThrow, "Store", 3, 1,
      1, 0, 1, 0, rep);
}


const Operator* MachineOperatorBuilder::CheckedLoad(
    CheckedLoadRepresentation rep) {
  switch (rep) {
#define LOAD(Type) \
  case k##Type:    \
    return &cache_.kCheckedLoad##Type;
    MACHINE_TYPE_LIST(LOAD)
    MACHINE_SIMD_TYPE_LIST(LOAD)
#undef LOAD
    default:
      break;
  }
  // Uncached.
  return new (zone_) Operator1<CheckedLoadRepresentation>(
      IrOpcode::kCheckedLoad, Operator::kNoThrow | Operator::kNoWrite,
      "CheckedLoad", 3, 1, 1, 1, 1, 0, rep);
}


const Operator* MachineOperatorBuilder::CheckedStore(
    CheckedStoreRepresentation rep) {
  switch (rep) {
#define STORE(Type) \
  case k##Type:     \
    return &cache_.kCheckedStore##Type;
    MACHINE_TYPE_LIST(STORE)
    MACHINE_SIMD_TYPE_LIST(STORE)
#undef STORE
    default:
      break;
  }
  // Uncached.
  return new (zone_) Operator1<CheckedStoreRepresentation>(
      IrOpcode::kCheckedStore, Operator::kNoRead | Operator::kNoThrow,
      "CheckedStore", 4, 1, 1, 0, 1, 0, rep);
}

}  // namespace compiler
}  // namespace internal
}  // namespace v8
