// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

(function(global, utils) {

"use strict";

%CheckIsBootstrapping();

// -------------------------------------------------------------------
// Imports

var GlobalSIMD = global.SIMD;

macro SIMD_FLOAT_TYPES(FUNCTION)
FUNCTION(Float32x4, float32x4, 4)
FUNCTION(Float64x2, float64x2, 2)
endmacro

macro SIMD_INT_TYPES(FUNCTION)
FUNCTION(Int32x4, int32x4, 4)
FUNCTION(Int16x8, int16x8, 8)
FUNCTION(Int8x16, int8x16, 16)
endmacro

macro SIMD_BOOL_TYPES(FUNCTION)
FUNCTION(Bool64x2, bool64x2, 2)
FUNCTION(Bool32x4, bool32x4, 4)
FUNCTION(Bool16x8, bool16x8, 8)
FUNCTION(Bool8x16, bool8x16, 16)
endmacro

macro SIMD_ALL_TYPES(FUNCTION)
SIMD_FLOAT_TYPES(FUNCTION)
SIMD_INT_TYPES(FUNCTION)
SIMD_BOOL_TYPES(FUNCTION)
endmacro

macro DECLARE_GLOBALS(NAME, TYPE, LANES)
var GlobalNAME = GlobalSIMD.NAME;
endmacro

SIMD_ALL_TYPES(DECLARE_GLOBALS)

macro DECLARE_COMMON_FUNCTIONS(NAME, TYPE, LANES)
function NAMECheckJS(a) {
  return %NAMECheck(a);
}

function NAMEToString() {
  if (typeof(this) !== 'TYPE' && %_ClassOf(this) !== 'NAME') {
    throw MakeTypeError(kIncompatibleMethodReceiver,
                        "NAME.prototype.toString", this);
  }
  var value = %_ValueOf(this);
  var str = "SIMD.NAME(";
  str += %NAMEExtractLane(value, 0);
  for (var i = 1; i < LANES; i++) {
    str += ", " + %NAMEExtractLane(value, i);
  }
  return str + ")";
}

function NAMEToLocaleString() {
  if (typeof(this) !== 'TYPE' && %_ClassOf(this) !== 'NAME') {
    throw MakeTypeError(kIncompatibleMethodReceiver,
                        "NAME.prototype.toLocaleString", this);
  }
  var value = %_ValueOf(this);
  var str = "SIMD.NAME(";
  str += %NAMEExtractLane(value, 0).toLocaleString();
  for (var i = 1; i < LANES; i++) {
    str += ", " + %NAMEExtractLane(value, i).toLocaleString();
  }
  return str + ")";
}

function NAMEValueOf() {
  if (typeof(this) !== 'TYPE' && %_ClassOf(this) !== 'NAME') {
    throw MakeTypeError(kIncompatibleMethodReceiver,
                        "NAME.prototype.valueOf", this);
  }
  return %_ValueOf(this);
}

function NAMEExtractLaneJS(instance, lane) {
  return %NAMEExtractLane(instance, lane);
}

function NAMEEqualJS(a, b) {
  return %NAMEEqual(a, b);
}

function NAMENotEqualJS(a, b) {
  return %NAMENotEqual(a, b);
}
endmacro

SIMD_ALL_TYPES(DECLARE_COMMON_FUNCTIONS)

macro DECLARE_INT_FUNCTIONS(NAME, TYPE, LANES)
function NAMEShiftLeftByScalarJS(instance, shift) {
  return %NAMEShiftLeftByScalar(instance, shift);
}

function NAMEShiftRightLogicalByScalarJS(instance, shift) {
  return %NAMEShiftRightLogicalByScalar(instance, shift);
}

function NAMEShiftRightArithmeticByScalarJS(instance, shift) {
  return %NAMEShiftRightArithmeticByScalar(instance, shift);
}
endmacro

SIMD_INT_TYPES(DECLARE_INT_FUNCTIONS)

macro DECLARE_BOOL_FUNCTIONS(NAME, TYPE, LANES)
function NAMEReplaceLaneJS(instance, lane, value) {
  return %NAMEReplaceLane(instance, lane, value);
}

function NAMEAnyTrueJS(s) {
  return %NAMEAnyTrue(s);
}

function NAMEAllTrueJS(s) {
  return %NAMEAllTrue(s);
}
endmacro

SIMD_BOOL_TYPES(DECLARE_BOOL_FUNCTIONS)

macro SIMD_UNSIGNED_INT_TYPES(FUNCTION)
FUNCTION(Int16x8)
FUNCTION(Int8x16)
endmacro

macro DECLARE_UNSIGNED_INT_FUNCTIONS(NAME)
function NAMEUnsignedExtractLaneJS(instance, lane) {
  return %NAMEUnsignedExtractLane(instance, lane);
}
endmacro

SIMD_UNSIGNED_INT_TYPES(DECLARE_UNSIGNED_INT_FUNCTIONS)

macro SIMD_NUMERIC_TYPES(FUNCTION)
SIMD_FLOAT_TYPES(FUNCTION)
SIMD_INT_TYPES(FUNCTION)
endmacro

macro DECLARE_NUMERIC_FUNCTIONS(NAME, TYPE, LANES)
function NAMEReplaceLaneJS(instance, lane, value) {
  return %NAMEReplaceLane(instance, lane, TO_NUMBER_INLINE(value));
}

function NAMESelectJS(selector, a, b) {
  return %NAMESelect(selector, a, b);
}

function NAMENegJS(a) {
  return %NAMENeg(a);
}

function NAMEAddJS(a, b) {
  return %NAMEAdd(a, b);
}

function NAMESubJS(a, b) {
  return %NAMESub(a, b);
}

function NAMEMulJS(a, b) {
  return %NAMEMul(a, b);
}

function NAMEMinJS(a, b) {
  return %NAMEMin(a, b);
}

function NAMEMaxJS(a, b) {
  return %NAMEMax(a, b);
}

function NAMELessThanJS(a, b) {
  return %NAMELessThan(a, b);
}

function NAMELessThanOrEqualJS(a, b) {
  return %NAMELessThanOrEqual(a, b);
}

function NAMEGreaterThanJS(a, b) {
  return %NAMEGreaterThan(a, b);
}

function NAMEGreaterThanOrEqualJS(a, b) {
  return %NAMEGreaterThanOrEqual(a, b);
}
endmacro

SIMD_NUMERIC_TYPES(DECLARE_NUMERIC_FUNCTIONS)

macro SIMD_LOGICAL_TYPES(FUNCTION)
SIMD_INT_TYPES(FUNCTION)
SIMD_BOOL_TYPES(FUNCTION)
endmacro

macro DECLARE_LOGICAL_FUNCTIONS(NAME, TYPE, LANES)
function NAMEAndJS(a, b) {
  return %NAMEAnd(a, b);
}

function NAMEOrJS(a, b) {
  return %NAMEOr(a, b);
}

function NAMEXorJS(a, b) {
  return %NAMEXor(a, b);
}

function NAMENotJS(a) {
  return %NAMENot(a);
}
endmacro

SIMD_LOGICAL_TYPES(DECLARE_LOGICAL_FUNCTIONS)

macro SIMD_FROM_TYPES(FUNCTION)
FUNCTION(Float32x4, Int32x4)
FUNCTION(Int32x4, Float32x4)
FUNCTION(Float64x2, Int32x4)
FUNCTION(Float64x2, Float32x4)
endmacro

macro DECLARE_FROM_FUNCTIONS(TO, FROM)
function TOFromFROMJS(a) {
  return %TOFromFROM(a);
}
endmacro

SIMD_FROM_TYPES(DECLARE_FROM_FUNCTIONS)

macro SIMD_FROM_BITS_TYPES(FUNCTION)
FUNCTION(Float32x4, Int32x4)
FUNCTION(Float32x4, Int16x8)
FUNCTION(Float32x4, Int8x16)
FUNCTION(Float64x2, Int32x4)
FUNCTION(Float64x2, Float32x4)
FUNCTION(Int32x4, Float32x4)
FUNCTION(Int32x4, Int16x8)
FUNCTION(Int32x4, Int8x16)
FUNCTION(Int16x8, Float32x4)
FUNCTION(Int16x8, Int32x4)
FUNCTION(Int16x8, Int8x16)
FUNCTION(Int8x16, Float32x4)
FUNCTION(Int8x16, Int32x4)
FUNCTION(Int8x16, Int16x8)
endmacro

macro DECLARE_FROM_BITS_FUNCTIONS(TO, FROM)
function TOFromFROMBitsJS(a) {
  return %TOFromFROMBits(a);
}
endmacro

SIMD_FROM_BITS_TYPES(DECLARE_FROM_BITS_FUNCTIONS)

//-------------------------------------------------------------------

function Float32x4Constructor(c0, c1, c2, c3) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Float32x4");
  return %CreateFloat32x4(TO_NUMBER_INLINE(c0), TO_NUMBER_INLINE(c1),
                          TO_NUMBER_INLINE(c2), TO_NUMBER_INLINE(c3));
}


function Float32x4Splat(s) {
  return %CreateFloat32x4(s, s, s, s);
}


function Float32x4AbsJS(a) {
  return %Float32x4Abs(a);
}


function Float32x4SqrtJS(a) {
  return %Float32x4Sqrt(a);
}


function Float32x4RecipApproxJS(a) {
  return %Float32x4RecipApprox(a);
}


function Float32x4RecipSqrtApproxJS(a) {
  return %Float32x4RecipSqrtApprox(a);
}


function Float32x4DivJS(a, b) {
  return %Float32x4Div(a, b);
}


function Float32x4MinNumJS(a, b) {
  return %Float32x4MinNum(a, b);
}


function Float32x4MaxNumJS(a, b) {
  return %Float32x4MaxNum(a, b);
}


function Float32x4SwizzleJS(a, c0, c1, c2, c3) {
  return %Float32x4Swizzle(a, c0, c1, c2, c3);
}


function Float32x4ShuffleJS(a, b, c0, c1, c2, c3) {
  return %Float32x4Shuffle(a, b, c0, c1, c2, c3);
}


function Float64x2Constructor(c0, c1) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Float64x2");
  return %CreateFloat64x2(TO_NUMBER_INLINE(c0), TO_NUMBER_INLINE(c1));
}


