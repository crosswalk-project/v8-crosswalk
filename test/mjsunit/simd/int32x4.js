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

// Flags: --simd-object  --allow-natives-syntax

function testConstructor() {
  var u4 = SIMD.Int32x4(1, 2, 3, 4);
  assertEquals(1, SIMD.Int32x4.extractLane(u4, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(u4, 1));
  assertEquals(3, SIMD.Int32x4.extractLane(u4, 2));
  assertEquals(4, SIMD.Int32x4.extractLane(u4, 3));
}

testConstructor();

function testCheck() {
  var u4 = SIMD.Int32x4(1, 2, 3, 4);
  var u4_new = SIMD.Int32x4.check(u4);
  assertEquals(SIMD.Int32x4.extractLane(u4_new, 0), SIMD.Int32x4.extractLane(u4, 0));
  assertEquals(SIMD.Int32x4.extractLane(u4_new, 1), SIMD.Int32x4.extractLane(u4, 1));
  assertEquals(SIMD.Int32x4.extractLane(u4_new, 2), SIMD.Int32x4.extractLane(u4, 2));
  assertEquals(SIMD.Int32x4.extractLane(u4_new, 3), SIMD.Int32x4.extractLane(u4, 3));
}

testCheck();
testCheck();
%OptimizeFunctionOnNextCall(testCheck);
testCheck();

function testZeroConstructor() {
  var u4 = SIMD.Int32x4.zero();
  assertEquals(0, SIMD.Int32x4.extractLane(u4, 0));
  assertEquals(0, SIMD.Int32x4.extractLane(u4, 1));
  assertEquals(0, SIMD.Int32x4.extractLane(u4, 2));
  assertEquals(0, SIMD.Int32x4.extractLane(u4, 3));
}

testZeroConstructor();
testZeroConstructor();
%OptimizeFunctionOnNextCall(testZeroConstructor);
testZeroConstructor();

function testBoolConstructor() {
  var u4 = SIMD.Int32x4.bool(true, false, true, false);
  assertEquals(-1, SIMD.Int32x4.extractLane(u4, 0));
  assertEquals(0, SIMD.Int32x4.extractLane(u4, 1));
  assertEquals(-1, SIMD.Int32x4.extractLane(u4, 2));
  assertEquals(0, SIMD.Int32x4.extractLane(u4, 3));
}

testBoolConstructor();
testBoolConstructor();
%OptimizeFunctionOnNextCall(testBoolConstructor);
testBoolConstructor();

function testSplatConstructor() {
  var u4 = SIMD.Int32x4.splat(4);
  assertEquals(4, SIMD.Int32x4.extractLane(u4, 0));
  assertEquals(4, SIMD.Int32x4.extractLane(u4, 1));
  assertEquals(4, SIMD.Int32x4.extractLane(u4, 2));
  assertEquals(4, SIMD.Int32x4.extractLane(u4, 3));
}

testSplatConstructor();
testSplatConstructor();
%OptimizeFunctionOnNextCall(testSplatConstructor);
testSplatConstructor();

function testTypeof() {
  var u4 = SIMD.Int32x4(1, 2, 3, 4);
  assertEquals(typeof(u4), "object");

  var new_u4 = new SIMD.Int32x4(1, 2, 3, 4);
  assertEquals(typeof(new_u4), "object");
  assertEquals(typeof(new_u4.valueOf()), "object");
  assertEquals(Object.prototype.toString.call(new_u4), "[object Object]");
}

testTypeof();

function testSignMaskGetter() {
  var a = SIMD.Int32x4(0x80000000 - 0xFFFFFFFF - 1, 0x7000000, -1, 0x0);
  assertEquals(0x5, a.signMask);
  var b = SIMD.Int32x4(0x0, 0x0, 0x0, 0x0);
  assertEquals(0x0, b.signMask);
  var c = SIMD.Int32x4(-1, -1, -1, -1);
  assertEquals(0xf, c.signMask);
}

testSignMaskGetter();
testSignMaskGetter();
%OptimizeFunctionOnNextCall(testSignMaskGetter);
testSignMaskGetter();


function testSIMDAnd() {
  var m = SIMD.Int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.Int32x4(0x55555555, 0x55555555, 0x55555555, 0x55555555);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(m, 0));
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(m, 1));
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(m, 2));
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(m, 3));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(n, 0));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(n, 1));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(n, 2));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(n, 3));
  assertEquals(true, n.flagX);
  assertEquals(true, n.flagY);
  assertEquals(true, n.flagZ);
  assertEquals(true, n.flagW);
  o = SIMD.Int32x4.and(m,n); // and
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 3));
  assertEquals(false, o.flagX);
  assertEquals(false, o.flagY);
  assertEquals(false, o.flagZ);
  assertEquals(false, o.flagW);
}

