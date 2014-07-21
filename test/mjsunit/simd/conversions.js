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

function testObject() {
  var a = SIMD.float32x4.zero();
  var b = Object(a);
  assertEquals(0, b.x);
  assertEquals(0, b.y);
  assertEquals(0, b.z);
  assertEquals(0, b.w);
  assertEquals(typeof(b), "object");
  assertEquals(typeof(b.valueOf()), "object");
  assertEquals(Object.prototype.toString.call(b), "[object Object]");
}

testObject();
testObject();
%OptimizeFunctionOnNextCall(testObject);
testObject();


function testNumber() {
  var a = SIMD.float32x4.zero();
  var b = Number(a);
  assertEquals(NaN, b);
}

testNumber();
testNumber();
%OptimizeFunctionOnNextCall(testNumber);
testNumber();


function testString() {
  var a = SIMD.float32x4.zero();
  var b = String(a);
  assertEquals("float32x4(0,0,0,0)", b);
}

testString();
testString();
%OptimizeFunctionOnNextCall(testString);
testString();


function testBoolean() {
  var a = SIMD.float32x4.zero();
  var b = Boolean(a);
  assertEquals(true, b);
}

testBoolean();
testBoolean();
%OptimizeFunctionOnNextCall(testBoolean);
testBoolean();