function Float64x2Splat(s) {
  return %CreateFloat64x2(s, s);
}


function Float64x2AbsJS(a) {
  return %Float64x2Abs(a);
}


function Float64x2SqrtJS(a) {
  return %Float64x2Sqrt(a);
}


function Float64x2RecipApproxJS(a) {
  return %Float64x2RecipApprox(a);
}


function Float64x2RecipSqrtApproxJS(a) {
  return %Float64x2RecipSqrtApprox(a);
}


function Float64x2DivJS(a, b) {
  return %Float64x2Div(a, b);
}


function Float64x2MinNumJS(a, b) {
  return %Float64x2MinNum(a, b);
}


function Float64x2MaxNumJS(a, b) {
  return %Float64x2MaxNum(a, b);
}


function Float64x2SwizzleJS(a, c0, c1) {
  return %Float64x2Swizzle(a, c0, c1);
}


function Float64x2ShuffleJS(a, b, c0, c1) {
  return %Float64x2Shuffle(a, b, c0, c1);
}

function Int32x4Constructor(c0, c1, c2, c3) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Int32x4");
  return %CreateInt32x4(TO_NUMBER_INLINE(c0), TO_NUMBER_INLINE(c1),
                        TO_NUMBER_INLINE(c2), TO_NUMBER_INLINE(c3));
}


