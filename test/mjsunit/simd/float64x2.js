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
  assertEquals(1.0, SIMD.Float64x2.extractLane(f4, 0));
  assertEquals(2.0, SIMD.Float64x2.extractLane(f4, 1));

  f4 = SIMD.Float64x2(1.1, 2.2);
  assertEquals(1.1, SIMD.Float64x2.extractLane(f4, 0));
  assertEquals(2.2, SIMD.Float64x2.extractLane(f4, 1));
}

testConstructor();
testConstructor();
%OptimizeFunctionOnNextCall(testConstructor);
testConstructor();

function testCheck() {
  var f2 = SIMD.Float64x2(1.0, 2.0);
  var f2_new = SIMD.Float64x2.check(f2);
  assertEquals(SIMD.Float64x2.extractLane(f2_new, 0), SIMD.Float64x2.extractLane(f2, 0));
  assertEquals(SIMD.Float64x2.extractLane(f2_new, 1), SIMD.Float64x2.extractLane(f2, 1));

  f2 = SIMD.Float64x2(1.1, 2.2);
  f2_new = SIMD.Float64x2.check(f2);
  assertEquals(SIMD.Float64x2.extractLane(f2_new, 0), SIMD.Float64x2.extractLane(f2, 0));
  assertEquals(SIMD.Float64x2.extractLane(f2_new, 1), SIMD.Float64x2.extractLane(f2, 1));
}

testCheck();
testCheck();
%OptimizeFunctionOnNextCall(testCheck);
testCheck();

function testZeroConstructor() {
  var z4 = SIMD.Float64x2.zero();
  assertEquals(0.0, SIMD.Float64x2.extractLane(z4, 0));
  assertEquals(0.0, SIMD.Float64x2.extractLane(z4, 1));
}

testZeroConstructor();
testZeroConstructor();
%OptimizeFunctionOnNextCall(testZeroConstructor);
testZeroConstructor();

function testSplatConstructor() {
  var z4 = SIMD.Float64x2.splat(5.0);
  assertEquals(5.0, SIMD.Float64x2.extractLane(z4, 0));
  assertEquals(5.0, SIMD.Float64x2.extractLane(z4, 1));
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

  assertEquals(1.0, SIMD.Float64x2.extractLane(b4, 0));
  assertEquals(1.0, SIMD.Float64x2.extractLane(b4, 1));
}

testSIMDAbs();
testSIMDAbs();
%OptimizeFunctionOnNextCall(testSIMDAbs);
testSIMDAbs();

function testSIMDNeg() {
  var a4 = SIMD.Float64x2(1.0, -1.0);
  var b4 = SIMD.Float64x2.neg(a4);

  assertEquals(-1.0, SIMD.Float64x2.extractLane(b4, 0));
  assertEquals(1.0, SIMD.Float64x2.extractLane(b4, 1));
}

testSIMDNeg();
testSIMDNeg();
%OptimizeFunctionOnNextCall(testSIMDNeg);
testSIMDNeg();

function testSIMDAdd() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.add(a4, b4);

  assertEquals(3.0, SIMD.Float64x2.extractLane(c4, 0));
  assertEquals(3.0, SIMD.Float64x2.extractLane(c4, 1));
}

testSIMDAdd();
testSIMDAdd();
%OptimizeFunctionOnNextCall(testSIMDAdd);
testSIMDAdd();

function testSIMDSub() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.sub(a4, b4);

  assertEquals(-1.0, SIMD.Float64x2.extractLane(c4, 0));
  assertEquals(-1.0, SIMD.Float64x2.extractLane(c4, 1));
}

testSIMDSub();
testSIMDSub();
%OptimizeFunctionOnNextCall(testSIMDSub);
testSIMDSub();

function testSIMDMul() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.mul(a4, b4);

  assertEquals(2.0, SIMD.Float64x2.extractLane(c4, 0));
  assertEquals(2.0, SIMD.Float64x2.extractLane(c4, 1));
}

testSIMDMul();
testSIMDMul();
%OptimizeFunctionOnNextCall(testSIMDMul);
testSIMDMul();

function testSIMDDiv() {
  var a4 = SIMD.Float64x2(1.0, 1.0);
  var b4 = SIMD.Float64x2(2.0, 2.0);
  var c4 = SIMD.Float64x2.div(a4, b4);

  assertEquals(0.5, SIMD.Float64x2.extractLane(c4, 0));
  assertEquals(0.5, SIMD.Float64x2.extractLane(c4, 1));
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
  assertEquals(1.0, SIMD.Float64x2.extractLane(m, 0));
  assertEquals(0.0, SIMD.Float64x2.extractLane(m, 1));
}

testSIMDClamp();
testSIMDClamp();
%OptimizeFunctionOnNextCall(testSIMDClamp);
testSIMDClamp();

function testSIMDMin() {
  var m = SIMD.Float64x2(1.0, 2.0);
  var n = SIMD.Float64x2(1.0, 0.0);
  m = SIMD.Float64x2.min(m, n);
  assertEquals(1.0, SIMD.Float64x2.extractLane(m, 0));
  assertEquals(0.0, SIMD.Float64x2.extractLane(m, 1));
}

