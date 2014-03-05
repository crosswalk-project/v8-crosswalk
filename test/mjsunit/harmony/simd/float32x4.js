// Copyright 2011 the V8 project authors. All rights reserved.
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

// Flags: --harmony-simd --harmony-tostring  --harmony-reflect
// Flags: --allow-natives-syntax --expose-natives-as natives --noalways-opt

function testConstructor() {
  var f4 = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  assertEquals(1.0, SIMD.Float32x4.extractLane(f4, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(f4, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(f4, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(f4, 3));

  f4 = SIMD.Float32x4(1.1, 2.2, 3.3, 4.4);
  assertEquals(1.100000023841858, SIMD.Float32x4.extractLane(f4, 0));
  assertEquals(2.200000047683716, SIMD.Float32x4.extractLane(f4, 1));
  assertEquals(3.299999952316284, SIMD.Float32x4.extractLane(f4, 2));
  assertEquals(4.400000095367432, SIMD.Float32x4.extractLane(f4, 3));
}

testConstructor();
testConstructor();
%OptimizeFunctionOnNextCall(testConstructor);
testConstructor();

function testCheck() {
  var f4 = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var f4_new = SIMD.Float32x4.check(f4);
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 0), SIMD.Float32x4.extractLane(f4, 0));
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 1), SIMD.Float32x4.extractLane(f4, 1));
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 2), SIMD.Float32x4.extractLane(f4, 2));
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 3), SIMD.Float32x4.extractLane(f4, 3));

  f4 = SIMD.Float32x4(1.1, 2.2, 3.3, 4.4);
  f4_new = SIMD.Float32x4.check(f4);
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 0), SIMD.Float32x4.extractLane(f4, 0));
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 1), SIMD.Float32x4.extractLane(f4, 1));
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 2), SIMD.Float32x4.extractLane(f4, 2));
  assertEquals(SIMD.Float32x4.extractLane(f4_new, 3), SIMD.Float32x4.extractLane(f4, 3));
}

testCheck();
testCheck();
%OptimizeFunctionOnNextCall(testCheck);
testCheck();

function testSplatConstructor() {
  var z4 = SIMD.Float32x4.splat(5.0);
  assertEquals(5.0, SIMD.Float32x4.extractLane(z4, 0));
  assertEquals(5.0, SIMD.Float32x4.extractLane(z4, 1));
  assertEquals(5.0, SIMD.Float32x4.extractLane(z4, 2));
  assertEquals(5.0, SIMD.Float32x4.extractLane(z4, 3));
}

testSplatConstructor();
testSplatConstructor();
%OptimizeFunctionOnNextCall(testSplatConstructor);
testSplatConstructor();

function testTypeof() {
  var z4 = SIMD.Float32x4.splat(0);
  assertEquals(typeof(z4), "float32x4");

  var new_z4 = SIMD.Float32x4(0, 0, 0, 0);
  assertEquals(typeof(new_z4), "float32x4");
  assertEquals(typeof(new_z4.valueOf()), "float32x4");
  assertEquals(Object.prototype.toString.call(new_z4), "[object Float32x4]");
}

testTypeof();


function testSIMDAbs() {
  var a4 = SIMD.Float32x4(1.0, -1.0, 1.0, -1.0);
  var b4 = SIMD.Float32x4.abs(a4);

  assertEquals(1.0, SIMD.Float32x4.extractLane(b4, 0));
  assertEquals(1.0, SIMD.Float32x4.extractLane(b4, 1));
  assertEquals(1.0, SIMD.Float32x4.extractLane(b4, 2));
  assertEquals(1.0, SIMD.Float32x4.extractLane(b4, 3));
}

testSIMDAbs();
testSIMDAbs();
%OptimizeFunctionOnNextCall(testSIMDAbs);
testSIMDAbs();

function testSIMDNeg() {
  var a4 = SIMD.Float32x4(1.0, -1.0, 1.0, -1.0);
  var b4 = SIMD.Float32x4.neg(a4);

  assertEquals(-1.0, SIMD.Float32x4.extractLane(b4, 0));
  assertEquals(1.0, SIMD.Float32x4.extractLane(b4, 1));
  assertEquals(-1.0, SIMD.Float32x4.extractLane(b4, 2));
  assertEquals(1.0, SIMD.Float32x4.extractLane(b4, 3));
}

