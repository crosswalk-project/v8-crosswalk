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
/*
function testArgumentsObjectwithFloat32x4Field() {
  "use strict";
  var forceDeopt = { deopt:false };
  function inner(a,b,c,d,e,f,g,h,i,j,k) {
    var args = arguments;
    forceDeopt.deopt;
    assertSame(11, args.length);
    assertSame(a, args[0]);
    assertSame(b, args[1]);
    assertSame(c, args[2]);
    assertSame(d, args[3]);
    assertSame(e, args[4]);
    assertSame(f, args[5]);
    assertSame(g, args[6]);
    assertSame(h, args[7]);
    assertSame(i, args[8]);
    assertSame(j, args[9]);
    assertEquals(1, SIMD.Float32x4.extractLane(args[10], 0));
    assertEquals(2, SIMD.Float32x4.extractLane(args[10], 1));
    assertEquals(3, SIMD.Float32x4.extractLane(args[10], 2));
    assertEquals(4, SIMD.Float32x4.extractLane(args[10], 3));
  }

  var a = 0.5;
  var b = 1.7;
  var c = 123;
  function outer() {
    inner(
      a - 0.3,  // double in double register
      b + 2.3,  // integer in double register
      c + 321,  // integer in general register
      c - 456,  // integer in stack slot
      a + 0.1, a + 0.2, a + 0.3, a + 0.4, a + 0.5,
      a + 0.6,  // double in stack slot
      SIMD.Float32x4(1, 2, 3, 4)
    );
  }

  outer();
  outer();
  %OptimizeFunctionOnNextCall(outer);
  outer();
  delete forceDeopt.deopt;
  outer();
}

testArgumentsObjectwithFloat32x4Field();

function testArgumentsObjectwithInt32x4Field() {
  "use strict";
  var forceDeopt = { deopt:false };
  function inner(a,b,c,d,e,f,g,h,i,j,k) {
    var args = arguments;
    forceDeopt.deopt;
    assertSame(11, args.length);
    assertSame(a, args[0]);
    assertSame(b, args[1]);
    assertSame(c, args[2]);
    assertSame(d, args[3]);
    assertSame(e, args[4]);
    assertSame(f, args[5]);
    assertSame(g, args[6]);
    assertSame(h, args[7]);
    assertSame(i, args[8]);
    assertSame(j, args[9]);
    assertEquals(1, SIMD.Int32x4.extractLane(args[10], 0);
    assertEquals(2, SIMD.Int32x4.extractLane(args[10], 1);
    assertEquals(3, SIMD.Int32x4.extractLane(args[10], 2);
    assertEquals(4, SIMD.Int32x4.extractLane(args[10], 3);
  }

  var a = 0.5;
  var b = 1.7;
  var c = 123;
  function outer() {
    inner(
      a - 0.3,  // double in double register
      b + 2.3,  // integer in double register
      c + 321,  // integer in general register
      c - 456,  // integer in stack slot
      a + 0.1, a + 0.2, a + 0.3, a + 0.4, a + 0.5,
      a + 0.6,  // double in stack slot
      SIMD.Int32x4(1, 2, 3, 4)
    );
  }

  outer();
  outer();
  %OptimizeFunctionOnNextCall(outer);
  outer();
  delete forceDeopt.deopt;
  outer();
}

testArgumentsObjectwithInt32x4Field();
*/
