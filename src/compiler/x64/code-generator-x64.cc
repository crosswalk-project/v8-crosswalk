// Copyright 2013 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/compiler/code-generator.h"

#include "src/compiler/code-generator-impl.h"
#include "src/compiler/gap-resolver.h"
#include "src/compiler/node-matchers.h"
#include "src/scopes.h"
#include "src/x64/assembler-x64.h"
#include "src/x64/macro-assembler-x64.h"

namespace v8 {
namespace internal {
namespace compiler {

#define __ masm()->


#define kScratchDoubleReg xmm0


// Adds X64 specific methods for decoding operands.
class X64OperandConverter : public InstructionOperandConverter {
 public:
  X64OperandConverter(CodeGenerator* gen, Instruction* instr)
      : InstructionOperandConverter(gen, instr) {}

  Immediate InputImmediate(size_t index) {
    return ToImmediate(instr_->InputAt(index));
  }

  Operand InputOperand(size_t index, int extra = 0) {
    return ToOperand(instr_->InputAt(index), extra);
  }

  Operand OutputOperand() { return ToOperand(instr_->Output()); }

  Immediate ToImmediate(InstructionOperand* operand) {
    return Immediate(ToConstant(operand).ToInt32());
  }

  Operand ToOperand(InstructionOperand* op, int extra = 0) {
    DCHECK(op->IsStackSlot() || op->IsDoubleStackSlot() ||
           op->IsSIMD128StackSlot());
    // The linkage computes where all spill slots are located.
    FrameOffset offset = linkage()->GetFrameOffset(op->index(), frame(), extra);
    return Operand(offset.from_stack_pointer() ? rsp : rbp, offset.offset());
  }

  static size_t NextOffset(size_t* offset) {
    size_t i = *offset;
    (*offset)++;
    return i;
  }

  static ScaleFactor ScaleFor(AddressingMode one, AddressingMode mode) {
    STATIC_ASSERT(0 == static_cast<int>(times_1));
    STATIC_ASSERT(1 == static_cast<int>(times_2));
    STATIC_ASSERT(2 == static_cast<int>(times_4));
    STATIC_ASSERT(3 == static_cast<int>(times_8));
    int scale = static_cast<int>(mode - one);
    DCHECK(scale >= 0 && scale < 4);
    return static_cast<ScaleFactor>(scale);
  }

  Operand MemoryOperand(size_t* offset) {
    AddressingMode mode = AddressingModeField::decode(instr_->opcode());
    switch (mode) {
      case kMode_MR: {
        Register base = InputRegister(NextOffset(offset));
        int32_t disp = 0;
        return Operand(base, disp);
      }
      case kMode_MRI: {
        Register base = InputRegister(NextOffset(offset));
        int32_t disp = InputInt32(NextOffset(offset));
        return Operand(base, disp);
      }
      case kMode_MR1:
      case kMode_MR2:
      case kMode_MR4:
      case kMode_MR8: {
        Register base = InputRegister(NextOffset(offset));
        Register index = InputRegister(NextOffset(offset));
        ScaleFactor scale = ScaleFor(kMode_MR1, mode);
        int32_t disp = 0;
        return Operand(base, index, scale, disp);
      }
      case kMode_MR1I:
      case kMode_MR2I:
      case kMode_MR4I:
      case kMode_MR8I: {
        Register base = InputRegister(NextOffset(offset));
        Register index = InputRegister(NextOffset(offset));
        ScaleFactor scale = ScaleFor(kMode_MR1I, mode);
        int32_t disp = InputInt32(NextOffset(offset));
        return Operand(base, index, scale, disp);
      }
      case kMode_M1: {
        Register base = InputRegister(NextOffset(offset));
        int32_t disp = 0;
        return Operand(base, disp);
      }
      case kMode_M2:
        UNREACHABLE();  // Should use kModeMR with more compact encoding instead
        return Operand(no_reg, 0);
      case kMode_M4:
      case kMode_M8: {
        Register index = InputRegister(NextOffset(offset));
        ScaleFactor scale = ScaleFor(kMode_M1, mode);
        int32_t disp = 0;
        return Operand(index, scale, disp);
      }
      case kMode_M1I:
      case kMode_M2I:
      case kMode_M4I:
      case kMode_M8I: {
        Register index = InputRegister(NextOffset(offset));
        ScaleFactor scale = ScaleFor(kMode_M1I, mode);
        int32_t disp = InputInt32(NextOffset(offset));
        return Operand(index, scale, disp);
      }
      case kMode_None:
        UNREACHABLE();
        return Operand(no_reg, 0);
    }
    UNREACHABLE();
    return Operand(no_reg, 0);
  }

  Operand MemoryOperand(size_t first_input = 0) {
    return MemoryOperand(&first_input);
  }
};


namespace {

bool HasImmediateInput(Instruction* instr, size_t index) {
  return instr->InputAt(index)->IsImmediate();
}


class OutOfLineLoadZero FINAL : public OutOfLineCode {
 public:
  OutOfLineLoadZero(CodeGenerator* gen, Register result)
      : OutOfLineCode(gen), result_(result) {}

  void Generate() FINAL { __ xorl(result_, result_); }

 private:
  Register const result_;
};


class OutOfLineLoadNaN FINAL : public OutOfLineCode {
 public:
  OutOfLineLoadNaN(CodeGenerator* gen, XMMRegister result)
      : OutOfLineCode(gen), result_(result) {}

  void Generate() FINAL { __ pcmpeqd(result_, result_); }

 private:
  XMMRegister const result_;
};


class OutOfLineTruncateDoubleToI FINAL : public OutOfLineCode {
 public:
  OutOfLineTruncateDoubleToI(CodeGenerator* gen, Register result,
                             XMMRegister input)
      : OutOfLineCode(gen), result_(result), input_(input) {}

  void Generate() FINAL {
    __ subp(rsp, Immediate(kDoubleSize));
    __ movsd(MemOperand(rsp, 0), input_);
    __ SlowTruncateToI(result_, rsp, 0);
    __ addp(rsp, Immediate(kDoubleSize));
  }

