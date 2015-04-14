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
var $Float64x2 = $SIMD.float64x2;
var $Int32x4 = $SIMD.int32x4;

macro SIMD128_DATA_TYPES(FUNCTION)
FUNCTION(Float32x4, float32x4)
FUNCTION(Float64x2, float64x2)
FUNCTION(Int32x4, int32x4)
endmacro

macro DECLARE_DATA_TYPE_COMMON_FUNCTION(NAME, TYPE)
function ThrowNAMETypeError() {
  throw MakeTypeError("this is not a TYPE object.");
}

function CheckNAME(arg) {
  if (!(arg instanceof $NAME))
    ThrowNAMETypeError();
}
endmacro

SIMD128_DATA_TYPES(DECLARE_DATA_TYPE_COMMON_FUNCTION)

function StringfyFloat32x4JS() {
  CheckFloat32x4(this);
  return "float32x4(" + this.x + "," + this.y + "," + this.z + "," + this.w + ")";
}

function StringfyFloat64x2JS() {
  CheckFloat64x2(this);
  return "float64x2(" + this.x + "," + this.y + ")";
}

function StringfyInt32x4JS() {
  CheckInt32x4(this);
  return "int32x4(" + this.x + "," + this.y + "," + this.z + "," + this.w + ")";
}

macro SIMD128_DATA_TYPE_FUNCTIONS(FUNCTION)
FUNCTION(Float32x4, GetX)
FUNCTION(Float32x4, GetY)
FUNCTION(Float32x4, GetZ)
FUNCTION(Float32x4, GetW)
FUNCTION(Float32x4, GetSignMask)
FUNCTION(Float64x2, GetX)
FUNCTION(Float64x2, GetY)
FUNCTION(Float64x2, GetSignMask)
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
function TYPEFUNCTIONJS() {
  CheckTYPE(this);
  return %TYPEFUNCTION(this);
}
endmacro

SIMD128_DATA_TYPE_FUNCTIONS(DECLARE_DATA_TYPE_FUNCTION)

function Float32x4Constructor(x, y, z, w) {
  x = TO_NUMBER_INLINE(x);
  y = TO_NUMBER_INLINE(y);
  z = TO_NUMBER_INLINE(z);
  w = TO_NUMBER_INLINE(w);
  return %CreateFloat32x4(x, y, z, w);
}

function Float32x4CheckJS(v) {
  CheckFloat32x4(v);
  return %CreateFloat32x4(v.x, v.y, v.z, v.w);
}

function Float64x2Constructor(x, y) {
  x = TO_NUMBER_INLINE(x);
  y = TO_NUMBER_INLINE(y);
  return %CreateFloat64x2(x, y);
}

function Float64x2CheckJS(v) {
  CheckFloat64x2(v);
  return %CreateFloat64x2(v.x, v.y);
}

function Int32x4Constructor(x, y, z, w) {
  x = TO_INT32(x);
  y = TO_INT32(y);
  z = TO_INT32(z);
  w = TO_INT32(w);
  return %CreateInt32x4(x, y, z, w);
}

function Int32x4CheckJS(v) {
  CheckInt32x4(v);
  return %CreateInt32x4(v.x, v.y, v.z, v.w);
}

function SetUpFloat32x4() {
  %CheckIsBootstrapping();

  %SetCode($Float32x4, Float32x4Constructor);

  %FunctionSetPrototype($Float32x4, new $Object());
  %AddNamedProperty($Float32x4.prototype, "constructor", $Float32x4, DONT_ENUM);

  InstallGetter($Float32x4.prototype, "x", Float32x4GetXJS);
  InstallGetter($Float32x4.prototype, "y", Float32x4GetYJS);
  InstallGetter($Float32x4.prototype, "z", Float32x4GetZJS);
  InstallGetter($Float32x4.prototype, "w", Float32x4GetWJS);
  InstallGetter($Float32x4.prototype, "signMask", Float32x4GetSignMaskJS);
  InstallFunctions($Float32x4.prototype, DONT_ENUM, $Array(
    "toString", StringfyFloat32x4JS
  ));
}