function Int32x4Splat(s) {
  return %CreateInt32x4(s, s, s, s);
}


function Int32x4SwizzleJS(a, c0, c1, c2, c3) {
  return %Int32x4Swizzle(a, c0, c1, c2, c3);
}


function Int32x4ShuffleJS(a, b, c0, c1, c2, c3) {
  return %Int32x4Shuffle(a, b, c0, c1, c2, c3);
}


function Bool64x2Constructor(c0, c1) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Bool64x2");
  return %CreateBool64x2(c0, c1);
}


function Bool64x2Splat(s) {
  return %CreateBool64x2(s, s);
}

function Bool64x2SwizzleJS(a, c0, c1) {
  return %Bool64x2Swizzle(a, c0, c1);
}


function Bool64x2ShuffleJS(a, b, c0, c1) {
  return %Bool64x2Shuffle(a, b, c0, c1);
}

function Bool32x4Constructor(c0, c1, c2, c3) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Bool32x4");
  return %CreateBool32x4(c0, c1, c2, c3);
}


function Bool32x4Splat(s) {
  return %CreateBool32x4(s, s, s, s);
}

function Bool32x4SwizzleJS(a, c0, c1, c2, c3) {
  return %Bool32x4Swizzle(a, c0, c1, c2, c3);
}