testSIMDMin();
testSIMDMin();
%OptimizeFunctionOnNextCall(testSIMDMin);
testSIMDMin();

function testSIMDMax() {
  var m = SIMD.Float64x2(1.0, 2.0);
  var n = SIMD.Float64x2(1.0, 0.0);
  m = SIMD.Float64x2.max(m, n);
  assertEquals(1.0, SIMD.Float64x2.extractLane(m, 0));
  assertEquals(2.0, SIMD.Float64x2.extractLane(m, 1));
}

testSIMDMax();
testSIMDMax();
%OptimizeFunctionOnNextCall(testSIMDMax);
testSIMDMax();

function testSIMDScale() {
  var m = SIMD.Float64x2(1.0, -2.0);
  m = SIMD.Float64x2.scale(m, 20.0);
  assertEquals(20.0, SIMD.Float64x2.extractLane(m, 0));
  assertEquals(-40.0, SIMD.Float64x2.extractLane(m, 1));
}

testSIMDScale();
testSIMDScale();
%OptimizeFunctionOnNextCall(testSIMDScale);
testSIMDScale();

function testSIMDSqrt() {
  var m = SIMD.Float64x2(1.0, 4.0);
  m = SIMD.Float64x2.sqrt(m);
  assertEquals(1.0, SIMD.Float64x2.extractLane(m, 0));
  assertEquals(2.0, SIMD.Float64x2.extractLane(m, 1));
}

testSIMDSqrt();
testSIMDSqrt();
%OptimizeFunctionOnNextCall(testSIMDSqrt);
testSIMDSqrt();

function testSIMDSetters() {
  var f = SIMD.Float64x2.zero();
  assertEquals(0.0, SIMD.Float64x2.extractLane(f, 0));
  assertEquals(0.0, SIMD.Float64x2.extractLane(f, 1));
  f = SIMD.Float64x2.replaceLane(f, 0, 4.0);
  assertEquals(4.0, SIMD.Float64x2.extractLane(f, 0));
  f = SIMD.Float64x2.replaceLane(f, 1, 3.0);
  assertEquals(3.0, SIMD.Float64x2.extractLane(f, 1));
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
  var yx = SIMD.Float64x2.shuffle(a, b, 1, 0);
  var yy = SIMD.Float64x2.shuffle(a, b, 1, 3);

  assertEquals(1.0, SIMD.Float64x2.extractLane(xx, 0));
  assertEquals(3.0, SIMD.Float64x2.extractLane(xx, 1));
  assertEquals(1.0, SIMD.Float64x2.extractLane(xy, 0));
  assertEquals(4.0, SIMD.Float64x2.extractLane(xy, 1));
  assertEquals(2.0, SIMD.Float64x2.extractLane(yx, 0));
  assertEquals(1.0, SIMD.Float64x2.extractLane(yx, 1));
  assertEquals(2.0, SIMD.Float64x2.extractLane(yy, 0));
  assertEquals(4.0, SIMD.Float64x2.extractLane(yy, 1));
}

testSIMDShuffle();
testSIMDShuffle();
%OptimizeFunctionOnNextCall(testSIMDShuffle);
testSIMDShuffle();

function testSIMDSwizzle() {
  var a = SIMD.Float64x2(1.0, 2.0);
  var xx = SIMD.Float64x2.swizzle(a, 0, 0);
  var xy = SIMD.Float64x2.swizzle(a, 0, 1);
  var yx = SIMD.Float64x2.swizzle(a, 1, 0);
  var yy = SIMD.Float64x2.swizzle(a, 1, 1);
  assertEquals(1.0, SIMD.Float64x2.extractLane(xx, 0));
  assertEquals(1.0, SIMD.Float64x2.extractLane(xx, 1));
  assertEquals(1.0, SIMD.Float64x2.extractLane(xy, 0));
  assertEquals(2.0, SIMD.Float64x2.extractLane(xy, 1));
  assertEquals(2.0, SIMD.Float64x2.extractLane(yx, 0));
  assertEquals(1.0, SIMD.Float64x2.extractLane(yx, 1));
  assertEquals(2.0, SIMD.Float64x2.extractLane(yy, 0));
  assertEquals(2.0, SIMD.Float64x2.extractLane(yy, 1));
}

testSIMDSwizzle();
testSIMDSwizzle();
%OptimizeFunctionOnNextCall(testSIMDSwizzle);
testSIMDSwizzle();

function testSIMDExtractLane() {
  var m = SIMD.Float64x2(1.0, 2.0);
  var x = SIMD.Float64x2.extractLane(m, 0);
  var y = SIMD.Float64x2.extractLane(m ,1);

  assertEquals(1.0, x);
  assertEquals(2.0, y);
}

testSIMDExtractLane();


function testSIMDReplaceLane() {
  var m = SIMD.Float64x2(1.0, 2.0);
  var a = SIMD.Float64x2.replaceLane(m, 0, 5.0);
  var b = SIMD.Float64x2.replaceLane(m, 1, 6.0);

  assertEquals(5.0, SIMD.Float64x2.extractLane(a, 0));
  assertEquals(6.0, SIMD.Float64x2.extractLane(b, 1));
}

testSIMDReplaceLane();