function SetUpFloat64x2() {
  %CheckIsBootstrapping();

  %SetCode($Float64x2, Float64x2Constructor);

  %FunctionSetPrototype($Float64x2, new $Object());
  %AddNamedProperty($Float64x2.prototype, "constructor", $Float64x2, DONT_ENUM);

  InstallGetter($Float64x2.prototype, "x", Float64x2GetXJS);
  InstallGetter($Float64x2.prototype, "y", Float64x2GetYJS);
  InstallGetter($Float64x2.prototype, "signMask", Float64x2GetSignMaskJS);
  InstallFunctions($Float64x2.prototype, DONT_ENUM, $Array(
    "toString", StringfyFloat64x2JS
  ));
}

function SetUpInt32x4() {
  %CheckIsBootstrapping();

  %SetCode($Int32x4, Int32x4Constructor);

  %FunctionSetPrototype($Int32x4, new $Object());
  %AddNamedProperty($Int32x4.prototype, "constructor", $Int32x4, DONT_ENUM);

  InstallGetter($Int32x4.prototype, "x", Int32x4GetXJS);
  InstallGetter($Int32x4.prototype, "y", Int32x4GetYJS);
  InstallGetter($Int32x4.prototype, "z", Int32x4GetZJS);
  InstallGetter($Int32x4.prototype, "w", Int32x4GetWJS);
  InstallGetter($Int32x4.prototype, "flagX", Int32x4GetFlagXJS);
  InstallGetter($Int32x4.prototype, "flagY", Int32x4GetFlagYJS);
  InstallGetter($Int32x4.prototype, "flagZ", Int32x4GetFlagZJS);
  InstallGetter($Int32x4.prototype, "flagW", Int32x4GetFlagWJS);
  InstallGetter($Int32x4.prototype, "signMask", Int32x4GetSignMaskJS);
  InstallFunctions($Int32x4.prototype, DONT_ENUM, $Array(
    "toString", StringfyInt32x4JS
  ));
}

SetUpFloat32x4();
SetUpFloat64x2();
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
FUNCTION(Float64x2, Abs)
FUNCTION(Float64x2, Neg)
FUNCTION(Float64x2, Sqrt)
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
FUNCTION(Float64x2, Add)
FUNCTION(Float64x2, Div)
FUNCTION(Float64x2, Max)
FUNCTION(Float64x2, Min)
FUNCTION(Float64x2, Mul)
FUNCTION(Float64x2, Sub)
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

macro SIMD128_SHUFFLE_FUNCTIONS(FUNCTION)
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

macro FLOAT64x2_BINARY_FUNCTIONS_WITH_FLOAT64_PARAMETER(FUNCTION)
FUNCTION(Scale)
FUNCTION(WithX)
FUNCTION(WithY)
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
function TYPEFUNCTIONJS(x4) {
  CheckTYPE(x4);
  return %TYPEFUNCTION(x4);
}
endmacro

macro DECLARE_SIMD_BINARY_FUNCTION(TYPE, FUNCTION)
function TYPEFUNCTIONJS(a4, b4) {
  CheckTYPE(a4);
  CheckTYPE(b4);
  return %TYPEFUNCTION(a4, b4);
}
endmacro

function Float64x2SwizzleJS(x2, x, y) {
  CheckFloat64x2(x2);
  var x_ = TO_INT32(x);
  var y_ = TO_INT32(y);
  if ((x_ < 0) || (x_ > 1) ||
      (y_ < 0) || (y_ > 1)) {
    throw MakeRangeError("invalid_simd_shuffle_lane_index");
  }
  return %Float64x2Swizzle(x2, x_, y_);
}

function Float64x2ShuffleJS(x2, y2, x, y) {
  CheckFloat64x2(x2);
  CheckFloat64x2(y2);
  var x_ = TO_INT32(x);
  var y_ = TO_INT32(y);
  if ((x_ < 0) || (x_ > 3) ||
      (y_ < 0) || (y_ > 3)) {
    throw MakeRangeError("invalid_simd_shuffle_lane_index");
  }
  return %Float64x2Shuffle(x2, y2, x_, y_);
}