function Bool32x4ShuffleJS(a, b, c0, c1, c2, c3) {
  return %Bool32x4Shuffle(a, b, c0, c1, c2, c3);
}


function Int16x8Constructor(c0, c1, c2, c3, c4, c5, c6, c7) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Int16x8");
  return %CreateInt16x8(TO_NUMBER_INLINE(c0), TO_NUMBER_INLINE(c1),
                        TO_NUMBER_INLINE(c2), TO_NUMBER_INLINE(c3),
                        TO_NUMBER_INLINE(c4), TO_NUMBER_INLINE(c5),
                        TO_NUMBER_INLINE(c6), TO_NUMBER_INLINE(c7));
}


function Int16x8Splat(s) {
  return %CreateInt16x8(s, s, s, s, s, s, s, s);
}


function Int16x8SwizzleJS(a, c0, c1, c2, c3, c4, c5, c6, c7) {
  return %Int16x8Swizzle(a, c0, c1, c2, c3, c4, c5, c6, c7);
}


function Int16x8ShuffleJS(a, b, c0, c1, c2, c3, c4, c5, c6, c7) {
  return %Int16x8Shuffle(a, b, c0, c1, c2, c3, c4, c5, c6, c7);
}


function Bool16x8Constructor(c0, c1, c2, c3, c4, c5, c6, c7) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Bool16x8");
  return %CreateBool16x8(c0, c1, c2, c3, c4, c5, c6, c7);
}


function Bool16x8Splat(s) {
  return %CreateBool16x8(s, s, s, s, s, s, s, s);
}


function Bool16x8SwizzleJS(a, c0, c1, c2, c3, c4, c5, c6, c7) {
  return %Bool16x8Swizzle(a, c0, c1, c2, c3, c4, c5, c6, c7);
}


function Bool16x8ShuffleJS(a, b, c0, c1, c2, c3, c4, c5, c6, c7) {
  return %Bool16x8Shuffle(a, b, c0, c1, c2, c3, c4, c5, c6, c7);
}


function Int8x16Constructor(c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11,
                            c12, c13, c14, c15) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Int8x16");
  return %CreateInt8x16(TO_NUMBER_INLINE(c0), TO_NUMBER_INLINE(c1),
                        TO_NUMBER_INLINE(c2), TO_NUMBER_INLINE(c3),
                        TO_NUMBER_INLINE(c4), TO_NUMBER_INLINE(c5),
                        TO_NUMBER_INLINE(c6), TO_NUMBER_INLINE(c7),
                        TO_NUMBER_INLINE(c8), TO_NUMBER_INLINE(c9),
                        TO_NUMBER_INLINE(c10), TO_NUMBER_INLINE(c11),
                        TO_NUMBER_INLINE(c12), TO_NUMBER_INLINE(c13),
                        TO_NUMBER_INLINE(c14), TO_NUMBER_INLINE(c15));
}


function Int8x16Splat(s) {
  return %CreateInt8x16(s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s);
}


function Int8x16SwizzleJS(a, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11,
                          c12, c13, c14, c15) {
  return %Int8x16Swizzle(a, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11,
                         c12, c13, c14, c15);
}


function Int8x16ShuffleJS(a, b, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10,
                          c11, c12, c13, c14, c15) {
  return %Int8x16Shuffle(a, b, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10,
                         c11, c12, c13, c14, c15);
}


function Bool8x16Constructor(c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11,
                             c12, c13, c14, c15) {
  if (%_IsConstructCall()) throw MakeTypeError(kNotConstructor, "Bool8x16");
  return %CreateBool8x16(c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12,
                         c13, c14, c15);
}


