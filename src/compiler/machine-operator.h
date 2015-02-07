// Copyright 2013 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_COMPILER_MACHINE_OPERATOR_H_
#define V8_COMPILER_MACHINE_OPERATOR_H_

#include "src/base/flags.h"
#include "src/compiler/machine-type.h"

namespace v8 {
namespace internal {
namespace compiler {

// Forward declarations.
struct MachineOperatorGlobalCache;
class Operator;


// Supported write barrier modes.
enum WriteBarrierKind { kNoWriteBarrier, kFullWriteBarrier };

std::ostream& operator<<(std::ostream& os, WriteBarrierKind);


// A Load needs a MachineType.
typedef MachineType LoadRepresentation;


// A Store needs a MachineType and a WriteBarrierKind in order to emit the
// correct write barrier.
class StoreRepresentation FINAL {
 public:
  StoreRepresentation(MachineType machine_type,
                      WriteBarrierKind write_barrier_kind)
      : machine_type_(machine_type), write_barrier_kind_(write_barrier_kind) {}

  MachineType machine_type() const { return machine_type_; }
  WriteBarrierKind write_barrier_kind() const { return write_barrier_kind_; }

 private:
  MachineType machine_type_;
  WriteBarrierKind write_barrier_kind_;
};

bool operator==(StoreRepresentation, StoreRepresentation);
bool operator!=(StoreRepresentation, StoreRepresentation);

size_t hash_value(StoreRepresentation);

std::ostream& operator<<(std::ostream&, StoreRepresentation);

StoreRepresentation const& StoreRepresentationOf(Operator const*);


// A CheckedLoad needs a MachineType.
typedef MachineType CheckedLoadRepresentation;

CheckedLoadRepresentation CheckedLoadRepresentationOf(Operator const*);


// A CheckedStore needs a MachineType.
typedef MachineType CheckedStoreRepresentation;

CheckedStoreRepresentation CheckedStoreRepresentationOf(Operator const*);


// Interface for building machine-level operators. These operators are
// machine-level but machine-independent and thus define a language suitable
// for generating code to run on architectures such as ia32, x64, arm, etc.
class MachineOperatorBuilder FINAL : public ZoneObject {
 public:
  // Flags that specify which operations are available. This is useful
  // for operations that are unsupported by some back-ends.
  enum Flag {
    kNoFlags = 0u,
    kFloat64Max = 1u << 0,
    kFloat64Min = 1u << 1,
    kFloat64RoundDown = 1u << 2,
    kFloat64RoundTruncate = 1u << 3,
    kFloat64RoundTiesAway = 1u << 4,
    kInt32DivIsSafe = 1u << 5,
    kUint32DivIsSafe = 1u << 6,
    kWord32ShiftIsSafe = 1u << 7
  };
  typedef base::Flags<Flag, unsigned> Flags;

  explicit MachineOperatorBuilder(Zone* zone, MachineType word = kMachPtr,
                                  Flags supportedOperators = kNoFlags);

  const Operator* Word32And();
  const Operator* Word32Or();
  const Operator* Word32Xor();
  const Operator* Word32Shl();
  const Operator* Word32Shr();
  const Operator* Word32Sar();
  const Operator* Word32Ror();
  const Operator* Word32Equal();
  const Operator* Word32Clz();
  bool Word32ShiftIsSafe() const { return flags_ & kWord32ShiftIsSafe; }

  const Operator* Word64And();
  const Operator* Word64Or();
  const Operator* Word64Xor();
  const Operator* Word64Shl();
  const Operator* Word64Shr();
  const Operator* Word64Sar();
  const Operator* Word64Ror();
  const Operator* Word64Equal();

  const Operator* Int32Add();
  const Operator* Int32AddWithOverflow();
  const Operator* Int32Sub();
  const Operator* Int32SubWithOverflow();
  const Operator* Int32Mul();
  const Operator* Int32MulHigh();
  const Operator* Int32Div();
  const Operator* Int32Mod();
  const Operator* Int32LessThan();
  const Operator* Int32LessThanOrEqual();
  const Operator* Uint32Div();
  const Operator* Uint32LessThan();
  const Operator* Uint32LessThanOrEqual();
  const Operator* Uint32Mod();
  const Operator* Uint32MulHigh();
  bool Int32DivIsSafe() const { return flags_ & kInt32DivIsSafe; }
  bool Uint32DivIsSafe() const { return flags_ & kUint32DivIsSafe; }