macro DECLARE_SIMD_SHUFFLE_FUNCTION(TYPE)
function TYPESwizzleJS(x4, x, y, z, w) {
  CheckTYPE(x4);
  var x_ = TO_INT32(x);
  var y_ = TO_INT32(y);
  var z_ = TO_INT32(z);
  var w_ = TO_INT32(w);
  if ((x_ < 0) || (x_ > 3) ||
      (y_ < 0) || (y_ > 3) ||
      (z_ < 0) || (z_ > 3) ||
      (w_ < 0) || (w_ > 3)) {
    throw MakeRangeError("invalid_simd_shuffle_lane_index");
  }
  return %TYPESwizzle(x4, x_, y_, z_, w_);
}

function TYPEShuffleJS(x4, y4, x, y, z, w) {
  CheckTYPE(x4);
  CheckTYPE(y4);
  var x_ = TO_INT32(x);
  var y_ = TO_INT32(y);
  var z_ = TO_INT32(z);
  var w_ = TO_INT32(w);
  if ((x_ < 0) || (x_ > 7) ||
      (y_ < 0) || (y_ > 7) ||
      (z_ < 0) || (z_ > 7) ||
      (w_ < 0) || (w_ > 7)) {
    throw MakeRangeError("invalid_simd_shuffle_lane_index");
  }
  return %TYPEShuffle(x4, y4, x_, y_, z_, w_);
}
endmacro

macro DECLARE_FLOAT32x4_BINARY_FUNCTION_WITH_FLOAT32_PARAMETER(FUNCTION)
function Float32x4FUNCTIONJS(x4, f) {
  CheckFloat32x4(x4);
  f = TO_NUMBER_INLINE(f);
  return %Float32x4FUNCTION(x4, f);
}
endmacro

macro DECLARE_FLOAT64x2_BINARY_FUNCTION_WITH_FLOAT64_PARAMETER(FUNCTION)
function Float64x2FUNCTIONJS(x2, f) {
  CheckFloat64x2(x2);
  f = TO_NUMBER_INLINE(f);
  return %Float64x2FUNCTION(x2, f);
}
endmacro

macro DECLARE_INT32x4_BINARY_FUNCTION_WITH_INT32_PARAMETER(FUNCTION)
function Int32x4FUNCTIONJS(x4, i) {
  CheckInt32x4(x4);
  i = TO_INT32(i);
  return %Int32x4FUNCTION(x4, i);
}
endmacro

macro DECLARE_INT32x4_BINARY_FUNCTION_WITH_BOOLEAN_PARAMETER(FUNCTION)
function Int32x4FUNCTIONJS(x4, b) {
  CheckInt32x4(x4);
  b = ToBoolean(b);
  return %Int32x4FUNCTION(x4, b);
}
endmacro

SIMD128_UNARY_FUNCTIONS(DECLARE_SIMD_UNARY_FUNCTION)
SIMD128_BINARY_FUNCTIONS(DECLARE_SIMD_BINARY_FUNCTION)
SIMD128_SHUFFLE_FUNCTIONS(DECLARE_SIMD_SHUFFLE_FUNCTION)
FLOAT32x4_BINARY_FUNCTIONS_WITH_FLOAT32_PARAMETER(DECLARE_FLOAT32x4_BINARY_FUNCTION_WITH_FLOAT32_PARAMETER)
FLOAT64x2_BINARY_FUNCTIONS_WITH_FLOAT64_PARAMETER(DECLARE_FLOAT64x2_BINARY_FUNCTION_WITH_FLOAT64_PARAMETER)
INT32x4_BINARY_FUNCTIONS_WITH_INT32_PARAMETER(DECLARE_INT32x4_BINARY_FUNCTION_WITH_INT32_PARAMETER)
INT32x4_BINARY_FUNCTIONS_WITH_BOOLEAN_PARAMETER(DECLARE_INT32x4_BINARY_FUNCTION_WITH_BOOLEAN_PARAMETER)

function NotImplementedJS() {
  throw MakeTypeError("Not implemented.");
}

function Float32x4SplatJS(f) {
  f = TO_NUMBER_INLINE(f);
  return %CreateFloat32x4(f, f, f, f);
}

function Float32x4ZeroJS() {
  return %CreateFloat32x4(0.0, 0.0, 0.0, 0.0);
}