function Bool8x16Splat(s) {
  return %CreateBool8x16(s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s);
}


function Bool8x16SwizzleJS(a, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11,
                           c12, c13, c14, c15) {
  return %Bool8x16Swizzle(a, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11,
                          c12, c13, c14, c15);
}


function Bool8x16ShuffleJS(a, b, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10,
                           c11, c12, c13, c14, c15) {
  return %Bool8x16Shuffle(a, b, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10,
                          c11, c12, c13, c14, c15);
}


%AddNamedProperty(GlobalSIMD, symbolToStringTag, 'SIMD', READ_ONLY | DONT_ENUM);

macro SETUP_SIMD_TYPE(NAME, TYPE, LANES)
%SetCode(GlobalNAME, NAMEConstructor);
%FunctionSetPrototype(GlobalNAME, {});
%AddNamedProperty(GlobalNAME.prototype, 'constructor', GlobalNAME,
    DONT_ENUM);
%AddNamedProperty(GlobalNAME.prototype, symbolToStringTag, 'NAME',
    DONT_ENUM | READ_ONLY);
utils.InstallFunctions(GlobalNAME.prototype, DONT_ENUM, [
  'toLocaleString', NAMEToLocaleString,
  'toString', NAMEToString,
  'valueOf', NAMEValueOf,
]);
endmacro

SIMD_ALL_TYPES(SETUP_SIMD_TYPE)

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

//-------------------------------------------------------------------

utils.InstallFunctions(GlobalFloat32x4, DONT_ENUM, [
  'splat', Float32x4Splat,
  'check', Float32x4CheckJS,
  'load', Float32x4LoadXYZWJS,
  'loadX', Float32x4LoadXJS,
  'loadXY', Float32x4LoadXYJS,
  'loadXYZ', Float32x4LoadXYZJS,
  'store', Float32x4StoreXYZWJS,
  'storeX', Float32x4StoreXJS,
  'storeXY', Float32x4StoreXYJS,
  'storeXYZ', Float32x4StoreXYZJS,
  'extractLane', Float32x4ExtractLaneJS,
  'replaceLane', Float32x4ReplaceLaneJS,
  'neg', Float32x4NegJS,
  'abs', Float32x4AbsJS,
  'sqrt', Float32x4SqrtJS,
  'reciprocalApproximation', Float32x4RecipApproxJS,
  'reciprocalSqrtApproximation', Float32x4RecipSqrtApproxJS,
  'add', Float32x4AddJS,
  'sub', Float32x4SubJS,
  'mul', Float32x4MulJS,
  'div', Float32x4DivJS,
  'min', Float32x4MinJS,
  'max', Float32x4MaxJS,
  'minNum', Float32x4MinNumJS,
  'maxNum', Float32x4MaxNumJS,
  'lessThan', Float32x4LessThanJS,
  'lessThanOrEqual', Float32x4LessThanOrEqualJS,
  'greaterThan', Float32x4GreaterThanJS,
  'greaterThanOrEqual', Float32x4GreaterThanOrEqualJS,
  'equal', Float32x4EqualJS,
  'notEqual', Float32x4NotEqualJS,
  'select', Float32x4SelectJS,
  'swizzle', Float32x4SwizzleJS,
  'shuffle', Float32x4ShuffleJS,
  'fromInt32x4', Float32x4FromInt32x4JS,
  'fromInt32x4Bits', Float32x4FromInt32x4BitsJS,
  'fromInt16x8Bits', Float32x4FromInt16x8BitsJS,
  'fromInt8x16Bits', Float32x4FromInt8x16BitsJS,
]);