  const Operator* Int64Add();
  const Operator* Int64Sub();
  const Operator* Int64Mul();
  const Operator* Int64Div();
  const Operator* Int64Mod();
  const Operator* Int64LessThan();
  const Operator* Int64LessThanOrEqual();
  const Operator* Uint64Div();
  const Operator* Uint64LessThan();
  const Operator* Uint64Mod();

  // These operators change the representation of numbers while preserving the
  // value of the number. Narrowing operators assume the input is representable
  // in the target type and are *not* defined for other inputs.
  // Use narrowing change operators only when there is a static guarantee that
  // the input value is representable in the target value.
  const Operator* ChangeFloat32ToFloat64();
  const Operator* ChangeFloat64ToInt32();   // narrowing
  const Operator* ChangeFloat64ToUint32();  // narrowing
  const Operator* ChangeInt32ToFloat64();
  const Operator* ChangeInt32ToInt64();
  const Operator* ChangeUint32ToFloat64();
  const Operator* ChangeUint32ToUint64();

  // These operators truncate numbers, both changing the representation of
  // the number and mapping multiple input values onto the same output value.
  const Operator* TruncateFloat64ToFloat32();
  const Operator* TruncateFloat64ToInt32();  // JavaScript semantics.
  const Operator* TruncateInt64ToInt32();

  // Floating point operators always operate with IEEE 754 round-to-nearest.
  const Operator* Float64Add();
  const Operator* Float64Sub();
  const Operator* Float64Mul();
  const Operator* Float64Div();
  const Operator* Float64Mod();
  const Operator* Float64Sqrt();

  // Floating point comparisons complying to IEEE 754.
  const Operator* Float64Equal();
  const Operator* Float64LessThan();
  const Operator* Float64LessThanOrEqual();

  // Floating point min/max complying to IEEE 754.
  const Operator* Float64Max();
  const Operator* Float64Min();
  bool HasFloat64Max() { return flags_ & kFloat64Max; }
  bool HasFloat64Min() { return flags_ & kFloat64Min; }

  // Floating point rounding.
  const Operator* Float64RoundDown();
  const Operator* Float64RoundTruncate();
  const Operator* Float64RoundTiesAway();
  bool HasFloat64RoundDown() { return flags_ & kFloat64RoundDown; }
  bool HasFloat64RoundTruncate() { return flags_ & kFloat64RoundTruncate; }
  bool HasFloat64RoundTiesAway() { return flags_ & kFloat64RoundTiesAway; }