function Float32x4AndJS(a4, b4) {
  a4 = Float32x4BitsToInt32x4JS(a4);
  b4 = Float32x4BitsToInt32x4JS(b4);
  return Int32x4BitsToFloat32x4JS(Int32x4AndJS(a4, b4));
}

function Float32x4OrJS(a4, b4) {
  a4 = Float32x4BitsToInt32x4JS(a4);
  b4 = Float32x4BitsToInt32x4JS(b4);
  return Int32x4BitsToFloat32x4JS(Int32x4OrJS(a4, b4));
}

function Float32x4XorJS(a4, b4) {
  a4 = Float32x4BitsToInt32x4JS(a4);
  b4 = Float32x4BitsToInt32x4JS(b4);
  return Int32x4BitsToFloat32x4JS(Int32x4XorJS(a4, b4));
}

function Float32x4NotJS(x4) {
  x4 = Float32x4BitsToInt32x4JS(x4);
  return Int32x4BitsToFloat32x4JS(Int32x4NotJS(x4));
}

function Float32x4ClampJS(x4, lowerLimit, upperLimit) {
  CheckFloat32x4(x4);
  CheckFloat32x4(lowerLimit);
  CheckFloat32x4(upperLimit);
  return %Float32x4Clamp(x4, lowerLimit, upperLimit);
}

function Float32x4ShuffleMixJS(a4, b4, mask) {
  CheckFloat32x4(a4);
  CheckFloat32x4(b4);
  var value = TO_INT32(mask);
  if ((value < 0) || (value > 0xFF)) {
    throw MakeRangeError("invalid_simd_shuffleMix_mask");
  }
  return %Float32x4ShuffleMix(a4, b4, mask);
}

function Float32x4SelectJS(x4, trueValue, falseValue) {
  CheckInt32x4(x4);
  CheckFloat32x4(trueValue);
  CheckFloat32x4(falseValue);
  return %Float32x4Select(x4, trueValue, falseValue);
}

function Float64x2SplatJS(f) {
  f = TO_NUMBER_INLINE(f);
  return %CreateFloat64x2(f, f);
}

function Float64x2ZeroJS() {
  return %CreateFloat64x2(0.0, 0.0);
}

function Float64x2ClampJS(x2, lowerLimit, upperLimit) {
  CheckFloat64x2(x2);
  CheckFloat64x2(lowerLimit);
  CheckFloat64x2(upperLimit);
  return %Float64x2Clamp(x2, lowerLimit, upperLimit);
}

function Int32x4ZeroJS() {
  return %CreateInt32x4(0, 0, 0, 0);
}

function Int32x4BoolJS(x, y, z, w) {
  x = x ? -1 : 0;
  y = y ? -1 : 0;
  z = z ? -1 : 0;
  w = w ? -1 : 0;
  return %CreateInt32x4(x, y, z, w);
}

function Int32x4SplatJS(s) {
  s = TO_INT32(s);
  return %CreateInt32x4(s, s, s, s);
}

function Int32x4SelectJS(x4, trueValue, falseValue) {
  CheckInt32x4(x4);
  CheckInt32x4(trueValue);
  CheckInt32x4(falseValue);
  return %Int32x4Select(x4, trueValue, falseValue);
}

function Int32x4ShiftLeftByScalarJS(t, s) {
  CheckInt32x4(t);
  s = TO_NUMBER_INLINE(s);
  var x = t.x << s;
  var y = t.y << s;
  var z = t.z << s;
  var w = t.w << s;
  return %CreateInt32x4(x, y, z, w);
}

function Int32x4ShiftRightLogicalByScalarJS(t, s) {
  CheckInt32x4(t);
  s = TO_NUMBER_INLINE(s);
  var x = t.x >>> s;
  var y = t.y >>> s;
  var z = t.z >>> s;
  var w = t.w >>> s;
  return %CreateInt32x4(x, y, z, w);
}

function Int32x4ShiftRightArithmeticByScalarJS(t, s) {
  CheckInt32x4(t);
  s = TO_NUMBER_INLINE(s);
  var x = t.x >> s;
  var y = t.y >> s;
  var z = t.z >> s;
  var w = t.w >> s;
  return %CreateInt32x4(x, y, z, w);
}

macro DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(TYPE, LANES)
function TYPELoadLANESJS(tarray, index) {
  return tarray._getTYPELANES(index);
}

