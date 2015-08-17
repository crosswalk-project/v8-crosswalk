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

// Flags: --simd-object --allow-natives-syntax

function testConstructor() {
  var f4 = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  assertEquals(1.0, f4.x);
  assertEquals(2.0, f4.y);
  assertEquals(3.0, f4.z);
  assertEquals(4.0, f4.w);

  f4 = SIMD.Float32x4(1.1, 2.2, 3.3, 4.4);
  assertEquals(1.100000023841858, f4.x);
  assertEquals(2.200000047683716, f4.y);
  assertEquals(3.299999952316284, f4.z);
  assertEquals(4.400000095367432, f4.w);
}

testConstructor();
testConstructor();
%OptimizeFunctionOnNextCall(testConstructor);
testConstructor();

function testCheck() {
  var f4 = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var f4_new = SIMD.Float32x4.check(f4);
  assertEquals(f4_new.x, f4.x);
  assertEquals(f4_new.y, f4.y);
  assertEquals(f4_new.z, f4.z);
  assertEquals(f4_new.w, f4.w);

  f4 = SIMD.Float32x4(1.1, 2.2, 3.3, 4.4);
  f4_new = SIMD.Float32x4.check(f4);
  assertEquals(f4_new.x, f4.x);
  assertEquals(f4_new.y, f4.y);
  assertEquals(f4_new.z, f4.z);
  assertEquals(f4_new.w, f4.w);
}

testCheck();
testCheck();
%OptimizeFunctionOnNextCall(testCheck);
testCheck();

function testZeroConstructor() {
  var z4 = SIMD.Float32x4.zero();
  assertEquals(0.0, z4.x);
  assertEquals(0.0, z4.y);
  assertEquals(0.0, z4.z);
  assertEquals(0.0, z4.w);
}

testZeroConstructor();
testZeroConstructor();
%OptimizeFunctionOnNextCall(testZeroConstructor);
testZeroConstructor();

function testSplatConstructor() {
  var z4 = SIMD.Float32x4.splat(5.0);
  assertEquals(5.0, z4.x);
  assertEquals(5.0, z4.y);
  assertEquals(5.0, z4.z);
  assertEquals(5.0, z4.w);
}

testSplatConstructor();
testSplatConstructor();
%OptimizeFunctionOnNextCall(testSplatConstructor);
testSplatConstructor();

function testTypeof() {
  var z4 = SIMD.Float32x4.zero();
  assertEquals(typeof(z4), "object");

  var new_z4 = new SIMD.Float32x4(0, 0, 0, 0);
  assertEquals(typeof(new_z4), "object");
  assertEquals(typeof(new_z4.valueOf()), "object");
  assertEquals(Object.prototype.toString.call(new_z4), "[object Object]");
}

testTypeof();

function testSignMaskGetter() {
  var a = SIMD.Float32x4(-1.0, -2.0, -3.0, -4.0);
  assertEquals(0xf, a.signMask);
  var b = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  assertEquals(0x0, b.signMask);
  var c = SIMD.Float32x4(1.0, -2.0, -3.0, 4.0);
  assertEquals(0x6, c.signMask);
}

testSignMaskGetter();
testSignMaskGetter();
%OptimizeFunctionOnNextCall(testSignMaskGetter);
testSignMaskGetter();

function testSIMDAbs() {
  var a4 = SIMD.Float32x4(1.0, -1.0, 1.0, -1.0);
  var b4 = SIMD.Float32x4.abs(a4);

  assertEquals(1.0, b4.x);
  assertEquals(1.0, b4.y);
  assertEquals(1.0, b4.z);
  assertEquals(1.0, b4.w);
}

testSIMDAbs();
testSIMDAbs();
%OptimizeFunctionOnNextCall(testSIMDAbs);
testSIMDAbs();