utils.InstallFunctions(GlobalFloat64x2, DONT_ENUM, [
  'splat', Float64x2Splat,
  'check', Float64x2CheckJS,
  'load', Float64x2LoadXYJS,
  'loadX', Float64x2LoadXJS,
  'store', Float64x2StoreXYJS,
  'storeX', Float64x2StoreXJS,
  'extractLane', Float64x2ExtractLaneJS,
  'replaceLane', Float64x2ReplaceLaneJS,
  'neg', Float64x2NegJS,
  'abs', Float64x2AbsJS,
  'sqrt', Float64x2SqrtJS,
  'reciprocalApproximation', Float64x2RecipApproxJS,
  'reciprocalSqrtApproximation', Float64x2RecipSqrtApproxJS,
  'add', Float64x2AddJS,
  'sub', Float64x2SubJS,
  'mul', Float64x2MulJS,
  'div', Float64x2DivJS,
  'min', Float64x2MinJS,
  'max', Float64x2MaxJS,
  'minNum', Float64x2MinNumJS,
  'maxNum', Float64x2MaxNumJS,
  'lessThan', Float64x2LessThanJS,
  'lessThanOrEqual', Float64x2LessThanOrEqualJS,
  'greaterThan', Float64x2GreaterThanJS,
  'greaterThanOrEqual', Float64x2GreaterThanOrEqualJS,
  'equal', Float64x2EqualJS,
  'notEqual', Float64x2NotEqualJS,
  'select', Float64x2SelectJS,
  'swizzle', Float64x2SwizzleJS,
  'shuffle', Float64x2ShuffleJS,
  'fromInt32x4', Float64x2FromInt32x4JS,
  'fromInt32x4Bits', Float64x2FromInt32x4BitsJS,
  'fromFloat32x4', Float64x2FromFloat32x4JS,
  'fromFloat32x4Bits', Float64x2FromFloat32x4BitsJS,
]);

utils.InstallFunctions(GlobalInt32x4, DONT_ENUM, [
  'splat', Int32x4Splat,
  'check', Int32x4CheckJS,
  'load', Int32x4LoadXYZWJS,
  'loadX', Int32x4LoadXJS,
  'loadXY', Int32x4LoadXYJS,
  'loadXYZ', Int32x4LoadXYZJS,
  'store', Int32x4StoreXYZWJS,
  'storeX', Int32x4StoreXJS,
  'storeXY', Int32x4StoreXYJS,
  'storeXYZ', Int32x4StoreXYZJS,
  'extractLane', Int32x4ExtractLaneJS,
  'replaceLane', Int32x4ReplaceLaneJS,
  'neg', Int32x4NegJS,
  'add', Int32x4AddJS,
  'sub', Int32x4SubJS,
  'mul', Int32x4MulJS,
  'min', Int32x4MinJS,
  'max', Int32x4MaxJS,
  'and', Int32x4AndJS,
  'or', Int32x4OrJS,
  'xor', Int32x4XorJS,
  'not', Int32x4NotJS,
  'shiftLeftByScalar', Int32x4ShiftLeftByScalarJS,
  'shiftRightLogicalByScalar', Int32x4ShiftRightLogicalByScalarJS,
  'shiftRightArithmeticByScalar', Int32x4ShiftRightArithmeticByScalarJS,
  'lessThan', Int32x4LessThanJS,
  'lessThanOrEqual', Int32x4LessThanOrEqualJS,
  'greaterThan', Int32x4GreaterThanJS,
  'greaterThanOrEqual', Int32x4GreaterThanOrEqualJS,
  'equal', Int32x4EqualJS,
  'notEqual', Int32x4NotEqualJS,
  'select', Int32x4SelectJS,
  'swizzle', Int32x4SwizzleJS,
  'shuffle', Int32x4ShuffleJS,
  'fromFloat32x4', Int32x4FromFloat32x4JS,
  'fromFloat32x4Bits', Int32x4FromFloat32x4BitsJS,
  'fromInt16x8Bits', Int32x4FromInt16x8BitsJS,
  'fromInt8x16Bits', Int32x4FromInt8x16BitsJS,
]);

utils.InstallFunctions(GlobalBool64x2, DONT_ENUM, [
  'splat', Bool64x2Splat,
  'check', Bool64x2CheckJS,
  'extractLane', Bool64x2ExtractLaneJS,
  'replaceLane', Bool64x2ReplaceLaneJS,
  'and', Bool64x2AndJS,
  'or', Bool64x2OrJS,
  'xor', Bool64x2XorJS,
  'not', Bool64x2NotJS,
  'anyTrue', Bool64x2AnyTrueJS,
  'allTrue', Bool64x2AllTrueJS,
  'equal', Bool64x2EqualJS,
  'notEqual', Bool64x2NotEqualJS,
  'swizzle', Bool64x2SwizzleJS,
  'shuffle', Bool64x2ShuffleJS,
]);