function TYPEStoreLANESJS(tarray, index, value) {
  tarray._setTYPELANES(index, value);
}
endmacro

DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Float32x4, XYZW)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Float32x4, XYZ)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Float32x4, XY)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Float32x4, X)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Float64x2, XY)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Float64x2, X)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Int32x4, XYZW)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Int32x4, XYZ)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Int32x4, XY)
DECLARE_SIMD_LOAD_AND_STORE_FUNCTION(Int32x4, X)

function SetUpSIMD() {
  %CheckIsBootstrapping();

  %OptimizeObjectForAddingMultipleProperties($SIMD, 258);

  %ToFastProperties($SIMD);

  // Set up non-enumerable properties of the SIMD float32x4 object.
  InstallFunctions($SIMD.float32x4, DONT_ENUM, $Array(
    // Float32x4 operations
    "check", Float32x4CheckJS,
    "load", Float32x4LoadXYZWJS,
    "loadX", Float32x4LoadXJS,
    "loadXY", Float32x4LoadXYJS,
    "loadXYZ", Float32x4LoadXYZJS,
    "store", Float32x4StoreXYZWJS,
    "storeX", Float32x4StoreXJS,
    "storeXY", Float32x4StoreXYJS,
    "storeXYZ", Float32x4StoreXYZJS,
    "splat", Float32x4SplatJS,
    "zero", Float32x4ZeroJS,
    // Unary
    "abs", Float32x4AbsJS,
    "fromInt32x4", Int32x4ToFloat32x4JS,
    "fromInt32x4Bits", Int32x4BitsToFloat32x4JS,
    "neg", Float32x4NegJS,
    "reciprocal", Float32x4ReciprocalJS,
    "reciprocalSqrt", Float32x4ReciprocalSqrtJS,
    "sqrt", Float32x4SqrtJS,
    // Binary
    "add", Float32x4AddJS,
    "div", Float32x4DivJS,
    "max", Float32x4MaxJS,
    "min", Float32x4MinJS,
    "mul", Float32x4MulJS,
    "sub", Float32x4SubJS,
    "lessThan", Float32x4LessThanJS,
    "lessThanOrEqual", Float32x4LessThanOrEqualJS,
    "equal", Float32x4EqualJS,
    "notEqual", Float32x4NotEqualJS,
    "greaterThanOrEqual", Float32x4GreaterThanOrEqualJS,
    "greaterThan", Float32x4GreaterThanJS,
    "and", Float32x4AndJS,
    "or", Float32x4OrJS,
    "xor", Float32x4XorJS,
    "not", Float32x4NotJS,
    "scale", Float32x4ScaleJS,
    "withX", Float32x4WithXJS,
    "withY", Float32x4WithYJS,
    "withZ", Float32x4WithZJS,
    "withW", Float32x4WithWJS,
    // Ternary
    "clamp", Float32x4ClampJS,
    "select", Float32x4SelectJS,
     // Quinary
    "swizzle", Float32x4SwizzleJS,
    // Senary
    "shuffle", Float32x4ShuffleJS
  ));

  // Set up non-enumerable properties of the SIMD float64x2 object.
  InstallFunctions($SIMD.float64x2, DONT_ENUM, $Array(
    // Float64x2 operations
    "check", Float64x2CheckJS,
    "load", Float64x2LoadXYJS,
    "loadX", Float64x2LoadXJS,
    "store", Float64x2StoreXYJS,
    "storeX", Float64x2StoreXJS,
    "splat", Float64x2SplatJS,
    "zero", Float64x2ZeroJS,
    // Unary
    "abs", Float64x2AbsJS,
    "neg", Float64x2NegJS,
    "sqrt", Float64x2SqrtJS,
    // Binary
    "add", Float64x2AddJS,
    "div", Float64x2DivJS,
    "max", Float64x2MaxJS,
    "min", Float64x2MinJS,
    "mul", Float64x2MulJS,
    "sub", Float64x2SubJS,
    "scale", Float64x2ScaleJS,
    "withX", Float64x2WithXJS,
    "withY", Float64x2WithYJS,
    // Ternary
    "clamp", Float64x2ClampJS,
    "swizzle", Float64x2SwizzleJS,
    //Quarternary
    "shuffle", Float64x2ShuffleJS
  ));

  // Set up non-enumerable properties of the SIMD int32x4 object.
  InstallFunctions($SIMD.int32x4, DONT_ENUM, $Array(
    // Int32x4 operations
    "check", Int32x4CheckJS,
    "load", Int32x4LoadXYZWJS,
    "loadX", Int32x4LoadXJS,
    "loadXY", Int32x4LoadXYJS,
    "loadXYZ", Int32x4LoadXYZJS,
    "store", Int32x4StoreXYZWJS,
    "storeX", Int32x4StoreXJS,
    "storeXY", Int32x4StoreXYJS,
    "storeXYZ", Int32x4StoreXYZJS,
    "zero", Int32x4ZeroJS,
    "splat", Int32x4SplatJS,
    "bool", Int32x4BoolJS,
    // Unary
    "fromFloat32x4", Float32x4ToInt32x4JS,
    "fromFloat32x4Bits", Float32x4BitsToInt32x4JS,
    "neg", Int32x4NegJS,
    "not", Int32x4NotJS,
    // Binary
    "add", Int32x4AddJS,
    "and", Int32x4AndJS,
    "mul", Int32x4MulJS,
    "or", Int32x4OrJS,
    "sub", Int32x4SubJS,
    "xor", Int32x4XorJS,
    "withX", Int32x4WithXJS,
    "withY", Int32x4WithYJS,
    "withZ", Int32x4WithZJS,
    "withW", Int32x4WithWJS,
    "withFlagX", Int32x4WithFlagXJS,
    "withFlagY", Int32x4WithFlagYJS,
    "withFlagZ", Int32x4WithFlagZJS,
    "withFlagW", Int32x4WithFlagWJS,
    "greaterThan", Int32x4GreaterThanJS,
    "equal", Int32x4EqualJS,
    "lessThan", Int32x4LessThanJS,
    "shiftLeftByScalar", Int32x4ShiftLeftByScalarJS,
    "shiftRightLogicalByScalar", Int32x4ShiftRightLogicalByScalarJS,
    "shiftRightArithmeticByScalar", Int32x4ShiftRightArithmeticByScalarJS,
    // Ternary
    "select", Int32x4SelectJS,
    // Quinary
    "swizzle", Int32x4SwizzleJS,
    // Senary
    "shuffle", Int32x4ShuffleJS
  ));
}

