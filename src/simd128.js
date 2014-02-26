// Copyright 2013 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"use strict";

// This file relies on the fact that the following declaration has been made
// in runtime.js:
// var $Array = global.Array;

var $SIMD = global.SIMD;
var $Float32x4 = $SIMD.float32x4;
var $Int32x4 = $SIMD.int32x4;

macro SIMD128_DATA_TYPES(FUNCTION)
FUNCTION(Float32x4, float32x4)
FUNCTION(Int32x4, int32x4)
endmacro

macro DECLARE_DATA_TYPE_COMMON_FUNCTION(NAME, TYPE)
function ThrowNAMETypeError() {
  throw MakeTypeError("this is not a TYPE value.");
}

function NAMEToString() {
  if (IsNAMEWrapper(this)) {
    return ObjectToString.apply(this);
  } else if (IsNAME(this)) {
    return "TYPE(" + this.x + "," + this.y + "," + this.z + "," + this.w + ")";
  } else {
    throw MakeTypeError('TYPE_to_string');
  }
}

function NAMEValueOf() {
  if (!IsNAME(this) && !IsNAMEWrapper(this)) {
    ThrowNAMETypeError();
  }
  return %_ValueOf(this);
}
endmacro

SIMD128_DATA_TYPES(DECLARE_DATA_TYPE_COMMON_FUNCTION)

macro SIMD128_DATA_TYPE_FUNCTIONS(FUNCTION)
FUNCTION(Float32x4, GetX)
FUNCTION(Float32x4, GetY)
FUNCTION(Float32x4, GetZ)
FUNCTION(Float32x4, GetW)
FUNCTION(Float32x4, GetSignMask)
FUNCTION(Int32x4, GetX)
FUNCTION(Int32x4, GetY)
FUNCTION(Int32x4, GetZ)
FUNCTION(Int32x4, GetW)
FUNCTION(Int32x4, GetFlagX)
FUNCTION(Int32x4, GetFlagY)
FUNCTION(Int32x4, GetFlagZ)
FUNCTION(Int32x4, GetFlagW)
FUNCTION(Int32x4, GetSignMask)
endmacro

macro DECLARE_DATA_TYPE_FUNCTION(TYPE, FUNCTION)
function TYPEFUNCTION() {
  var x4 = ToTYPE(this);
  CheckTYPE(x4);
  return %TYPEFUNCTION(x4);
}
endmacro

SIMD128_DATA_TYPE_FUNCTIONS(DECLARE_DATA_TYPE_FUNCTION)

function Float32x4Constructor(x, y, z, w) {
  x = TO_NUMBER_INLINE(x);
  y = TO_NUMBER_INLINE(y);
  z = TO_NUMBER_INLINE(z);
  w = TO_NUMBER_INLINE(w);

  var value = %CreateFloat32x4(x, y, z, w);
  if (%_IsConstructCall()) {
    %_SetValueOf(this, value);
  } else {
    return value;
  }
}

function Int32x4Constructor(x, y, z, w) {
  x = TO_INT32(x);
  y = TO_INT32(y);
  z = TO_INT32(z);
  w = TO_INT32(w);

  var value = %CreateInt32x4(x, y, z, w);
  if (%_IsConstructCall()) {
    %_SetValueOf(this, value);
  } else {
    return value;
  }
}

function SetUpFloat32x4() {
  %CheckIsBootstrapping();

  %SetCode($Float32x4, Float32x4Constructor);

  %FunctionSetPrototype($Float32x4, new $Float32x4(0.0, 0.0, 0.0, 0.0));
  %SetProperty($Float32x4.prototype, "constructor", $Float32x4, DONT_ENUM);

  InstallGetter($Float32x4.prototype, "x", Float32x4GetX);
  InstallGetter($Float32x4.prototype, "y", Float32x4GetY);
  InstallGetter($Float32x4.prototype, "z", Float32x4GetZ);
  InstallGetter($Float32x4.prototype, "w", Float32x4GetW);
  InstallGetter($Float32x4.prototype, "signMask", Float32x4GetSignMask);
  InstallFunctions($Float32x4.prototype, DONT_ENUM, $Array(
    "toString", Float32x4ToString,
    "valueOf", Float32x4ValueOf
  ));
}