function testSIMDNeg() {
  var a4 = SIMD.Float32x4(1.0, -1.0, 1.0, -1.0);
  var b4 = SIMD.Float32x4.neg(a4);

  assertEquals(-1.0, b4.x);
  assertEquals(1.0, b4.y);
  assertEquals(-1.0, b4.z);
  assertEquals(1.0, b4.w);
}

testSIMDNeg();
testSIMDNeg();
%OptimizeFunctionOnNextCall(testSIMDNeg);
testSIMDNeg();

function testSIMDAdd() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.add(a4, b4);

  assertEquals(3.0, c4.x);
  assertEquals(3.0, c4.y);
  assertEquals(3.0, c4.z);
  assertEquals(3.0, c4.w);
}

testSIMDAdd();
testSIMDAdd();
%OptimizeFunctionOnNextCall(testSIMDAdd);
testSIMDAdd();

function testSIMDSub() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.sub(a4, b4);

  assertEquals(-1.0, c4.x);
  assertEquals(-1.0, c4.y);
  assertEquals(-1.0, c4.z);
  assertEquals(-1.0, c4.w);
}

testSIMDSub();
testSIMDSub();
%OptimizeFunctionOnNextCall(testSIMDSub);
testSIMDSub();

function testSIMDMul() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.mul(a4, b4);

  assertEquals(2.0, c4.x);
  assertEquals(2.0, c4.y);
  assertEquals(2.0, c4.z);
  assertEquals(2.0, c4.w);
}

testSIMDMul();
testSIMDMul();
%OptimizeFunctionOnNextCall(testSIMDMul);
testSIMDMul();

function testSIMDDiv() {
  var a4 = SIMD.Float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.Float32x4.div(a4, b4);

  assertEquals(0.5, c4.x);
  assertEquals(0.5, c4.y);
  assertEquals(0.5, c4.z);
  assertEquals(0.5, c4.w);
}

testSIMDDiv();
testSIMDDiv();
%OptimizeFunctionOnNextCall(testSIMDDiv);
testSIMDDiv();

function testSIMDClamp() {
  var m = SIMD.Float32x4(1.0, -2.0, 3.0, -4.0);
  var lo = SIMD.Float32x4(0.0, 0.0, 0.0, 0.0);
  var hi = SIMD.Float32x4(2.0, 2.0, 2.0, 2.0);
  m = SIMD.Float32x4.clamp(m, lo, hi);
  assertEquals(1.0, m.x);
  assertEquals(0.0, m.y);
  assertEquals(2.0, m.z);
  assertEquals(0.0, m.w);
}

testSIMDClamp();
testSIMDClamp();
%OptimizeFunctionOnNextCall(testSIMDClamp);
testSIMDClamp();

function testSIMDMin() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.Float32x4(1.0, 0.0, 2.5, 5.0);
  m = SIMD.Float32x4.min(m, n);
  assertEquals(1.0, m.x);
  assertEquals(0.0, m.y);
  assertEquals(2.5, m.z);
  assertEquals(4.0, m.w);
}

testSIMDMin();
testSIMDMin();
%OptimizeFunctionOnNextCall(testSIMDMin);
testSIMDMin();

function testSIMDMax() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.Float32x4(1.0, 0.0, 2.5, 5.0);
  m = SIMD.Float32x4.max(m, n);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
  assertEquals(3.0, m.z);
  assertEquals(5.0, m.w);
}

testSIMDMax();
testSIMDMax();
%OptimizeFunctionOnNextCall(testSIMDMax);
testSIMDMax();

function testSIMDReciprocal() {
  var m = SIMD.Float32x4(1.0, 4.0, 9.0, 16.0);
  m = SIMD.Float32x4.reciprocal(m);
  assertTrue(Math.abs(1.0 - m.x) <= 0.001);
  assertTrue(Math.abs(0.25 - m.y) <= 0.001);
  assertTrue(Math.abs(0.1111111 - m.z) <= 0.001);
  assertTrue(Math.abs(0.0625 - m.w) <= 0.001);
}

