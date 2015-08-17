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
  assertEquals(1, u4.x);
  assertEquals(2, u4.y);
  assertEquals(3, u4.z);
  assertEquals(4, u4.w);
}

testConstructor();

function testCheck() {
  var u4 = SIMD.Int32x4(1, 2, 3, 4);
  var u4_new = SIMD.Int32x4.check(u4);
  assertEquals(u4_new.x, u4.x);
  assertEquals(u4_new.y, u4.y);
  assertEquals(u4_new.z, u4.z);
  assertEquals(u4_new.w, u4.w);
}

testCheck();
testCheck();
%OptimizeFunctionOnNextCall(testCheck);
testCheck();

function testZeroConstructor() {
  var u4 = SIMD.Int32x4.zero();
  assertEquals(0, u4.x);
  assertEquals(0, u4.y);
  assertEquals(0, u4.z);
  assertEquals(0, u4.w);
}

testZeroConstructor();
testZeroConstructor();
%OptimizeFunctionOnNextCall(testZeroConstructor);
testZeroConstructor();

function testBoolConstructor() {
  var u4 = SIMD.Int32x4.bool(true, false, true, false);
  assertEquals(-1, u4.x);
  assertEquals(0, u4.y);
  assertEquals(-1, u4.z);
  assertEquals(0, u4.w);
}

testBoolConstructor();
testBoolConstructor();
%OptimizeFunctionOnNextCall(testBoolConstructor);
testBoolConstructor();

function testSplatConstructor() {
  var u4 = SIMD.Int32x4.splat(4);
  assertEquals(4, u4.x);
  assertEquals(4, u4.y);
  assertEquals(4, u4.z);
  assertEquals(4, u4.w);
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
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, m.x);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, m.y);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, m.z);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, m.w);
  assertEquals(0x55555555, n.x);
  assertEquals(0x55555555, n.y);
  assertEquals(0x55555555, n.z);
  assertEquals(0x55555555, n.w);
  assertEquals(true, n.flagX);
  assertEquals(true, n.flagY);
  assertEquals(true, n.flagZ);
  assertEquals(true, n.flagW);
  o = SIMD.Int32x4.and(m,n); // and
  assertEquals(0x0, o.x);
  assertEquals(0x0, o.y);
  assertEquals(0x0, o.z);
  assertEquals(0x0, o.w);
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
  assertEquals(-1, o.x);
  assertEquals(-1, o.y);
  assertEquals(-1, o.z);
  assertEquals(-1, o.w);
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
  assertEquals(0x0, o.x);
  assertEquals(0x0, o.y);
  assertEquals(0x0, o.z);
  assertEquals(0x0, o.w);
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
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, n.x);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, n.y);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, n.z);
  assertEquals(0xAAAAAAAA - 0xFFFFFFFF - 1, n.w);
  assertEquals(0x55555555, m.x);
  assertEquals(0x55555555, m.y);
  assertEquals(0x55555555, m.z);
  assertEquals(0x55555555, m.w);
}

testSIMDNot();
testSIMDNot();
%OptimizeFunctionOnNextCall(testSIMDNot);
testSIMDNot();

function testSIMDNegu32() {
  var m = SIMD.Int32x4(-1, 1, -1, 1);
  m = SIMD.Int32x4.neg(m);
  assertEquals(1, m.x);
  assertEquals(-1, m.y);
  assertEquals(1, m.z);
  assertEquals(-1, m.w);
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
  assertEquals(1, s.x);
  assertEquals(2, s.y);
  assertEquals(7, s.z);
  assertEquals(8, s.w);
}

testSIMDSelect();
testSIMDSelect();
%OptimizeFunctionOnNextCall(testSIMDSelect);
testSIMDSelect();


function testSIMDWithXu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.withX(a, 20);
    assertEquals(20, c.x);
    assertEquals(2, c.y);
    assertEquals(3, c.z);
    assertEquals(4, c.w);
}

testSIMDWithXu32();
testSIMDWithXu32();
%OptimizeFunctionOnNextCall(testSIMDWithXu32);
testSIMDWithXu32();

function testSIMDWithYu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.withY(a, 20);
    assertEquals(1, c.x);
    assertEquals(20, c.y);
    assertEquals(3, c.z);
    assertEquals(4, c.w);
}

testSIMDWithYu32();
testSIMDWithYu32();
%OptimizeFunctionOnNextCall(testSIMDWithYu32);
testSIMDWithYu32();

function testSIMDWithZu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.withZ(a, 20);
    assertEquals(1, c.x);
    assertEquals(2, c.y);
    assertEquals(20, c.z);
    assertEquals(4, c.w);
}

testSIMDWithZu32();
testSIMDWithZu32();
%OptimizeFunctionOnNextCall(testSIMDWithZu32);
testSIMDWithZu32();

function testSIMDWithWu32() {
    var a = SIMD.Int32x4(1, 2, 3, 4);
    var c = SIMD.Int32x4.withW(a, 20);
    assertEquals(1, c.x);
    assertEquals(2, c.y);
    assertEquals(3, c.z);
    assertEquals(20, c.w);
}