function SetUpInt32x4() {
  %CheckIsBootstrapping();

  %SetCode($Int32x4, Int32x4Constructor);

  %FunctionSetPrototype($Int32x4, new $Int32x4(0, 0, 0, 0));
  %SetProperty($Int32x4.prototype, "constructor", $Int32x4, DONT_ENUM);

  InstallGetter($Int32x4.prototype, "x", Int32x4GetX);
  InstallGetter($Int32x4.prototype, "y", Int32x4GetY);
  InstallGetter($Int32x4.prototype, "z", Int32x4GetZ);
  InstallGetter($Int32x4.prototype, "w", Int32x4GetW);
  InstallGetter($Int32x4.prototype, "flagX", Int32x4GetFlagX);
  InstallGetter($Int32x4.prototype, "flagY", Int32x4GetFlagY);
  InstallGetter($Int32x4.prototype, "flagZ", Int32x4GetFlagZ);
  InstallGetter($Int32x4.prototype, "flagW", Int32x4GetFlagW);
  InstallGetter($Int32x4.prototype, "signMask", Int32x4GetSignMask);
  InstallFunctions($Int32x4.prototype, DONT_ENUM, $Array(
    "toString", Int32x4ToString,
    "valueOf", Int32x4ValueOf
  ));
}

SetUpFloat32x4();
SetUpInt32x4();

//------------------------------------------------------------------------------

macro SIMD128_UNARY_FUNCTIONS(FUNCTION)
FUNCTION(Float32x4, Abs)
FUNCTION(Float32x4, BitsToInt32x4)
FUNCTION(Float32x4, Neg)
FUNCTION(Float32x4, Reciprocal)
FUNCTION(Float32x4, ReciprocalSqrt)
FUNCTION(Float32x4, Sqrt)
FUNCTION(Float32x4, ToInt32x4)
FUNCTION(Int32x4, BitsToFloat32x4)
FUNCTION(Int32x4, Neg)
FUNCTION(Int32x4, Not)
FUNCTION(Int32x4, ToFloat32x4)
endmacro

macro SIMD128_BINARY_FUNCTIONS(FUNCTION)
FUNCTION(Float32x4, Add)
FUNCTION(Float32x4, Div)
FUNCTION(Float32x4, Max)
FUNCTION(Float32x4, Min)
FUNCTION(Float32x4, Mul)
FUNCTION(Float32x4, Sub)
FUNCTION(Float32x4, Equal)
FUNCTION(Float32x4, NotEqual)
FUNCTION(Float32x4, GreaterThanOrEqual)
FUNCTION(Float32x4, GreaterThan)
FUNCTION(Float32x4, LessThan)
FUNCTION(Float32x4, LessThanOrEqual)
FUNCTION(Int32x4, Add)
FUNCTION(Int32x4, And)
FUNCTION(Int32x4, Mul)
FUNCTION(Int32x4, Or)
FUNCTION(Int32x4, Sub)
FUNCTION(Int32x4, Xor)
FUNCTION(Int32x4, Equal)
FUNCTION(Int32x4, GreaterThan)
FUNCTION(Int32x4, LessThan)
endmacro

macro SIMD128_BINARY_SHUFFLE_FUNCTIONS(FUNCTION)
FUNCTION(Float32x4)
FUNCTION(Int32x4)
endmacro

macro FLOAT32x4_BINARY_FUNCTIONS_WITH_FLOAT32_PARAMETER(FUNCTION)
FUNCTION(Scale)
FUNCTION(WithX)
FUNCTION(WithY)
FUNCTION(WithZ)
FUNCTION(WithW)
endmacro