SetUpSIMD();

//------------------------------------------------------------------------------
macro SIMD128_TYPED_ARRAYS(FUNCTION)
// arrayIds below should be synchronized with Runtime_TypedArrayInitialize.
FUNCTION(10, Float32x4Array, 16)
FUNCTION(11, Float64x2Array, 16)
FUNCTION(12, Int32x4Array, 16)
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

    var bufferByteLength = %_ArrayBufferGetByteLength(buffer);
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

  function NAME_GetBuffer() {
    if (!(%_ClassOf(this) === 'NAME')) {
      throw MakeTypeError('incompatible_method_receiver',
                          ["NAME.buffer", this]);
    }
    return %TypedArrayGetBuffer(this);
  }

  function NAME_GetByteLength() {
    if (!(%_ClassOf(this) === 'NAME')) {
      throw MakeTypeError('incompatible_method_receiver',
                          ["NAME.byteLength", this]);
    }
    return %_ArrayBufferViewGetByteLength(this);
  }

  function NAME_GetByteOffset() {
    if (!(%_ClassOf(this) === 'NAME')) {
      throw MakeTypeError('incompatible_method_receiver',
                          ["NAME.byteOffset", this]);
    }
    return %_ArrayBufferViewGetByteOffset(this);
  }

  function NAME_GetLength() {
    if (!(%_ClassOf(this) === 'NAME')) {
      throw MakeTypeError('incompatible_method_receiver',
                          ["NAME.length", this]);
    }
    return %_TypedArrayGetLength(this);
  }

  var $NAME = global.NAME;

  function NAMESubArray(begin, end) {
    if (!(%_ClassOf(this) === 'NAME')) {
      throw MakeTypeError('incompatible_method_receiver',
                          ["NAME.subarray", this]);
    }
    var beginInt = TO_INTEGER(begin);
    if (!IS_UNDEFINED(end)) {
      end = TO_INTEGER(end);
    }

    var srcLength = %_TypedArrayGetLength(this);
    if (beginInt < 0) {
      beginInt = $MathMax(0, srcLength + beginInt);
    } else {
      beginInt = $MathMin(srcLength, beginInt);
    }

    var endInt = IS_UNDEFINED(end) ? srcLength : end;
    if (endInt < 0) {
      endInt = $MathMax(0, srcLength + endInt);
    } else {
      endInt = $MathMin(endInt, srcLength);
    }
    if (endInt < beginInt) {
      endInt = beginInt;
    }
    var newLength = endInt - beginInt;
    var beginByteOffset =
        %_ArrayBufferViewGetByteOffset(this) + beginInt * ELEMENT_SIZE;
    return new $NAME(%TypedArrayGetBuffer(this),
                     beginByteOffset, newLength);
  }
