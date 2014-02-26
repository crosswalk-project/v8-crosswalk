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

// Flags: --simd_object --allow-natives-syntax

function testConstructor() {
  var f4 = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  assertEquals(1.0, f4.x);
  assertEquals(2.0, f4.y);
  assertEquals(3.0, f4.z);
  assertEquals(4.0, f4.w);

  f4 = SIMD.float32x4(1.1, 2.2, 3.3, 4.4);
  assertEquals(1.100000023841858, f4.x);
  assertEquals(2.200000047683716, f4.y);
  assertEquals(3.299999952316284, f4.z);
  assertEquals(4.400000095367432, f4.w);
}

testConstructor();
testConstructor();
%OptimizeFunctionOnNextCall(testConstructor);
testConstructor();

function testZeroConstructor() {
  var z4 = SIMD.float32x4.zero();
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
  var z4 = SIMD.float32x4.splat(5.0);
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
  var z4 = SIMD.float32x4.zero();
  assertEquals(typeof(z4), "float32x4");

  var new_z4 = new SIMD.float32x4(0, 0, 0, 0);
  assertEquals(typeof(new_z4), "object");
  assertEquals(typeof(new_z4.valueOf()), "float32x4");
  assertEquals(Object.prototype.toString.call(new_z4), "[object float32x4]");
}

testTypeof();

function testSignMaskGetter() {
  var a = SIMD.float32x4(-1.0, -2.0, -3.0, -4.0);
  assertEquals(0xf, a.signMask);
  var b = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  assertEquals(0x0, b.signMask);
  var c = SIMD.float32x4(1.0, -2.0, -3.0, 4.0);
  assertEquals(0x6, c.signMask);
}

testSignMaskGetter();
testSignMaskGetter();
%OptimizeFunctionOnNextCall(testSignMaskGetter);
testSignMaskGetter();

function testSIMDAbs() {
  var a4 = SIMD.float32x4(1.0, -1.0, 1.0, -1.0);
  var b4 = SIMD.float32x4.abs(a4);

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
  var a4 = SIMD.float32x4(1.0, -1.0, 1.0, -1.0);
  var b4 = SIMD.float32x4.neg(a4);

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
  var a4 = SIMD.float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.float32x4.add(a4, b4);

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
  var a4 = SIMD.float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.float32x4.sub(a4, b4);

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
  var a4 = SIMD.float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.float32x4.mul(a4, b4);

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
  var a4 = SIMD.float32x4(1.0, 1.0, 1.0, 1.0);
  var b4 = SIMD.float32x4(2.0, 2.0, 2.0, 2.0);
  var c4 = SIMD.float32x4.div(a4, b4);

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
  var m = SIMD.float32x4(1.0, -2.0, 3.0, -4.0);
  var lo = SIMD.float32x4(0.0, 0.0, 0.0, 0.0);
  var hi = SIMD.float32x4(2.0, 2.0, 2.0, 2.0);
  m = SIMD.float32x4.clamp(m, lo, hi);
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
  var m = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.float32x4(1.0, 0.0, 2.5, 5.0);
  m = SIMD.float32x4.min(m, n);
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
  var m = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.float32x4(1.0, 0.0, 2.5, 5.0);
  m = SIMD.float32x4.max(m, n);
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
  var m = SIMD.float32x4(1.0, 4.0, 9.0, 16.0);
  m = SIMD.float32x4.reciprocal(m);
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
  var m = SIMD.float32x4(1.0, 0.25, 0.111111, 0.0625);
  m = SIMD.float32x4.reciprocalSqrt(m);
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
  var m = SIMD.float32x4(1.0, -2.0, 3.0, -4.0);
  m = SIMD.float32x4.scale(m, 20.0);
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
  var m = SIMD.float32x4(1.0, 4.0, 9.0, 16.0);
  m = SIMD.float32x4.sqrt(m);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
  assertEquals(3.0, m.z);
  assertEquals(4.0, m.w);
}

testSIMDSqrt();
testSIMDSqrt();
%OptimizeFunctionOnNextCall(testSIMDSqrt);
testSIMDSqrt();