testSIMDWithWu32();
testSIMDWithWu32();
%OptimizeFunctionOnNextCall(testSIMDWithWu32);
testSIMDWithWu32();

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
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    // smi
    c = SIMD.Int32x4.withFlagX(a, 2);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
    c = SIMD.Int32x4.withFlagX(a, 0);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    // string
    c = SIMD.Int32x4.withFlagX(a, 'true');
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
    c = SIMD.Int32x4.withFlagX(a, '');
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    // heap number
    c = SIMD.Int32x4.withFlagX(a, 3.14);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
    c = SIMD.Int32x4.withFlagX(a, 0.0);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    // JS Array
    var array = [1];
    c = SIMD.Int32x4.withFlagX(a, array);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    c = SIMD.Int32x4.withFlagX(a, undefined);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
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
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
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
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(0x0, c.z);
    assertEquals(0x0, c.w);
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
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
}

testSIMDWithFlagW();
testSIMDWithFlagW();
%OptimizeFunctionOnNextCall(testSIMDWithFlagW);
testSIMDWithFlagW();

function testSIMDAddu32() {
  var a = SIMD.Int32x4(-1, -1, 0x7fffffff, 0x0);
  var b = SIMD.Int32x4(0x1, -1, 0x1, -1);
  var c = SIMD.Int32x4.add(a, b);
  assertEquals(0x0, c.x);
  assertEquals(-2, c.y);
  assertEquals(0x80000000 - 0xFFFFFFFF - 1, c.z);
  assertEquals(-1, c.w);
}

testSIMDAddu32();
testSIMDAddu32();
%OptimizeFunctionOnNextCall(testSIMDAddu32);
testSIMDAddu32();

function testSIMDSubu32() {
  var a = SIMD.Int32x4(-1, -1, 0x80000000 - 0xFFFFFFFF - 1, 0x0);
  var b = SIMD.Int32x4(0x1, -1, 0x1, -1);
  var c = SIMD.Int32x4.sub(a, b);
  assertEquals(-2, c.x);
  assertEquals(0x0, c.y);
  assertEquals(0x7FFFFFFF, c.z);
  assertEquals(0x1, c.w);
}

testSIMDSubu32();
testSIMDSubu32();
%OptimizeFunctionOnNextCall(testSIMDSubu32);
testSIMDSubu32();

function testSIMDMulu32() {
  var a = SIMD.Int32x4(-1, -1, 0x80000000 - 0xFFFFFFFF - 1, 0x0);
  var b = SIMD.Int32x4(0x1, -1, 0x80000000 - 0xFFFFFFFF - 1, -1);
  var c = SIMD.Int32x4.mul(a, b);
  assertEquals(-1, c.x);
  assertEquals(0x1, c.y);
  assertEquals(0x0, c.z);
  assertEquals(0x0, c.w);
}

testSIMDMulu32();
testSIMDMulu32();
%OptimizeFunctionOnNextCall(testSIMDMulu32);
testSIMDMulu32();

function testSIMDSwizzleu32() {
  var m = SIMD.Int32x4(1, 2, 3, 4);
  var xxxx = SIMD.Int32x4.swizzle(m, 0, 0, 0, 0);
  assertEquals(1, xxxx.x);
  assertEquals(1, xxxx.y);
  assertEquals(1, xxxx.z);
  assertEquals(1, xxxx.w);
  var yyyy = SIMD.Int32x4.swizzle(m, 1, 1, 1, 1);
  assertEquals(2, yyyy.x);
  assertEquals(2, yyyy.y);
  assertEquals(2, yyyy.z);
  assertEquals(2, yyyy.w);
  var zzzz = SIMD.Int32x4.swizzle(m, 2, 2, 2, 2);
  assertEquals(3, zzzz.x);
  assertEquals(3, zzzz.y);
  assertEquals(3, zzzz.z);
  assertEquals(3, zzzz.w);
  var wwww = SIMD.Int32x4.swizzle(m, 3, 3, 3, 3);
  assertEquals(4, wwww.x);
  assertEquals(4, wwww.y);
  assertEquals(4, wwww.z);
  assertEquals(4, wwww.w);
  var wzyx = SIMD.Int32x4.swizzle(m, 3, 2, 1, 0);
  assertEquals(4, wzyx.x);
  assertEquals(3, wzyx.y);
  assertEquals(2, wzyx.z);
  assertEquals(1, wzyx.w);
  var wwzz = SIMD.Int32x4.swizzle(m, 3, 3, 2, 2);
  assertEquals(4, wwzz.x);
  assertEquals(4, wwzz.y);
  assertEquals(3, wwzz.z);
  assertEquals(3, wwzz.w);
  var xxyy = SIMD.Int32x4.swizzle(m, 0, 0, 1, 1);
  assertEquals(1, xxyy.x);
  assertEquals(1, xxyy.y);
  assertEquals(2, xxyy.z);
  assertEquals(2, xxyy.w);
  var yyww = SIMD.Int32x4.swizzle(m, 1, 1, 3, 3);
  assertEquals(2, yyww.x);
  assertEquals(2, yyww.y);
  assertEquals(4, yyww.z);
  assertEquals(4, yyww.w);
}