endmacro

SIMD128_TYPED_ARRAYS(TYPED_ARRAY_CONSTRUCTOR)

function SetupSIMD128TypedArrays() {
macro SETUP_TYPED_ARRAY(ARRAY_ID, NAME, ELEMENT_SIZE)
  %CheckIsBootstrapping();
  %SetCode(global.NAME, NAMEConstructor);
  %FunctionSetPrototype(global.NAME, new $Object());

  %AddNamedProperty(global.NAME, "BYTES_PER_ELEMENT", ELEMENT_SIZE,
               READ_ONLY | DONT_ENUM | DONT_DELETE);
  %AddNamedProperty(global.NAME.prototype,
               "constructor", global.NAME, DONT_ENUM);
  %AddNamedProperty(global.NAME.prototype,
               "BYTES_PER_ELEMENT", ELEMENT_SIZE,
               READ_ONLY | DONT_ENUM | DONT_DELETE);
  InstallGetter(global.NAME.prototype, "buffer", NAME_GetBuffer);
  InstallGetter(global.NAME.prototype, "byteOffset", NAME_GetByteOffset);
  InstallGetter(global.NAME.prototype, "byteLength", NAME_GetByteLength);
  InstallGetter(global.NAME.prototype, "length", NAME_GetLength);

  InstallFunctions(global.NAME.prototype, DONT_ENUM, $Array(
        "subarray", NAMESubArray,
        "set", TypedArraySet
  ));
endmacro

SIMD128_TYPED_ARRAYS(SETUP_TYPED_ARRAY)
}

SetupSIMD128TypedArrays();

macro DECLARE_TYPED_ARRAY_FUNCTION(NAME)
function NAMEArrayGet(i) {
  if((i < 0) || (i + 1 > this.length)) {
    throw MakeRangeError('the index of value:' + i + ' ' + 'is invalid');
  }
  return this[i];
}

function NAMEArraySet(i, v) {
  CheckNAME(v);
  this[i] = v;
}

function SetUpNAMEArray() {
  InstallFunctions(global.NAMEArray.prototype, DONT_ENUM, $Array(
    "getAt", NAMEArrayGet,
    "setAt", NAMEArraySet
  ));
}
endmacro

DECLARE_TYPED_ARRAY_FUNCTION(Float32x4)
DECLARE_TYPED_ARRAY_FUNCTION(Float64x2)
DECLARE_TYPED_ARRAY_FUNCTION(Int32x4)

SetUpFloat32x4Array();
SetUpFloat64x2Array();
SetUpInt32x4Array();

// --------------------SIMD128 Access in Typed Array -----------------
var $Uint8Array = global.Uint8Array;
var $Int8Array = global.Int8Array;
var $Uint16Array = global.Uint16Array;
var $Int16Array = global.Int16Array;
var $Uint32Array = global.Uint32Array;
var $Int32Array = global.Int32Array;
var $Float32Array = global.Float32Array;
var $Float64Array = global.Float64Array;

