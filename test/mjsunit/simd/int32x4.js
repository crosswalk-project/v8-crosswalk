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

// Flags: --simd_object  --allow-natives-syntax

function testConstructor() {
  var u4 = SIMD.int32x4(1, 2, 3, 4);
  assertEquals(1, u4.x);
  assertEquals(2, u4.y);
  assertEquals(3, u4.z);
  assertEquals(4, u4.w);
}

testConstructor();

function testZeroConstructor() {
  var u4 = SIMD.int32x4.zero();
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
  var u4 = SIMD.int32x4.bool(true, false, true, false);
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
  var u4 = SIMD.int32x4.splat(4);
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
  var u4 = SIMD.int32x4(1, 2, 3, 4);
  assertEquals(typeof(u4), "int32x4");

  var new_u4 = new SIMD.int32x4(1, 2, 3, 4);
  assertEquals(typeof(new_u4), "object");
  assertEquals(typeof(new_u4.valueOf()), "int32x4");
  assertEquals(Object.prototype.toString.call(new_u4), "[object int32x4]");
}

testTypeof();

function testSignMaskGetter() {
  var a = SIMD.int32x4(0x80000000 - 0xFFFFFFFF - 1, 0x7000000, -1, 0x0);
  assertEquals(0x5, a.signMask);
  var b = SIMD.int32x4(0x0, 0x0, 0x0, 0x0);
  assertEquals(0x0, b.signMask);
  var c = SIMD.int32x4(-1, -1, -1, -1);
  assertEquals(0xf, c.signMask);
}

testSignMaskGetter();
testSignMaskGetter();
%OptimizeFunctionOnNextCall(testSignMaskGetter);
testSignMaskGetter();


function testSIMDAnd() {
  var m = SIMD.int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.int32x4(0x55555555, 0x55555555, 0x55555555, 0x55555555);
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
  o = SIMD.int32x4.and(m,n); // and
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
  var m = SIMD.int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.int32x4(0x55555555, 0x55555555, 0x55555555, 0x55555555);
  var o = SIMD.int32x4.or(m,n); // or
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
  var m = SIMD.int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var o = SIMD.int32x4.xor(m,n); // xor
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
  var m = SIMD.int32x4(0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1,
                  0xAAAAAAAA - 0xFFFFFFFF - 1, 0xAAAAAAAA - 0xFFFFFFFF - 1);
  var n = SIMD.int32x4(0x55555555, 0x55555555, 0x55555555, 0x55555555);
  m = SIMD.int32x4.not(m);
  n = SIMD.int32x4.not(n);
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
  var m = SIMD.int32x4(-1, 1, -1, 1);
  m = SIMD.int32x4.neg(m);
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
  var m = SIMD.int32x4.bool(true, true, false, false);
  var t = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
  var f = SIMD.float32x4(5.0, 6.0, 7.0, 8.0);
  var s = SIMD.int32x4.select(m, t, f);
  assertEquals(1.0, s.x);
  assertEquals(2.0, s.y);
  assertEquals(7.0, s.z);
  assertEquals(8.0, s.w);
}

testSIMDSelect();
testSIMDSelect();
%OptimizeFunctionOnNextCall(testSIMDSelect);
testSIMDSelect();