function testSIMDShuffle() {
  var m = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var xxxx = SIMD.float32x4.shuffle(m, SIMD.XXXX);
  assertEquals(1.0, xxxx.x);
  assertEquals(1.0, xxxx.y);
  assertEquals(1.0, xxxx.z);
  assertEquals(1.0, xxxx.w);
  var yyyy = SIMD.float32x4.shuffle(m, SIMD.YYYY);
  assertEquals(2.0, yyyy.x);
  assertEquals(2.0, yyyy.y);
  assertEquals(2.0, yyyy.z);
  assertEquals(2.0, yyyy.w);
  var zzzz = SIMD.float32x4.shuffle(m, SIMD.ZZZZ);
  assertEquals(3.0, zzzz.x);
  assertEquals(3.0, zzzz.y);
  assertEquals(3.0, zzzz.z);
  assertEquals(3.0, zzzz.w);
  var wwww = SIMD.float32x4.shuffle(m, SIMD.WWWW);
  assertEquals(4.0, wwww.x);
  assertEquals(4.0, wwww.y);
  assertEquals(4.0, wwww.z);
  assertEquals(4.0, wwww.w);
  var wzyx = SIMD.float32x4.shuffle(m, SIMD.WZYX);
  assertEquals(4.0, wzyx.x);
  assertEquals(3.0, wzyx.y);
  assertEquals(2.0, wzyx.z);
  assertEquals(1.0, wzyx.w);
  var wwzz = SIMD.float32x4.shuffle(m, SIMD.WWZZ);
  assertEquals(4.0, wwzz.x);
  assertEquals(4.0, wwzz.y);
  assertEquals(3.0, wwzz.z);
  assertEquals(3.0, wwzz.w);
  var xxyy = SIMD.float32x4.shuffle(m, SIMD.XXYY);
  assertEquals(1.0, xxyy.x);
  assertEquals(1.0, xxyy.y);
  assertEquals(2.0, xxyy.z);
  assertEquals(2.0, xxyy.w);
  var yyww = SIMD.float32x4.shuffle(m, SIMD.YYWW);
  assertEquals(2.0, yyww.x);
  assertEquals(2.0, yyww.y);
  assertEquals(4.0, yyww.z);
  assertEquals(4.0, yyww.w);
}

testSIMDShuffle();
testSIMDShuffle();
%OptimizeFunctionOnNextCall(testSIMDShuffle);
testSIMDShuffle();

function testSIMDShuffleMix() {
  var a = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var b = SIMD.float32x4(5.0, 6.0, 7.0, 8.0);
  var xxxx = SIMD.float32x4.shuffleMix(a, b, SIMD.XXXX);
  assertEquals(1.0, xxxx.x);
  assertEquals(1.0, xxxx.y);
  assertEquals(5.0, xxxx.z);
  assertEquals(5.0, xxxx.w);
  var yyyy = SIMD.float32x4.shuffleMix(a, b, SIMD.YYYY);
  assertEquals(2.0, yyyy.x);
  assertEquals(2.0, yyyy.y);
  assertEquals(6.0, yyyy.z);
  assertEquals(6.0, yyyy.w);
  var zzzz = SIMD.float32x4.shuffleMix(a, b, SIMD.ZZZZ);
  assertEquals(3.0, zzzz.x);
  assertEquals(3.0, zzzz.y);
  assertEquals(7.0, zzzz.z);
  assertEquals(7.0, zzzz.w);
  var wwww = SIMD.float32x4.shuffleMix(a, b, SIMD.WWWW);
  assertEquals(4.0, wwww.x);
  assertEquals(4.0, wwww.y);
  assertEquals(8.0, wwww.z);
  assertEquals(8.0, wwww.w);
  var wzyx = SIMD.float32x4.shuffleMix(a, b, SIMD.WZYX);
  assertEquals(4.0, wzyx.x);
  assertEquals(3.0, wzyx.y);
  assertEquals(6.0, wzyx.z);
  assertEquals(5.0, wzyx.w);
  var wwzz = SIMD.float32x4.shuffleMix(a, b, SIMD.WWZZ);
  assertEquals(4.0, wwzz.x);
  assertEquals(4.0, wwzz.y);
  assertEquals(7.0, wwzz.z);
  assertEquals(7.0, wwzz.w);
  var xxyy = SIMD.float32x4.shuffleMix(a, b, SIMD.XXYY);
  assertEquals(1.0, xxyy.x);
  assertEquals(1.0, xxyy.y);
  assertEquals(6.0, xxyy.z);
  assertEquals(6.0, xxyy.w);
  var yyww = SIMD.float32x4.shuffleMix(a, b, SIMD.YYWW);
  assertEquals(2.0, yyww.x);
  assertEquals(2.0, yyww.y);
  assertEquals(8.0, yyww.z);
  assertEquals(8.0, yyww.w);
}