macro INT32x4_BINARY_FUNCTIONS_WITH_INT32_PARAMETER(FUNCTION)
FUNCTION(WithX)
FUNCTION(WithY)
FUNCTION(WithZ)
FUNCTION(WithW)
endmacro

macro INT32x4_BINARY_FUNCTIONS_WITH_BOOLEAN_PARAMETER(FUNCTION)
FUNCTION(WithFlagX)
FUNCTION(WithFlagY)
FUNCTION(WithFlagZ)
FUNCTION(WithFlagW)
endmacro

macro DECLARE_SIMD_UNARY_FUNCTION(TYPE, FUNCTION)
function TYPEFUNCTION(x4) {
  x4 = ToTYPE(x4);
  CheckTYPE(x4);
  return %TYPEFUNCTION(x4);
}
endmacro

macro DECLARE_SIMD_BINARY_FUNCTION(TYPE, FUNCTION)
function TYPEFUNCTION(a4, b4) {
  a4 = ToTYPE(a4);
  CheckTYPE(a4);
  b4 = ToTYPE(b4);
  CheckTYPE(b4);
  return %TYPEFUNCTION(a4, b4);
}
endmacro

macro DECLARE_SIMD_BINARY_SHUFFLE_FUNCTION(TYPE)
function TYPEShuffle(x4, mask) {
  x4 = ToTYPE(x4);
  CheckTYPE(x4);
  var value = TO_INT32(mask);
  if ((value < 0) || (value > 0xFF)) {
    throw MakeRangeError("invalid_simd_shuffle_mask");
  }
  return %TYPEShuffle(x4, mask);
}
endmacro

macro DECLARE_FLOAT32x4_BINARY_FUNCTION_WITH_FLOAT32_PARAMETER(FUNCTION)
function Float32x4FUNCTION(x4, f) {
  x4 = ToFloat32x4(x4);
  CheckFloat32x4(x4);
  f = TO_NUMBER_INLINE(f);
  return %Float32x4FUNCTION(x4, f);
}
endmacro

macro DECLARE_INT32x4_BINARY_FUNCTION_WITH_INT32_PARAMETER(FUNCTION)
function Int32x4FUNCTION(x4, i) {
  x4 = ToInt32x4(x4);
  CheckInt32x4(x4);
  i = TO_INT32(i);
  return %Int32x4FUNCTION(x4, i);
}
endmacro

macro DECLARE_INT32x4_BINARY_FUNCTION_WITH_BOOLEAN_PARAMETER(FUNCTION)
function Int32x4FUNCTION(x4, b) {
  x4 = ToInt32x4(x4);
  CheckInt32x4(x4);
  b = ToBoolean(b);
  return %Int32x4FUNCTION(x4, b);
}
endmacro

SIMD128_UNARY_FUNCTIONS(DECLARE_SIMD_UNARY_FUNCTION)
SIMD128_BINARY_FUNCTIONS(DECLARE_SIMD_BINARY_FUNCTION)
SIMD128_BINARY_SHUFFLE_FUNCTIONS(DECLARE_SIMD_BINARY_SHUFFLE_FUNCTION)
FLOAT32x4_BINARY_FUNCTIONS_WITH_FLOAT32_PARAMETER(DECLARE_FLOAT32x4_BINARY_FUNCTION_WITH_FLOAT32_PARAMETER)
INT32x4_BINARY_FUNCTIONS_WITH_INT32_PARAMETER(DECLARE_INT32x4_BINARY_FUNCTION_WITH_INT32_PARAMETER)
INT32x4_BINARY_FUNCTIONS_WITH_BOOLEAN_PARAMETER(DECLARE_INT32x4_BINARY_FUNCTION_WITH_BOOLEAN_PARAMETER)

function Float32x4Splat(f) {
  f = TO_NUMBER_INLINE(f);
  return %CreateFloat32x4(f, f, f, f);
}

function Float32x4Zero() {
  return %CreateFloat32x4(0.0, 0.0, 0.0, 0.0);
}