testSIMDNeg();
testSIMDNeg();
%OptimizeFunctionOnNextCall(testSIMDNeg);
testSIMDNeg();

function testSIMDAdd() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.add(a4, b4);

  assertEquals(3.0, SIMD.Float32x4.extractLane(c4, 0));
  assertEquals(3.0, SIMD.Float32x4.extractLane(c4, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(c4, 2));
  assertEquals(3.0, SIMD.Float32x4.extractLane(c4, 3));
}

testSIMDAdd();
testSIMDAdd();
%OptimizeFunctionOnNextCall(testSIMDAdd);
testSIMDAdd();

function testSIMDSub() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.sub(a4, b4);

  assertEquals(-1.0, SIMD.Float32x4.extractLane(c4, 0));
  assertEquals(-1.0, SIMD.Float32x4.extractLane(c4, 1));
  assertEquals(-1.0, SIMD.Float32x4.extractLane(c4, 2));
  assertEquals(-1.0, SIMD.Float32x4.extractLane(c4, 3));
}

testSIMDSub();
testSIMDSub();
%OptimizeFunctionOnNextCall(testSIMDSub);
testSIMDSub();

function testSIMDMul() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.mul(a4, b4);

  assertEquals(2.0, SIMD.Float32x4.extractLane(c4, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(c4, 1));
  assertEquals(2.0, SIMD.Float32x4.extractLane(c4, 2));
  assertEquals(2.0, SIMD.Float32x4.extractLane(c4, 3));
}

testSIMDMul();
testSIMDMul();
%OptimizeFunctionOnNextCall(testSIMDMul);
testSIMDMul();

function testSIMDDiv() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.div(a4, b4);

  assertEquals(0.5, SIMD.Float32x4.extractLane(c4, 0));
  assertEquals(0.5, SIMD.Float32x4.extractLane(c4, 1));
  assertEquals(0.5, SIMD.Float32x4.extractLane(c4, 2));
  assertEquals(0.5, SIMD.Float32x4.extractLane(c4, 3));
}

testSIMDDiv();
testSIMDDiv();
%OptimizeFunctionOnNextCall(testSIMDDiv);
testSIMDDiv();

function testSIMDMin() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.Float32x4(1.0, 0.0, 2.5, 5.0);
  m = SIMD.Float32x4.min(m, n);
  assertEquals(1.0, SIMD.Float32x4.extractLane(m, 0));
  assertEquals(0.0, SIMD.Float32x4.extractLane(m, 1));
  assertEquals(2.5, SIMD.Float32x4.extractLane(m, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(m, 3));
}

testSIMDMin();
testSIMDMin();
%OptimizeFunctionOnNextCall(testSIMDMin);
testSIMDMin();