testSIMDReciprocal();
testSIMDReciprocal();
%OptimizeFunctionOnNextCall(testSIMDReciprocal);
testSIMDReciprocal();

function testSIMDReciprocalSqrt() {
  var m = SIMD.Float32x4(1.0, 0.25, 0.111111, 0.0625);
  m = SIMD.Float32x4.reciprocalSqrt(m);
  assertTrue(Math.abs(1.0 - m.x) <= 0.001);
  assertTrue(Math.abs(2.0 - m.y) <= 0.001);
  assertTrue(Math.abs(3.0 - m.z) <= 0.001);
  assertTrue(Math.abs(4.0 - m.w) <= 0.001);
}

testSIMDReciprocalSqrt();
testSIMDReciprocalSqrt();
%OptimizeFunctionOnNextCall(testSIMDReciprocalSqrt);
testSIMDReciprocalSqrt();

function testSIMDScale() {
  var m = SIMD.Float32x4(1.0, -2.0, 3.0, -4.0);
  m = SIMD.Float32x4.scale(m, 20.0);
  assertEquals(20.0, m.x);
  assertEquals(-40.0, m.y);
  assertEquals(60.0, m.z);
  assertEquals(-80.0, m.w);
}

testSIMDScale();
testSIMDScale();
%OptimizeFunctionOnNextCall(testSIMDScale);
testSIMDScale();

function testSIMDSqrt() {
  var m = SIMD.Float32x4(1.0, 4.0, 9.0, 16.0);
  m = SIMD.Float32x4.sqrt(m);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
  assertEquals(3.0, m.z);
  assertEquals(4.0, m.w);
}

testSIMDSqrt();
testSIMDSqrt();
%OptimizeFunctionOnNextCall(testSIMDSqrt);
testSIMDSqrt();

function testSIMDSwizzle() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var xxxx = SIMD.Float32x4.swizzle(m, 0, 0, 0, 0);
  print('------');
  print(xxxx.x);
  print(xxxx.y);
  print(xxxx.z);
  print(xxxx.w);
  print('------');
  assertEquals(1.0, xxxx.x);
  assertEquals(1.0, xxxx.y);
  assertEquals(1.0, xxxx.z);
  assertEquals(1.0, xxxx.w);
  var yyyy = SIMD.Float32x4.swizzle(m, 1, 1, 1, 1);
  assertEquals(2.0, yyyy.x);
  assertEquals(2.0, yyyy.y);
  assertEquals(2.0, yyyy.z);
  assertEquals(2.0, yyyy.w);
  var zzzz = SIMD.Float32x4.swizzle(m, 2, 2, 2, 2);
  assertEquals(3.0, zzzz.x);
  assertEquals(3.0, zzzz.y);
  assertEquals(3.0, zzzz.z);
  assertEquals(3.0, zzzz.w);
  var wwww = SIMD.Float32x4.swizzle(m, 3, 3, 3, 3);
  assertEquals(4.0, wwww.x);
  assertEquals(4.0, wwww.y);
  assertEquals(4.0, wwww.z);
  assertEquals(4.0, wwww.w);
  var wzyx = SIMD.Float32x4.swizzle(m, 3, 2, 1, 0);
  assertEquals(4.0, wzyx.x);
  assertEquals(3.0, wzyx.y);
  assertEquals(2.0, wzyx.z);
  assertEquals(1.0, wzyx.w);
  var wwzz = SIMD.Float32x4.swizzle(m, 3, 3, 2, 2);
  assertEquals(4.0, wwzz.x);
  assertEquals(4.0, wwzz.y);
  assertEquals(3.0, wwzz.z);
  assertEquals(3.0, wwzz.w);
  var xxyy = SIMD.Float32x4.swizzle(m, 0, 0, 1, 1);
  assertEquals(1.0, xxyy.x);
  assertEquals(1.0, xxyy.y);
  assertEquals(2.0, xxyy.z);
  assertEquals(2.0, xxyy.w);
  var yyww = SIMD.Float32x4.swizzle(m, 1, 1, 3, 3);
  assertEquals(2.0, yyww.x);
  assertEquals(2.0, yyww.y);
  assertEquals(4.0, yyww.z);
  assertEquals(4.0, yyww.w);
}