testSIMDAnd();
testSIMDAnd();
%OptimizeFunctionOnNextCall(testSIMDAnd);
testSIMDAnd();

function testSIMDOr() {
  var m = SIMD.Int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.Int32x4(0x55555555, 0x55555555, 0x55555555, 0x55555555);
  var o = SIMD.Int32x4.or(m,n); // or
  assertEquals(-1, SIMD.Int32x4.extractLane(o, 0));
  assertEquals(-1, SIMD.Int32x4.extractLane(o, 1));
  assertEquals(-1, SIMD.Int32x4.extractLane(o, 2));
  assertEquals(-1, SIMD.Int32x4.extractLane(o, 3));
  assertEquals(true, o.flagX);
  assertEquals(true, o.flagY);
  assertEquals(true, o.flagZ);
  assertEquals(true, o.flagW);
}

testSIMDOr();
testSIMDOr();
%OptimizeFunctionOnNextCall(testSIMDOr);
testSIMDOr();

function testSIMDInt32x4Or() {
  var m = SIMD.Int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.Int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var o = SIMD.Int32x4.xor(m,n); // xor
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(o, 3));
  assertEquals(false, o.flagX);
  assertEquals(false, o.flagY);
  assertEquals(false, o.flagZ);
  assertEquals(false, o.flagW);
}

testSIMDInt32x4Or();
testSIMDInt32x4Or();
%OptimizeFunctionOnNextCall(testSIMDInt32x4Or);
testSIMDInt32x4Or();

function testSIMDNot() {
  var m = SIMD.Int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.Int32x4(0x55555555, 0x55555555, 0x55555555, 0x55555555);
  m = SIMD.Int32x4.not(m);
  n = SIMD.Int32x4.not(n);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(n, 0));
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(n, 1));
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(n, 2));
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(n, 3));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(m, 0));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(m, 1));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(m, 2));
  assertEquals(0x55555555, SIMD.Int32x4.extractLane(m, 3));
}

testSIMDNot();
testSIMDNot();
%OptimizeFunctionOnNextCall(testSIMDNot);
testSIMDNot();

function testSIMDNegu32() {
  var m = SIMD.Int32x4(-1, 1, -1, 1);
  m = SIMD.Int32x4.neg(m);
  assertEquals(1, SIMD.Int32x4.extractLane(m, 0));
  assertEquals(-1, SIMD.Int32x4.extractLane(m, 1));
  assertEquals(1, SIMD.Int32x4.extractLane(m, 2));
  assertEquals(-1, SIMD.Int32x4.extractLane(m, 3));
}

testSIMDNegu32();
testSIMDNegu32();
%OptimizeFunctionOnNextCall(testSIMDNegu32);
testSIMDNegu32();