function Float32x4And(a4, b4) {
  a4 = Float32x4BitsToInt32x4(a4);
  b4 = Float32x4BitsToInt32x4(b4);
  return Int32x4BitsToFloat32x4(Int32x4And(a4, b4));
}

function Float32x4Or(a4, b4) {
  a4 = Float32x4BitsToInt32x4(a4);
  b4 = Float32x4BitsToInt32x4(b4);
  return Int32x4BitsToFloat32x4(Int32x4Or(a4, b4));
}

function Float32x4XOr(a4, b4) {
  a4 = Float32x4BitsToInt32x4(a4);
  b4 = Float32x4BitsToInt32x4(b4);
  return Int32x4BitsToFloat32x4(Int32x4Xor(a4, b4));
}

function Float32x4Not(x4) {
  x4 = Float32x4BitsToInt32x4(x4);
  return Int32x4BitsToFloat32x4(Int32x4Not(x4));
}

function Float32x4Clamp(x4, lowerLimit, upperLimit) {
  x4 = ToFloat32x4(x4);
  CheckFloat32x4(x4);
  lowerLimit = ToFloat32x4(lowerLimit);
  CheckFloat32x4(lowerLimit);
  upperLimit = ToFloat32x4(upperLimit);
  CheckFloat32x4(upperLimit);
  return %Float32x4Clamp(x4, lowerLimit, upperLimit);
}

function Float32x4ShuffleMix(a4, b4, mask) {
  a4 = ToFloat32x4(a4);
  CheckFloat32x4(a4);
  b4 = ToFloat32x4(b4);
  CheckFloat32x4(b4);
  var value = TO_INT32(mask);
  if ((value < 0) || (value > 0xFF)) {
    throw MakeRangeError("invalid_simd_shuffleMix_mask");
  }
  return %Float32x4ShuffleMix(a4, b4, mask);
}

function Int32x4Zero() {
  return %CreateInt32x4(0, 0, 0, 0);
}

function Int32x4Bool(x, y, z, w) {
  x = x ? -1 : 0;
  y = y ? -1 : 0;
  z = z ? -1 : 0;
  w = w ? -1 : 0;
  return %CreateInt32x4(x, y, z, w);
}

function Int32x4Splat(s) {
  s = TO_INT32(s);
  return %CreateInt32x4(s, s, s, s);
}

function Int32x4Select(x4, trueValue, falseValue) {
  x4 = ToInt32x4(x4);
  CheckInt32x4(x4);
  trueValue = ToFloat32x4(trueValue);
  CheckFloat32x4(trueValue);
  falseValue = ToFloat32x4(falseValue);
  CheckFloat32x4(falseValue);
  return %Int32x4Select(x4, trueValue, falseValue);
}

function Int32x4ShiftLeft(t, s) {
  t = ToInt32x4(t);
  CheckInt32x4(t);
  s = TO_NUMBER_INLINE(s);
  var x = t.x << s;
  var y = t.y << s;
  var z = t.z << s;
  var w = t.w << s;
  return %CreateInt32x4(x, y, z, w);
}

function Int32x4ShiftRight(t, s) {
  t = ToInt32x4(t);
  CheckInt32x4(t);
  s = TO_NUMBER_INLINE(s);
  var x = t.x >>> s;
  var y = t.y >>> s;
  var z = t.z >>> s;
  var w = t.w >>> s;
  return %CreateInt32x4(x, y, z, w);
}

function Int32x4ShiftRightArithmetic(t, s) {
  t = ToInt32x4(t);
  CheckInt32x4(t);
  s = TO_NUMBER_INLINE(s);
  var x = t.x >> s;
  var y = t.y >> s;
  var z = t.z >> s;
  var w = t.w >> s;
  return %CreateInt32x4(x, y, z, w);
}