function testSIMDMax() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.Float32x4(1.0, 0.0, 2.5, 5.0);
  m = SIMD.Float32x4.max(m, n);
  assertEquals(1.0, SIMD.Float32x4.extractLane(m, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(m, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(m, 2));
  assertEquals(5.0, SIMD.Float32x4.extractLane(m, 3));
}

testSIMDMax();
testSIMDMax();
%OptimizeFunctionOnNextCall(testSIMDMax);
testSIMDMax();

function testSIMDReciprocal() {
  var m = SIMD.Float32x4(1.0, 4.0, 9.0, 16.0);
  m = SIMD.Float32x4.reciprocalApproximation(m);
  assertTrue(Math.abs(1.0 - SIMD.Float32x4.extractLane(m, 0)) <= 0.001);
  assertTrue(Math.abs(0.25 - SIMD.Float32x4.extractLane(m, 1)) <= 0.001);
  assertTrue(Math.abs(0.1111111 - SIMD.Float32x4.extractLane(m, 2)) <= 0.001);
  assertTrue(Math.abs(0.0625 - SIMD.Float32x4.extractLane(m, 3)) <= 0.001);
}

testSIMDReciprocal();
testSIMDReciprocal();
%OptimizeFunctionOnNextCall(testSIMDReciprocal);
testSIMDReciprocal();

function testSIMDReciprocalSqrt() {
  var m = SIMD.Float32x4(1.0, 0.25, 0.111111, 0.0625);
  m = SIMD.Float32x4.reciprocalSqrtApproximation(m);
  assertTrue(Math.abs(1.0 - SIMD.Float32x4.extractLane(m, 0)) <= 0.001);
  assertTrue(Math.abs(2.0 - SIMD.Float32x4.extractLane(m, 1)) <= 0.001);
  assertTrue(Math.abs(3.0 - SIMD.Float32x4.extractLane(m, 2)) <= 0.001);
  assertTrue(Math.abs(4.0 - SIMD.Float32x4.extractLane(m, 3)) <= 0.001);
}

testSIMDReciprocalSqrt();
testSIMDReciprocalSqrt();
%OptimizeFunctionOnNextCall(testSIMDReciprocalSqrt);
testSIMDReciprocalSqrt();

function testSIMDSqrt() {
  var m = SIMD.Float32x4(1.0, 4.0, 9.0, 16.0);
  m = SIMD.Float32x4.sqrt(m);
  assertEquals(1.0, SIMD.Float32x4.extractLane(m, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(m, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(m, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(m, 3));
}

testSIMDSqrt();
testSIMDSqrt();
%OptimizeFunctionOnNextCall(testSIMDSqrt);
testSIMDSqrt();

function testSIMDSwizzle() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var xxxx = SIMD.Float32x4.swizzle(m, 0, 0, 0, 0);
  print('------');
  print(SIMD.Float32x4.extractLane(xxxx, 0));
  print(SIMD.Float32x4.extractLane(xxxx, 1));
  print(SIMD.Float32x4.extractLane(xxxx, 2));
  print(SIMD.Float32x4.extractLane(xxxx, 3));
  print('------');
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxxx, 0));
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxxx, 1));
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxxx, 2));
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxxx, 3));
  var yyyy = SIMD.Float32x4.swizzle(m, 1, 1, 1, 1);
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyyy, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyyy, 1));
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyyy, 2));
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyyy, 3));
  var zzzz = SIMD.Float32x4.swizzle(m, 2, 2, 2, 2);
  assertEquals(3.0, SIMD.Float32x4.extractLane(zzzz, 0));
  assertEquals(3.0, SIMD.Float32x4.extractLane(zzzz, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(zzzz, 2));
  assertEquals(3.0, SIMD.Float32x4.extractLane(zzzz, 3));
  var wwww = SIMD.Float32x4.swizzle(m, 3, 3, 3, 3);
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwww, 0));
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwww, 1));
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwww, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwww, 3));
  var wzyx = SIMD.Float32x4.swizzle(m, 3, 2, 1, 0);
  assertEquals(4.0, SIMD.Float32x4.extractLane(wzyx, 0));
  assertEquals(3.0, SIMD.Float32x4.extractLane(wzyx, 1));
  assertEquals(2.0, SIMD.Float32x4.extractLane(wzyx, 2));
  assertEquals(1.0, SIMD.Float32x4.extractLane(wzyx, 3));
  var wwzz = SIMD.Float32x4.swizzle(m, 3, 3, 2, 2);
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwzz, 0));
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwzz, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(wwzz, 2));
  assertEquals(3.0, SIMD.Float32x4.extractLane(wwzz, 3));
  var xxyy = SIMD.Float32x4.swizzle(m, 0, 0, 1, 1);
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxyy, 0));
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxyy, 1));
  assertEquals(2.0, SIMD.Float32x4.extractLane(xxyy, 2));
  assertEquals(2.0, SIMD.Float32x4.extractLane(xxyy, 3));
  var yyww = SIMD.Float32x4.swizzle(m, 1, 1, 3, 3);
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyww, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyww, 1));
  assertEquals(4.0, SIMD.Float32x4.extractLane(yyww, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(yyww, 3));
}

testSIMDSwizzle();
testSIMDSwizzle();
%OptimizeFunctionOnNextCall(testSIMDSwizzle);
testSIMDSwizzle();

