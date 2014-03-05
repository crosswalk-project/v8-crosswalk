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

// Flags: --harmony-simd --harmony-tostring --harmony-reflect
// Flags: --allow-natives-syntax --expose-natives-as natives --noalways-opt

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
/*
function testTypeof() {
  var u4 = SIMD.Int32x4(1, 2, 3, 4);
  assertEquals(typeof(u4), "object");

  var new_u4 = new SIMD.Int32x4(1, 2, 3, 4);
  assertEquals(typeof(new_u4), "object");
  assertEquals(typeof(new_u4.valueOf()), "object");
  assertEquals(Object.prototype.toString.call(new_u4), "[object Object]");
}

testTypeof();
*/

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

function testSIMDShift() {
  var m = SIMD.Int32x4(1, 2, 100, 0);

  var a = SIMD.Int32x4.shiftLeftByScalar(m, 2);
  assertEquals(4, SIMD.Int32x4.extractLane(a, 0));
  assertEquals(8, SIMD.Int32x4.extractLane(a, 1));
  assertEquals(400, SIMD.Int32x4.extractLane(a, 2));
  assertEquals(0, SIMD.Int32x4.extractLane(a, 3));

  var n = SIMD.Int32x4(-8, 2, 1, 100);

  var c = SIMD.Int32x4.shiftRightByScalar(n, 2);
  assertEquals(-2, SIMD.Int32x4.extractLane(c, 0));
  assertEquals(0, SIMD.Int32x4.extractLane(c, 1));
  assertEquals(0, SIMD.Int32x4.extractLane(c, 2));
  assertEquals(25, SIMD.Int32x4.extractLane(c, 3));
}

testSIMDShift();
testSIMDShift();
%OptimizeFunctionOnNextCall(testSIMDShift);
testSIMDShift();

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