function SetUpSIMD() {
  %CheckIsBootstrapping();

  %OptimizeObjectForAddingMultipleProperties($SIMD, 258);
  %SetProperty($SIMD, "XXXX", 0x00, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXXY", 0x40, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXXZ", 0x80, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXXW", 0xC0, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXYX", 0x10, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXYY", 0x50, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXYZ", 0x90, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXYW", 0xD0, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXZX", 0x20, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXZY", 0x60, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXZZ", 0xA0, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXZW", 0xE0, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXWX", 0x30, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXWY", 0x70, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXWZ", 0xB0, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XXWW", 0xF0, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYXX", 0x04, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYXY", 0x44, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYXZ", 0x84, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYXW", 0xC4, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYYX", 0x14, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYYY", 0x54, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYYZ", 0x94, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYYW", 0xD4, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYZX", 0x24, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYZY", 0x64, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYZZ", 0xA4, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYZW", 0xE4, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYWX", 0x34, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYWY", 0x74, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYWZ", 0xB4, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XYWW", 0xF4, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZXX", 0x08, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZXY", 0x48, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZXZ", 0x88, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZXW", 0xC8, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZYX", 0x18, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZYY", 0x58, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZYZ", 0x98, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZYW", 0xD8, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZZX", 0x28, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZZY", 0x68, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZZZ", 0xA8, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZZW", 0xE8, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZWX", 0x38, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZWY", 0x78, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZWZ", 0xB8, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XZWW", 0xF8, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWXX", 0x0C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWXY", 0x4C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWXZ", 0x8C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWXW", 0xCC, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWYX", 0x1C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWYY", 0x5C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWYZ", 0x9C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWYW", 0xDC, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWZX", 0x2C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWZY", 0x6C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWZZ", 0xAC, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWZW", 0xEC, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWWX", 0x3C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWWY", 0x7C, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWWZ", 0xBC, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "XWWW", 0xFC, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXXX", 0x01, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXXY", 0x41, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXXZ", 0x81, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXXW", 0xC1, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXYX", 0x11, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXYY", 0x51, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXYZ", 0x91, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXYW", 0xD1, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXZX", 0x21, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXZY", 0x61, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXZZ", 0xA1, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXZW", 0xE1, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXWX", 0x31, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXWY", 0x71, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXWZ", 0xB1, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YXWW", 0xF1, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYXX", 0x05, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYXY", 0x45, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYXZ", 0x85, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYXW", 0xC5, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYYX", 0x15, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYYY", 0x55, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYYZ", 0x95, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYYW", 0xD5, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYZX", 0x25, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYZY", 0x65, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYZZ", 0xA5, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYZW", 0xE5, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYWX", 0x35, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYWY", 0x75, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYWZ", 0xB5, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YYWW", 0xF5, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZXX", 0x09, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZXY", 0x49, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZXZ", 0x89, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZXW", 0xC9, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZYX", 0x19, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZYY", 0x59, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZYZ", 0x99, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZYW", 0xD9, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZZX", 0x29, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZZY", 0x69, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZZZ", 0xA9, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZZW", 0xE9, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZWX", 0x39, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZWY", 0x79, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZWZ", 0xB9, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YZWW", 0xF9, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWXX", 0x0D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWXY", 0x4D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWXZ", 0x8D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWXW", 0xCD, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWYX", 0x1D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWYY", 0x5D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWYZ", 0x9D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWYW", 0xDD, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWZX", 0x2D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWZY", 0x6D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWZZ", 0xAD, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWZW", 0xED, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWWX", 0x3D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWWY", 0x7D, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWWZ", 0xBD, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "YWWW", 0xFD, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXXX", 0x02, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXXY", 0x42, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXXZ", 0x82, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXXW", 0xC2, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXYX", 0x12, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXYY", 0x52, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXYZ", 0x92, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXYW", 0xD2, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXZX", 0x22, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXZY", 0x62, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXZZ", 0xA2, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXZW", 0xE2, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXWX", 0x32, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXWY", 0x72, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXWZ", 0xB2, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZXWW", 0xF2, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYXX", 0x06, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYXY", 0x46, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYXZ", 0x86, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYXW", 0xC6, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYYX", 0x16, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYYY", 0x56, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYYZ", 0x96, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYYW", 0xD6, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYZX", 0x26, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYZY", 0x66, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYZZ", 0xA6, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYZW", 0xE6, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYWX", 0x36, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYWY", 0x76, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYWZ", 0xB6, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZYWW", 0xF6, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZXX", 0x0A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZXY", 0x4A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZXZ", 0x8A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZXW", 0xCA, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZYX", 0x1A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZYY", 0x5A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZYZ", 0x9A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZYW", 0xDA, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZZX", 0x2A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZZY", 0x6A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZZZ", 0xAA, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZZW", 0xEA, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZWX", 0x3A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZWY", 0x7A, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZWZ", 0xBA, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZZWW", 0xFA, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWXX", 0x0E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWXY", 0x4E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWXZ", 0x8E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWXW", 0xCE, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWYX", 0x1E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWYY", 0x5E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWYZ", 0x9E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWYW", 0xDE, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWZX", 0x2E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWZY", 0x6E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWZZ", 0xAE, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWZW", 0xEE, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWWX", 0x3E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWWY", 0x7E, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWWZ", 0xBE, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "ZWWW", 0xFE, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXXX", 0x03, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXXY", 0x43, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXXZ", 0x83, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXXW", 0xC3, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXYX", 0x13, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXYY", 0x53, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXYZ", 0x93, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXYW", 0xD3, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXZX", 0x23, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXZY", 0x63, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXZZ", 0xA3, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXZW", 0xE3, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXWX", 0x33, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXWY", 0x73, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXWZ", 0xB3, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WXWW", 0xF3, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYXX", 0x07, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYXY", 0x47, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYXZ", 0x87, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYXW", 0xC7, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYYX", 0x17, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYYY", 0x57, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYYZ", 0x97, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYYW", 0xD7, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYZX", 0x27, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYZY", 0x67, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYZZ", 0xA7, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYZW", 0xE7, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYWX", 0x37, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYWY", 0x77, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYWZ", 0xB7, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WYWW", 0xF7, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZXX", 0x0B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZXY", 0x4B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZXZ", 0x8B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZXW", 0xCB, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZYX", 0x1B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZYY", 0x5B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZYZ", 0x9B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZYW", 0xDB, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZZX", 0x2B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZZY", 0x6B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZZZ", 0xAB, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZZW", 0xEB, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZWX", 0x3B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZWY", 0x7B, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZWZ", 0xBB, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WZWW", 0xFB, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWXX", 0x0F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWXY", 0x4F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWXZ", 0x8F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWXW", 0xCF, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWYX", 0x1F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWYY", 0x5F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWYZ", 0x9F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWYW", 0xDF, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWZX", 0x2F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWZY", 0x6F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWZZ", 0xAF, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWZW", 0xEF, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWWX", 0x3F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWWY", 0x7F, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWWZ", 0xBF, DONT_ENUM | DONT_DELETE | READ_ONLY);
  %SetProperty($SIMD, "WWWW", 0xFF, DONT_ENUM | DONT_DELETE | READ_ONLY);

  %ToFastProperties($SIMD);

  // Set up non-enumerable properties of the SIMD float32x4 object.
  InstallFunctions($SIMD.float32x4, DONT_ENUM, $Array(
    // Float32x4 operations
    "splat", Float32x4Splat,
    "zero", Float32x4Zero,
    // Unary
    "abs", Float32x4Abs,
    "bitsToInt32x4", Float32x4BitsToInt32x4,
    "neg", Float32x4Neg,
    "reciprocal", Float32x4Reciprocal,
    "reciprocalSqrt", Float32x4ReciprocalSqrt,
    "sqrt", Float32x4Sqrt,
    "toInt32x4", Float32x4ToInt32x4,
    // Binary
    "add", Float32x4Add,
    "div", Float32x4Div,
    "max", Float32x4Max,
    "min", Float32x4Min,
    "mul", Float32x4Mul,
    "sub", Float32x4Sub,
    "lessThan", Float32x4LessThan,
    "lessThanOrEqual", Float32x4LessThanOrEqual,
    "equal", Float32x4Equal,
    "notEqual", Float32x4NotEqual,
    "greaterThanOrEqual", Float32x4GreaterThanOrEqual,
    "greaterThan", Float32x4GreaterThan,
    "and", Float32x4And,
    "or", Float32x4Or,
    "xor", Float32x4XOr,
    "not", Float32x4Not,
    "scale", Float32x4Scale,
    "withX", Float32x4WithX,
    "withY", Float32x4WithY,
    "withZ", Float32x4WithZ,
    "withW", Float32x4WithW,
    "shuffle", Float32x4Shuffle,
    // Ternary
    "clamp", Float32x4Clamp,
    "shuffleMix", Float32x4ShuffleMix
  ));

  // Set up non-enumerable properties of the SIMD int32x4 object.
  InstallFunctions($SIMD.int32x4, DONT_ENUM, $Array(
    // Int32x4 operations
    "zero", Int32x4Zero,
    "splat", Int32x4Splat,
    "bool", Int32x4Bool,
    // Unary
    "bitsToFloat32x4", Int32x4BitsToFloat32x4,
    "neg", Int32x4Neg,
    "not", Int32x4Not,
    "toFloat32x4", Int32x4ToFloat32x4,
    // Binary
    "add", Int32x4Add,
    "and", Int32x4And,
    "mul", Int32x4Mul,
    "or", Int32x4Or,
    "sub", Int32x4Sub,
    "xor", Int32x4Xor,
    "shuffle", Int32x4Shuffle,
    "withX", Int32x4WithX,
    "withY", Int32x4WithY,
    "withZ", Int32x4WithZ,
    "withW", Int32x4WithW,
    "withFlagX", Int32x4WithFlagX,
    "withFlagY", Int32x4WithFlagY,
    "withFlagZ", Int32x4WithFlagZ,
    "withFlagW", Int32x4WithFlagW,
    "greaterThan", Int32x4GreaterThan,
    "equal", Int32x4Equal,
    "lessThan", Int32x4LessThan,
    "shiftLeft", Int32x4ShiftLeft,
    "shiftRight", Int32x4ShiftRight,
    "shiftRightArithmetic", Int32x4ShiftRightArithmetic,
    // Ternary
    "select", Int32x4Select
  ));

  %SetInlineBuiltinFlag(Float32x4And);
  %SetInlineBuiltinFlag(Float32x4Or);
  %SetInlineBuiltinFlag(Float32x4XOr);
  %SetInlineBuiltinFlag(Float32x4Not);
}

SetUpSIMD();

//------------------------------------------------------------------------------

macro FLOAT32x4OrINT32x4_TYPED_ARRAYS(FUNCTION)
// arrayIds below should be synchronized with Runtime_TypedArrayInitialize.
FUNCTION(10, Float32x4Array, 16)
FUNCTION(11, Int32x4Array, 16)
endmacro

macro TYPED_ARRAY_CONSTRUCTOR(ARRAY_ID, NAME, ELEMENT_SIZE)
  function NAMEConstructByArrayBuffer(obj, buffer, byteOffset, length) {
    if (!IS_UNDEFINED(byteOffset)) {
        byteOffset =
            ToPositiveInteger(byteOffset,  "invalid_typed_array_length");
    }
    if (!IS_UNDEFINED(length)) {
        length = ToPositiveInteger(length, "invalid_typed_array_length");
    }

    var bufferByteLength = %ArrayBufferGetByteLength(buffer);
    var offset;
    if (IS_UNDEFINED(byteOffset)) {
      offset = 0;
    } else {
      offset = byteOffset;

      if (offset % ELEMENT_SIZE !== 0) {
        throw MakeRangeError("invalid_typed_array_alignment",
            ["start offset", "NAME", ELEMENT_SIZE]);
      }
      if (offset > bufferByteLength) {
        throw MakeRangeError("invalid_typed_array_offset");
      }
    }

    var newByteLength;
    var newLength;
    if (IS_UNDEFINED(length)) {
      if (bufferByteLength % ELEMENT_SIZE !== 0) {
        throw MakeRangeError("invalid_typed_array_alignment",
          ["byte length", "NAME", ELEMENT_SIZE]);
      }
      newByteLength = bufferByteLength - offset;
      newLength = newByteLength / ELEMENT_SIZE;
    } else {
      var newLength = length;
      newByteLength = newLength * ELEMENT_SIZE;
    }
    if ((offset + newByteLength > bufferByteLength)
        || (newLength > %_MaxSmi())) {
      throw MakeRangeError("invalid_typed_array_length");
    }
    %_TypedArrayInitialize(obj, ARRAY_ID, buffer, offset, newByteLength);
  }

  function NAMEConstructByLength(obj, length) {
    var l = IS_UNDEFINED(length) ?
      0 : ToPositiveInteger(length, "invalid_typed_array_length");
    if (l > %_MaxSmi()) {
      throw MakeRangeError("invalid_typed_array_length");
    }
    var byteLength = l * ELEMENT_SIZE;
    if (byteLength > %_TypedArrayMaxSizeInHeap()) {
      var buffer = new $ArrayBuffer(byteLength);
      %_TypedArrayInitialize(obj, ARRAY_ID, buffer, 0, byteLength);
    } else {
      %_TypedArrayInitialize(obj, ARRAY_ID, null, 0, byteLength);
    }
  }

  function NAMEConstructByArrayLike(obj, arrayLike) {
    var length = arrayLike.length;
    var l = ToPositiveInteger(length, "invalid_typed_array_length");

    if (l > %_MaxSmi()) {
      throw MakeRangeError("invalid_typed_array_length");
    }
    if(!%TypedArrayInitializeFromArrayLike(obj, ARRAY_ID, arrayLike, l)) {
      for (var i = 0; i < l; i++) {
        // It is crucial that we let any execptions from arrayLike[i]
        // propagate outside the function.
        obj[i] = arrayLike[i];
      }
    }
  }

  function NAMEConstructor(arg1, arg2, arg3) {

    if (%_IsConstructCall()) {
      if (IS_ARRAYBUFFER(arg1)) {
        NAMEConstructByArrayBuffer(this, arg1, arg2, arg3);
      } else if (IS_NUMBER(arg1) || IS_STRING(arg1) ||
                 IS_BOOLEAN(arg1) || IS_UNDEFINED(arg1)) {
        NAMEConstructByLength(this, arg1);
      } else {
        NAMEConstructByArrayLike(this, arg1);
      }
    } else {
      throw MakeTypeError("constructor_not_function", ["NAME"])
    }
  }
endmacro

FLOAT32x4OrINT32x4_TYPED_ARRAYS(TYPED_ARRAY_CONSTRUCTOR)

macro DECLARE_TYPED_ARRAY_FUNCTION(NAME)
function NAMEArrayGet(i) {
  return this[i];
}

function NAMEArraySet(i, v) {
  v = ToNAME(v);
  CheckNAME(v);
  this[i] = v;
}

function SetUpNAMEArray() {
  // Keep synced with typedarray.js.
  SetupTypedArray(global.NAMEArray, NAMEArrayConstructor, 16);

  InstallFunctions(global.NAMEArray.prototype, DONT_ENUM, $Array(
    "getAt", NAMEArrayGet,
    "setAt", NAMEArraySet
  ));
}
endmacro

DECLARE_TYPED_ARRAY_FUNCTION(Float32x4)
DECLARE_TYPED_ARRAY_FUNCTION(Int32x4)

SetUpFloat32x4Array();
SetUpInt32x4Array();