testSIMDSwizzle();
testSIMDSwizzle();
%OptimizeFunctionOnNextCall(testSIMDSwizzle);
testSIMDSwizzle();

function testSIMDShuffle() {
  var a = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var b = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  var xxxx = SIMD.Float32x4.shuffle(a, b, 0, 0, 4, 4);
  assertEquals(1.0, xxxx.x);
  assertEquals(1.0, xxxx.y);
  assertEquals(5.0, xxxx.z);
  assertEquals(5.0, xxxx.w);
  var yyyy = SIMD.Float32x4.shuffle(a, b, 1, 1, 5, 5);
  assertEquals(2.0, yyyy.x);
  assertEquals(2.0, yyyy.y);
  assertEquals(6.0, yyyy.z);
  assertEquals(6.0, yyyy.w);
  var zzzz = SIMD.Float32x4.shuffle(a, b, 2, 2, 6, 6);
  assertEquals(3.0, zzzz.x);
  assertEquals(3.0, zzzz.y);
  assertEquals(7.0, zzzz.z);
  assertEquals(7.0, zzzz.w);
  var wwww = SIMD.Float32x4.shuffle(a, b, 3, 3, 7, 7);
  assertEquals(4.0, wwww.x);
  assertEquals(4.0, wwww.y);
  assertEquals(8.0, wwww.z);
  assertEquals(8.0, wwww.w);
  var wzyx = SIMD.Float32x4.shuffle(a, b, 3, 2, 5, 4);
  assertEquals(4.0, wzyx.x);
  assertEquals(3.0, wzyx.y);
  assertEquals(6.0, wzyx.z);
  assertEquals(5.0, wzyx.w);
  var wwzz = SIMD.Float32x4.shuffle(a, b, 3, 3, 6, 6);
  assertEquals(4.0, wwzz.x);
  assertEquals(4.0, wwzz.y);
  assertEquals(7.0, wwzz.z);
  assertEquals(7.0, wwzz.w);
  var xxyy = SIMD.Float32x4.shuffle(a, b, 0, 0, 5, 5);
  assertEquals(1.0, xxyy.x);
  assertEquals(1.0, xxyy.y);
  assertEquals(6.0, xxyy.z);
  assertEquals(6.0, xxyy.w);
  var yyww = SIMD.Float32x4.shuffle(a, b, 1, 1, 7, 7);
  assertEquals(2.0, yyww.x);
  assertEquals(2.0, yyww.y);
  assertEquals(8.0, yyww.z);
  assertEquals(8.0, yyww.w);
}

testSIMDShuffle();
testSIMDShuffle();
%OptimizeFunctionOnNextCall(testSIMDShuffle);
testSIMDShuffle();

function testSIMDSetters() {
  var f = SIMD.Float32x4.zero();
  assertEquals(0.0, f.x);
  assertEquals(0.0, f.y);
  assertEquals(0.0, f.z);
  assertEquals(0.0, f.w);
  f = SIMD.Float32x4.withX(f, 4.0);
  assertEquals(4.0, f.x);
  f = SIMD.Float32x4.withY(f, 3.0);
  assertEquals(3.0, f.y);
  f = SIMD.Float32x4.withZ(f, 2.0);
  assertEquals(2.0, f.z);
  f = SIMD.Float32x4.withW(f, 1.0);
  assertEquals(1.0, f.w);
  f = SIMD.Float32x4.zero();
}

testSIMDSetters();
testSIMDSetters();
%OptimizeFunctionOnNextCall(testSIMDSetters);
testSIMDSetters();

