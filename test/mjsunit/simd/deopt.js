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

function testdeopt(a, b) {
  var a4 = SIMD.float32x4(1.0, -2.0, 3.0, -4.0);
  var b4 = SIMD.float32x4.abs(a4);

  if (a > 0) {
    a = 0;
  } else {
    a += b; //deopt
  }

  assertEquals(1.0, b4.x);
  assertEquals(2.0, b4.y);
  assertEquals(3.0, b4.z);
  assertEquals(4.0, b4.w);
}

testdeopt(1, 1);
testdeopt(1, 1);
%OptimizeFunctionOnNextCall(testdeopt);
testdeopt(0, 1);

function testdeopt2() {
  var a4 = SIMD.float32x4(1.0, -1.0, 1.0, -1.0);
  var b4 = SIMD.float32x4.abs(a4);

  assertEquals(1.0, b4.x);
  assertEquals(1.0, b4.y);
  assertEquals(1.0, b4.z);
  assertEquals(1.0, b4.w);

  var new_a4 = new SIMD.float32x4(1.0, -1.0, 1.0, -1.0);
  var new_b4 = SIMD.float32x4.abs(new_a4);

  assertEquals(1.0, new_b4.x);
  assertEquals(1.0, new_b4.y);
  assertEquals(1.0, new_b4.z);
  assertEquals(1.0, new_b4.w);

  // Verifying deoptimization
  assertEquals(1.0, b4.x);
  assertEquals(1.0, b4.y);
  assertEquals(1.0, b4.z);
  assertEquals(1.0, b4.w);
}

testdeopt2();
testdeopt2();
%OptimizeFunctionOnNextCall(testdeopt2);
testdeopt2();
