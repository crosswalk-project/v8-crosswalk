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

function testArithmeticOperators() {
  var a = SIMD.float64x2.zero();
  var b = SIMD.float64x2.zero();
  var c;

  c = a + b;
  assertEquals(NaN, c);
  c = a++;
  assertEquals(NaN, c);
  c = a - b;
  assertEquals(NaN, c);
  c = a--;
  assertEquals(NaN, c);
  c = a * b;
  assertEquals(NaN, c);
  c = a / b;
  assertEquals(NaN, c);
  c = a % b;
  assertEquals(NaN, c);
}

testArithmeticOperators();
testArithmeticOperators();
%OptimizeFunctionOnNextCall(testArithmeticOperators);
testArithmeticOperators();


function testBitwiseOperators() {
  var a = SIMD.float64x2.zero();
  var b = SIMD.float64x2.zero();
  var c;
  c = a | b;
  assertEquals(0, c);
  c = a & b;
  assertEquals(0, c);
  c = a ^ b;
  assertEquals(0, c);
  c = ~a;
  assertEquals(-1, c);
  c = a << 0;
  assertEquals(0, c);
  c = a >> 0;
  assertEquals(0, c);
  c = a >>> 0;
  assertEquals(0, c);
}

testBitwiseOperators();
testBitwiseOperators();
%OptimizeFunctionOnNextCall(testBitwiseOperators);
testBitwiseOperators();


function testAssignmentOperators() {
  var a = SIMD.float64x2.zero();
  var b = SIMD.float64x2.zero();
  var c = a;
  c += b;
  assertEquals(NaN, c);
  c -= b;
  assertEquals(NaN, c);
  c *= b;
  assertEquals(NaN, c);
  c /= b;
  assertEquals(NaN, c);
  c %= b;
  assertEquals(NaN, c);

  c &= b;
  assertEquals(0, c);
  c |= b;
  assertEquals(0, c);
  c ^= b;
  assertEquals(0, c);
  c <<= b;
  assertEquals(0, c);
  c >>= b;
  assertEquals(0, c);
  c >>>= b;
  assertEquals(0, c);
}

testAssignmentOperators();
testAssignmentOperators();
%OptimizeFunctionOnNextCall(testAssignmentOperators);
testAssignmentOperators();


function testStringOperators() {
  var a = SIMD.float64x2.zero();
  var b = "0";
  var c = a;
  c += b;
  assertEquals("float64x2(0,0)0", c);
  c = b + a;
  assertEquals("0float64x2(0,0)", c);
}

testStringOperators();
testStringOperators();
%OptimizeFunctionOnNextCall(testStringOperators);
testStringOperators();


function testComparisionOperators() {
  var a = SIMD.float64x2.zero();
  var b = SIMD.float64x2.zero();
  assertEquals(true, a == b);
  assertEquals(false, a != b);
  assertEquals(true, a === b);
  assertEquals(false, a !== b);
  assertEquals(false, a > b);
  assertEquals(true, a >= b);
  assertEquals(false, a < b);
  assertEquals(true, a <= b);
}

testComparisionOperators();
testComparisionOperators();
%OptimizeFunctionOnNextCall(testComparisionOperators);
testComparisionOperators();


function testLogicalOperators() {
  var a = SIMD.float64x2.zero();
  var b = SIMD.float64x2.splat(1);
  assertEquals(1, (a && b).x);
  assertEquals(1, (a && b).y);
  assertEquals(0, (a || b).x);
  assertEquals(0, (a || b).y);
  assertEquals(false, !a);
}

testLogicalOperators();
testLogicalOperators();
%OptimizeFunctionOnNextCall(testLogicalOperators);
testLogicalOperators();