function testSIMDShuffle() {
  var a = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var b = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  var xxxx = SIMD.Float32x4.shuffle(a, b, 0, 0, 4, 4);
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxxx, 0));
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxxx, 1));
  assertEquals(5.0, SIMD.Float32x4.extractLane(xxxx, 2));
  assertEquals(5.0, SIMD.Float32x4.extractLane(xxxx, 3));
  var yyyy = SIMD.Float32x4.shuffle(a, b, 1, 1, 5, 5);
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyyy, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyyy, 1));
  assertEquals(6.0, SIMD.Float32x4.extractLane(yyyy, 2));
  assertEquals(6.0, SIMD.Float32x4.extractLane(yyyy, 3));
  var zzzz = SIMD.Float32x4.shuffle(a, b, 2, 2, 6, 6);
  assertEquals(3.0, SIMD.Float32x4.extractLane(zzzz, 0));
  assertEquals(3.0, SIMD.Float32x4.extractLane(zzzz, 1));
  assertEquals(7.0, SIMD.Float32x4.extractLane(zzzz, 2));
  assertEquals(7.0, SIMD.Float32x4.extractLane(zzzz, 3));
  var wwww = SIMD.Float32x4.shuffle(a, b, 3, 3, 7, 7);
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwww, 0));
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwww, 1));
  assertEquals(8.0, SIMD.Float32x4.extractLane(wwww, 2));
  assertEquals(8.0, SIMD.Float32x4.extractLane(wwww, 3));
  var wzyx = SIMD.Float32x4.shuffle(a, b, 3, 2, 5, 4);
  assertEquals(4.0, SIMD.Float32x4.extractLane(wzyx, 0));
  assertEquals(3.0, SIMD.Float32x4.extractLane(wzyx, 1));
  assertEquals(6.0, SIMD.Float32x4.extractLane(wzyx, 2));
  assertEquals(5.0, SIMD.Float32x4.extractLane(wzyx, 3));
  var wwzz = SIMD.Float32x4.shuffle(a, b, 3, 3, 6, 6);
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwzz, 0));
  assertEquals(4.0, SIMD.Float32x4.extractLane(wwzz, 1));
  assertEquals(7.0, SIMD.Float32x4.extractLane(wwzz, 2));
  assertEquals(7.0, SIMD.Float32x4.extractLane(wwzz, 3));
  var xxyy = SIMD.Float32x4.shuffle(a, b, 0, 0, 5, 5);
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxyy, 0));
  assertEquals(1.0, SIMD.Float32x4.extractLane(xxyy, 1));
  assertEquals(6.0, SIMD.Float32x4.extractLane(xxyy, 2));
  assertEquals(6.0, SIMD.Float32x4.extractLane(xxyy, 3));
  var yyww = SIMD.Float32x4.shuffle(a, b, 1, 1, 7, 7);
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyww, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(yyww, 1));
  assertEquals(8.0, SIMD.Float32x4.extractLane(yyww, 2));
  assertEquals(8.0, SIMD.Float32x4.extractLane(yyww, 3));
}

testSIMDShuffle();
testSIMDShuffle();
%OptimizeFunctionOnNextCall(testSIMDShuffle);
testSIMDShuffle();