utils.InstallFunctions(GlobalBool32x4, DONT_ENUM, [
  'splat', Bool32x4Splat,
  'check', Bool32x4CheckJS,
  'extractLane', Bool32x4ExtractLaneJS,
  'replaceLane', Bool32x4ReplaceLaneJS,
  'and', Bool32x4AndJS,
  'or', Bool32x4OrJS,
  'xor', Bool32x4XorJS,
  'not', Bool32x4NotJS,
  'anyTrue', Bool32x4AnyTrueJS,
  'allTrue', Bool32x4AllTrueJS,
  'equal', Bool32x4EqualJS,
  'notEqual', Bool32x4NotEqualJS,
  'swizzle', Bool32x4SwizzleJS,
  'shuffle', Bool32x4ShuffleJS,
]);

utils.InstallFunctions(GlobalInt16x8, DONT_ENUM, [
  'splat', Int16x8Splat,
  'check', Int16x8CheckJS,
  'extractLane', Int16x8ExtractLaneJS,
  'unsignedExtractLane', Int16x8UnsignedExtractLaneJS,
  'replaceLane', Int16x8ReplaceLaneJS,
  'neg', Int16x8NegJS,
  'add', Int16x8AddJS,
  'sub', Int16x8SubJS,
  'mul', Int16x8MulJS,
  'min', Int16x8MinJS,
  'max', Int16x8MaxJS,
  'and', Int16x8AndJS,
  'or', Int16x8OrJS,
  'xor', Int16x8XorJS,
  'not', Int16x8NotJS,
  'shiftLeftByScalar', Int16x8ShiftLeftByScalarJS,
  'shiftRightLogicalByScalar', Int16x8ShiftRightLogicalByScalarJS,
  'shiftRightArithmeticByScalar', Int16x8ShiftRightArithmeticByScalarJS,
  'lessThan', Int16x8LessThanJS,
  'lessThanOrEqual', Int16x8LessThanOrEqualJS,
  'greaterThan', Int16x8GreaterThanJS,
  'greaterThanOrEqual', Int16x8GreaterThanOrEqualJS,
  'equal', Int16x8EqualJS,
  'notEqual', Int16x8NotEqualJS,
  'select', Int16x8SelectJS,
  'swizzle', Int16x8SwizzleJS,
  'shuffle', Int16x8ShuffleJS,
  'fromFloat32x4Bits', Int16x8FromFloat32x4BitsJS,
  'fromInt32x4Bits', Int16x8FromInt32x4BitsJS,
  'fromInt8x16Bits', Int16x8FromInt8x16BitsJS,
]);

utils.InstallFunctions(GlobalBool16x8, DONT_ENUM, [
  'splat', Bool16x8Splat,
  'check', Bool16x8CheckJS,
  'extractLane', Bool16x8ExtractLaneJS,
  'replaceLane', Bool16x8ReplaceLaneJS,
  'and', Bool16x8AndJS,
  'or', Bool16x8OrJS,
  'xor', Bool16x8XorJS,
  'not', Bool16x8NotJS,
  'anyTrue', Bool16x8AnyTrueJS,
  'allTrue', Bool16x8AllTrueJS,
  'equal', Bool16x8EqualJS,
  'notEqual', Bool16x8NotEqualJS,
  'swizzle', Bool16x8SwizzleJS,
  'shuffle', Bool16x8ShuffleJS,
]);