function testSIMDConversion() {
  var m = SIMD.Int32x4(0x3F800000, 0x40000000, 0x40400000, 0x40800000);
  var n = SIMD.Float32x4.fromInt32x4Bits(m);
  assertEquals(1.0, n.x);
  assertEquals(2.0, n.y);
  assertEquals(3.0, n.z);
  assertEquals(4.0, n.w);
  n = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  m = SIMD.Int32x4.fromFloat32x4Bits(n);
  assertEquals(0x40A00000, m.x);
  assertEquals(0x40C00000, m.y);
  assertEquals(0x40E00000, m.z);
  assertEquals(0x41000000, m.w);
  // Flip sign using bit-wise operators.
  n = SIMD.Float32x4(9.0, 10.0, 11.0, 12.0);
  m = SIMD.Int32x4(0x80000000, 0x80000000, 0x80000000, 0x80000000);
  var nMask = SIMD.Int32x4.fromFloat32x4Bits(n);
  nMask = SIMD.Int32x4.xor(nMask, m); // flip sign.
  n = SIMD.Float32x4.fromInt32x4Bits(nMask);
  assertEquals(-9.0, n.x);
  assertEquals(-10.0, n.y);
  assertEquals(-11.0, n.z);
  assertEquals(-12.0, n.w);
  nMask = SIMD.Int32x4.fromFloat32x4Bits(n);
  nMask = SIMD.Int32x4.xor(nMask, m); // flip sign.
  n = SIMD.Float32x4.fromInt32x4Bits(nMask);
  assertEquals(9.0, n.x);
  assertEquals(10.0, n.y);
  assertEquals(11.0, n.z);
  assertEquals(12.0, n.w);
}

testSIMDConversion();
testSIMDConversion();
%OptimizeFunctionOnNextCall(testSIMDConversion);
testSIMDConversion();

function testSIMDConversion2() {
  var m = SIMD.Int32x4(1, 2, 3, 4);
  var n = SIMD.Float32x4.fromInt32x4(m);
  assertEquals(1.0, n.x);
  assertEquals(2.0, n.y);
  assertEquals(3.0, n.z);
  assertEquals(4.0, n.w);
  n = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  m = SIMD.Int32x4.fromFloat32x4(n);
  assertEquals(5, m.x);
  assertEquals(6, m.y);
  assertEquals(7, m.z);
  assertEquals(8, m.w);
}

testSIMDConversion2();
testSIMDConversion2();
%OptimizeFunctionOnNextCall(testSIMDConversion2);
testSIMDConversion2();


