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
  var f4 = SIMD.Float64x2(1.0, 2.0);
  assertEquals(1.0, f4.x);
  assertEquals(2.0, f4.y);

  f4 = SIMD.Float64x2(1.1, 2.2);
  assertEquals(1.1, f4.x);
  assertEquals(2.2, f4.y);
}

testConstructor();
testConstructor();
%OptimizeFunctionOnNextCall(testConstructor);
testConstructor();

function testCheck() {
  var f2 = SIMD.Float64x2(1.0, 2.0);
  var f2_new = SIMD.Float64x2.check(f2);
  assertEquals(f2_new.x, f2.x);
  assertEquals(f2_new.y, f2.y);

  f2 = SIMD.Float64x2(1.1, 2.2);
  f2_new = SIMD.Float64x2.check(f2);
  assertEquals(f2_new.x, f2.x);
  assertEquals(f2_new.y, f2.y);
}

testCheck();
testCheck();
%OptimizeFunctionOnNextCall(testCheck);
testCheck();

function testZeroConstructor() {
  var z4 = SIMD.Float64x2.zero();
  assertEquals(0.0, z4.x);
  assertEquals(0.0, z4.y);
}

testZeroConstructor();
testZeroConstructor();
%OptimizeFunctionOnNextCall(testZeroConstructor);
testZeroConstructor();

function testSplatConstructor() {
  var z4 = SIMD.Float64x2.splat(5.0);
  assertEquals(5.0, z4.x);
  assertEquals(5.0, z4.y);
}

testSplatConstructor();
testSplatConstructor();
%OptimizeFunctionOnNextCall(testSplatConstructor);
testSplatConstructor();

function testTypeof() {
  var z4 = SIMD.Float64x2.zero();
  assertEquals(typeof(z4), "object");

  var new_z4 = new SIMD.Float64x2(0, 0);
  assertEquals(typeof(new_z4), "object");
  assertEquals(typeof(new_z4.valueOf()), "object");
  assertEquals(Object.prototype.toString.call(new_z4), "[object Object]");
}

testTypeof();

function testSignMaskGetter() {
  var a = SIMD.Float64x2(-1.0, -2.0);
  assertEquals(0x3, a.signMask);
  var b = SIMD.Float64x2(1.0, 2.0);
  assertEquals(0x0, b.signMask);
  var c = SIMD.Float64x2(1.0, -2.0);
  assertEquals(0x2, c.signMask);
}

testSignMaskGetter();
testSignMaskGetter();
%OptimizeFunctionOnNextCall(testSignMaskGetter);
testSignMaskGetter();

function testSIMDAbs() {
  var a4 = SIMD.Float64x2(1.0, -1.0);
  var b4 = SIMD.Float64x2.abs(a4);

  assertEquals(1.0, b4.x);
  assertEquals(1.0, b4.y);
}

testSIMDAbs();
testSIMDAbs();
%OptimizeFunctionOnNextCall(testSIMDAbs);
testSIMDAbs();

function testSIMDNeg() {
  var a4 = SIMD.Float64x2(1.0, -1.0);
  var b4 = SIMD.Float64x2.neg(a4);

  assertEquals(-1.0, b4.x);
  assertEquals(1.0, b4.y);
}

testSIMDNeg();
testSIMDNeg();
%OptimizeFunctionOnNextCall(testSIMDNeg);
testSIMDNeg();

function testSIMDAdd() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.add(a4, b4);

  assertEquals(3.0, c4.x);
  assertEquals(3.0, c4.y);
}

testSIMDAdd();
testSIMDAdd();
%OptimizeFunctionOnNextCall(testSIMDAdd);
testSIMDAdd();

function testSIMDSub() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.sub(a4, b4);

  assertEquals(-1.0, c4.x);
  assertEquals(-1.0, c4.y);
}

testSIMDSub();
testSIMDSub();
%OptimizeFunctionOnNextCall(testSIMDSub);
testSIMDSub();

function testSIMDMul() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.mul(a4, b4);

  assertEquals(2.0, c4.x);
  assertEquals(2.0, c4.y);
}

testSIMDMul();
testSIMDMul();
%OptimizeFunctionOnNextCall(testSIMDMul);
testSIMDMul();

function testSIMDDiv() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.div(a4, b4);

  assertEquals(0.5, c4.x);
  assertEquals(0.5, c4.y);
}