function testSIMDConversion() {
  var m = SIMD.Int32x4(0x3F800000, 0x40000000, 0x40400000, 0x40800000);
  var n = SIMD.Float32x4.fromInt32x4Bits(m);
  assertEquals(1.0, SIMD.Float32x4.extractLane(n, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(n, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(n, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(n, 3));
  n = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  m = SIMD.Int32x4.fromFloat32x4Bits(n);
  assertEquals(0x40A00000, SIMD.Int32x4.extractLane(m, 0));
  assertEquals(0x40C00000, SIMD.Int32x4.extractLane(m, 1));
  assertEquals(0x40E00000, SIMD.Int32x4.extractLane(m, 2));
  assertEquals(0x41000000, SIMD.Int32x4.extractLane(m, 3));
  // Flip sign using bit-wise operators.
  n = SIMD.Float32x4(9.0, 10.0, 11.0, 12.0);
  m = SIMD.Int32x4(0x80000000, 0x80000000, 0x80000000, 0x80000000);
  var nMask = SIMD.Int32x4.fromFloat32x4Bits(n);
  nMask = SIMD.Int32x4.xor(nMask, m); // flip sign.
  n = SIMD.Float32x4.fromInt32x4Bits(nMask);
  assertEquals(-9.0, SIMD.Float32x4.extractLane(n, 0));
  assertEquals(-10.0, SIMD.Float32x4.extractLane(n, 1));
  assertEquals(-11.0, SIMD.Float32x4.extractLane(n, 2));
  assertEquals(-12.0, SIMD.Float32x4.extractLane(n, 3));
  nMask = SIMD.Int32x4.fromFloat32x4Bits(n);
  nMask = SIMD.Int32x4.xor(nMask, m); // flip sign.
  n = SIMD.Float32x4.fromInt32x4Bits(nMask);
  assertEquals(9.0, SIMD.Float32x4.extractLane(n, 0));
  assertEquals(10.0, SIMD.Float32x4.extractLane(n, 1));
  assertEquals(11.0, SIMD.Float32x4.extractLane(n, 2));
  assertEquals(12.0, SIMD.Float32x4.extractLane(n, 3));
}

testSIMDConversion();
testSIMDConversion();
%OptimizeFunctionOnNextCall(testSIMDConversion);
testSIMDConversion();

function testSIMDConversion2() {
  var m = SIMD.Int32x4(1, 2, 3, 4);
  var n = SIMD.Float32x4.fromInt32x4(m);
  assertEquals(1.0, SIMD.Float32x4.extractLane(n, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(n, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(n, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(n, 3));
  n = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  m = SIMD.Int32x4.fromFloat32x4(n);
  assertEquals(5, SIMD.Int32x4.extractLane(m, 0));
  assertEquals(6, SIMD.Int32x4.extractLane(m, 1));
  assertEquals(7, SIMD.Int32x4.extractLane(m, 2));
  assertEquals(8, SIMD.Int32x4.extractLane(m, 3));
}

testSIMDConversion2();
testSIMDConversion2();
%OptimizeFunctionOnNextCall(testSIMDConversion2);
testSIMDConversion2();

/*
function testSIMDComparisons() {
  var m = SIMD.Float32x4(1.0, 2.0, 0.1, 0.001);
  var n = SIMD.Float32x4(2.0, 2.0, 0.001, 0.1);
  var cmp;
  cmp = SIMD.Float32x4.lessThan(m, n);
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 3));

  cmp = SIMD.Float32x4.lessThanOrEqual(m, n);
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 3));

  cmp = SIMD.Float32x4.equal(m, n);
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 3));

  cmp = SIMD.Float32x4.notEqual(m, n);
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 3));

  cmp = SIMD.Float32x4.greaterThanOrEqual(m, n);
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 3));

  cmp = SIMD.Float32x4.greaterThan(m, n);
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 3));
}

testSIMDComparisons();
testSIMDComparisons();
%OptimizeFunctionOnNextCall(testSIMDComparisons);
testSIMDComparisons();
*/


function testSIMDSelect() {
  var m = SIMD.Bool32x4(true, true, false, false);
  var t = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var f = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  var s = SIMD.Float32x4.select(m, t, f);
  assertEquals(1.0, SIMD.Float32x4.extractLane(s, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(s, 1));
  assertEquals(7.0, SIMD.Float32x4.extractLane(s, 2));
  assertEquals(8.0, SIMD.Float32x4.extractLane(s, 3));
}

testSIMDSelect();
testSIMDSelect();
%OptimizeFunctionOnNextCall(testSIMDSelect);
testSIMDSelect();


function testFloat32ArrayByteOffset() {
  var b = new ArrayBuffer(40);
  var a = new Float32Array(b, 8);
  for (var i = 0; i < a.length; i++) {
    a[i] = i;
  }

  for (var i = 0; i < a.length - 3; i++) {
    var v = SIMD.Float32x4.load(a, i);
    assertEquals(i, SIMD.Float32x4.extractLane(v, 0));
    assertEquals(i+1, SIMD.Float32x4.extractLane(v, 1));
    assertEquals(i+2, SIMD.Float32x4.extractLane(v, 2));
    assertEquals(i+3, SIMD.Float32x4.extractLane(v, 3));
  }
}

testFloat32ArrayByteOffset();
testFloat32ArrayByteOffset();
%OptimizeFunctionOnNextCall(testFloat32ArrayByteOffset);
testFloat32ArrayByteOffset();

function testFloat32x4Store() {
  var b = new ArrayBuffer(56);
  var a = new Float32Array(b, 8);
  SIMD.Float32x4.store(a, 0, SIMD.Float32x4(0, 1, 2, 3));
  SIMD.Float32x4.store(a, 4, SIMD.Float32x4(4, 5, 6, 7));
  SIMD.Float32x4.store(a, 8, SIMD.Float32x4(8, 9, 10, 11));

  for (var i = 0; i < a.length; i++) {
    assertEquals(i, a[i]);
  }
}

testFloat32x4Store();
testFloat32x4Store();
%OptimizeFunctionOnNextCall(testFloat32x4Store);
testFloat32x4Store();

function testSIMDFromInt32x4() {
  var m = SIMD.Float32x4(9, 10, 11, 12);
  var nMask = SIMD.Int32x4.fromFloat32x4(m);
  var n = SIMD.Float32x4.fromInt32x4(nMask);

  assertEquals(9.0, SIMD.Float32x4.extractLane(n, 0));
  assertEquals(10.0, SIMD.Float32x4.extractLane(n, 1));
  assertEquals(11.0, SIMD.Float32x4.extractLane(n, 2));
  assertEquals(12.0, SIMD.Float32x4.extractLane(n, 3));
};

testSIMDFromInt32x4();
testSIMDFromInt32x4();
%OptimizeFunctionOnNextCall(testSIMDFromInt32x4);
testSIMDFromInt32x4();

function testSIMDFromInt32x4Bits() {
  var m = SIMD.Float32x4(9, 10, 11, 12);
  var nMask = SIMD.Int32x4.fromFloat32x4Bits(m);
  var n = SIMD.Float32x4.fromInt32x4Bits(nMask);

  assertEquals(9.0, SIMD.Float32x4.extractLane(n, 0));
  assertEquals(10.0, SIMD.Float32x4.extractLane(n, 1));
  assertEquals(11.0, SIMD.Float32x4.extractLane(n, 2));
  assertEquals(12.0, SIMD.Float32x4.extractLane(n, 3));
};

testSIMDFromInt32x4Bits();
testSIMDFromInt32x4Bits();
%OptimizeFunctionOnNextCall(testSIMDFromInt32x4Bits);
testSIMDFromInt32x4Bits();

function testSIMDExtractLane() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var x = SIMD.Float32x4.extractLane(m, 0);
  var y = SIMD.Float32x4.extractLane(m ,1);
  var z = SIMD.Float32x4.extractLane(m ,2);
  var w = SIMD.Float32x4.extractLane(m ,3);

  assertEquals(1.0, x);
  assertEquals(2.0, y);
  assertEquals(3.0, z);
  assertEquals(4.0, w);
}

testSIMDExtractLane();
testSIMDExtractLane();
%OptimizeFunctionOnNextCall(testSIMDExtractLane);
testSIMDExtractLane();

function testSIMDReplaceLane() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var a = SIMD.Float32x4.replaceLane(m, 0, 5.0);
  var b = SIMD.Float32x4.replaceLane(m, 1, 6.0);
  var c = SIMD.Float32x4.replaceLane(m, 2, 7.0);
  var d = SIMD.Float32x4.replaceLane(m, 3, 8.0);

  assertEquals(5.0, SIMD.Float32x4.extractLane(a, 0));
  assertEquals(6.0, SIMD.Float32x4.extractLane(b, 1));
  assertEquals(7.0, SIMD.Float32x4.extractLane(c, 2));
  assertEquals(8.0, SIMD.Float32x4.extractLane(d, 3));
}

testSIMDReplaceLane();
testSIMDReplaceLane();
%OptimizeFunctionOnNextCall(testSIMDReplaceLane);
testSIMDReplaceLane();