macro DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, TYPE, LANES, NBYTES)
function VIEWGetTYPELANESJS(index) {
  if (!(%_ClassOf(this) === 'VIEW')) {
    throw MakeTypeError('incompatible_method_receiver',
                        ["VIEW._getTYPELANES", this]);
  }
  var tarray = this;
  if (%_ArgumentsLength() < 1) {
    throw MakeTypeError('invalid_argument');
  }
  if (!IS_NUMBER(index)) {
    throw MakeTypeError('The 2nd argument must be a Number.');
  }
  var offset = TO_INTEGER(index) * tarray.BYTES_PER_ELEMENT + tarray.byteOffset;
  if (offset < tarray.byteOffset || (offset + NBYTES) > (tarray.byteLength + tarray.byteOffset))
    throw MakeRangeError('The value of index is invalid.');
  var arraybuffer = tarray.buffer;
  return %TYPELoadLANES(arraybuffer, offset);
}

function VIEWSetTYPELANESJS(index, value) {
  if (!(%_ClassOf(this) === 'VIEW')) {
    throw MakeTypeError('incompatible_method_receiver',
                        ["VIEW._setTYPELANES", this]);
  }
  var tarray = this;
  if (%_ArgumentsLength() < 2) {
    throw MakeTypeError('invalid_argument');
  }
  if (!IS_NUMBER(index)) {
    throw MakeTypeError('The 2nd argument must be a Number.');
  }
  CheckTYPE(value);
  var offset = TO_INTEGER(index) * tarray.BYTES_PER_ELEMENT + tarray.byteOffset;
  if (offset < tarray.byteOffset || (offset + NBYTES) > (tarray.byteLength + tarray.byteOffset))
    throw MakeRangeError('The value of index is invalid.');
  var arraybuffer = tarray.buffer;
  %TYPEStoreLANES(arraybuffer, offset, value);
}
endmacro

macro DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(VIEW)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Float32x4, XYZW, 12)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Float32x4, XYZ, 12)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Float32x4, XY, 8)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Float32x4, X, 4)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Float64x2, XY, 16)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Float64x2, X, 8)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Int32x4, XYZW, 16)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Int32x4, XYZ, 12)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Int32x4, XY, 8)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Int32x4, X, 4)
endmacro

DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Uint8Array)
DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Int8Array)
DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Uint16Array)
DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Int16Array)
DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Uint32Array)
DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Int32Array)
DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Float32Array)
DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(Float64Array)

function SetupTypedArraysSimdLoadStore() {
  %CheckIsBootstrapping();

macro DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(VIEW)
  InstallFunctions($VIEW.prototype, DONT_ENUM, $Array(
      "_getFloat32x4X", VIEWGetFloat32x4XJS,
      "_setFloat32x4X", VIEWSetFloat32x4XJS,
      "_getFloat32x4XY", VIEWGetFloat32x4XYJS,
      "_setFloat32x4XY", VIEWSetFloat32x4XYJS,
      "_getFloat32x4XYZ", VIEWGetFloat32x4XYZJS,
      "_setFloat32x4XYZ", VIEWSetFloat32x4XYZJS,
      "_getFloat32x4XYZW", VIEWGetFloat32x4XYZWJS,
      "_setFloat32x4XYZW", VIEWSetFloat32x4XYZWJS,
      "_getFloat64x2X", VIEWGetFloat64x2XJS,
      "_setFloat64x2X", VIEWSetFloat64x2XJS,
      "_getFloat64x2XY", VIEWGetFloat64x2XYJS,
      "_setFloat64x2XY", VIEWSetFloat64x2XYJS,
      "_getInt32x4X", VIEWGetInt32x4XJS,
      "_setInt32x4X", VIEWSetInt32x4XJS,
      "_getInt32x4XY", VIEWGetInt32x4XYJS,
      "_setInt32x4XY", VIEWSetInt32x4XYJS,
      "_getInt32x4XYZ", VIEWGetInt32x4XYZJS,
      "_setInt32x4XYZ", VIEWSetInt32x4XYZJS,
      "_getInt32x4XYZW", VIEWGetInt32x4XYZWJS,
      "_setInt32x4XYZW", VIEWSetInt32x4XYZWJS
  ));
endmacro

DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Uint8Array)
DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Int8Array)
DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Uint16Array)
DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Int16Array)
DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Uint32Array)
DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Int32Array)
DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Float32Array)
DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(Float64Array)
}

SetupTypedArraysSimdLoadStore();