  // Floating point bit representation.
  const Operator* Float64ExtractLowWord32();
  const Operator* Float64ExtractHighWord32();
  const Operator* Float64InsertLowWord32();
  const Operator* Float64InsertHighWord32();

// SIMD operators
#define SIMD_OPERATORS(V)        \
  V(Float32x4Add)                \
  V(Float32x4Mul)                \
  V(Float32x4Sub)                \
  V(Float32x4Div)                \
  V(Float32x4Constructor)        \
  V(Float32x4Min)                \
  V(Float32x4Max)                \
  V(Float32x4GetX)               \
  V(Float32x4GetY)               \
  V(Float32x4GetZ)               \
  V(Float32x4GetW)               \
  V(Float32x4GetSignMask)        \
  V(Float32x4Abs)                \
  V(Float32x4Neg)                \
  V(Float32x4Reciprocal)         \
  V(Float32x4ReciprocalSqrt)     \
  V(Float32x4Splat)              \
  V(Float32x4Sqrt)               \
  V(Float32x4Scale)              \
  V(Float32x4WithX)              \
  V(Float32x4WithY)              \
  V(Float32x4WithZ)              \
  V(Float32x4WithW)              \
  V(Float32x4Clamp)              \
  V(Float32x4Swizzle)            \
  V(Float32x4Equal)              \
  V(Float32x4NotEqual)           \
  V(Float32x4GreaterThan)        \
  V(Float32x4GreaterThanOrEqual) \
  V(Float32x4LessThan)           \
  V(Float32x4LessThanOrEqual)    \
  V(Float32x4Select)             \
  V(Float32x4Shuffle)            \
  V(Int32x4Add)                  \
  V(Int32x4And)                  \
  V(Int32x4Mul)                  \
  V(Int32x4Sub)                  \
  V(Int32x4Or)                   \
  V(Int32x4Xor)                  \
  V(Int32x4Constructor)          \
  V(Int32x4GetX)                 \
  V(Int32x4GetY)                 \
  V(Int32x4GetZ)                 \
  V(Int32x4GetW)                 \
  V(Int32x4Bool)                 \
  V(Int32x4Select)               \
  V(Int32x4Shuffle)              \
  V(Int32x4GetFlagX)             \
  V(Int32x4GetFlagY)             \
  V(Int32x4GetFlagZ)             \
  V(Int32x4GetFlagW)             \
  V(Int32x4GetSignMask)          \
  V(Int32x4Neg)                  \
  V(Int32x4Not)                  \
  V(Int32x4Splat)                \
  V(Int32x4Swizzle)              \
  V(Int32x4ShiftLeft)            \
  V(Int32x4ShiftRight)           \
  V(Int32x4ShiftRightArithmetic) \
  V(Int32x4BitsToFloat32x4)      \
  V(Int32x4ToFloat32x4)          \
  V(Float32x4BitsToInt32x4)      \
  V(Float32x4ToInt32x4)          \
  V(Int32x4Equal)                \
  V(Int32x4GreaterThan)          \
  V(Int32x4LessThan)             \
  V(Int32x4WithX)                \
  V(Int32x4WithY)                \
  V(Int32x4WithZ)                \
  V(Int32x4WithW)                \
  V(Float64x2Add)                \
  V(Float64x2Mul)                \
  V(Float64x2Sub)                \
  V(Float64x2Div)                \
  V(Float64x2Constructor)        \
  V(Float64x2Min)                \
  V(Float64x2Max)                \
  V(Float64x2GetX)               \
  V(Float64x2GetY)               \
  V(Float64x2GetSignMask)        \
  V(Float64x2Abs)                \
  V(Float64x2Neg)                \
  V(Float64x2Sqrt)               \
  V(Float64x2Scale)              \
  V(Float64x2WithX)              \
  V(Float64x2WithY)              \
  V(Float64x2Clamp)

#define DECLARE_SIMD_OPERATORS(opcode) const Operator* opcode();

  SIMD_OPERATORS(DECLARE_SIMD_OPERATORS)

  // load [base + index]
  const Operator* Load(LoadRepresentation rep);

  // store [base + index], value
  const Operator* Store(StoreRepresentation rep);

  // Access to the machine stack.
  const Operator* LoadStackPointer();

  // checked-load heap, index, length
  const Operator* CheckedLoad(CheckedLoadRepresentation);
  // checked-store heap, index, length, value
  const Operator* CheckedStore(CheckedStoreRepresentation);

  // Target machine word-size assumed by this builder.
  bool Is32() const { return word() == kRepWord32; }
  bool Is64() const { return word() == kRepWord64; }
  MachineType word() const { return word_; }

// Pseudo operators that translate to 32/64-bit operators depending on the
// word-size of the target machine assumed by this builder.
#define PSEUDO_OP_LIST(V) \
  V(Word, And)            \
  V(Word, Or)             \
  V(Word, Xor)            \
  V(Word, Shl)            \
  V(Word, Shr)            \
  V(Word, Sar)            \
  V(Word, Ror)            \
  V(Word, Equal)          \
  V(Int, Add)             \
  V(Int, Sub)             \
  V(Int, Mul)             \
  V(Int, Div)             \
  V(Int, Mod)             \
  V(Int, LessThan)        \
  V(Int, LessThanOrEqual) \
  V(Uint, Div)            \
  V(Uint, LessThan)       \
  V(Uint, Mod)
#define PSEUDO_OP(Prefix, Suffix)                                \
  const Operator* Prefix##Suffix() {                             \
    return Is32() ? Prefix##32##Suffix() : Prefix##64##Suffix(); \
  }
  PSEUDO_OP_LIST(PSEUDO_OP)
#undef PSEUDO_OP
#undef PSEUDO_OP_LIST

 private:
  Zone* const zone_;
  MachineOperatorGlobalCache const& cache_;
  MachineType const word_;
  Flags const flags_;

  DISALLOW_COPY_AND_ASSIGN(MachineOperatorBuilder);
};


DEFINE_OPERATORS_FOR_FLAGS(MachineOperatorBuilder::Flags)

}  // namespace compiler
}  // namespace internal
}  // namespace v8

#endif  // V8_COMPILER_MACHINE_OPERATOR_H_