utils.InstallFunctions(GlobalInt8x16, DONT_ENUM, [
  'splat', Int8x16Splat,
  'check', Int8x16CheckJS,
  'extractLane', Int8x16ExtractLaneJS,
  'unsignedExtractLane', Int8x16UnsignedExtractLaneJS,
  'replaceLane', Int8x16ReplaceLaneJS,
  'neg', Int8x16NegJS,
  'add', Int8x16AddJS,
  'sub', Int8x16SubJS,
  'mul', Int8x16MulJS,
  'min', Int8x16MinJS,
  'max', Int8x16MaxJS,
  'and', Int8x16AndJS,
  'or', Int8x16OrJS,
  'xor', Int8x16XorJS,
  'not', Int8x16NotJS,
  'shiftLeftByScalar', Int8x16ShiftLeftByScalarJS,
  'shiftRightLogicalByScalar', Int8x16ShiftRightLogicalByScalarJS,
  'shiftRightArithmeticByScalar', Int8x16ShiftRightArithmeticByScalarJS,
  'lessThan', Int8x16LessThanJS,
  'lessThanOrEqual', Int8x16LessThanOrEqualJS,
  'greaterThan', Int8x16GreaterThanJS,
  'greaterThanOrEqual', Int8x16GreaterThanOrEqualJS,
  'equal', Int8x16EqualJS,
  'notEqual', Int8x16NotEqualJS,
  'select', Int8x16SelectJS,
  'swizzle', Int8x16SwizzleJS,
  'shuffle', Int8x16ShuffleJS,
  'fromFloat32x4Bits', Int8x16FromFloat32x4BitsJS,
  'fromInt32x4Bits', Int8x16FromInt32x4BitsJS,
  'fromInt16x8Bits', Int8x16FromInt16x8BitsJS,
]);

utils.InstallFunctions(GlobalBool8x16, DONT_ENUM, [
  'splat', Bool8x16Splat,
  'check', Bool8x16CheckJS,
  'extractLane', Bool8x16ExtractLaneJS,
  'replaceLane', Bool8x16ReplaceLaneJS,
  'and', Bool8x16AndJS,
  'or', Bool8x16OrJS,
  'xor', Bool8x16XorJS,
  'not', Bool8x16NotJS,
  'anyTrue', Bool8x16AnyTrueJS,
  'allTrue', Bool8x16AllTrueJS,
  'equal', Bool8x16EqualJS,
  'notEqual', Bool8x16NotEqualJS,
  'swizzle', Bool8x16SwizzleJS,
  'shuffle', Bool8x16ShuffleJS,
]);

//------------------------------------------------------------------------------

function TypedArrayGetToStringTag() {
  if (!%_IsTypedArray(this)) return;
  var name = %_ClassOf(this);
  if (IS_UNDEFINED(name)) return;
  return name;
}


// --------------------SIMD128 Access in Typed Array -----------------
var Uint8Array = global.Uint8Array;
var Int8Array = global.Int8Array;
var Uint16Array = global.Uint16Array;
var Int16Array = global.Int16Array;
var Uint32Array = global.Uint32Array;
var Int32Array = global.Int32Array;
var Float32Array = global.Float32Array;
var Float64Array = global.Float64Array;

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

  var offset = TO_INTEGER(index) * tarray.BYTES_PER_ELEMENT + tarray.byteOffset;
  if (offset < tarray.byteOffset || (offset + NBYTES) > (tarray.byteLength + tarray.byteOffset))
    throw MakeRangeError('The value of index is invalid.');
  var arraybuffer = tarray.buffer;
  %TYPEStoreLANES(arraybuffer, offset, value);

}
endmacro

macro DECLARE_VIEW_SIMD_LOAD_AND_STORE_FUNCTION(VIEW)
DECLARE_TYPED_ARRAY_SIMD_LOAD_AND_STORE_FUNCTION(VIEW, Float32x4, XYZW, 16)
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
macro DECLARE_INSTALL_SIMD_LOAD_AND_STORE_FUNCTION(VIEW)
  utils.InstallFunctions(VIEW.prototype, DONT_ENUM, [
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
  ]);
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

utils.Export(function(to) {
  to.Float32x4ToString = Float32x4ToString;
  to.Int32x4ToString = Int32x4ToString;
  to.Bool32x4ToString = Bool32x4ToString;
  to.Int16x8ToString = Int16x8ToString;
  to.Bool16x8ToString = Bool16x8ToString;
  to.Int8x16ToString = Int8x16ToString;
  to.Bool8x16ToString = Bool8x16ToString;
});

})
