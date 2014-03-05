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

// Flags: --harmony-simd --harmony-tostring  --harmony-reflect
// Flags: --allow-natives-syntax --expose-natives-as natives --noalways-opt

function testCapturedObjectwithFloat32x4Field() {
  var deopt = { deopt:false };
  function constructor() {
    this.x = 1.1;
    this.y = SIMD.Float32x4(1,2,3,4);
  }
  function field(x) {
    var o = new constructor();
    o.x = x;
    deopt.deopt;
    assertEquals(x, o.x);
    assertEquals(SIMD.Float32x4.extractLane(o.y, 0), 1);
    assertEquals(SIMD.Float32x4.extractLane(o.y, 1), 2);
    assertEquals(SIMD.Float32x4.extractLane(o.y, 2), 3);
    assertEquals(SIMD.Float32x4.extractLane(o.y, 3), 4);
  }
  field(1); field(2);
  // TODO(ningxin): fails in x64 test.
  //%OptimizeFunctionOnNextCall(field);
  field(3); field(4);
  delete deopt.deopt;
  field(5); field(6);
}

testCapturedObjectwithFloat32x4Field();

function testCapturedObjectwithInt32x4Field() {
  var deopt = { deopt:false };
  function constructor() {
    this.x = 1.1;
    this.y = SIMD.Int32x4(1,2,3,4);
  }
  function field(x) {
    var o = new constructor();
    o.x = x;
    deopt.deopt;
    assertEquals(x, o.x);
    assertEquals(SIMD.Int32x4.extractLane(o.y, 0), 1);
    assertEquals(SIMD.Int32x4.extractLane(o.y, 1), 2);
    assertEquals(SIMD.Int32x4.extractLane(o.y, 2), 3);
    assertEquals(SIMD.Int32x4.extractLane(o.y, 3), 4);
  }
  field(1); field(2);
  // TODO(ningxin): fix the failures.
  //%OptimizeFunctionOnNextCall(field);
  field(3); field(4);
  delete deopt.deopt;
  field(5); field(6);
}

testCapturedObjectwithInt32x4Field();