function testSIMDSelect() {
  var m = SIMD.Int32x4.bool(true, true, false, false);
  var t = SIMD.Int32x4(1, 2, 3, 4);
  var f = SIMD.Int32x4(5, 6, 7, 8);
  var s = SIMD.Int32x4.select(m, t, f);
  assertEquals(1, SIMD.Int32x4.extractLane(s, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(s, 1));
  assertEquals(7, SIMD.Int32x4.extractLane(s, 2));
  assertEquals(8, SIMD.Int32x4.extractLane(s, 3));
}

testSIMDSelect();
testSIMDSelect();
%OptimizeFunctionOnNextCall(testSIMDSelect);
testSIMDSelect();


function testSIMDReplaceLaneXu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.replaceLane(a, 0, 20);
    assertEquals(20, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(2, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(3, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(4, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDReplaceLaneXu32();
testSIMDReplaceLaneXu32();
%OptimizeFunctionOnNextCall(testSIMDReplaceLaneXu32);
testSIMDReplaceLaneXu32();

function testSIMDReplaceLaneYu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.replaceLane(a, 1, 20);
    assertEquals(1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(20, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(3, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(4, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDReplaceLaneYu32();
testSIMDReplaceLaneYu32();
%OptimizeFunctionOnNextCall(testSIMDReplaceLaneYu32);
testSIMDReplaceLaneYu32();

function testSIMDReplaceLaneZu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.replaceLane(a, 2, 20);
    assertEquals(1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(2, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(20, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(4, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDReplaceLaneZu32();
testSIMDReplaceLaneZu32();
%OptimizeFunctionOnNextCall(testSIMDReplaceLaneZu32);
testSIMDReplaceLaneZu32();

function testSIMDReplaceLaneWu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.replaceLane(a, 3, 20);
    assertEquals(1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(2, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(3, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(20, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDReplaceLaneWu32();
testSIMDReplaceLaneWu32();
%OptimizeFunctionOnNextCall(testSIMDReplaceLaneWu32);
testSIMDReplaceLaneWu32();

function testSIMDWithFlagX() {
    var a = SIMD.Int32x4.bool(true, false, true, false);

    // boolean
    var c = SIMD.Int32x4.withFlagX(a, true);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    c = SIMD.Int32x4.withFlagX(a, false);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));

    // smi
    c = SIMD.Int32x4.withFlagX(a, 2);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
    c = SIMD.Int32x4.withFlagX(a, 0);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));

    // string
    c = SIMD.Int32x4.withFlagX(a, 'true');
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
    c = SIMD.Int32x4.withFlagX(a, '');
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));

    // heap number
    c = SIMD.Int32x4.withFlagX(a, 3.14);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
    c = SIMD.Int32x4.withFlagX(a, 0.0);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));

    // JS Array
    var array = [1];
    c = SIMD.Int32x4.withFlagX(a, array);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));

    c = SIMD.Int32x4.withFlagX(a, undefined);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDWithFlagX();
testSIMDWithFlagX();
%OptimizeFunctionOnNextCall(testSIMDWithFlagX);
testSIMDWithFlagX();

function testSIMDWithFlagY() {
    var a = SIMD.Int32x4.bool(true, false, true, false);
    var c = SIMD.Int32x4.withFlagY(a, true);
    assertEquals(true, c.flagX);
    assertEquals(true, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    c = SIMD.Int32x4.withFlagY(a, false);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDWithFlagY();
testSIMDWithFlagY();
%OptimizeFunctionOnNextCall(testSIMDWithFlagY);
testSIMDWithFlagY();

function testSIMDWithFlagZ() {
    var a = SIMD.Int32x4.bool(true, false, true, false);
    var c = SIMD.Int32x4.withFlagZ(a, true);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    c = SIMD.Int32x4.withFlagZ(a, false);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(false, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDWithFlagZ();
testSIMDWithFlagZ();
%OptimizeFunctionOnNextCall(testSIMDWithFlagZ);
testSIMDWithFlagZ();

function testSIMDWithFlagW() {
    var a = SIMD.Int32x4.bool(true, false, true, false);
    var c = SIMD.Int32x4.withFlagW(a, true);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(true, c.flagW);
    c = SIMD.Int32x4.withFlagW(a, false);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
    assertEquals(-1, SIMD.Int32x4.extractLane(c, 2));
    assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDWithFlagW();
testSIMDWithFlagW();
%OptimizeFunctionOnNextCall(testSIMDWithFlagW);
testSIMDWithFlagW();

function testSIMDAddu32() {
  var a = SIMD.Int32x4(-1, -1, 0x7fffffff, 0x0);
  var b = SIMD.Int32x4(0x1, -1, 0x1, -1);
  var c = SIMD.Int32x4.add(a, b);
  assertEquals(0x0, SIMD.Int32x4.extractLane(c, 0));
  assertEquals(-2, SIMD.Int32x4.extractLane(c, 1));
  assertEquals(0x80000000 - 0xFFFFFFFF - 1, SIMD.Int32x4.extractLane(c, 2));
  assertEquals(-1, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDAddu32();
testSIMDAddu32();
%OptimizeFunctionOnNextCall(testSIMDAddu32);
testSIMDAddu32();

function testSIMDSubu32() {
  var a = SIMD.Int32x4(-1, -1, 0x80000000 - 0xFFFFFFFF - 1, 0x0);
  var b = SIMD.Int32x4(0x1, -1, 0x1, -1);
  var c = SIMD.Int32x4.sub(a, b);
  assertEquals(-2, SIMD.Int32x4.extractLane(c, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(c, 1));
  assertEquals(0x7FFFFFFF, SIMD.Int32x4.extractLane(c, 2));
  assertEquals(0x1, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDSubu32();
testSIMDSubu32();
%OptimizeFunctionOnNextCall(testSIMDSubu32);
testSIMDSubu32();

function testSIMDMulu32() {
  var a = SIMD.Int32x4(-1, -1, 0x80000000 - 0xFFFFFFFF - 1, 0x0);
  var b = SIMD.Int32x4(0x1, -1, 0x80000000 - 0xFFFFFFFF - 1, -1);
  var c = SIMD.Int32x4.mul(a, b);
  assertEquals(-1, SIMD.Int32x4.extractLane(c, 0));
  assertEquals(0x1, SIMD.Int32x4.extractLane(c, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(c, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDMulu32();
testSIMDMulu32();
%OptimizeFunctionOnNextCall(testSIMDMulu32);
testSIMDMulu32();

function testSIMDSwizzleu32() {
  var m = SIMD.Int32x4(1, 2, 3, 4);
  var xxxx = SIMD.Int32x4.swizzle(m, 0, 0, 0, 0);
  assertEquals(1, SIMD.Int32x4.extractLane(xxxx, 0));
  assertEquals(1, SIMD.Int32x4.extractLane(xxxx, 1));
  assertEquals(1, SIMD.Int32x4.extractLane(xxxx, 2));
  assertEquals(1, SIMD.Int32x4.extractLane(xxxx, 3));
  var yyyy = SIMD.Int32x4.swizzle(m, 1, 1, 1, 1);
  assertEquals(2, SIMD.Int32x4.extractLane(yyyy, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(yyyy, 1));
  assertEquals(2, SIMD.Int32x4.extractLane(yyyy, 2));
  assertEquals(2, SIMD.Int32x4.extractLane(yyyy, 3));
  var zzzz = SIMD.Int32x4.swizzle(m, 2, 2, 2, 2);
  assertEquals(3, SIMD.Int32x4.extractLane(zzzz, 0));
  assertEquals(3, SIMD.Int32x4.extractLane(zzzz, 1));
  assertEquals(3, SIMD.Int32x4.extractLane(zzzz, 2));
  assertEquals(3, SIMD.Int32x4.extractLane(zzzz, 3));
  var wwww = SIMD.Int32x4.swizzle(m, 3, 3, 3, 3);
  assertEquals(4, SIMD.Int32x4.extractLane(wwww, 0));
  assertEquals(4, SIMD.Int32x4.extractLane(wwww, 1));
  assertEquals(4, SIMD.Int32x4.extractLane(wwww, 2));
  assertEquals(4, SIMD.Int32x4.extractLane(wwww, 3));
  var wzyx = SIMD.Int32x4.swizzle(m, 3, 2, 1, 0);
  assertEquals(4, SIMD.Int32x4.extractLane(wzyx, 0));
  assertEquals(3, SIMD.Int32x4.extractLane(wzyx, 1));
  assertEquals(2, SIMD.Int32x4.extractLane(wzyx, 2));
  assertEquals(1, SIMD.Int32x4.extractLane(wzyx, 3));
  var wwzz = SIMD.Int32x4.swizzle(m, 3, 3, 2, 2);
  assertEquals(4, SIMD.Int32x4.extractLane(wwzz, 0));
  assertEquals(4, SIMD.Int32x4.extractLane(wwzz, 1));
  assertEquals(3, SIMD.Int32x4.extractLane(wwzz, 2));
  assertEquals(3, SIMD.Int32x4.extractLane(wwzz, 3));
  var xxyy = SIMD.Int32x4.swizzle(m, 0, 0, 1, 1);
  assertEquals(1, SIMD.Int32x4.extractLane(xxyy, 0));
  assertEquals(1, SIMD.Int32x4.extractLane(xxyy, 1));
  assertEquals(2, SIMD.Int32x4.extractLane(xxyy, 2));
  assertEquals(2, SIMD.Int32x4.extractLane(xxyy, 3));
  var yyww = SIMD.Int32x4.swizzle(m, 1, 1, 3, 3);
  assertEquals(2, SIMD.Int32x4.extractLane(yyww, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(yyww, 1));
  assertEquals(4, SIMD.Int32x4.extractLane(yyww, 2));
  assertEquals(4, SIMD.Int32x4.extractLane(yyww, 3));
}

testSIMDSwizzleu32();
testSIMDSwizzleu32();
%OptimizeFunctionOnNextCall(testSIMDSwizzleu32);
testSIMDSwizzleu32();

function testSIMDShuffle() {
  var a = SIMD.Int32x4(1, 2, 3, 4);
  var b = SIMD.Int32x4(5, 6, 7, 8);
  var xxxx = SIMD.Int32x4.shuffle(a, b, 0, 0, 4, 4);
  assertEquals(1, SIMD.Int32x4.extractLane(xxxx, 0));
  assertEquals(1, SIMD.Int32x4.extractLane(xxxx, 1));
  assertEquals(5, SIMD.Int32x4.extractLane(xxxx, 2));
  assertEquals(5, SIMD.Int32x4.extractLane(xxxx, 3));
  var yyyy = SIMD.Int32x4.shuffle(a, b, 1, 1, 5, 5);
  assertEquals(2, SIMD.Int32x4.extractLane(yyyy, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(yyyy, 1));
  assertEquals(6, SIMD.Int32x4.extractLane(yyyy, 2));
  assertEquals(6, SIMD.Int32x4.extractLane(yyyy, 3));
  var zzzz = SIMD.Int32x4.shuffle(a, b, 2, 2, 6, 6);
  assertEquals(3, SIMD.Int32x4.extractLane(zzzz, 0));
  assertEquals(3, SIMD.Int32x4.extractLane(zzzz, 1));
  assertEquals(7, SIMD.Int32x4.extractLane(zzzz, 2));
  assertEquals(7, SIMD.Int32x4.extractLane(zzzz, 3));
  var wwww = SIMD.Int32x4.shuffle(a, b, 3, 3, 7, 7);
  assertEquals(4, SIMD.Int32x4.extractLane(wwww, 0));
  assertEquals(4, SIMD.Int32x4.extractLane(wwww, 1));
  assertEquals(8, SIMD.Int32x4.extractLane(wwww, 2));
  assertEquals(8, SIMD.Int32x4.extractLane(wwww, 3));
  var wzyx = SIMD.Int32x4.shuffle(a, b, 3, 2, 5, 4);
  assertEquals(4, SIMD.Int32x4.extractLane(wzyx, 0));
  assertEquals(3, SIMD.Int32x4.extractLane(wzyx, 1));
  assertEquals(6, SIMD.Int32x4.extractLane(wzyx, 2));
  assertEquals(5, SIMD.Int32x4.extractLane(wzyx, 3));
  var wwzz = SIMD.Int32x4.shuffle(a, b, 3, 3, 6, 6);
  assertEquals(4, SIMD.Int32x4.extractLane(wwzz, 0));
  assertEquals(4, SIMD.Int32x4.extractLane(wwzz, 1));
  assertEquals(7, SIMD.Int32x4.extractLane(wwzz, 2));
  assertEquals(7, SIMD.Int32x4.extractLane(wwzz, 3));
  var xxyy = SIMD.Int32x4.shuffle(a, b, 0, 0, 5, 5);
  assertEquals(1, SIMD.Int32x4.extractLane(xxyy, 0));
  assertEquals(1, SIMD.Int32x4.extractLane(xxyy, 1));
  assertEquals(6, SIMD.Int32x4.extractLane(xxyy, 2));
  assertEquals(6, SIMD.Int32x4.extractLane(xxyy, 3));
  var yyww = SIMD.Int32x4.shuffle(a, b, 1, 1, 7, 7);
  assertEquals(2, SIMD.Int32x4.extractLane(yyww, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(yyww, 1));
  assertEquals(8, SIMD.Int32x4.extractLane(yyww, 2));
  assertEquals(8, SIMD.Int32x4.extractLane(yyww, 3));
}

testSIMDShuffle();
testSIMDShuffle();
%OptimizeFunctionOnNextCall(testSIMDShuffle);
testSIMDShuffle();

function testSIMDComparisons() {
  var m = SIMD.Int32x4(1, 2, 100, 1);
  var n = SIMD.Int32x4(2, 2, 1, 100);
  var cmp;
  cmp = SIMD.Int32x4.lessThan(m, n);
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 3));

  cmp = SIMD.Int32x4.equal(m, n);
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 3));

  cmp = SIMD.Int32x4.greaterThan(m, n);
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 0));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 1));
  assertEquals(-1, SIMD.Int32x4.extractLane(cmp, 2));
  assertEquals(0x0, SIMD.Int32x4.extractLane(cmp, 3));
}

testSIMDComparisons();
testSIMDComparisons();
%OptimizeFunctionOnNextCall(testSIMDComparisons);
testSIMDComparisons();

function testSIMDShift() {
  var m = SIMD.Int32x4(1, 2, 100, 0);

  var a = SIMD.Int32x4.shiftLeftByScalar(m, 2);
  assertEquals(4, SIMD.Int32x4.extractLane(a, 0));
  assertEquals(8, SIMD.Int32x4.extractLane(a, 1));
  assertEquals(400, SIMD.Int32x4.extractLane(a, 2));
  assertEquals(0, SIMD.Int32x4.extractLane(a, 3));

  var b = SIMD.Int32x4.shiftRightLogicalByScalar(a, 2);
  assertEquals(1, SIMD.Int32x4.extractLane(b, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(b, 1));
  assertEquals(100, SIMD.Int32x4.extractLane(b, 2));
  assertEquals(0, SIMD.Int32x4.extractLane(b, 3));

  var n = SIMD.Int32x4(-8, 2, 1, 100);

  var c = SIMD.Int32x4.shiftRightArithmeticByScalar(n, 2);
  assertEquals(-2, SIMD.Int32x4.extractLane(c, 0));
  assertEquals(0, SIMD.Int32x4.extractLane(c, 1));
  assertEquals(0, SIMD.Int32x4.extractLane(c, 2));
  assertEquals(25, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDShift();
testSIMDShift();
%OptimizeFunctionOnNextCall(testSIMDShift);
testSIMDShift();

function testSIMDFromFloat64x2() {
  var m = SIMD.Int32x4(9, 10, 11, 12);
  var nMask = SIMD.Float64x2.fromInt32x4(m);
  var n = SIMD.Int32x4.fromFloat64x2(nMask);

  assertEquals(9, SIMD.Int32x4.extractLane(n, 0));
  assertEquals(10, SIMD.Int32x4.extractLane(n, 1));
  assertEquals(0, SIMD.Int32x4.extractLane(n, 2));
  assertEquals(0, SIMD.Int32x4.extractLane(n, 3));
}

testSIMDFromFloat64x2();

function testSIMDFromFloat64x2Bits() {
  var m = SIMD.Int32x4(9, 10, 11, 12);
  var nMask = SIMD.Float64x2.fromInt32x4Bits(m);
  var n = SIMD.Int32x4.fromFloat64x2Bits(nMask);

  assertEquals(9, SIMD.Int32x4.extractLane(n, 0));
  assertEquals(10, SIMD.Int32x4.extractLane(n, 1));
  assertEquals(11, SIMD.Int32x4.extractLane(n, 2));
  assertEquals(12, SIMD.Int32x4.extractLane(n, 3));
}

testSIMDFromFloat64x2Bits();

function testSIMDExtractLane() {
  var m = SIMD.Int32x4(1, 2, 3, 4);
  var x = SIMD.Int32x4.extractLane(m, 0);
  var y = SIMD.Int32x4.extractLane(m ,1);
  var z = SIMD.Int32x4.extractLane(m ,2);
  var w = SIMD.Int32x4.extractLane(m ,3);

  assertEquals(1, x);
  assertEquals(2, y);
  assertEquals(3, z);
  assertEquals(4, w);
}

testSIMDExtractLane();
testSIMDExtractLane();
%OptimizeFunctionOnNextCall(testSIMDExtractLane);
testSIMDExtractLane();

function testSIMDReplaceLane() {
  var m = SIMD.Int32x4(1, 2, 3, 4);
  var a = SIMD.Int32x4.replaceLane(m, 0, 5);
  var b = SIMD.Int32x4.replaceLane(m, 1, 6);
  var c = SIMD.Int32x4.replaceLane(m, 2, 7);
  var d = SIMD.Int32x4.replaceLane(m, 3, 8);

  assertEquals(5, SIMD.Int32x4.extractLane(a, 0));
  assertEquals(6, SIMD.Int32x4.extractLane(b, 1));
  assertEquals(7, SIMD.Int32x4.extractLane(c, 2));
  assertEquals(8, SIMD.Int32x4.extractLane(d, 3));
}

testSIMDReplaceLane();
testSIMDReplaceLane();
%OptimizeFunctionOnNextCall(testSIMDReplaceLane);
testSIMDReplaceLane();