function testSIMDWithXu32() {
    var a = SIMD.int32x4(1, 2, 3, 4);
    var c = SIMD.int32x4.withX(a, 20);
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
    var a = SIMD.int32x4(1, 2, 3, 4);
    var c = SIMD.int32x4.withY(a, 20);
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
    var a = SIMD.int32x4(1, 2, 3, 4);
    var c = SIMD.int32x4.withZ(a, 20);
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
    var a = SIMD.int32x4(1, 2, 3, 4);
    var c = SIMD.int32x4.withW(a, 20);
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
    var a = SIMD.int32x4.bool(true, false, true, false);

    // boolean
    var c = SIMD.int32x4.withFlagX(a, true);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    c = SIMD.int32x4.withFlagX(a, false);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    // smi
    c = SIMD.int32x4.withFlagX(a, 2);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
    c = SIMD.int32x4.withFlagX(a, 0);
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    // string
    c = SIMD.int32x4.withFlagX(a, 'true');
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
    c = SIMD.int32x4.withFlagX(a, '');
    assertEquals(false, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(0x0, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    // heap number
    c = SIMD.int32x4.withFlagX(a, 3.14);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);
    c = SIMD.int32x4.withFlagX(a, 0.0);
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
    c = SIMD.int32x4.withFlagX(a, array);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    assertEquals(-1, c.x);
    assertEquals(0x0, c.y);
    assertEquals(-1, c.z);
    assertEquals(0x0, c.w);

    c = SIMD.int32x4.withFlagX(a, undefined);
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
    var a = SIMD.int32x4.bool(true, false, true, false);
    var c = SIMD.int32x4.withFlagY(a, true);
    assertEquals(true, c.flagX);
    assertEquals(true, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    c = SIMD.int32x4.withFlagY(a, false);
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
    var a = SIMD.int32x4.bool(true, false, true, false);
    var c = SIMD.int32x4.withFlagZ(a, true);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(false, c.flagW);
    c = SIMD.int32x4.withFlagZ(a, false);
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
    var a = SIMD.int32x4.bool(true, false, true, false);
    var c = SIMD.int32x4.withFlagW(a, true);
    assertEquals(true, c.flagX);
    assertEquals(false, c.flagY);
    assertEquals(true, c.flagZ);
    assertEquals(true, c.flagW);
    c = SIMD.int32x4.withFlagW(a, false);
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
  var a = SIMD.int32x4(-1, -1, 0x7fffffff, 0x0);
  var b = SIMD.int32x4(0x1, -1, 0x1, -1);
  var c = SIMD.int32x4.add(a, b);
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
  var a = SIMD.int32x4(-1, -1, 0x80000000 - 0xFFFFFFFF - 1, 0x0);
  var b = SIMD.int32x4(0x1, -1, 0x1, -1);
  var c = SIMD.int32x4.sub(a, b);
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
  var a = SIMD.int32x4(-1, -1, 0x80000000 - 0xFFFFFFFF - 1, 0x0);
  var b = SIMD.int32x4(0x1, -1, 0x80000000 - 0xFFFFFFFF - 1, -1);
  var c = SIMD.int32x4.mul(a, b);
  assertEquals(-1, c.x);
  assertEquals(0x1, c.y);
  assertEquals(0x0, c.z);
  assertEquals(0x0, c.w);
}

testSIMDMulu32();
testSIMDMulu32();
%OptimizeFunctionOnNextCall(testSIMDMulu32);
testSIMDMulu32();

function testSIMDShuffleu32() {
  var m = SIMD.int32x4(1, 2, 3, 4);
  var xxxx = SIMD.int32x4.shuffle(m, SIMD.XXXX);
  assertEquals(1, xxxx.x);
  assertEquals(1, xxxx.y);
  assertEquals(1, xxxx.z);
  assertEquals(1, xxxx.w);
  var yyyy = SIMD.int32x4.shuffle(m, SIMD.YYYY);
  assertEquals(2, yyyy.x);
  assertEquals(2, yyyy.y);
  assertEquals(2, yyyy.z);
  assertEquals(2, yyyy.w);
  var zzzz = SIMD.int32x4.shuffle(m, SIMD.ZZZZ);
  assertEquals(3, zzzz.x);
  assertEquals(3, zzzz.y);
  assertEquals(3, zzzz.z);
  assertEquals(3, zzzz.w);
  var wwww = SIMD.int32x4.shuffle(m, SIMD.WWWW);
  assertEquals(4, wwww.x);
  assertEquals(4, wwww.y);
  assertEquals(4, wwww.z);
  assertEquals(4, wwww.w);
  var wzyx = SIMD.int32x4.shuffle(m, SIMD.WZYX);
  assertEquals(4, wzyx.x);
  assertEquals(3, wzyx.y);
  assertEquals(2, wzyx.z);
  assertEquals(1, wzyx.w);
  var wwzz = SIMD.int32x4.shuffle(m, SIMD.WWZZ);
  assertEquals(4, wwzz.x);
  assertEquals(4, wwzz.y);
  assertEquals(3, wwzz.z);
  assertEquals(3, wwzz.w);
  var xxyy = SIMD.int32x4.shuffle(m, SIMD.XXYY);
  assertEquals(1, xxyy.x);
  assertEquals(1, xxyy.y);
  assertEquals(2, xxyy.z);
  assertEquals(2, xxyy.w);
  var yyww = SIMD.int32x4.shuffle(m, SIMD.YYWW);
  assertEquals(2, yyww.x);
  assertEquals(2, yyww.y);
  assertEquals(4, yyww.z);
  assertEquals(4, yyww.w);
}

testSIMDShuffleu32();
testSIMDShuffleu32();
%OptimizeFunctionOnNextCall(testSIMDShuffleu32);
testSIMDShuffleu32();

function testSIMDComparisons() {
  var m = SIMD.int32x4(1, 2, 100, 1);
  var n = SIMD.int32x4(2, 2, 1, 100);
  var cmp;
  cmp = SIMD.int32x4.lessThan(m, n);
  assertEquals(-1, cmp.x);
  assertEquals(0x0, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(-1, cmp.w);

  cmp = SIMD.int32x4.equal(m, n);
  assertEquals(0x0, cmp.x);
  assertEquals(-1, cmp.y);
  assertEquals(0x0, cmp.z);
  assertEquals(0x0, cmp.w);

  cmp = SIMD.int32x4.greaterThan(m, n);
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
  var m = SIMD.int32x4(1, 2, 100, 0);

  var a = SIMD.int32x4.shiftLeft(m, 2);
  assertEquals(4, a.x);
  assertEquals(8, a.y);
  assertEquals(400, a.z);
  assertEquals(0, a.w);

  var b = SIMD.int32x4.shiftRight(a, 2);
  assertEquals(1, b.x);
  assertEquals(2, b.y);
  assertEquals(100, b.z);
  assertEquals(0, b.w);

  var n = SIMD.int32x4(-8, 2, 1, 100);

  var c = SIMD.int32x4.shiftRightArithmetic(n, 2);
  assertEquals(-2, c.x);
  assertEquals(0, c.y);
  assertEquals(0, c.z);
  assertEquals(25, c.w);
}

testSIMDShift();
testSIMDShift();
%OptimizeFunctionOnNextCall(testSIMDShift);
testSIMDShift();

function testInt32x4ArrayBasic() {
  var a = new Int32x4Array(1);
  assertEquals(1, a.length);
  assertEquals(16, a.byteLength);
  assertEquals(16, a.BYTES_PER_ELEMENT);
  assertEquals(16, Int32x4Array.BYTES_PER_ELEMENT);
  assertEquals(0, a.byteOffset);
  assertTrue(undefined != a.buffer);
  var b = new Int32x4Array(4);
  assertEquals(4, b.length);
  assertEquals(64, b.byteLength);
  assertEquals(16, b.BYTES_PER_ELEMENT);
  assertEquals(16, Int32x4Array.BYTES_PER_ELEMENT);
  assertEquals(0, b.byteOffset);
  assertTrue(undefined != b.buffer);
}

testInt32x4ArrayBasic();

function testInt32x4ArrayGetAndSet() {
  var a = new Int32x4Array(4);
  a[0] = SIMD.int32x4(1, 2, 3, 4);
  a[1] = SIMD.int32x4(5, 6, 7, 8);
  a[2] = SIMD.int32x4(9, 10, 11, 12);
  a[3] = SIMD.int32x4(13, 14, 15, 16);
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

  var b = new Int32x4Array(4);
  b.setAt(0,SIMD.int32x4(1, 2, 3, 4));
  b.setAt(1,SIMD.int32x4(5, 6, 7, 8));
  b.setAt(2,SIMD.int32x4(9, 10, 11, 12));
  b.setAt(3,SIMD.int32x4(13, 14, 15, 16));

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

testInt32x4ArrayGetAndSet();

function testInt32x4ArraySwap() {
  var a = new Int32x4Array(4);
  a[0] = SIMD.int32x4(1, 2, 3, 4);
  a[1] = SIMD.int32x4(5, 6, 7, 8);
  a[2] = SIMD.int32x4(9, 10, 11, 12);
  a[3] = SIMD.int32x4(13, 14, 15, 16);

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

testInt32x4ArraySwap();
testInt32x4ArraySwap();
%OptimizeFunctionOnNextCall(testInt32x4ArraySwap);
testInt32x4ArraySwap();

function testInt32x4ArrayCopy() {
  var a = new Int32x4Array(4);
  a[0] = SIMD.int32x4(1, 2, 3, 4);
  a[1] = SIMD.int32x4(5, 6, 7, 8);
  a[2] = SIMD.int32x4(9, 10, 11, 12);
  a[3] = SIMD.int32x4(13, 14, 15, 16);
  var b = new Int32x4Array(a);
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

  a[2] = SIMD.int32x4(17, 18, 19, 20);

  assertEquals(a[2].x, 17);
  assertEquals(a[2].y, 18);
  assertEquals(a[2].z, 19);
  assertEquals(a[2].w, 20);

  assertTrue(a[2].x != b[2].x);
  assertTrue(a[2].y != b[2].y);
  assertTrue(a[2].z != b[2].z);
  assertTrue(a[2].w != b[2].w);
}

testInt32x4ArrayCopy();

function testInt32x4ArrayViewBasic() {
  var a = new Uint32Array(8);
  // view with no offset.
  var b = new Int32x4Array(a.buffer, 0);
  // view with offset.
  var c = new Int32x4Array(a.buffer, 16);
  // view with no offset but shorter than original list.
  var d = new Int32x4Array(a.buffer, 0, 1);
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

testInt32x4ArrayViewBasic();

function testInt32x4ArrayViewValues() {
  var a = new Uint32Array(8);
  var b = new Int32x4Array(a.buffer, 0);
  var c = new Int32x4Array(a.buffer, 16);
  var d = new Int32x4Array(a.buffer, 0, 1);
  var start = 100;
  for (var i = 0; i < b.length; i++) {
    assertEquals(0, b[i].x);
    assertEquals(0, b[i].y);
    assertEquals(0, b[i].z);
    assertEquals(0, b[i].w);
  }
  for (var i = 0; i < c.length; i++) {
    assertEquals(0, c[i].x);
    assertEquals(0, c[i].y);
    assertEquals(0, c[i].z);
    assertEquals(0, c[i].w);
  }
  for (var i = 0; i < d.length; i++) {
    assertEquals(0, d[i].x);
    assertEquals(0, d[i].y);
    assertEquals(0, d[i].z);
    assertEquals(0, d[i].w);
  }
  for (var i = 0; i < a.length; i++) {
    a[i] = i+start;
  }
  for (var i = 0; i < b.length; i++) {
    assertTrue(0 != b[i].x);
    assertTrue(0 != b[i].y);
    assertTrue(0 != b[i].z);
    assertTrue(0 != b[i].w);
  }
  for (var i = 0; i < c.length; i++) {
    assertTrue(0 != c[i].x);
    assertTrue(0 != c[i].y);
    assertTrue(0 != c[i].z);
    assertTrue(0 != c[i].w);
  }
  for (var i = 0; i < d.length; i++) {
    assertTrue(0 != d[i].x);
    assertTrue(0 != d[i].y);
    assertTrue(0 != d[i].z);
    assertTrue(0 != d[i].w);
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

testInt32x4ArrayViewValues();

function testViewOnInt32x4Array() {
  var a = new Int32x4Array(4);
  a[0] = SIMD.int32x4(1, 2, 3, 4);
  a[1] = SIMD.int32x4(5, 6, 7, 8);
  a[2] = SIMD.int32x4(9, 10, 11, 12);
  a[3] = SIMD.int32x4(13, 14, 15, 16);
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
  var b = new Uint32Array(a.buffer);
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

testViewOnInt32x4Array();

function testArrayOfInt32x4() {
  var a = [];
  var a4 = new Int32x4Array(2);
  for (var i = 0; i < a4.length; i++) {
    a[i] = SIMD.int32x4(i, i + 1, i + 2, i + 3);
    a4[i] = SIMD.int32x4(i, i + 1, i + 2, i + 3);
  }

  for (var i = 0; i < a4.length; i++) {
    assertEquals(a[i].x, a4[i].x);
    assertEquals(a[i].y, a4[i].y);
    assertEquals(a[i].z, a4[i].z);
    assertEquals(a[i].w, a4[i].w);
  }
}

testArrayOfInt32x4();