testSIMDSwizzleu32();
testSIMDSwizzleu32();
%OptimizeFunctionOnNextCall(testSIMDSwizzleu32);
testSIMDSwizzleu32();

function testSIMDShuffle() {
  var a = SIMD.Int32x4(1, 2, 3, 4);
  var b = SIMD.Int32x4(5, 6, 7, 8);
  var xxxx = SIMD.Int32x4.shuffle(a, b, 0, 0, 4, 4);
  assertEquals(1, xxxx.x);
  assertEquals(1, xxxx.y);
  assertEquals(5, xxxx.z);
  assertEquals(5, xxxx.w);
  var yyyy = SIMD.Int32x4.shuffle(a, b, 1, 1, 5, 5);
  assertEquals(2, yyyy.x);
  assertEquals(2, yyyy.y);
  assertEquals(6, yyyy.z);
  assertEquals(6, yyyy.w);
  var zzzz = SIMD.Int32x4.shuffle(a, b, 2, 2, 6, 6);
  assertEquals(3, zzzz.x);
  assertEquals(3, zzzz.y);
  assertEquals(7, zzzz.z);
  assertEquals(7, zzzz.w);
  var wwww = SIMD.Int32x4.shuffle(a, b, 3, 3, 7, 7);
  assertEquals(4, wwww.x);
  assertEquals(4, wwww.y);
  assertEquals(8, wwww.z);
  assertEquals(8, wwww.w);
  var wzyx = SIMD.Int32x4.shuffle(a, b, 3, 2, 5, 4);
  assertEquals(4, wzyx.x);
  assertEquals(3, wzyx.y);
  assertEquals(6, wzyx.z);
  assertEquals(5, wzyx.w);
  var wwzz = SIMD.Int32x4.shuffle(a, b, 3, 3, 6, 6);
  assertEquals(4, wwzz.x);
  assertEquals(4, wwzz.y);
  assertEquals(7, wwzz.z);
  assertEquals(7, wwzz.w);
  var xxyy = SIMD.Int32x4.shuffle(a, b, 0, 0, 5, 5);
  assertEquals(1, xxyy.x);
  assertEquals(1, xxyy.y);
  assertEquals(6, xxyy.z);
  assertEquals(6, xxyy.w);
  var yyww = SIMD.Int32x4.shuffle(a, b, 1, 1, 7, 7);
  assertEquals(2, yyww.x);
  assertEquals(2, yyww.y);
  assertEquals(8, yyww.z);
  assertEquals(8, yyww.w);
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
  assertEquals(-1, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.Int32x4.equal(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(0x0, cmp.w);

  cmp = SIMD.Int32x4.greaterThan(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(-1, cmp.z);
  assertEquals(0x0, cmp.w);
}

testSIMDComparisons();
testSIMDComparisons();
%OptimizeFunctionOnNextCall(testSIMDComparisons);
testSIMDComparisons();

function testSIMDShift() {
  var m = SIMD.Int32x4(1, 2, 100, 0);

  var a = SIMD.Int32x4.shiftLeftByScalar(m, 2);
  assertEquals(4, a.x);
  assertEquals(8, a.y);
  assertEquals(400, a.z);
  assertEquals(0, a.w);

  var b = SIMD.Int32x4.shiftRightLogicalByScalar(a, 2);
  assertEquals(1, b.x);
  assertEquals(2, b.y);
  assertEquals(100, b.z);
  assertEquals(0, b.w);

  var n = SIMD.Int32x4(-8, 2, 1, 100);

  var c = SIMD.Int32x4.shiftRightArithmeticByScalar(n, 2);
  assertEquals(-2, c.x);
  assertEquals(0, c.y);
  assertEquals(0, c.z);
  assertEquals(25, c.w);
}

testSIMDShift();
testSIMDShift();
%OptimizeFunctionOnNextCall(testSIMDShift);
testSIMDShift();

function testSIMDFromFloat64x2() {
  var m = SIMD.Int32x4(9, 10, 11, 12);
  var nMask = SIMD.Float64x2.fromInt32x4(m);
  var n = SIMD.Int32x4.fromFloat64x2(nMask);

  assertEquals(9, n.x);
  assertEquals(10, n.y);
  assertEquals(0, n.z);
  assertEquals(0, n.w);
}

testSIMDFromFloat64x2();

function testSIMDFromFloat64x2Bits() {
  var m = SIMD.Int32x4(9, 10, 11, 12);
  var nMask = SIMD.Float64x2.fromInt32x4Bits(m);
  var n = SIMD.Int32x4.fromFloat64x2Bits(nMask);

  assertEquals(9, n.x);
  assertEquals(10, n.y);
  assertEquals(11, n.z);
  assertEquals(12, n.w);
}

testSIMDFromFloat64x2Bits();