testSIMDDiv();
testSIMDDiv();
%OptimizeFunctionOnNextCall(testSIMDDiv);
testSIMDDiv();

function testSIMDClamp() {
  var m = SIMD.Float64x2(1.0, -2.0);
  var lo = SIMD.Float64x2(0.0, 0.0);
  var hi = SIMD.Float64x2(2.0, 2.0);
  m = SIMD.Float64x2.clamp(m, lo, hi);
  assertEquals(1.0, m.x);
  assertEquals(0.0, m.y);
}

testSIMDClamp();
testSIMDClamp();
%OptimizeFunctionOnNextCall(testSIMDClamp);
testSIMDClamp();

function testSIMDMin() {
  var m = SIMD.Float64x2(1.0, 2.0);
  var n = SIMD.Float64x2(1.0, 0.0);
  m = SIMD.Float64x2.min(m, n);
  assertEquals(1.0, m.x);
  assertEquals(0.0, m.y);
}

testSIMDMin();
testSIMDMin();
%OptimizeFunctionOnNextCall(testSIMDMin);
testSIMDMin();

function testSIMDMax() {
  var m = SIMD.Float64x2(1.0, 2.0);
  var n = SIMD.Float64x2(1.0, 0.0);
  m = SIMD.Float64x2.max(m, n);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
}

testSIMDMax();
testSIMDMax();
%OptimizeFunctionOnNextCall(testSIMDMax);
testSIMDMax();

function testSIMDScale() {
  var m = SIMD.Float64x2(1.0, -2.0);
  m = SIMD.Float64x2.scale(m, 20.0);
  assertEquals(20.0, m.x);
  assertEquals(-40.0, m.y);
}

testSIMDScale();
testSIMDScale();
%OptimizeFunctionOnNextCall(testSIMDScale);
testSIMDScale();

function testSIMDSqrt() {
  var m = SIMD.Float64x2(1.0, 4.0);
  m = SIMD.Float64x2.sqrt(m);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
}

testSIMDSqrt();
testSIMDSqrt();
%OptimizeFunctionOnNextCall(testSIMDSqrt);
testSIMDSqrt();

function testSIMDSetters() {
  var f = SIMD.Float64x2.zero();
  assertEquals(0.0, f.x);
  assertEquals(0.0, f.y);
  f = SIMD.Float64x2.withX(f, 4.0);
  assertEquals(4.0, f.x);
  f = SIMD.Float64x2.withY(f, 3.0);
  assertEquals(3.0, f.y);
}

testSIMDSetters();
testSIMDSetters();
%OptimizeFunctionOnNextCall(testSIMDSetters);
testSIMDSetters();

function testSIMDShuffle() {
  var a = SIMD.Float64x2(1.0, 2.0);
  var b = SIMD.Float64x2(3.0, 4.0);
  var xx = SIMD.Float64x2.shuffle(a, b, 0, 2);
  var xy = SIMD.Float64x2.shuffle(a, b, 0, 3);
  var yx = SIMD.Float64x2.shuffle(a, b, 1, 2);
  var yy = SIMD.Float64x2.shuffle(a, b, 1, 3);

  assertEquals(xx.x, 1.0);
  assertEquals(xx.y, 3.0);
  assertEquals(xy.x, 1.0);
  assertEquals(xy.y, 4.0);
  assertEquals(yx.x, 2.0);
  assertEquals(yx.y, 3.0);
  assertEquals(yy.x, 2.0);
  assertEquals(yy.y, 4.0);
}

testSIMDShuffle();

function testSIMDSwizzle() {
  var a = SIMD.Float64x2(1.0, 2.0);
  var xx = SIMD.Float64x2.swizzle(a, 0, 0);
  var xy = SIMD.Float64x2.swizzle(a, 0, 1);
  var yx = SIMD.Float64x2.swizzle(a, 1, 0);
  var yy = SIMD.Float64x2.swizzle(a, 1, 1);

  assertEquals(xx.x, 1.0);
  assertEquals(xx.y, 1.0);
  assertEquals(xy.x, 1.0);
  assertEquals(xy.y, 2.0);
  assertEquals(yx.x, 2.0);
  assertEquals(yx.y, 1.0);
  assertEquals(yy.x, 2.0);
  assertEquals(yy.y, 2.0);
}

testSIMDSwizzle();