testSIMDShuffleMix();
testSIMDShuffleMix();
%OptimizeFunctionOnNextCall(testSIMDShuffleMix);
testSIMDShuffleMix();

function testSIMDSetters() {
  var f = SIMD.float32x4.zero();
  assertEquals(0.0, f.x);
  assertEquals(0.0, f.y);
  assertEquals(0.0, f.z);
  assertEquals(0.0, f.w);
  f = SIMD.float32x4.withX(f, 4.0);
  assertEquals(4.0, f.x);
  f = SIMD.float32x4.withY(f, 3.0);
  assertEquals(3.0, f.y);
  f = SIMD.float32x4.withZ(f, 2.0);
  assertEquals(2.0, f.z);
  f = SIMD.float32x4.withW(f, 1.0);
  assertEquals(1.0, f.w);
  f = SIMD.float32x4.zero();
}

testSIMDSetters();
testSIMDSetters();
%OptimizeFunctionOnNextCall(testSIMDSetters);
testSIMDSetters();

function testSIMDConversion() {
  var m = SIMD.int32x4(0x3F800000, 0x40000000, 0x40400000, 0x40800000);
  var n = SIMD.int32x4.bitsToFloat32x4(m);
  assertEquals(1.0, n.x);
  assertEquals(2.0, n.y);
  assertEquals(3.0, n.z);
  assertEquals(4.0, n.w);
  n = SIMD.float32x4(5.0, 6.0, 7.0, 8.0);
  m = SIMD.float32x4.bitsToInt32x4(n);
  assertEquals(0x40A00000, m.x);
  assertEquals(0x40C00000, m.y);
  assertEquals(0x40E00000, m.z);
  assertEquals(0x41000000, m.w);
  // Flip sign using bit-wise operators.
  n = SIMD.float32x4(9.0, 10.0, 11.0, 12.0);
  m = SIMD.int32x4(0x80000000, 0x80000000, 0x80000000, 0x80000000);
  var nMask = SIMD.float32x4.bitsToInt32x4(n);
  nMask = SIMD.int32x4.xor(nMask, m); // flip sign.
  n = SIMD.int32x4.bitsToFloat32x4(nMask);
  assertEquals(-9.0, n.x);
  assertEquals(-10.0, n.y);
  assertEquals(-11.0, n.z);
  assertEquals(-12.0, n.w);
  nMask = SIMD.float32x4.bitsToInt32x4(n);
  nMask = SIMD.int32x4.xor(nMask, m); // flip sign.
  n = SIMD.int32x4.bitsToFloat32x4(nMask);
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
  var m = SIMD.int32x4(1, 2, 3, 4);
  var n = SIMD.int32x4.toFloat32x4(m);
  assertEquals(1.0, n.x);
  assertEquals(2.0, n.y);
  assertEquals(3.0, n.z);
  assertEquals(4.0, n.w);
  n = SIMD.float32x4(5.0, 6.0, 7.0, 8.0);
  m = SIMD.float32x4.toInt32x4(n);
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
  var m = SIMD.float32x4(1.0, 2.0, 0.1, 0.001);
  var n = SIMD.float32x4(2.0, 2.0, 0.001, 0.1);
  var cmp;
  cmp = SIMD.float32x4.lessThan(m, n);
  assertEquals(-1, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.float32x4.lessThanOrEqual(m, n);
  assertEquals(-1, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.float32x4.equal(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(0x0, cmp.w);

  cmp = SIMD.float32x4.notEqual(m, n);
  assertEquals(-1, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(-1, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.float32x4.greaterThanOrEqual(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(-1, cmp.z);
  assertEquals(0x0, cmp.w);

  cmp = SIMD.float32x4.greaterThan(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(-1, cmp.z);
  assertEquals(0x0, cmp.w);
}

testSIMDComparisons();
testSIMDComparisons();
%OptimizeFunctionOnNextCall(testSIMDComparisons);
testSIMDComparisons();

function testFloat32x4ArrayBasic() {
  var a = new Float32x4Array(1);
  assertEquals(1, a.length);
  assertEquals(16, a.byteLength);
  assertEquals(16, a.BYTES_PER_ELEMENT);
  assertEquals(16, Float32x4Array.BYTES_PER_ELEMENT);
  assertEquals(0, a.byteOffset);
  assertTrue(undefined != a.buffer);
  var b = new Float32x4Array(4);
  assertEquals(4, b.length);
  assertEquals(64, b.byteLength);
  assertEquals(16, b.BYTES_PER_ELEMENT);
  assertEquals(16, Float32x4Array.BYTES_PER_ELEMENT);
  assertEquals(0, b.byteOffset);
  assertTrue(undefined != b.buffer);
}

testFloat32x4ArrayBasic();

function testFloat32x4ArrayGetAndSet() {
  var a = new Float32x4Array(4);
  a[0] = SIMD.float32x4(1, 2, 3, 4);
  a[1] = SIMD.float32x4(5, 6, 7, 8);
  a[2] = SIMD.float32x4(9, 10, 11, 12);
  a[3] = SIMD.float32x4(13, 14, 15, 16);
  assertEquals(a[0].x, 1);
  assertEquals(a[0].y, 2);
  assertEquals(a[0].z, 3);
  assertEquals(a[0].w, 4);

  assertEquals(a[1].x, 5);
  assertEquals(a[1].y, 6);
  assertEquals(a[1].z, 7);
  assertEquals(a[1].w, 8);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);
  assertEquals(a[2].z, 11);
  assertEquals(a[2].w, 12);

  assertEquals(a[3].x, 13);
  assertEquals(a[3].y, 14);
  assertEquals(a[3].z, 15);
  assertEquals(a[3].w, 16);

  var b = new Float32x4Array(4);
  b.setAt(0,SIMD.float32x4(1, 2, 3, 4));
  b.setAt(1,SIMD.float32x4(5, 6, 7, 8));
  b.setAt(2,SIMD.float32x4(9, 10, 11, 12));
  b.setAt(3,SIMD.float32x4(13, 14, 15, 16));

  assertEquals(b.getAt(0).x, 1);
  assertEquals(b.getAt(0).y, 2);
  assertEquals(b.getAt(0).z, 3);
  assertEquals(b.getAt(0).w, 4);

  assertEquals(b.getAt(1).x, 5);
  assertEquals(b.getAt(1).y, 6);
  assertEquals(b.getAt(1).z, 7);
  assertEquals(b.getAt(1).w, 8);

  assertEquals(b.getAt(2).x, 9);
  assertEquals(b.getAt(2).y, 10);
  assertEquals(b.getAt(2).z, 11);
  assertEquals(b.getAt(2).w, 12);

  assertEquals(b.getAt(3).x, 13);
  assertEquals(b.getAt(3).y, 14);
  assertEquals(b.getAt(3).z, 15);
  assertEquals(b.getAt(3).w, 16);
}

testFloat32x4ArrayGetAndSet();
testFloat32x4ArrayGetAndSet();
%OptimizeFunctionOnNextCall(testFloat32x4ArrayGetAndSet);
testFloat32x4ArrayGetAndSet();

function testFloat32x4ArraySwap() {
  var a = new Float32x4Array(4);
  a[0] = SIMD.float32x4(1, 2, 3, 4);
  a[1] = SIMD.float32x4(5, 6, 7, 8);
  a[2] = SIMD.float32x4(9, 10, 11, 12);
  a[3] = SIMD.float32x4(13, 14, 15, 16);

  // Swap element 0 and element 3
  var t = a[0];
  a[0] = a[3];
  a[3] = t;

  assertEquals(a[3].x, 1);
  assertEquals(a[3].y, 2);
  assertEquals(a[3].z, 3);
  assertEquals(a[3].w, 4);

  assertEquals(a[1].x, 5);
  assertEquals(a[1].y, 6);
  assertEquals(a[1].z, 7);
  assertEquals(a[1].w, 8);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);
  assertEquals(a[2].z, 11);
  assertEquals(a[2].w, 12);

  assertEquals(a[0].x, 13);
  assertEquals(a[0].y, 14);
  assertEquals(a[0].z, 15);
  assertEquals(a[0].w, 16);
}

testFloat32x4ArraySwap();

function testFloat32x4ArrayCopy() {
  var a = new Float32x4Array(4);
  a[0] = SIMD.float32x4(1, 2, 3, 4);
  a[1] = SIMD.float32x4(5, 6, 7, 8);
  a[2] = SIMD.float32x4(9, 10, 11, 12);
  a[3] = SIMD.float32x4(13, 14, 15, 16);
  var b = new Float32x4Array(a);
  assertEquals(a[0].x, b[0].x);
  assertEquals(a[0].y, b[0].y);
  assertEquals(a[0].z, b[0].z);
  assertEquals(a[0].w, b[0].w);

  assertEquals(a[1].x, b[1].x);
  assertEquals(a[1].y, b[1].y);
  assertEquals(a[1].z, b[1].z);
  assertEquals(a[1].w, b[1].w);

  assertEquals(a[2].x, b[2].x);
  assertEquals(a[2].y, b[2].y);
  assertEquals(a[2].z, b[2].z);
  assertEquals(a[2].w, b[2].w);

  assertEquals(a[3].x, b[3].x);
  assertEquals(a[3].y, b[3].y);
  assertEquals(a[3].z, b[3].z);
  assertEquals(a[3].w, b[3].w);

  a[2] = SIMD.float32x4(17, 18, 19, 20);

  assertEquals(a[2].x, 17);
  assertEquals(a[2].y, 18);
  assertEquals(a[2].z, 19);
  assertEquals(a[2].w, 20);

  assertTrue(a[2].x != b[2].x);
  assertTrue(a[2].y != b[2].y);
  assertTrue(a[2].z != b[2].z);
  assertTrue(a[2].w != b[2].w);
}

testFloat32x4ArrayCopy();

function testFloat32x4ArrayViewBasic() {
  var a = new Float32Array(8);
  // view with no offset.
  var b = new Float32x4Array(a.buffer, 0);
  // view with offset.
  var c = new Float32x4Array(a.buffer, 16);
  // view with no offset but shorter than original list.
  var d = new Float32x4Array(a.buffer, 0, 1);
  assertEquals(a.length, 8);
  assertEquals(b.length, 2);
  assertEquals(c.length, 1);
  assertEquals(d.length, 1);
  assertEquals(a.byteLength, 32);
  assertEquals(b.byteLength, 32);
  assertEquals(c.byteLength, 16);
  assertEquals(d.byteLength, 16)
  assertEquals(a.byteOffset, 0);
  assertEquals(b.byteOffset, 0);
  assertEquals(c.byteOffset, 16);
  assertEquals(d.byteOffset, 0);
}

testFloat32x4ArrayViewBasic();

function testFloat32x4ArrayViewValues() {
  var a = new Float32Array(8);
  var b = new Float32x4Array(a.buffer, 0);
  var c = new Float32x4Array(a.buffer, 16);
  var d = new Float32x4Array(a.buffer, 0, 1);
  var start = 100;
  for (var i = 0; i < b.length; i++) {
    assertEquals(0.0, b[i].x);
    assertEquals(0.0, b[i].y);
    assertEquals(0.0, b[i].z);
    assertEquals(0.0, b[i].w);
  }
  for (var i = 0; i < c.length; i++) {
    assertEquals(0.0, c[i].x);
    assertEquals(0.0, c[i].y);
    assertEquals(0.0, c[i].z);
    assertEquals(0.0, c[i].w);
  }
  for (var i = 0; i < d.length; i++) {
    assertEquals(0.0, d[i].x);
    assertEquals(0.0, d[i].y);
    assertEquals(0.0, d[i].z);
    assertEquals(0.0, d[i].w);
  }
  for (var i = 0; i < a.length; i++) {
    a[i] = i+start;
  }
  for (var i = 0; i < b.length; i++) {
    assertTrue(0.0 != b[i].x);
    assertTrue(0.0 != b[i].y);
    assertTrue(0.0 != b[i].z);
    assertTrue(0.0 != b[i].w);
  }
  for (var i = 0; i < c.length; i++) {
    assertTrue(0.0 != c[i].x);
    assertTrue(0.0 != c[i].y);
    assertTrue(0.0 != c[i].z);
    assertTrue(0.0 != c[i].w);
  }
  for (var i = 0; i < d.length; i++) {
    assertTrue(0.0 != d[i].x);
    assertTrue(0.0 != d[i].y);
    assertTrue(0.0 != d[i].z);
    assertTrue(0.0 != d[i].w);
  }
  assertEquals(start+0, b[0].x);
  assertEquals(start+1, b[0].y);
  assertEquals(start+2, b[0].z);
  assertEquals(start+3, b[0].w);
  assertEquals(start+4, b[1].x);
  assertEquals(start+5, b[1].y);
  assertEquals(start+6, b[1].z);
  assertEquals(start+7, b[1].w);

  assertEquals(start+4, c[0].x);
  assertEquals(start+5, c[0].y);
  assertEquals(start+6, c[0].z);
  assertEquals(start+7, c[0].w);

  assertEquals(start+0, d[0].x);
  assertEquals(start+1, d[0].y);
  assertEquals(start+2, d[0].z);
  assertEquals(start+3, d[0].w);
}

testFloat32x4ArrayViewValues();

function testViewOnFloat32x4Array() {
  var a = new Float32x4Array(4);
  a[0] = SIMD.float32x4(1, 2, 3, 4);
  a[1] = SIMD.float32x4(5, 6, 7, 8);
  a[2] = SIMD.float32x4(9, 10, 11, 12);
  a[3] = SIMD.float32x4(13, 14, 15, 16);
  assertEquals(a[0].x, 1);
  assertEquals(a[0].y, 2);
  assertEquals(a[0].z, 3);
  assertEquals(a[0].w, 4);

  assertEquals(a[1].x, 5);
  assertEquals(a[1].y, 6);
  assertEquals(a[1].z, 7);
  assertEquals(a[1].w, 8);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);
  assertEquals(a[2].z, 11);
  assertEquals(a[2].w, 12);

  assertEquals(a[3].x, 13);
  assertEquals(a[3].y, 14);
  assertEquals(a[3].z, 15);
  assertEquals(a[3].w, 16);

  // Create view on a.
  var b = new Float32Array(a.buffer);
  assertEquals(b.length, 16);
  assertEquals(b.byteLength, 64);
  b[2] = 99.0;
  b[6] = 1.0;

  // Observe changes in "a"
  assertEquals(a[0].x, 1);
  assertEquals(a[0].y, 2);
  assertEquals(a[0].z, 99);
  assertEquals(a[0].w, 4);

  assertEquals(a[1].x, 5);
  assertEquals(a[1].y, 6);
  assertEquals(a[1].z, 1);
  assertEquals(a[1].w, 8);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);
  assertEquals(a[2].z, 11);
  assertEquals(a[2].w, 12);

  assertEquals(a[3].x, 13);
  assertEquals(a[3].y, 14);
  assertEquals(a[3].z, 15);
  assertEquals(a[3].w, 16);
}

testViewOnFloat32x4Array();

function testArrayOfFloat32x4() {
  var a = [];
  var a4 = new Float32x4Array(2);
  for (var i = 0; i < a4.length; i++) {
    a[i] = SIMD.float32x4(i, i + 1, i + 2, i + 3);
    a4[i] = SIMD.float32x4(i, i + 1, i + 2, i + 3);
  }

  for (var i = 0; i < a4.length; i++) {
    assertEquals(a[i].x, a4[i].x);
    assertEquals(a[i].y, a4[i].y);
    assertEquals(a[i].z, a4[i].z);
    assertEquals(a[i].w, a4[i].w);
  }
}

testArrayOfFloat32x4();

function testSIMDAnd() {
  var m = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.float32x4(~1.0, 2.0, 3.0, 4.0);
  o = SIMD.float32x4.and(m,n); // and
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
  var m = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.float32x4(~1.0, 2.0, 3.0, 4.0);
  var o = SIMD.float32x4.or(m,n); // or
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
  var m = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var n = SIMD.float32x4(~1.0, 2.0, 3.0, 4.0);
  var o = SIMD.float32x4.xor(m,n); // xor
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
  var m = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  m = SIMD.float32x4.not(m);
  m = SIMD.float32x4.not(m);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
  assertEquals(3.0, m.z);
  assertEquals(4.0, m.w);
}

testSIMDNot();
testSIMDNot();
%OptimizeFunctionOnNextCall(testSIMDNot);
testSIMDNot();