 private:
  Register const result_;
  XMMRegister const input_;
};

}  // namespace


#define ASSEMBLE_UNOP(asm_instr)         \
  do {                                   \
    if (instr->Output()->IsRegister()) { \
      __ asm_instr(i.OutputRegister());  \
    } else {                             \
      __ asm_instr(i.OutputOperand());   \
    }                                    \
  } while (0)


#define ASSEMBLE_BINOP(asm_instr)                              \
  do {                                                         \
    if (HasImmediateInput(instr, 1)) {                         \
      if (instr->InputAt(0)->IsRegister()) {                   \
        __ asm_instr(i.InputRegister(0), i.InputImmediate(1)); \
      } else {                                                 \
        __ asm_instr(i.InputOperand(0), i.InputImmediate(1));  \
      }                                                        \
    } else {                                                   \
      if (instr->InputAt(1)->IsRegister()) {                   \
        __ asm_instr(i.InputRegister(0), i.InputRegister(1));  \
      } else {                                                 \
        __ asm_instr(i.InputRegister(0), i.InputOperand(1));   \
      }                                                        \
    }                                                          \
  } while (0)


#define ASSEMBLE_MULT(asm_instr)                              \
  do {                                                        \
    if (HasImmediateInput(instr, 1)) {                        \
      if (instr->InputAt(0)->IsRegister()) {                  \
        __ asm_instr(i.OutputRegister(), i.InputRegister(0),  \
                     i.InputImmediate(1));                    \
      } else {                                                \
        __ asm_instr(i.OutputRegister(), i.InputOperand(0),   \
                     i.InputImmediate(1));                    \
      }                                                       \
    } else {                                                  \
      if (instr->InputAt(1)->IsRegister()) {                  \
        __ asm_instr(i.OutputRegister(), i.InputRegister(1)); \
      } else {                                                \
        __ asm_instr(i.OutputRegister(), i.InputOperand(1));  \
      }                                                       \
    }                                                         \
  } while (0)


#define ASSEMBLE_SHIFT(asm_instr, width)                                   \
  do {                                                                     \
    if (HasImmediateInput(instr, 1)) {                                     \
      if (instr->Output()->IsRegister()) {                                 \
        __ asm_instr(i.OutputRegister(), Immediate(i.InputInt##width(1))); \
      } else {                                                             \
        __ asm_instr(i.OutputOperand(), Immediate(i.InputInt##width(1)));  \
      }                                                                    \
    } else {                                                               \
      if (instr->Output()->IsRegister()) {                                 \
        __ asm_instr##_cl(i.OutputRegister());                             \
      } else {                                                             \
        __ asm_instr##_cl(i.OutputOperand());                              \
      }                                                                    \
    }                                                                      \
  } while (0)


#define ASSEMBLE_MOVX(asm_instr)                            \
  do {                                                      \
    if (instr->addressing_mode() != kMode_None) {           \
      __ asm_instr(i.OutputRegister(), i.MemoryOperand());  \
    } else if (instr->InputAt(0)->IsRegister()) {           \
      __ asm_instr(i.OutputRegister(), i.InputRegister(0)); \
    } else {                                                \
      __ asm_instr(i.OutputRegister(), i.InputOperand(0));  \
    }                                                       \
  } while (0)


#define ASSEMBLE_DOUBLE_BINOP(asm_instr)                                \
  do {                                                                  \
    if (instr->InputAt(1)->IsDoubleRegister()) {                        \
      __ asm_instr(i.InputDoubleRegister(0), i.InputDoubleRegister(1)); \
    } else {                                                            \
      __ asm_instr(i.InputDoubleRegister(0), i.InputOperand(1));        \
    }                                                                   \
  } while (0)


#define ASSEMBLE_AVX_DOUBLE_BINOP(asm_instr)                           \
  do {                                                                 \
    CpuFeatureScope avx_scope(masm(), AVX);                            \
    if (instr->InputAt(1)->IsDoubleRegister()) {                       \
      __ asm_instr(i.OutputDoubleRegister(), i.InputDoubleRegister(0), \
                   i.InputDoubleRegister(1));                          \
    } else {                                                           \
      __ asm_instr(i.OutputDoubleRegister(), i.InputDoubleRegister(0), \
                   i.InputOperand(1));                                 \
    }                                                                  \
  } while (0)


#define ASSEMBLE_FLOAT32x4_BINOP(asm_instr)                                  \
  do {                                                                       \
    if (instr->InputAt(1)->IsFloat32x4Register()) {                          \
      __ asm_instr(i.OutputFloat32x4Register(), i.InputFloat32x4Register(0), \
                   i.InputFloat32x4Register(1));                             \
    } else {                                                                 \
      __ asm_instr(i.OutputFloat32x4Register(), i.InputFloat32x4Register(0), \
                   i.InputOperand(1));                                       \
    }                                                                        \
  } while (0)


#define ASSEMBLE_SIMD_BINOP_NOAVX(asm_instr, type)                          \
  do {                                                                      \
    if (instr->InputAt(1)->Is##type##Register()) {                          \
      __ asm_instr(i.Input##type##Register(0), i.Input##type##Register(1)); \
    } else {                                                                \
      __ asm_instr(i.Input##type##Register(0), i.InputOperand(1));          \
    }                                                                       \
  } while (0)


// According to Intel Software Developer's Manual Volumne 1: 11.5.2.1, cmpps
// will have different result for NaN using different predicates. So for
// consistent reason, we only use op1 here and wait for more clear definition
// from simd.js spec.
#define ASSEMBLE_SIMD_CMP_BINOP_NOAVX(op1, op2, type) \
  do {                                                \
    auto result = i.OutputInt32x4Register();          \
    auto left = i.Input##type##Register(0);           \
    auto right = i.Input##type##Register(1);          \
    if (result.is(left)) {                            \
      __ op1(result, right);                          \
    } else if (result.is(right)) {                    \
      __ movaps(xmm0, left);                          \
      __ op1(xmm0, right);                            \
      __ movaps(result, xmm0);                        \
    } else {                                          \
      __ movaps(result, left);                        \
      __ op1(result, right);                          \
    }                                                 \
  } while (0)


#define ASSEMBLE_CHECKED_LOAD_FLOAT(asm_instr)                               \
  do {                                                                       \
    auto result = i.OutputDoubleRegister();                                  \
    auto buffer = i.InputRegister(0);                                        \
    auto index1 = i.InputRegister(1);                                        \
    auto index2 = i.InputInt32(2);                                           \
    OutOfLineCode* ool;                                                      \
    if (instr->InputAt(3)->IsRegister()) {                                   \
      auto length = i.InputRegister(3);                                      \
      DCHECK_EQ(0, index2);                                                  \
      __ cmpl(index1, length);                                               \
      ool = new (zone()) OutOfLineLoadNaN(this, result);                     \
    } else {                                                                 \
      auto length = i.InputInt32(3);                                         \
      DCHECK_LE(index2, length);                                             \
      __ cmpq(index1, Immediate(length - index2));                           \
      class OutOfLineLoadFloat FINAL : public OutOfLineCode {                \
       public:                                                               \
        OutOfLineLoadFloat(CodeGenerator* gen, XMMRegister result,           \
                           Register buffer, Register index1, int32_t index2, \
                           int32_t length)                                   \
            : OutOfLineCode(gen),                                            \
              result_(result),                                               \
              buffer_(buffer),                                               \
              index1_(index1),                                               \
              index2_(index2),                                               \
              length_(length) {}                                             \
                                                                             \
        void Generate() FINAL {                                              \
          __ leal(kScratchRegister, Operand(index1_, index2_));              \
          __ pcmpeqd(result_, result_);                                      \
          __ cmpl(kScratchRegister, Immediate(length_));                     \
          __ j(above_equal, exit());                                         \
          __ asm_instr(result_,                                              \
                       Operand(buffer_, kScratchRegister, times_1, 0));      \
        }                                                                    \
                                                                             \
       private:                                                              \
        XMMRegister const result_;                                           \
        Register const buffer_;                                              \
        Register const index1_;                                              \
        int32_t const index2_;                                               \
        int32_t const length_;                                               \
      };                                                                     \
      ool = new (zone())                                                     \
          OutOfLineLoadFloat(this, result, buffer, index1, index2, length);  \
    }                                                                        \
    __ j(above_equal, ool->entry());                                         \
    __ asm_instr(result, Operand(buffer, index1, times_1, index2));          \
    __ bind(ool->exit());                                                    \
  } while (false)


#define ASSEMBLE_CHECKED_LOAD_INTEGER(asm_instr)                               \
  do {                                                                         \
    auto result = i.OutputRegister();                                          \
    auto buffer = i.InputRegister(0);                                          \
    auto index1 = i.InputRegister(1);                                          \
    auto index2 = i.InputInt32(2);                                             \
    OutOfLineCode* ool;                                                        \
    if (instr->InputAt(3)->IsRegister()) {                                     \
      auto length = i.InputRegister(3);                                        \
      DCHECK_EQ(0, index2);                                                    \
      __ cmpl(index1, length);                                                 \
      ool = new (zone()) OutOfLineLoadZero(this, result);                      \
    } else {                                                                   \
      auto length = i.InputInt32(3);                                           \
      DCHECK_LE(index2, length);                                               \
      __ cmpq(index1, Immediate(length - index2));                             \
      class OutOfLineLoadInteger FINAL : public OutOfLineCode {                \
       public:                                                                 \
        OutOfLineLoadInteger(CodeGenerator* gen, Register result,              \
                             Register buffer, Register index1, int32_t index2, \
                             int32_t length)                                   \
            : OutOfLineCode(gen),                                              \
              result_(result),                                                 \
              buffer_(buffer),                                                 \
              index1_(index1),                                                 \
              index2_(index2),                                                 \
              length_(length) {}                                               \
                                                                               \
        void Generate() FINAL {                                                \
          Label oob;                                                           \
          __ leal(kScratchRegister, Operand(index1_, index2_));                \
          __ cmpl(kScratchRegister, Immediate(length_));                       \
          __ j(above_equal, &oob, Label::kNear);                               \
          __ asm_instr(result_,                                                \
                       Operand(buffer_, kScratchRegister, times_1, 0));        \
          __ jmp(exit());                                                      \
          __ bind(&oob);                                                       \
          __ xorl(result_, result_);                                           \
        }                                                                      \
                                                                               \
       private:                                                                \
        Register const result_;                                                \
        Register const buffer_;                                                \
        Register const index1_;                                                \
        int32_t const index2_;                                                 \
        int32_t const length_;                                                 \
      };                                                                       \
      ool = new (zone())                                                       \
          OutOfLineLoadInteger(this, result, buffer, index1, index2, length);  \
    }                                                                          \
    __ j(above_equal, ool->entry());                                           \
    __ asm_instr(result, Operand(buffer, index1, times_1, index2));            \
    __ bind(ool->exit());                                                      \
  } while (false)


#define ASSEMBLE_CHECKED_STORE_FLOAT(asm_instr)                              \
  do {                                                                       \
    auto buffer = i.InputRegister(0);                                        \
    auto index1 = i.InputRegister(1);                                        \
    auto index2 = i.InputInt32(2);                                           \
    auto value = i.InputDoubleRegister(4);                                   \
    if (instr->InputAt(3)->IsRegister()) {                                   \
      auto length = i.InputRegister(3);                                      \
      DCHECK_EQ(0, index2);                                                  \
      Label done;                                                            \
      __ cmpl(index1, length);                                               \
      __ j(above_equal, &done, Label::kNear);                                \
      __ asm_instr(Operand(buffer, index1, times_1, index2), value);         \
      __ bind(&done);                                                        \
    } else {                                                                 \
      auto length = i.InputInt32(3);                                         \
      DCHECK_LE(index2, length);                                             \
      __ cmpq(index1, Immediate(length - index2));                           \
      class OutOfLineStoreFloat FINAL : public OutOfLineCode {               \
       public:                                                               \
        OutOfLineStoreFloat(CodeGenerator* gen, Register buffer,             \
                            Register index1, int32_t index2, int32_t length, \
                            XMMRegister value)                               \
            : OutOfLineCode(gen),                                            \
              buffer_(buffer),                                               \
              index1_(index1),                                               \
              index2_(index2),                                               \
              length_(length),                                               \
              value_(value) {}                                               \
                                                                             \
        void Generate() FINAL {                                              \
          __ leal(kScratchRegister, Operand(index1_, index2_));              \
          __ cmpl(kScratchRegister, Immediate(length_));                     \
          __ j(above_equal, exit());                                         \
          __ asm_instr(Operand(buffer_, kScratchRegister, times_1, 0),       \
                       value_);                                              \
        }                                                                    \
                                                                             \
       private:                                                              \
        Register const buffer_;                                              \
        Register const index1_;                                              \
        int32_t const index2_;                                               \
        int32_t const length_;                                               \
        XMMRegister const value_;                                            \
      };                                                                     \
      auto ool = new (zone())                                                \
          OutOfLineStoreFloat(this, buffer, index1, index2, length, value);  \
      __ j(above_equal, ool->entry());                                       \
      __ asm_instr(Operand(buffer, index1, times_1, index2), value);         \
      __ bind(ool->exit());                                                  \
    }                                                                        \
  } while (false)


#define ASSEMBLE_CHECKED_STORE_INTEGER_IMPL(asm_instr, Value)                  \
  do {                                                                         \
    auto buffer = i.InputRegister(0);                                          \
    auto index1 = i.InputRegister(1);                                          \
    auto index2 = i.InputInt32(2);                                             \
    if (instr->InputAt(3)->IsRegister()) {                                     \
      auto length = i.InputRegister(3);                                        \
      DCHECK_EQ(0, index2);                                                    \
      Label done;                                                              \
      __ cmpl(index1, length);                                                 \
      __ j(above_equal, &done, Label::kNear);                                  \
      __ asm_instr(Operand(buffer, index1, times_1, index2), value);           \
      __ bind(&done);                                                          \
    } else {                                                                   \
      auto length = i.InputInt32(3);                                           \
      DCHECK_LE(index2, length);                                               \
      __ cmpq(index1, Immediate(length - index2));                             \
      class OutOfLineStoreInteger FINAL : public OutOfLineCode {               \
       public:                                                                 \
        OutOfLineStoreInteger(CodeGenerator* gen, Register buffer,             \
                              Register index1, int32_t index2, int32_t length, \
                              Value value)                                     \
            : OutOfLineCode(gen),                                              \
              buffer_(buffer),                                                 \
              index1_(index1),                                                 \
              index2_(index2),                                                 \
              length_(length),                                                 \
              value_(value) {}                                                 \
                                                                               \
        void Generate() FINAL {                                                \
          __ leal(kScratchRegister, Operand(index1_, index2_));                \
          __ cmpl(kScratchRegister, Immediate(length_));                       \
          __ j(above_equal, exit());                                           \
          __ asm_instr(Operand(buffer_, kScratchRegister, times_1, 0),         \
                       value_);                                                \
        }                                                                      \
                                                                               \
       private:                                                                \
        Register const buffer_;                                                \
        Register const index1_;                                                \
        int32_t const index2_;                                                 \
        int32_t const length_;                                                 \
        Value const value_;                                                    \
      };                                                                       \
      auto ool = new (zone())                                                  \
          OutOfLineStoreInteger(this, buffer, index1, index2, length, value);  \
      __ j(above_equal, ool->entry());                                         \
      __ asm_instr(Operand(buffer, index1, times_1, index2), value);           \
      __ bind(ool->exit());                                                    \
    }                                                                          \
  } while (false)


#define ASSEMBLE_CHECKED_STORE_INTEGER(asm_instr)                \
  do {                                                           \
    if (instr->InputAt(4)->IsRegister()) {                       \
      Register value = i.InputRegister(4);                       \
      ASSEMBLE_CHECKED_STORE_INTEGER_IMPL(asm_instr, Register);  \
    } else {                                                     \
      Immediate value = i.InputImmediate(4);                     \
      ASSEMBLE_CHECKED_STORE_INTEGER_IMPL(asm_instr, Immediate); \
    }                                                            \
  } while (false)


static uint8_t ComputeShuffleSelect(uint32_t x, uint32_t y, uint32_t z,
                                    uint32_t w) {
  DCHECK(x < 4 && y < 4 && z < 4 && w < 4);
  uint32_t r =
      static_cast<uint8_t>(((w << 6) | (z << 4) | (y << 2) | (x << 0)) & 0xFF);
  return r;
}

static void Emit32x4Shuffle(MacroAssembler* masm, XMMRegister lhs,
                            XMMRegister rhs, int32_t x, int32_t y, int32_t z,
                            int32_t w) {
  XMMRegister temp = xmm0;
  uint32_t num_lanes_from_lhs = (x < 4) + (y < 4) + (z < 4) + (w < 4);
  if (num_lanes_from_lhs == 4) {
    uint8_t select = ComputeShuffleSelect(x, y, z, w);
    masm->shufps(lhs, lhs, select);
    return;
  } else if (num_lanes_from_lhs == 0) {
    x -= 4;
    y -= 4;
    z -= 4;
    w -= 4;
    uint8_t select = ComputeShuffleSelect(x, y, z, w);
    masm->movaps(lhs, rhs);
    masm->shufps(lhs, lhs, select);
    return;
  } else if (num_lanes_from_lhs == 3 || num_lanes_from_lhs == 1) {
    XMMRegister result = lhs;
    if (num_lanes_from_lhs == 1) {
      std::swap(lhs, rhs);
      x = (x >= 4) ? x - 4 : x + 4;
      y = (y >= 4) ? y - 4 : y + 4;
      z = (z >= 4) ? z - 4 : z + 4;
      w = (w >= 4) ? w - 4 : w + 4;
    }
    uint8_t first_select = 0xFF;
    uint8_t second_select = 0xFF;
    if (x < 4 && y < 4) {
      if (w >= 4) {
        w -= 4;
        first_select = ComputeShuffleSelect(w, w, z, z);
        second_select = ComputeShuffleSelect(x, y, 2, 0);
      } else {
        DCHECK(z >= 4);
        z -= 4;
        first_select = ComputeShuffleSelect(z, z, w, w);
        second_select = ComputeShuffleSelect(x, y, 0, 2);
      }
      masm->movaps(temp, rhs);
      masm->shufps(temp, lhs, first_select);
      if (!result.is(lhs)) masm->movaps(result, lhs);
      masm->shufps(result, temp, second_select);
      return;
    }

    DCHECK(z < 4 && w < 4);
    if (y >= 4) {
      y -= 4;
      first_select = ComputeShuffleSelect(y, y, x, x);
      second_select = ComputeShuffleSelect(2, 0, z, w);
    } else {
      DCHECK(x >= 4);
      x -= 4;
      first_select = ComputeShuffleSelect(x, x, y, y);
      second_select = ComputeShuffleSelect(0, 2, z, w);
    }
    masm->movaps(temp, rhs);
    masm->shufps(temp, lhs, first_select);
    masm->shufps(temp, lhs, second_select);
    masm->movaps(result, temp);
    return;
  } else if (num_lanes_from_lhs == 2) {
    if (x < 4 && y < 4) {
      uint8_t select = ComputeShuffleSelect(x, y, z % 4, w % 4);
      masm->shufps(lhs, rhs, select);
      return;
    } else if (z < 4 && w < 4) {
      uint8_t select = ComputeShuffleSelect(x % 4, y % 4, z, w);
      masm->movaps(temp, rhs);
      masm->shufps(temp, lhs, select);
      masm->movaps(lhs, temp);
      return;
    }

    // In two shufps, for the most generic case:
    uint8_t first_select[4], second_select[4];
    uint32_t i = 0, j = 2, k = 0;

#define COMPUTE_SELECT(lane)    \
  if (lane >= 4) {              \
    first_select[j] = lane % 4; \
    second_select[k++] = j++;   \
  } else {                      \
    first_select[i] = lane;     \
    second_select[k++] = i++;   \
  }

    COMPUTE_SELECT(x)
    COMPUTE_SELECT(y)
    COMPUTE_SELECT(z)
    COMPUTE_SELECT(w)
#undef COMPUTE_SELECT

    DCHECK(i == 2 && j == 4 && k == 4);

    int8_t select;
    select = ComputeShuffleSelect(first_select[0], first_select[1],
                                  first_select[2], first_select[3]);
    masm->shufps(lhs, rhs, select);
    select = ComputeShuffleSelect(second_select[0], second_select[1],
                                  second_select[2], second_select[3]);
    masm->shufps(lhs, lhs, select);
  }

  return;
}


// Assembles an instruction after register allocation, producing machine code.
void CodeGenerator::AssembleArchInstruction(Instruction* instr) {
  X64OperandConverter i(this, instr);
  uint8_t select = 0;

  switch (ArchOpcodeField::decode(instr->opcode())) {
    case kArchCallCodeObject: {
      EnsureSpaceForLazyDeopt();
      if (HasImmediateInput(instr, 0)) {
        Handle<Code> code = Handle<Code>::cast(i.InputHeapObject(0));
        __ Call(code, RelocInfo::CODE_TARGET);
      } else {
        Register reg = i.InputRegister(0);
        int entry = Code::kHeaderSize - kHeapObjectTag;
        __ Call(Operand(reg, entry));
      }
      RecordCallPosition(instr);
      break;
    }
    case kArchCallJSFunction: {
      EnsureSpaceForLazyDeopt();
      Register func = i.InputRegister(0);
      if (FLAG_debug_code) {
        // Check the function's context matches the context argument.
        __ cmpp(rsi, FieldOperand(func, JSFunction::kContextOffset));
        __ Assert(equal, kWrongFunctionContext);
      }
      __ Call(FieldOperand(func, JSFunction::kCodeEntryOffset));
      RecordCallPosition(instr);
      break;
    }
    case kArchJmp:
      AssembleArchJump(i.InputRpo(0));
      break;
    case kArchLookupSwitch:
      AssembleArchLookupSwitch(instr);
      break;
    case kArchTableSwitch:
      AssembleArchTableSwitch(instr);
      break;
    case kArchNop:
      // don't emit code for nops.
      break;
    case kArchDeoptimize: {
      int deopt_state_id =
          BuildTranslation(instr, -1, 0, OutputFrameStateCombine::Ignore());
      AssembleDeoptimizerCall(deopt_state_id, Deoptimizer::EAGER);
      break;
    }
    case kArchRet:
      AssembleReturn();
      break;
    case kArchStackPointer:
      __ movq(i.OutputRegister(), rsp);
      break;
    case kArchTruncateDoubleToI: {
      auto result = i.OutputRegister();
      auto input = i.InputDoubleRegister(0);
      auto ool = new (zone()) OutOfLineTruncateDoubleToI(this, result, input);
      __ cvttsd2siq(result, input);
      __ cmpq(result, Immediate(1));
      __ j(overflow, ool->entry());
      __ bind(ool->exit());
      break;
    }
    case kX64Add32:
      ASSEMBLE_BINOP(addl);
      break;
    case kX64Add:
      ASSEMBLE_BINOP(addq);
      break;
    case kX64Sub32:
      ASSEMBLE_BINOP(subl);
      break;
    case kX64Sub:
      ASSEMBLE_BINOP(subq);
      break;
    case kX64And32:
      ASSEMBLE_BINOP(andl);
      break;
    case kX64And:
      ASSEMBLE_BINOP(andq);
      break;
    case kX64Cmp32:
      ASSEMBLE_BINOP(cmpl);
      break;
    case kX64Cmp:
      ASSEMBLE_BINOP(cmpq);
      break;
    case kX64Test32:
      ASSEMBLE_BINOP(testl);
      break;
    case kX64Test:
      ASSEMBLE_BINOP(testq);
      break;
    case kX64Imul32:
      ASSEMBLE_MULT(imull);
      break;
    case kX64Imul:
      ASSEMBLE_MULT(imulq);
      break;
    case kX64ImulHigh32:
      if (instr->InputAt(1)->IsRegister()) {
        __ imull(i.InputRegister(1));
      } else {
        __ imull(i.InputOperand(1));
      }
      break;
    case kX64UmulHigh32:
      if (instr->InputAt(1)->IsRegister()) {
        __ mull(i.InputRegister(1));
      } else {
        __ mull(i.InputOperand(1));
      }
      break;
    case kX64Idiv32:
      __ cdq();
      __ idivl(i.InputRegister(1));
      break;
    case kX64Idiv:
      __ cqo();
      __ idivq(i.InputRegister(1));
      break;
    case kX64Udiv32:
      __ xorl(rdx, rdx);
      __ divl(i.InputRegister(1));
      break;
    case kX64Udiv:
      __ xorq(rdx, rdx);
      __ divq(i.InputRegister(1));
      break;
    case kX64Not:
      ASSEMBLE_UNOP(notq);
      break;
    case kX64Not32:
      ASSEMBLE_UNOP(notl);
      break;
    case kX64Neg:
      ASSEMBLE_UNOP(negq);
      break;
    case kX64Neg32:
      ASSEMBLE_UNOP(negl);
      break;
    case kX64Or32:
      ASSEMBLE_BINOP(orl);
      break;
    case kX64Or:
      ASSEMBLE_BINOP(orq);
      break;
    case kX64Xor32:
      ASSEMBLE_BINOP(xorl);
      break;
    case kX64Xor:
      ASSEMBLE_BINOP(xorq);
      break;
    case kX64Shl32:
      ASSEMBLE_SHIFT(shll, 5);
      break;
    case kX64Shl:
      ASSEMBLE_SHIFT(shlq, 6);
      break;
    case kX64Shr32:
      ASSEMBLE_SHIFT(shrl, 5);
      break;
    case kX64Shr:
      ASSEMBLE_SHIFT(shrq, 6);
      break;
    case kX64Sar32:
      ASSEMBLE_SHIFT(sarl, 5);
      break;
    case kX64Sar:
      ASSEMBLE_SHIFT(sarq, 6);
      break;
    case kX64Ror32:
      ASSEMBLE_SHIFT(rorl, 5);
      break;
    case kX64Ror:
      ASSEMBLE_SHIFT(rorq, 6);
      break;
    case kX64Lzcnt32:
      if (instr->InputAt(0)->IsRegister()) {
        __ Lzcntl(i.OutputRegister(), i.InputRegister(0));
      } else {
        __ Lzcntl(i.OutputRegister(), i.InputOperand(0));
      }
      break;
    case kSSEFloat64Cmp:
      ASSEMBLE_DOUBLE_BINOP(ucomisd);
      break;
    case kSSEFloat64Add:
      ASSEMBLE_DOUBLE_BINOP(addsd);
      break;
    case kSSEFloat64Sub:
      ASSEMBLE_DOUBLE_BINOP(subsd);
      break;
    case kSSEFloat64Mul:
      ASSEMBLE_DOUBLE_BINOP(mulsd);
      break;
    case kSSEFloat64Div:
      ASSEMBLE_DOUBLE_BINOP(divsd);
      break;
    case kSSEFloat64Mod: {
      __ subq(rsp, Immediate(kDoubleSize));
      // Move values to st(0) and st(1).
      __ movsd(Operand(rsp, 0), i.InputDoubleRegister(1));
      __ fld_d(Operand(rsp, 0));
      __ movsd(Operand(rsp, 0), i.InputDoubleRegister(0));
      __ fld_d(Operand(rsp, 0));
      // Loop while fprem isn't done.
      Label mod_loop;
      __ bind(&mod_loop);
      // This instructions traps on all kinds inputs, but we are assuming the
      // floating point control word is set to ignore them all.
      __ fprem();
      // The following 2 instruction implicitly use rax.
      __ fnstsw_ax();
      if (CpuFeatures::IsSupported(SAHF)) {
        CpuFeatureScope sahf_scope(masm(), SAHF);
        __ sahf();
      } else {
        __ shrl(rax, Immediate(8));
        __ andl(rax, Immediate(0xFF));
        __ pushq(rax);
        __ popfq();
      }
      __ j(parity_even, &mod_loop);
      // Move output to stack and clean up.
      __ fstp(1);
      __ fstp_d(Operand(rsp, 0));
      __ movsd(i.OutputDoubleRegister(), Operand(rsp, 0));
      __ addq(rsp, Immediate(kDoubleSize));
      break;
    }
    case kSSEFloat64Max:
      ASSEMBLE_DOUBLE_BINOP(maxsd);
      break;
    case kSSEFloat64Min:
      ASSEMBLE_DOUBLE_BINOP(minsd);
      break;
    case kSSEFloat64Sqrt:
      if (instr->InputAt(0)->IsDoubleRegister()) {
        __ sqrtsd(i.OutputDoubleRegister(), i.InputDoubleRegister(0));
      } else {
        __ sqrtsd(i.OutputDoubleRegister(), i.InputOperand(0));
      }
      break;
    case kSSEFloat64Round: {
      CpuFeatureScope sse_scope(masm(), SSE4_1);
      RoundingMode const mode =
          static_cast<RoundingMode>(MiscField::decode(instr->opcode()));
      __ roundsd(i.OutputDoubleRegister(), i.InputDoubleRegister(0), mode);
      break;
    }
    case kSSECvtss2sd:
      if (instr->InputAt(0)->IsDoubleRegister()) {
        __ cvtss2sd(i.OutputDoubleRegister(), i.InputDoubleRegister(0));
      } else {
        __ cvtss2sd(i.OutputDoubleRegister(), i.InputOperand(0));
      }
      break;
    case kSSECvtsd2ss:
      if (instr->InputAt(0)->IsDoubleRegister()) {
        __ cvtsd2ss(i.OutputDoubleRegister(), i.InputDoubleRegister(0));
      } else {
        __ cvtsd2ss(i.OutputDoubleRegister(), i.InputOperand(0));
      }
      break;
    case kSSEFloat64ToInt32:
      if (instr->InputAt(0)->IsDoubleRegister()) {
        __ cvttsd2si(i.OutputRegister(), i.InputDoubleRegister(0));
      } else {
        __ cvttsd2si(i.OutputRegister(), i.InputOperand(0));
      }
      break;
    case kSSEFloat64ToUint32: {
      if (instr->InputAt(0)->IsDoubleRegister()) {
        __ cvttsd2siq(i.OutputRegister(), i.InputDoubleRegister(0));
      } else {
        __ cvttsd2siq(i.OutputRegister(), i.InputOperand(0));
      }
      __ AssertZeroExtended(i.OutputRegister());
      break;
    }
    case kSSEInt32ToFloat64:
      if (instr->InputAt(0)->IsRegister()) {
        __ cvtlsi2sd(i.OutputDoubleRegister(), i.InputRegister(0));
      } else {
        __ cvtlsi2sd(i.OutputDoubleRegister(), i.InputOperand(0));
      }
      break;
    case kSSEUint32ToFloat64:
      if (instr->InputAt(0)->IsRegister()) {
        __ movl(kScratchRegister, i.InputRegister(0));
      } else {
        __ movl(kScratchRegister, i.InputOperand(0));
      }
      __ cvtqsi2sd(i.OutputDoubleRegister(), kScratchRegister);
      break;
    case kSSEFloat64ExtractLowWord32:
      if (instr->InputAt(0)->IsDoubleStackSlot()) {
        __ movl(i.OutputRegister(), i.InputOperand(0));
      } else {
        __ movd(i.OutputRegister(), i.InputDoubleRegister(0));
      }
      break;
    case kSSEFloat64ExtractHighWord32:
      if (instr->InputAt(0)->IsDoubleStackSlot()) {
        __ movl(i.OutputRegister(), i.InputOperand(0, kDoubleSize / 2));
      } else {
        __ Pextrd(i.OutputRegister(), i.InputDoubleRegister(0), 1);
      }
      break;
    case kSSEFloat64InsertLowWord32:
      if (instr->InputAt(1)->IsRegister()) {
        __ Pinsrd(i.OutputDoubleRegister(), i.InputRegister(1), 0);
      } else {
        __ Pinsrd(i.OutputDoubleRegister(), i.InputOperand(1), 0);
      }
      break;
    case kSSEFloat64InsertHighWord32:
      if (instr->InputAt(1)->IsRegister()) {
        __ Pinsrd(i.OutputDoubleRegister(), i.InputRegister(1), 1);
      } else {
        __ Pinsrd(i.OutputDoubleRegister(), i.InputOperand(1), 1);
      }
      break;
    case kSSEFloat64LoadLowWord32:
      if (instr->InputAt(0)->IsRegister()) {
        __ movd(i.OutputDoubleRegister(), i.InputRegister(0));
      } else {
        __ movd(i.OutputDoubleRegister(), i.InputOperand(0));
      }
      break;
    case kAVXFloat64Add:
      ASSEMBLE_AVX_DOUBLE_BINOP(vaddsd);
      break;
    case kAVXFloat64Sub:
      ASSEMBLE_AVX_DOUBLE_BINOP(vsubsd);
      break;
    case kAVXFloat64Mul:
      ASSEMBLE_AVX_DOUBLE_BINOP(vmulsd);
      break;
    case kAVXFloat64Div:
      ASSEMBLE_AVX_DOUBLE_BINOP(vdivsd);
      break;
    case kAVXFloat64Max:
      ASSEMBLE_AVX_DOUBLE_BINOP(vmaxsd);
      break;
    case kAVXFloat64Min:
      ASSEMBLE_AVX_DOUBLE_BINOP(vminsd);
      break;
    case kFloat32x4Add:
      ASSEMBLE_FLOAT32x4_BINOP(Addps);
      break;
    case kFloat32x4Sub:
      ASSEMBLE_FLOAT32x4_BINOP(Subps);
      break;
    case kFloat32x4Mul:
      ASSEMBLE_FLOAT32x4_BINOP(Mulps);
      break;
    case kFloat32x4Div:
      ASSEMBLE_FLOAT32x4_BINOP(Divps);
      break;
    case kFloat32x4Min:
      ASSEMBLE_SIMD_BINOP_NOAVX(minps, Float32x4);
      break;
    case kFloat32x4Max:
      ASSEMBLE_SIMD_BINOP_NOAVX(maxps, Float32x4);
      break;
    case kFloat32x4Constructor:
      __ leaq(rsp, Operand(rsp, -kFloat32x4Size));
      __ movss(Operand(rsp, 0 * kFloatSize), i.InputDoubleRegister(0));
      __ movss(Operand(rsp, 1 * kFloatSize), i.InputDoubleRegister(1));
      __ movss(Operand(rsp, 2 * kFloatSize), i.InputDoubleRegister(2));
      __ movss(Operand(rsp, 3 * kFloatSize), i.InputDoubleRegister(3));
      __ movups(i.OutputFloat32x4Register(), Operand(rsp, 0 * kFloatSize));
      __ leaq(rsp, Operand(rsp, kFloat32x4Size));
      break;
    case kFloat32x4GetW:
      select++;
    case kFloat32x4GetZ:
      select++;
    case kFloat32x4GetY:
      select++;
    case kFloat32x4GetX: {
      XMMRegister dst = i.OutputDoubleRegister();
      XMMRegister input = i.InputFloat32x4Register(0);
      if (select == 0x0) {
        if (!dst.is(input)) __ movaps(dst, input);
      } else {
        __ pshufd(dst, input, select);
      }
      break;
    }
    case kFloat32x4GetSignMask:
      __ movmskps(i.OutputRegister(), i.InputFloat32x4Register(0));
      break;
    case kFloat32x4Abs:
      __ absps(i.InputFloat32x4Register(0));
      break;
    case kFloat32x4Neg:
      __ negateps(i.InputFloat32x4Register(0));
      break;
    case kFloat32x4Reciprocal:
      __ rcpps(i.OutputFloat32x4Register(), i.InputFloat32x4Register(0));
      break;
    case kFloat32x4ReciprocalSqrt:
      __ rsqrtps(i.OutputFloat32x4Register(), i.InputFloat32x4Register(0));
      break;
    case kFloat32x4Sqrt:
      __ sqrtps(i.OutputFloat32x4Register(), i.InputFloat32x4Register(0));
      break;
    case kFloat32x4Splat: {
      XMMRegister output = i.OutputFloat32x4Register();
      __ movaps(output, i.InputDoubleRegister(0));
      __ shufps(output, output, 0x0);
      break;
    }
    case kFloat32x4Scale: {
      XMMRegister scale = i.InputDoubleRegister(1);
      __ shufps(scale, scale, 0x0);
      __ mulps(i.InputFloat32x4Register(0), scale);
      break;
    }
    case kFloat32x4WithW:
      select++;
    case kFloat32x4WithZ:
      select++;
    case kFloat32x4WithY:
      select++;
    case kFloat32x4WithX: {
      if (CpuFeatures::IsSupported(SSE4_1)) {
        select = select << 4;
        CpuFeatureScope scope(masm(), SSE4_1);
        __ insertps(i.InputFloat32x4Register(0), i.InputDoubleRegister(1),
                    select);
      } else {
        __ subq(rsp, Immediate(kFloat32x4Size));
        __ movups(Operand(rsp, 0), i.InputFloat32x4Register(0));
        __ movss(Operand(rsp, select * kFloatSize), i.InputDoubleRegister(1));
        __ movups(i.InputFloat32x4Register(0), Operand(rsp, 0));
        __ addq(rsp, Immediate(kFloat32x4Size));
      }
      break;
    }
    case kFloat32x4Clamp: {
      XMMRegister value_reg = i.InputFloat32x4Register(0);
      XMMRegister lower_reg = i.InputFloat32x4Register(1);
      XMMRegister upper_reg = i.InputFloat32x4Register(2);
      __ minps(value_reg, upper_reg);
      __ maxps(value_reg, lower_reg);
      break;
    }
    case kFloat32x4Swizzle: {
      uint8_t s = ComputeShuffleSelect(i.InputInt32(1), i.InputInt32(2),
                                       i.InputInt32(3), i.InputInt32(4));
      XMMRegister value_reg = i.InputFloat32x4Register(0);
      __ shufps(value_reg, value_reg, s);
      break;
    }
    case kFloat32x4Equal:
      ASSEMBLE_SIMD_CMP_BINOP_NOAVX(cmpeqps, cmpeqps, Float32x4);
      break;
    case kFloat32x4NotEqual:
      ASSEMBLE_SIMD_CMP_BINOP_NOAVX(cmpneqps, cmpneqps, Float32x4);
      break;
    case kFloat32x4GreaterThan:
      ASSEMBLE_SIMD_CMP_BINOP_NOAVX(cmpnleps, cmpltps, Float32x4);
      break;
    case kFloat32x4GreaterThanOrEqual:
      ASSEMBLE_SIMD_CMP_BINOP_NOAVX(cmpnltps, cmpleps, Float32x4);
      break;
    case kFloat32x4LessThan:
      ASSEMBLE_SIMD_CMP_BINOP_NOAVX(cmpltps, cmpnleps, Float32x4);
      break;
    case kFloat32x4LessThanOrEqual:
      ASSEMBLE_SIMD_CMP_BINOP_NOAVX(cmpleps, cmpnltps, Float32x4);
      break;
    case kFloat32x4Select:
    case kInt32x4Select: {
      auto mask = i.InputSIMD128Register(0);
      auto left = i.InputSIMD128Register(1);
      auto right = i.InputSIMD128Register(2);
      auto result = i.OutputSIMD128Register();
      __ movaps(xmm0, mask);
      __ notps(xmm0);
      __ andps(xmm0, right);
      if (!result.is(mask)) {
        if (result.is(left)) {
          __ andps(result, mask);
          __ orps(result, xmm0);
        } else {
          __ movaps(result, mask);
          __ andps(result, left);
          __ orps(result, xmm0);
        }
      } else {
        __ andps(result, left);
        __ orps(result, xmm0);
      }
      break;
    }
    case kFloat32x4Shuffle:
    case kInt32x4Shuffle: {
      DCHECK(i.OutputSIMD128Register().is(i.InputSIMD128Register(0)));
      auto lhs = i.InputSIMD128Register(0);
      auto rhs = i.InputSIMD128Register(1);
      auto x = i.InputInt32(2);
      auto y = i.InputInt32(3);
      auto z = i.InputInt32(4);
      auto w = i.InputInt32(5);
      Emit32x4Shuffle(masm(), lhs, rhs, x, y, z, w);
      break;
    }
    // For Int32x4 operation.
    case kInt32x4And:
      ASSEMBLE_SIMD_BINOP_NOAVX(andps, Int32x4);
      break;
    case kInt32x4Or:
      ASSEMBLE_SIMD_BINOP_NOAVX(orps, Int32x4);
       break;
    case kInt32x4Xor:
      ASSEMBLE_SIMD_BINOP_NOAVX(xorps, Int32x4);
      break;
    case kInt32x4Sub:
      ASSEMBLE_SIMD_BINOP_NOAVX(psubd, Int32x4);
      break;
    case kInt32x4Add:
      ASSEMBLE_SIMD_BINOP_NOAVX(paddd, Int32x4);
      break;
    case kInt32x4Mul: {
      DCHECK(i.InputInt32x4Register(0).is(i.OutputInt32x4Register()));
      XMMRegister left_reg = i.InputInt32x4Register(0);
      XMMRegister right_reg = i.InputInt32x4Register(1);
      if (CpuFeatures::IsSupported(SSE4_1)) {
        CpuFeatureScope scope(masm(), SSE4_1);
        __ pmulld(left_reg, right_reg);
      } else {
        // The algorithm is from http://stackoverflow.com/questions/10500766/sse-multiplication-of-4-32-bit-integers
        XMMRegister xmm_scratch = xmm0;
        __ movaps(xmm_scratch, left_reg);
        __ pmuludq(left_reg, right_reg);
        __ psrldq(xmm_scratch, 4);
        __ psrldq(right_reg, 4);
        __ pmuludq(xmm_scratch, right_reg);
        __ pshufd(left_reg, left_reg, 8);
        __ pshufd(xmm_scratch, xmm_scratch, 8);
        __ punpackldq(left_reg, xmm_scratch);
      }
      break;
    }
    case kInt32x4Constructor:
      __ leaq(rsp, Operand(rsp, -kInt32x4Size));
      __ movl(Operand(rsp, 0 * kIntSize), i.InputRegister(0));
      __ movl(Operand(rsp, 1 * kIntSize), i.InputRegister(1));
      __ movl(Operand(rsp, 2 * kIntSize), i.InputRegister(2));
      __ movl(Operand(rsp, 3 * kIntSize), i.InputRegister(3));
      __ movups(i.OutputInt32x4Register(), Operand(rsp, 0 * kIntSize));
      __ leaq(rsp, Operand(rsp, kInt32x4Size));
      break;
    case kInt32x4GetW:
      select++;
    case kInt32x4GetZ:
      select++;
    case kInt32x4GetY:
      select++;
    case kInt32x4GetX: {
      Register dst = i.OutputRegister();
      XMMRegister input = i.InputInt32x4Register(0);
      if (select == 0x0) {
        __ movd(dst, input);
      } else {
        if (CpuFeatures::IsSupported(SSE4_1)) {
          CpuFeatureScope scope(masm(), SSE4_1);
            __ extractps(dst, input, select);
        } else {
          XMMRegister xmm_scratch = xmm0;
          __ pshufd(xmm_scratch, input, select);
          __ movd(dst, xmm_scratch);
        }
      }
      break;
    }
    case kInt32x4Bool: {
      __ leaq(rsp, Operand(rsp, -kInt32x4Size));
      __ movl(rbx, i.InputRegister(0));
      __ negl(rbx);
      __ movl(Operand(rsp, 0 * kIntSize), rbx);
      __ movl(rbx, i.InputRegister(1));
      __ negl(rbx);
      __ movl(Operand(rsp, 1 * kIntSize), rbx);
      __ movl(rbx, i.InputRegister(2));
      __ negl(rbx);
      __ movl(Operand(rsp, 2 * kIntSize), rbx);
      __ movl(rbx, i.InputRegister(3));
      __ negl(rbx);
      __ movl(Operand(rsp, 3 * kIntSize), rbx);
      __ movups(i.OutputInt32x4Register(), Operand(rsp, 0 * kIntSize));
      __ leaq(rsp, Operand(rsp, kInt32x4Size));
      break;
    }
    case kInt32x4GetSignMask: {
      XMMRegister input = i.InputInt32x4Register(0);
      Register dst = i.OutputRegister();
      __ movmskps(dst, input);
      break;
    }
    case kInt32x4GetFlagW:
      select++;
    case kInt32x4GetFlagZ:
      select++;
    case kInt32x4GetFlagY:
      select++;
    case kInt32x4GetFlagX: {
      Label false_value, done;
      Register dst = i.OutputRegister();
      XMMRegister input = i.InputInt32x4Register(0);
      if (select == 0x0) {
        __ movd(dst, input);
      } else {
        if (CpuFeatures::IsSupported(SSE4_1)) {
          CpuFeatureScope scope(masm(), SSE4_1);
            __ extractps(dst, input, select);
        } else {
          XMMRegister xmm_scratch = xmm0;
          __ pshufd(xmm_scratch, input, select);
          __ movd(dst, xmm_scratch);
        }
      }

      __ testl(dst, dst);
      __ j(zero, &false_value, Label::kNear);
      __ LoadRoot(dst, Heap::kTrueValueRootIndex);
      __ jmp(&done, Label::kNear);
      __ bind(&false_value);
      __ LoadRoot(dst, Heap::kFalseValueRootIndex);
      __ bind(&done);
      break;
    }
    case kInt32x4Not: {
      XMMRegister input = i.InputInt32x4Register(0);
      __ notps(input);
      break;
    }
    case kInt32x4Neg: {
      XMMRegister input = i.InputInt32x4Register(0);
      __ pnegd(input);
      break;
    }
    case kInt32x4Splat: {
      Register input_reg = i.InputRegister(0);
      XMMRegister result_reg = i.OutputInt32x4Register();
      __ movd(result_reg, input_reg);
      __ shufps(result_reg, result_reg, 0x0);
      return;
    }
    case kInt32x4Swizzle: {
      uint8_t s = ComputeShuffleSelect(i.InputInt32(1), i.InputInt32(2),
                                       i.InputInt32(3), i.InputInt32(4));
      XMMRegister value_reg = i.InputInt32x4Register(0);
      __ pshufd(value_reg, value_reg, s);
      break;
    }
    case kInt32x4ShiftLeft: {
      if (HasImmediateInput(instr, 1)) {
        uint8_t shift = static_cast<uint8_t>(i.InputInt32(1) & 0xFF);
        __ pslld(i.InputInt32x4Register(0), shift);
      } else {
        if (instr->InputAt(1)->IsRegister()) {
          __ movd(xmm0, i.InputRegister(1));
        } else {
          __ movd(xmm0, i.InputOperand(1));
        }
        __ pslld(i.InputInt32x4Register(0), xmm0);
      }
      break;
    }
    case kInt32x4ShiftRight: {
      if (HasImmediateInput(instr, 1)) {
        uint8_t shift = static_cast<uint8_t>(i.InputInt32(1) & 0xFF);
        __ psrld(i.InputInt32x4Register(0), shift);
      } else {
        if (instr->InputAt(1)->IsRegister()) {
          __ movd(xmm0, i.InputRegister(1));
        } else {
          __ movd(xmm0, i.InputOperand(1));
        }
        __ psrld(i.InputInt32x4Register(0), xmm0);
      }
      break;
    }
    case kInt32x4ShiftRightArithmetic: {
      if (HasImmediateInput(instr, 1)) {
        uint8_t shift = static_cast<uint8_t>(i.InputInt32(1) & 0xFF);
        __ psrad(i.InputInt32x4Register(0), shift);
      } else {
        if (instr->InputAt(1)->IsRegister()) {
          __ movd(xmm0, i.InputRegister(1));
        } else {
          __ movd(xmm0, i.InputOperand(1));
        }
        __ psrad(i.InputInt32x4Register(0), xmm0);
      }
      break;
    }
    case kFloat32x4BitsToInt32x4:
    case kInt32x4BitsToFloat32x4:
      if (!i.OutputSIMD128Register().is(i.InputSIMD128Register(0))) {
        __ movaps(i.OutputSIMD128Register(), i.InputSIMD128Register(0));
      }
      break;
    case kInt32x4ToFloat32x4:
      __ cvtdq2ps(i.OutputFloat32x4Register(), i.InputInt32x4Register(0));
      break;
    case kFloat32x4ToInt32x4:
      __ cvtps2dq(i.OutputInt32x4Register(), i.InputFloat32x4Register(0));
      break;
    case kInt32x4Equal:
      __ pcmpeqd(i.InputFloat32x4Register(0), i.InputFloat32x4Register(1));
      break;
    case kInt32x4GreaterThan:
      __ pcmpgtd(i.InputFloat32x4Register(0), i.InputFloat32x4Register(1));
      break;
    case kInt32x4LessThan:
      __ movaps(xmm0, i.InputFloat32x4Register(1));
      __ pcmpgtd(xmm0, i.InputFloat32x4Register(0));
      __ movaps(i.InputFloat32x4Register(0), xmm0);
      break;
    case kInt32x4WithW:
      select++;
    case kInt32x4WithZ:
      select++;
    case kInt32x4WithY:
      select++;
    case kInt32x4WithX: {
      XMMRegister left = i.InputInt32x4Register(0);
      Register right = i.InputRegister(1);
      if (CpuFeatures::IsSupported(SSE4_1)) {
        CpuFeatureScope scope(masm(), SSE4_1);
        __ pinsrd(left, right, select);
      } else {
        __ subq(rsp, Immediate(kInt32x4Size));
        __ movdqu(Operand(rsp, 0), left);
        __ movl(Operand(rsp, select * kInt32Size), right);
        __ movdqu(left, Operand(rsp, 0));
        __ addq(rsp, Immediate(kInt32x4Size));
      }
      break;
    }
    // Int32x4 Operation end.
    case kLoadSIMD128: {
      size_t index = 0;
      auto result = i.OutputSIMD128Register();
      auto operand = i.MemoryOperand(&index);
      auto loaded_bytes = i.InputInt32(index);
      if (loaded_bytes == 16) {
        __ movups(result, operand);
      } else if (loaded_bytes == 12) {
        __ movq(result, operand);
        __ movd(xmm0, Operand(operand, 0x8));
        __ movlhps(result, xmm0);
      } else if (loaded_bytes == 8) {
        __ movq(result, operand);
      } else if (loaded_bytes == 4) {
        __ movd(result, operand);
      }
      break;
    }
    case kCheckedLoadSIMD128: {
      auto result = i.OutputSIMD128Register();
      auto buffer = i.InputRegister(0);
      auto index1 = i.InputRegister(1);
      auto index2 = i.InputInt32(2);
      auto loaded_bytes = i.InputInt32(4);
      OutOfLineCode* ool = new (zone()) OutOfLineLoadNaN(this, result);
      if (instr->InputAt(3)->IsRegister()) {
        auto length = i.InputRegister(3);
        DCHECK_EQ(0, index2);
        __ cmpl(index1, length);
      } else {
        auto length = i.InputInt32(3);
        DCHECK_LE(index2, length);
        __ cmpl(index1, Immediate(length - index2));
      }
      __ j(above, ool->entry());
      if (loaded_bytes == 16) {
        __ movups(result, Operand(buffer, index1, times_1, index2));
      } else if (loaded_bytes == 12) {
        __ movq(result, Operand(buffer, index1, times_1, index2));
        __ movd(xmm0, Operand(buffer, index1, times_1, index2 + 0x8));
        __ movlhps(result, xmm0);
      } else if (loaded_bytes == 8) {
        __ movq(result, Operand(buffer, index1, times_1, index2));
      } else if (loaded_bytes == 4) {
        __ movd(result, Operand(buffer, index1, times_1, index2));
      }
      __ bind(ool->exit());
      break;
    }
    case kStoreSIMD128: {
      DCHECK(!instr->HasOutput());
      size_t index = 0;
      auto operand = i.MemoryOperand(&index);
      auto val = i.InputSIMD128Register(index++);
      auto stored_bytes = i.InputInt32(index);
      if (stored_bytes == 16) {
        __ movups(operand, val);
      } else if (stored_bytes == 12) {
        __ movhlps(xmm0, val);
        __ movq(operand, val);
        __ movd(Operand(operand, 0x8), xmm0);
      } else if (stored_bytes == 8) {
        __ movq(operand, val);
      } else if (stored_bytes == 4) {
        __ movd(operand, val);
      }
      break;
    }
    case kCheckedStoreSIMD128: {
      DCHECK(!instr->HasOutput());
      auto buffer = i.InputRegister(0);
      auto index1 = i.InputRegister(1);
      auto index2 = i.InputInt32(2);
      auto val = i.InputSIMD128Register(4);
      auto stored_bytes = i.InputInt32(5);
      Label done;
      if (instr->InputAt(3)->IsRegister()) {
        auto length = i.InputRegister(3);
        DCHECK_EQ(0, index2);
        __ cmpl(index1, length);
      } else {
        auto length = i.InputInt32(3);
        DCHECK_LE(index2, length);
        __ cmpl(index1, Immediate(length - index2));
      }
      __ j(above, &done, Label::kNear);
      Operand operand = Operand(buffer, index1, times_1, index2);
      if (stored_bytes == 16) {
        __ movups(operand, val);
      } else if (stored_bytes == 12) {
        __ movhlps(xmm0, val);
        __ movq(operand, val);
        __ movd(Operand(operand, 0x8), xmm0);
      } else if (stored_bytes == 8) {
        __ movq(operand, val);
      } else if (stored_bytes == 4) {
        __ movd(operand, val);
      }
      __ bind(&done);
      break;
    }
    case kFloat64x2Add:
      ASSEMBLE_SIMD_BINOP_NOAVX(addpd, Float64x2);
      break;
    case kFloat64x2Sub:
      ASSEMBLE_SIMD_BINOP_NOAVX(subpd, Float64x2);
      break;
    case kFloat64x2Mul:
      ASSEMBLE_SIMD_BINOP_NOAVX(mulpd, Float64x2);
      break;
    case kFloat64x2Div:
      ASSEMBLE_SIMD_BINOP_NOAVX(divpd, Float64x2);
      break;
    case kFloat64x2Max:
      ASSEMBLE_SIMD_BINOP_NOAVX(maxpd, Float64x2);
      break;
    case kFloat64x2Min:
      ASSEMBLE_SIMD_BINOP_NOAVX(minpd, Float64x2);
      break;
    case kFloat64x2Constructor:
      __ leaq(rsp, Operand(rsp, -kFloat64x2Size));
      __ movsd(Operand(rsp, 0 * kDoubleSize), i.InputDoubleRegister(0));
      __ movsd(Operand(rsp, 1 * kDoubleSize), i.InputDoubleRegister(1));
      __ movups(i.OutputFloat64x2Register(), Operand(rsp, 0 * kDoubleSize));
      __ leaq(rsp, Operand(rsp, kFloat64x2Size));
      break;
    case kFloat64x2GetY:
      select++;
    case kFloat64x2GetX: {
      XMMRegister dst = i.OutputDoubleRegister();
      XMMRegister input = i.InputFloat64x2Register(0);
      if (!dst.is(input)) __ movaps(dst, input);
      if (select != 0) __ shufpd(dst, input, select);
      break;
    }
    case kFloat64x2GetSignMask:
      __ movmskpd(i.OutputRegister(), i.InputFloat64x2Register(0));
      break;
    case kFloat64x2Abs:
      __ abspd(i.InputFloat64x2Register(0));
      break;
    case kFloat64x2Neg:
      __ negatepd(i.InputFloat64x2Register(0));
      break;
    case kFloat64x2Sqrt:
      __ sqrtpd(i.OutputFloat64x2Register(), i.InputFloat64x2Register(0));
      break;
    case kFloat64x2Scale: {
      XMMRegister scale = i.InputDoubleRegister(1);
      __ shufpd(scale, scale, 0x0);
      __ mulpd(i.InputFloat64x2Register(0), scale);
      break;
    }
    case kFloat64x2WithY:
      select++;
    case kFloat64x2WithX: {
      __ subq(rsp, Immediate(kFloat64x2Size));
      __ movups(Operand(rsp, 0), i.InputFloat64x2Register(0));
      __ movsd(Operand(rsp, select * kDoubleSize), i.InputDoubleRegister(1));
      __ movups(i.InputFloat64x2Register(0), Operand(rsp, 0));
      __ addq(rsp, Immediate(kFloat64x2Size));
      break;
    }
    case kFloat64x2Clamp: {
      XMMRegister value_reg = i.InputFloat64x2Register(0);
      XMMRegister lower_reg = i.InputFloat64x2Register(1);
      XMMRegister upper_reg = i.InputFloat64x2Register(2);
      __ minpd(value_reg, upper_reg);
      __ maxpd(value_reg, lower_reg);
      break;
    }
    case kX64Movsxbl:
      ASSEMBLE_MOVX(movsxbl);
      __ AssertZeroExtended(i.OutputRegister());
      break;
    case kX64Movzxbl:
      ASSEMBLE_MOVX(movzxbl);
      __ AssertZeroExtended(i.OutputRegister());
      break;
    case kX64Movb: {
      size_t index = 0;
      Operand operand = i.MemoryOperand(&index);
      if (HasImmediateInput(instr, index)) {
        __ movb(operand, Immediate(i.InputInt8(index)));
      } else {
        __ movb(operand, i.InputRegister(index));
      }
      break;
    }
    case kX64Movsxwl:
      ASSEMBLE_MOVX(movsxwl);
      __ AssertZeroExtended(i.OutputRegister());
      break;
    case kX64Movzxwl:
      ASSEMBLE_MOVX(movzxwl);
      __ AssertZeroExtended(i.OutputRegister());
      break;
    case kX64Movw: {
      size_t index = 0;
      Operand operand = i.MemoryOperand(&index);
      if (HasImmediateInput(instr, index)) {
        __ movw(operand, Immediate(i.InputInt16(index)));
      } else {
        __ movw(operand, i.InputRegister(index));
      }
      break;
    }
    case kX64Movl:
      if (instr->HasOutput()) {
        if (instr->addressing_mode() == kMode_None) {
          if (instr->InputAt(0)->IsRegister()) {
            __ movl(i.OutputRegister(), i.InputRegister(0));
          } else {
            __ movl(i.OutputRegister(), i.InputOperand(0));
          }
        } else {
          __ movl(i.OutputRegister(), i.MemoryOperand());
        }
        __ AssertZeroExtended(i.OutputRegister());
      } else {
        size_t index = 0;
        Operand operand = i.MemoryOperand(&index);
        if (HasImmediateInput(instr, index)) {
          __ movl(operand, i.InputImmediate(index));
        } else {
          __ movl(operand, i.InputRegister(index));
        }
      }
      break;
    case kX64Movsxlq:
      ASSEMBLE_MOVX(movsxlq);
      break;
    case kX64Movq:
      if (instr->HasOutput()) {
        __ movq(i.OutputRegister(), i.MemoryOperand());
      } else {
        size_t index = 0;
        Operand operand = i.MemoryOperand(&index);
        if (HasImmediateInput(instr, index)) {
          __ movq(operand, i.InputImmediate(index));
        } else {
          __ movq(operand, i.InputRegister(index));
        }
      }
      break;
    case kX64Movss:
      if (instr->HasOutput()) {
        __ movss(i.OutputDoubleRegister(), i.MemoryOperand());
      } else {
        size_t index = 0;
        Operand operand = i.MemoryOperand(&index);
        __ movss(operand, i.InputDoubleRegister(index));
      }
      break;
    case kX64Movsd:
      if (instr->HasOutput()) {
        __ movsd(i.OutputDoubleRegister(), i.MemoryOperand());
      } else {
        size_t index = 0;
        Operand operand = i.MemoryOperand(&index);
        __ movsd(operand, i.InputDoubleRegister(index));
      }
      break;
    case kX64Lea32: {
      AddressingMode mode = AddressingModeField::decode(instr->opcode());
      // Shorten "leal" to "addl", "subl" or "shll" if the register allocation
      // and addressing mode just happens to work out. The "addl"/"subl" forms
      // in these cases are faster based on measurements.
      if (i.InputRegister(0).is(i.OutputRegister())) {
        if (mode == kMode_MRI) {
          int32_t constant_summand = i.InputInt32(1);
          if (constant_summand > 0) {
            __ addl(i.OutputRegister(), Immediate(constant_summand));
          } else if (constant_summand < 0) {
            __ subl(i.OutputRegister(), Immediate(-constant_summand));
          }
        } else if (mode == kMode_MR1) {
          if (i.InputRegister(1).is(i.OutputRegister())) {
            __ shll(i.OutputRegister(), Immediate(1));
          } else {
            __ leal(i.OutputRegister(), i.MemoryOperand());
          }
        } else if (mode == kMode_M2) {
          __ shll(i.OutputRegister(), Immediate(1));
        } else if (mode == kMode_M4) {
          __ shll(i.OutputRegister(), Immediate(2));
        } else if (mode == kMode_M8) {
          __ shll(i.OutputRegister(), Immediate(3));
        } else {
          __ leal(i.OutputRegister(), i.MemoryOperand());
        }
      } else {
        __ leal(i.OutputRegister(), i.MemoryOperand());
      }
      __ AssertZeroExtended(i.OutputRegister());
      break;
    }
    case kX64Lea:
      __ leaq(i.OutputRegister(), i.MemoryOperand());
      break;
    case kX64Dec32:
      __ decl(i.OutputRegister());
      break;
    case kX64Inc32:
      __ incl(i.OutputRegister());
      break;
    case kX64Push:
      if (HasImmediateInput(instr, 0)) {
        __ pushq(i.InputImmediate(0));
      } else {
        if (instr->InputAt(0)->IsRegister()) {
          __ pushq(i.InputRegister(0));
        } else {
          __ pushq(i.InputOperand(0));
        }
      }
      break;
    case kX64StoreWriteBarrier: {
      Register object = i.InputRegister(0);
      Register index = i.InputRegister(1);
      Register value = i.InputRegister(2);
      __ movq(Operand(object, index, times_1, 0), value);
      __ leaq(index, Operand(object, index, times_1, 0));
      SaveFPRegsMode mode =
          frame()->DidAllocateDoubleRegisters() ? kSaveFPRegs : kDontSaveFPRegs;
      __ RecordWrite(object, index, value, mode);
      break;
    }
    case kCheckedLoadInt8:
      ASSEMBLE_CHECKED_LOAD_INTEGER(movsxbl);
      break;
    case kCheckedLoadUint8:
      ASSEMBLE_CHECKED_LOAD_INTEGER(movzxbl);
      break;
    case kCheckedLoadInt16:
      ASSEMBLE_CHECKED_LOAD_INTEGER(movsxwl);
      break;
    case kCheckedLoadUint16:
      ASSEMBLE_CHECKED_LOAD_INTEGER(movzxwl);
      break;
    case kCheckedLoadWord32:
      ASSEMBLE_CHECKED_LOAD_INTEGER(movl);
      break;
    case kCheckedLoadFloat32:
      ASSEMBLE_CHECKED_LOAD_FLOAT(movss);
      break;
    case kCheckedLoadFloat64:
      ASSEMBLE_CHECKED_LOAD_FLOAT(movsd);
      break;
    case kCheckedStoreWord8:
      ASSEMBLE_CHECKED_STORE_INTEGER(movb);
      break;
    case kCheckedStoreWord16:
      ASSEMBLE_CHECKED_STORE_INTEGER(movw);
      break;
    case kCheckedStoreWord32:
      ASSEMBLE_CHECKED_STORE_INTEGER(movl);
      break;
    case kCheckedStoreFloat32:
      ASSEMBLE_CHECKED_STORE_FLOAT(movss);
      break;
    case kCheckedStoreFloat64:
      ASSEMBLE_CHECKED_STORE_FLOAT(movsd);
      break;
    case kX64StackCheck:
      __ CompareRoot(rsp, Heap::kStackLimitRootIndex);
      break;
  }
}  // NOLINT(readability/fn_size)


// Assembles branches after this instruction.
void CodeGenerator::AssembleArchBranch(Instruction* instr, BranchInfo* branch) {
  X64OperandConverter i(this, instr);
  Label::Distance flabel_distance =
      branch->fallthru ? Label::kNear : Label::kFar;
  Label* tlabel = branch->true_label;
  Label* flabel = branch->false_label;
  switch (branch->condition) {
    case kUnorderedEqual:
      __ j(parity_even, flabel, flabel_distance);
    // Fall through.
    case kEqual:
      __ j(equal, tlabel);
      break;
    case kUnorderedNotEqual:
      __ j(parity_even, tlabel);
    // Fall through.
    case kNotEqual:
      __ j(not_equal, tlabel);
      break;
    case kSignedLessThan:
      __ j(less, tlabel);
      break;
    case kSignedGreaterThanOrEqual:
      __ j(greater_equal, tlabel);
      break;
    case kSignedLessThanOrEqual:
      __ j(less_equal, tlabel);
      break;
    case kSignedGreaterThan:
      __ j(greater, tlabel);
      break;
    case kUnsignedLessThan:
      __ j(below, tlabel);
      break;
    case kUnsignedGreaterThanOrEqual:
      __ j(above_equal, tlabel);
      break;
    case kUnsignedLessThanOrEqual:
      __ j(below_equal, tlabel);
      break;
    case kUnsignedGreaterThan:
      __ j(above, tlabel);
      break;
    case kOverflow:
      __ j(overflow, tlabel);
      break;
    case kNotOverflow:
      __ j(no_overflow, tlabel);
      break;
  }
  if (!branch->fallthru) __ jmp(flabel, flabel_distance);
}


void CodeGenerator::AssembleArchJump(RpoNumber target) {
  if (!IsNextInAssemblyOrder(target)) __ jmp(GetLabel(target));
}


// Assembles boolean materializations after this instruction.
void CodeGenerator::AssembleArchBoolean(Instruction* instr,
                                        FlagsCondition condition) {
  X64OperandConverter i(this, instr);
  Label done;

  // Materialize a full 64-bit 1 or 0 value. The result register is always the
  // last output of the instruction.
  Label check;
  DCHECK_NE(0u, instr->OutputCount());
  Register reg = i.OutputRegister(instr->OutputCount() - 1);
  Condition cc = no_condition;
  switch (condition) {
    case kUnorderedEqual:
      __ j(parity_odd, &check, Label::kNear);
      __ movl(reg, Immediate(0));
      __ jmp(&done, Label::kNear);
    // Fall through.
    case kEqual:
      cc = equal;
      break;
    case kUnorderedNotEqual:
      __ j(parity_odd, &check, Label::kNear);
      __ movl(reg, Immediate(1));
      __ jmp(&done, Label::kNear);
    // Fall through.
    case kNotEqual:
      cc = not_equal;
      break;
    case kSignedLessThan:
      cc = less;
      break;
    case kSignedGreaterThanOrEqual:
      cc = greater_equal;
      break;
    case kSignedLessThanOrEqual:
      cc = less_equal;
      break;
    case kSignedGreaterThan:
      cc = greater;
      break;
    case kUnsignedLessThan:
      cc = below;
      break;
    case kUnsignedGreaterThanOrEqual:
      cc = above_equal;
      break;
    case kUnsignedLessThanOrEqual:
      cc = below_equal;
      break;
    case kUnsignedGreaterThan:
      cc = above;
      break;
    case kOverflow:
      cc = overflow;
      break;
    case kNotOverflow:
      cc = no_overflow;
      break;
  }
  __ bind(&check);
  __ setcc(cc, reg);
  __ movzxbl(reg, reg);
  __ bind(&done);
}


void CodeGenerator::AssembleArchLookupSwitch(Instruction* instr) {
  X64OperandConverter i(this, instr);
  Register input = i.InputRegister(0);
  for (size_t index = 2; index < instr->InputCount(); index += 2) {
    __ cmpl(input, Immediate(i.InputInt32(index + 0)));
    __ j(equal, GetLabel(i.InputRpo(index + 1)));
  }
  AssembleArchJump(i.InputRpo(1));
}


void CodeGenerator::AssembleArchTableSwitch(Instruction* instr) {
  X64OperandConverter i(this, instr);
  Register input = i.InputRegister(0);
  int32_t const case_count = static_cast<int32_t>(instr->InputCount() - 2);
  Label** cases = zone()->NewArray<Label*>(case_count);
  for (int32_t index = 0; index < case_count; ++index) {
    cases[index] = GetLabel(i.InputRpo(index + 2));
  }
  Label* const table = AddJumpTable(cases, case_count);
  __ cmpl(input, Immediate(case_count));
  __ j(above_equal, GetLabel(i.InputRpo(1)));
  __ leaq(kScratchRegister, Operand(table));
  __ jmp(Operand(kScratchRegister, input, times_8, 0));
}


void CodeGenerator::AssembleDeoptimizerCall(
    int deoptimization_id, Deoptimizer::BailoutType bailout_type) {
  Address deopt_entry = Deoptimizer::GetDeoptimizationEntry(
      isolate(), deoptimization_id, bailout_type);
  __ call(deopt_entry, RelocInfo::RUNTIME_ENTRY);
}


void CodeGenerator::AssembleStopAt() {
  if (strlen(FLAG_stop_at) > 0 &&
      info_->function()->name()->IsUtf8EqualTo(CStrVector(FLAG_stop_at))) {
    __ int3();
  }
}


void CodeGenerator::AssemblePrologue() {
  CallDescriptor* descriptor = linkage()->GetIncomingDescriptor();
  int stack_slots = frame()->GetSpillSlotCount();
  if (descriptor->kind() == CallDescriptor::kCallAddress) {
    __ pushq(rbp);
    __ movq(rbp, rsp);
    const RegList saves = descriptor->CalleeSavedRegisters();
    if (saves != 0) {  // Save callee-saved registers.
      int register_save_area_size = 0;
      for (int i = Register::kNumRegisters - 1; i >= 0; i--) {
        if (!((1 << i) & saves)) continue;
        __ pushq(Register::from_code(i));
        register_save_area_size += kPointerSize;
      }
      frame()->SetRegisterSaveAreaSize(register_save_area_size);
    }
  } else if (descriptor->IsJSFunctionCall()) {
    CompilationInfo* info = this->info();
    __ Prologue(info->IsCodePreAgingActive());
    frame()->SetRegisterSaveAreaSize(
        StandardFrameConstants::kFixedFrameSizeFromFp);
  } else if (stack_slots > 0) {
    __ StubPrologue();
    frame()->SetRegisterSaveAreaSize(
        StandardFrameConstants::kFixedFrameSizeFromFp);
  }

  if (info()->is_osr()) {
    // TurboFan OSR-compiled functions cannot be entered directly.
    __ Abort(kShouldNotDirectlyEnterOsrFunction);

    // Unoptimized code jumps directly to this entrypoint while the unoptimized
    // frame is still on the stack. Optimized code uses OSR values directly from
    // the unoptimized frame. Thus, all that needs to be done is to allocate the
    // remaining stack slots.
    if (FLAG_code_comments) __ RecordComment("-- OSR entrypoint --");
    osr_pc_offset_ = __ pc_offset();
    // TODO(titzer): cannot address target function == local #-1
    __ movq(rdi, Operand(rbp, JavaScriptFrameConstants::kFunctionOffset));
    DCHECK(stack_slots >= frame()->GetOsrStackSlotCount());
    stack_slots -= frame()->GetOsrStackSlotCount();
  }

  if (stack_slots > 0) {
    __ subq(rsp, Immediate(stack_slots * kPointerSize));
  }
}


void CodeGenerator::AssembleReturn() {
  CallDescriptor* descriptor = linkage()->GetIncomingDescriptor();
  int stack_slots = frame()->GetSpillSlotCount();
  if (descriptor->kind() == CallDescriptor::kCallAddress) {
    if (frame()->GetRegisterSaveAreaSize() > 0) {
      // Remove this frame's spill slots first.
      if (stack_slots > 0) {
        __ addq(rsp, Immediate(stack_slots * kPointerSize));
      }
      const RegList saves = descriptor->CalleeSavedRegisters();
      // Restore registers.
      if (saves != 0) {
        for (int i = 0; i < Register::kNumRegisters; i++) {
          if (!((1 << i) & saves)) continue;
          __ popq(Register::from_code(i));
        }
      }
      __ popq(rbp);  // Pop caller's frame pointer.
      __ ret(0);
    } else {
      // No saved registers.
      __ movq(rsp, rbp);  // Move stack pointer back to frame pointer.
      __ popq(rbp);       // Pop caller's frame pointer.
      __ ret(0);
    }
  } else if (descriptor->IsJSFunctionCall() || stack_slots > 0) {
    __ movq(rsp, rbp);  // Move stack pointer back to frame pointer.
    __ popq(rbp);       // Pop caller's frame pointer.
    int pop_count = descriptor->IsJSFunctionCall()
                        ? static_cast<int>(descriptor->JSParameterCount())
                        : 0;
    __ ret(pop_count * kPointerSize);
  } else {
    __ ret(0);
  }
}


void CodeGenerator::AssembleMove(InstructionOperand* source,
                                 InstructionOperand* destination) {
  X64OperandConverter g(this, NULL);
  // Dispatch on the source and destination operand kinds.  Not all
  // combinations are possible.
  if (source->IsRegister()) {
    DCHECK(destination->IsRegister() || destination->IsStackSlot());
    Register src = g.ToRegister(source);
    if (destination->IsRegister()) {
      __ movq(g.ToRegister(destination), src);
    } else {
      __ movq(g.ToOperand(destination), src);
    }
  } else if (source->IsStackSlot()) {
    DCHECK(destination->IsRegister() || destination->IsStackSlot());
    Operand src = g.ToOperand(source);
    if (destination->IsRegister()) {
      Register dst = g.ToRegister(destination);
      __ movq(dst, src);
    } else {
      // Spill on demand to use a temporary register for memory-to-memory
      // moves.
      Register tmp = kScratchRegister;
      Operand dst = g.ToOperand(destination);
      __ movq(tmp, src);
      __ movq(dst, tmp);
    }
  } else if (source->IsConstant()) {
    ConstantOperand* constant_source = ConstantOperand::cast(source);
    Constant src = g.ToConstant(constant_source);
    if (destination->IsRegister() || destination->IsStackSlot()) {
      Register dst = destination->IsRegister() ? g.ToRegister(destination)
                                               : kScratchRegister;
      switch (src.type()) {
        case Constant::kInt32:
          // TODO(dcarney): don't need scratch in this case.
          __ Set(dst, src.ToInt32());
          break;
        case Constant::kInt64:
          __ Set(dst, src.ToInt64());
          break;
        case Constant::kFloat32:
          __ Move(dst,
                  isolate()->factory()->NewNumber(src.ToFloat32(), TENURED));
          break;
        case Constant::kFloat64:
          __ Move(dst,
                  isolate()->factory()->NewNumber(src.ToFloat64(), TENURED));
          break;
        case Constant::kExternalReference:
          __ Move(dst, src.ToExternalReference());
          break;
        case Constant::kHeapObject: {
          Handle<HeapObject> src_object = src.ToHeapObject();
          if (info()->IsOptimizing() &&
              src_object.is_identical_to(info()->context())) {
            // Loading the context from the frame is way cheaper than
            // materializing the actual context heap object address.
            __ movp(dst, Operand(rbp, StandardFrameConstants::kContextOffset));
          } else {
            __ Move(dst, src_object);
          }
          break;
        }
        case Constant::kRpoNumber:
          UNREACHABLE();  // TODO(dcarney): load of labels on x64.
          break;
      }
      if (destination->IsStackSlot()) {
        __ movq(g.ToOperand(destination), kScratchRegister);
      }
    } else if (src.type() == Constant::kFloat32) {
      // TODO(turbofan): Can we do better here?
      uint32_t src_const = bit_cast<uint32_t>(src.ToFloat32());
      if (destination->IsDoubleRegister()) {
        __ Move(g.ToDoubleRegister(destination), src_const);
      } else {
        DCHECK(destination->IsDoubleStackSlot());
        Operand dst = g.ToOperand(destination);
        __ movl(dst, Immediate(src_const));
      }
    } else {
      DCHECK_EQ(Constant::kFloat64, src.type());
      uint64_t src_const = bit_cast<uint64_t>(src.ToFloat64());
      if (destination->IsDoubleRegister()) {
        __ Move(g.ToDoubleRegister(destination), src_const);
      } else {
        DCHECK(destination->IsDoubleStackSlot());
        __ movq(kScratchRegister, src_const);
        __ movq(g.ToOperand(destination), kScratchRegister);
      }
    }
  } else if (source->IsDoubleRegister()) {
    XMMRegister src = g.ToDoubleRegister(source);
    if (destination->IsDoubleRegister()) {
      XMMRegister dst = g.ToDoubleRegister(destination);
      __ movaps(dst, src);
    } else {
      DCHECK(destination->IsDoubleStackSlot());
      Operand dst = g.ToOperand(destination);
      __ movsd(dst, src);
    }
  } else if (source->IsDoubleStackSlot()) {
    DCHECK(destination->IsDoubleRegister() || destination->IsDoubleStackSlot());
    Operand src = g.ToOperand(source);
    if (destination->IsDoubleRegister()) {
      XMMRegister dst = g.ToDoubleRegister(destination);
      __ movsd(dst, src);
    } else {
      // We rely on having xmm0 available as a fixed scratch register.
      Operand dst = g.ToOperand(destination);
      __ movsd(xmm0, src);
      __ movsd(dst, xmm0);
    }
  } else if (source->IsSIMD128Register()) {
    DCHECK(destination->IsSIMD128Register() ||
           destination->IsSIMD128StackSlot());
    XMMRegister src = g.ToSIMD128Register(source);
    if (destination->IsSIMD128Register()) {
      __ movaps(g.ToSIMD128Register(destination), src);
    } else {
      __ movups(g.ToOperand(destination), src);
    }
  } else if (source->IsSIMD128StackSlot()) {
    DCHECK(destination->IsSIMD128Register() ||
           destination->IsSIMD128StackSlot());
    Operand src = g.ToOperand(source);
    if (destination->IsSIMD128Register()) {
      __ movups(g.ToSIMD128Register(destination), src);
    } else {
      __ movups(xmm0, src);
      __ movups(g.ToOperand(destination), xmm0);
    }
  } else {
    UNREACHABLE();
  }
}


void CodeGenerator::AssembleSwap(InstructionOperand* source,
                                 InstructionOperand* destination) {
  X64OperandConverter g(this, NULL);
  // Dispatch on the source and destination operand kinds.  Not all
  // combinations are possible.
  if (source->IsRegister() && destination->IsRegister()) {
    // Register-register.
    __ xchgq(g.ToRegister(source), g.ToRegister(destination));
  } else if (source->IsRegister() && destination->IsStackSlot()) {
    Register src = g.ToRegister(source);
    Register tmp = kScratchRegister;
    Operand dst = g.ToOperand(destination);
    __ movq(tmp, dst);
    __ movq(dst, src);
    __ movq(src, tmp);
  } else if ((source->IsStackSlot() && destination->IsStackSlot()) ||
             (source->IsDoubleStackSlot() &&
              destination->IsDoubleStackSlot())) {
    // Memory-memory.
    Register tmp = kScratchRegister;
    Operand src = g.ToOperand(source);
    Operand dst = g.ToOperand(destination);
    __ movsd(xmm0, src);
    __ movq(tmp, dst);
    __ movsd(dst, xmm0);
    __ movq(src, tmp);
  } else if ((source->IsSIMD128StackSlot() &&
              destination->IsSIMD128StackSlot())) {
    // Swap two XMM stack slots.
    STATIC_ASSERT(kSIMD128Size == 2 * kDoubleSize);
    Operand src = g.ToOperand(source);
    Operand dst = g.ToOperand(destination);
    __ movups(xmm0, src);
    __ movq(kScratchRegister, dst);
    __ movq(src, kScratchRegister);
    __ movq(kScratchRegister, Operand(dst, kDoubleSize));
    __ movq(Operand(src, kDoubleSize), kScratchRegister);
    __ movups(dst, xmm0);

  } else if (source->IsDoubleRegister() && destination->IsDoubleRegister()) {
    // XMM register-register swap. We rely on having xmm0
    // available as a fixed scratch register.
    XMMRegister src = g.ToDoubleRegister(source);
    XMMRegister dst = g.ToDoubleRegister(destination);
    __ movaps(xmm0, src);
    __ movaps(src, dst);
    __ movaps(dst, xmm0);

  } else if (source->IsSIMD128Register() && destination->IsSIMD128Register()) {
    // Swap two XMM registers.
    XMMRegister src = g.ToSIMD128Register(source);
    XMMRegister dst = g.ToSIMD128Register(destination);
    __ movaps(xmm0, src);
    __ movaps(src, dst);
    __ movaps(dst, xmm0);

  } else if (source->IsDoubleRegister() && destination->IsDoubleStackSlot()) {
    // XMM register-memory swap.  We rely on having xmm0
    // available as a fixed scratch register.
    XMMRegister src = g.ToDoubleRegister(source);
    Operand dst = g.ToOperand(destination);
    __ movsd(xmm0, src);
    __ movsd(src, dst);
    __ movsd(dst, xmm0);

  } else if (source->IsSIMD128Register() && destination->IsSIMD128StackSlot()) {
    // Swap a xmm register and a xmm stack slot.
    XMMRegister src = g.ToSIMD128Register(source);
    Operand dst = g.ToOperand(destination);
    __ movups(xmm0, dst);
    __ movups(dst, src);
    __ movups(dst, xmm0);

  } else {
    // No other combinations are possible.
    UNREACHABLE();
  }
}


void CodeGenerator::AssembleJumpTable(Label** targets, size_t target_count) {
  for (size_t index = 0; index < target_count; ++index) {
    __ dq(targets[index]);
  }
}


void CodeGenerator::AddNopForSmiCodeInlining() { __ nop(); }


void CodeGenerator::EnsureSpaceForLazyDeopt() {
  int space_needed = Deoptimizer::patch_size();
  if (!info()->IsStub()) {
    // Ensure that we have enough space after the previous lazy-bailout
    // instruction for patching the code here.
    int current_pc = masm()->pc_offset();
    if (current_pc < last_lazy_deopt_pc_ + space_needed) {
      int padding_size = last_lazy_deopt_pc_ + space_needed - current_pc;
      __ Nop(padding_size);
    }
  }
  MarkLazyDeoptSite();
}

#undef __

}  // namespace internal
}  // namespace compiler
}  // namespace v8
