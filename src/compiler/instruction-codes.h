// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_COMPILER_INSTRUCTION_CODES_H_
#define V8_COMPILER_INSTRUCTION_CODES_H_

#include <iosfwd>

#if V8_TARGET_ARCH_ARM
#include "src/compiler/arm/instruction-codes-arm.h"
#elif V8_TARGET_ARCH_ARM64
#include "src/compiler/arm64/instruction-codes-arm64.h"
#elif V8_TARGET_ARCH_IA32
#include "src/compiler/ia32/instruction-codes-ia32.h"
#elif V8_TARGET_ARCH_MIPS
#include "src/compiler/mips/instruction-codes-mips.h"
#elif V8_TARGET_ARCH_MIPS64
#include "src/compiler/mips64/instruction-codes-mips64.h"
#elif V8_TARGET_ARCH_X64
#include "src/compiler/x64/instruction-codes-x64.h"
#elif V8_TARGET_ARCH_PPC
#include "src/compiler/ppc/instruction-codes-ppc.h"
#else
#define TARGET_ARCH_OPCODE_LIST(V)
#define TARGET_ADDRESSING_MODE_LIST(V)
#endif
#include "src/utils.h"

namespace v8 {
namespace internal {
namespace compiler {

// Target-specific opcodes that specify which assembly sequence to emit.
// Most opcodes specify a single instruction.
#define ARCH_OPCODE_LIST(V) \
  V(ArchCallCodeObject)     \
  V(ArchCallJSFunction)     \
  V(ArchJmp)                \
  V(ArchLookupSwitch)       \
  V(ArchTableSwitch)        \
  V(ArchNop)                \
  V(ArchDeoptimize)         \
  V(ArchRet)                \
  V(ArchStackPointer)       \
  V(ArchTruncateDoubleToI)  \
  V(CheckedLoadInt8)        \
  V(CheckedLoadUint8)       \
  V(CheckedLoadInt16)       \
  V(CheckedLoadUint16)      \
  V(CheckedLoadWord32)      \
  V(CheckedLoadFloat32)     \
  V(CheckedLoadFloat64)     \
  V(CheckedStoreWord8)      \
  V(CheckedStoreWord16)     \
  V(CheckedStoreWord32)     \
  V(CheckedStoreFloat32)    \
  V(CheckedStoreFloat64)    \
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
  V(Int32x4WithX)                \
  V(Int32x4WithY)                \
  V(Int32x4WithZ)                \
  V(Int32x4WithW)                \
  V(LoadSIMD128)                 \
  V(CheckedLoadSIMD128)          \
  V(StoreSIMD128)                \
  V(CheckedStoreSIMD128)         \
  V(Int32x4BitsToFloat32x4)      \
  V(Int32x4ToFloat32x4)          \
  V(Float32x4BitsToInt32x4)      \
  V(Float32x4ToInt32x4)          \
  V(Int32x4Equal)                \
  V(Int32x4GreaterThan)          \
  V(Int32x4LessThan)             \
  V(Float64x2Add)                \
  V(Float64x2Mul)                \
  V(Float64x2Sub)                \
  V(Float64x2Div)                \
  V(Float64x2Max)                \
  V(Float64x2Min)                \
  V(Float64x2Constructor)        \
  V(Float64x2GetX)               \
  V(Float64x2GetY)               \
  V(Float64x2GetSignMask)        \
  V(Float64x2Abs)                \
  V(Float64x2Neg)                \
  V(Float64x2Sqrt)               \
  V(Float64x2Scale)              \
  V(Float64x2WithX)              \
  V(Float64x2WithY)              \
  V(Float64x2Clamp)              \
  TARGET_ARCH_OPCODE_LIST(V)

enum ArchOpcode {
#define DECLARE_ARCH_OPCODE(Name) k##Name,
  ARCH_OPCODE_LIST(DECLARE_ARCH_OPCODE)
#undef DECLARE_ARCH_OPCODE
#define COUNT_ARCH_OPCODE(Name) +1
  kLastArchOpcode = -1 ARCH_OPCODE_LIST(COUNT_ARCH_OPCODE)
#undef COUNT_ARCH_OPCODE
};

std::ostream& operator<<(std::ostream& os, const ArchOpcode& ao);

// Addressing modes represent the "shape" of inputs to an instruction.
// Many instructions support multiple addressing modes. Addressing modes
// are encoded into the InstructionCode of the instruction and tell the
// code generator after register allocation which assembler method to call.
#define ADDRESSING_MODE_LIST(V) \
  V(None)                       \
  TARGET_ADDRESSING_MODE_LIST(V)

enum AddressingMode {
#define DECLARE_ADDRESSING_MODE(Name) kMode_##Name,
  ADDRESSING_MODE_LIST(DECLARE_ADDRESSING_MODE)
#undef DECLARE_ADDRESSING_MODE
#define COUNT_ADDRESSING_MODE(Name) +1
  kLastAddressingMode = -1 ADDRESSING_MODE_LIST(COUNT_ADDRESSING_MODE)
#undef COUNT_ADDRESSING_MODE
};

std::ostream& operator<<(std::ostream& os, const AddressingMode& am);

// The mode of the flags continuation (see below).
enum FlagsMode { kFlags_none = 0, kFlags_branch = 1, kFlags_set = 2 };

std::ostream& operator<<(std::ostream& os, const FlagsMode& fm);

// The condition of flags continuation (see below).
enum FlagsCondition {
  kEqual,
  kNotEqual,
  kSignedLessThan,
  kSignedGreaterThanOrEqual,
  kSignedLessThanOrEqual,
  kSignedGreaterThan,
  kUnsignedLessThan,
  kUnsignedGreaterThanOrEqual,
  kUnsignedLessThanOrEqual,
  kUnsignedGreaterThan,
  kUnorderedEqual,
  kUnorderedNotEqual,
  kOverflow,
  kNotOverflow
};

inline FlagsCondition NegateFlagsCondition(FlagsCondition condition) {
  return static_cast<FlagsCondition>(condition ^ 1);
}

std::ostream& operator<<(std::ostream& os, const FlagsCondition& fc);

// The InstructionCode is an opaque, target-specific integer that encodes
// what code to emit for an instruction in the code generator. It is not
// interesting to the register allocator, as the inputs and flags on the
// instructions specify everything of interest.
typedef int32_t InstructionCode;

// Helpers for encoding / decoding InstructionCode into the fields needed
// for code generation. We encode the instruction, addressing mode, and flags
// continuation into a single InstructionCode which is stored as part of
// the instruction.
typedef BitField<ArchOpcode, 0, 8> ArchOpcodeField;
typedef BitField<AddressingMode, 8, 5> AddressingModeField;
typedef BitField<FlagsMode, 13, 2> FlagsModeField;
typedef BitField<FlagsCondition, 15, 4> FlagsConditionField;
typedef BitField<int, 15, 17> MiscField;

}  // namespace compiler
}  // namespace internal
}  // namespace v8

#endif  // V8_COMPILER_INSTRUCTION_CODES_H_