function testSIMDComparisons() {
  var m = SIMD.Float32x4(1.0, 2.0, 0.1, 0.001);
  var n = SIMD.Float32x4(2.0, 2.0, 0.001, 0.1);
  var cmp;
  cmp = SIMD.Float32x4.lessThan(m, n);
  assertEquals(-1, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.Float32x4.lessThanOrEqual(m, n);
  assertEquals(-1, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.Float32x4.equal(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(0x0, cmp.w);

  cmp = SIMD.Float32x4.notEqual(m, n);
  assertEquals(-1, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(-1, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.Float32x4.greaterThanOrEqual(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(-1, cmp.z);
  assertEquals(0x0, cmp.w);

  cmp = SIMD.Float32x4.greaterThan(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(-1, cmp.z);
  assertEquals(0x0, cmp.w);
}

testSIMDComparisons();
testSIMDComparisons();
%OptimizeFunctionOnNextCall(testSIMDComparisons);
testSIMDComparisons();

function testSIMDAnd() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.Float32x4(~1.0, 2.0, 3.0, 4.0);
  o = SIMD.Float32x4.and(m,n); // and
  assertEquals(0, o.x);
  assertEquals(2, o.y);
  assertEquals(3, o.z);
  assertEquals(4, o.w);
}

testSIMDAnd();
testSIMDAnd();
%OptimizeFunctionOnNextCall(testSIMDAnd);
testSIMDAnd();

function testSIMDOr() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.Float32x4(~1.0, 2.0, 3.0, 4.0);
  var o = SIMD.Float32x4.or(m,n); // or
  assertEquals(-Infinity, o.x);
  assertEquals(2.0, o.y);
  assertEquals(3.0, o.z);
  assertEquals(4.0, o.w);
}

testSIMDOr();
testSIMDOr();
%OptimizeFunctionOnNextCall(testSIMDOr);
testSIMDOr();

function testSIMDXor() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.Float32x4(~1.0, 2.0, 3.0, 4.0);
  var o = SIMD.Float32x4.xor(m,n); // xor
  assertEquals(-Infinity, o.x);
  assertEquals(0x0, o.y);
  assertEquals(0x0, o.z);
  assertEquals(0x0, o.w);
}

testSIMDXor();
testSIMDXor();
%OptimizeFunctionOnNextCall(testSIMDXor);
testSIMDXor();

function testSIMDNot() {
  var m = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  m = SIMD.Float32x4.not(m);
  m = SIMD.Float32x4.not(m);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
  assertEquals(3.0, m.z);
  assertEquals(4.0, m.w);
}

testSIMDNot();
testSIMDNot();
%OptimizeFunctionOnNextCall(testSIMDNot);
testSIMDNot();

function testSIMDSelect() {
  var m = SIMD.Int32x4.bool(true, true, false, false);
  var t = SIMD.Float32x4(1.0, 2.0, 3.0, 4.0);
  var f = SIMD.Float32x4(5.0, 6.0, 7.0, 8.0);
  var s = SIMD.Float32x4.select(m, t, f);
  assertEquals(1.0, s.x);
  assertEquals(2.0, s.y);
  assertEquals(7.0, s.z);
  assertEquals(8.0, s.w);
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
    assertEquals(i, v.x);
    assertEquals(i+1, v.y);
    assertEquals(i+2, v.z);
    assertEquals(i+3, v.w);
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

  assertEquals(9.0, n.x);
  assertEquals(10.0, n.y);
  assertEquals(11.0, n.z);
  assertEquals(12.0, n.w);
};

testSIMDFromInt32x4();
testSIMDFromInt32x4();
%OptimizeFunctionOnNextCall(testSIMDFromInt32x4);
testSIMDFromInt32x4();

function testSIMDFromInt32x4Bits() {
  var m = SIMD.Float32x4(9, 10, 11, 12);
  var nMask = SIMD.Int32x4.fromFloat32x4Bits(m);
  var n = SIMD.Float32x4.fromInt32x4Bits(nMask);

  assertEquals(9.0, n.x);
  assertEquals(10.0, n.y);
  assertEquals(11.0, n.z);
  assertEquals(12.0, n.w);
};

testSIMDFromInt32x4Bits();
testSIMDFromInt32x4Bits();
%OptimizeFunctionOnNextCall(testSIMDFromInt32x4Bits);
testSIMDFromInt32x4Bits();

function testSIMDromFloat64x2() {
  var m = SIMD.Float32x4(9.0, 10.0, 11.0, 12.0);
  var nMask = SIMD.Float64x2.fromFloat32x4(m);
  var n = SIMD.Float32x4.fromFloat64x2(nMask);

  assertEquals(9.0, n.x);
  assertEquals(10.0, n.y);
  assertEquals(0, n.z);
  assertEquals(0, n.w);
};

testSIMDromFloat64x2();

function testSIMDFromFloat64x2Bits() {
  var m = SIMD.Float32x4(9.0, 10.0, 11.0, 12.0);
  var nMask = SIMD.Float64x2.fromFloat32x4Bits(m);
  var n = SIMD.Float32x4.fromFloat64x2Bits(nMask);

  assertEquals(9.0, n.x);
  assertEquals(10.0, n.y);
  assertEquals(11.0, n.z);
  assertEquals(12.0, n.w);
};

testSIMDFromFloat64x2Bits()
