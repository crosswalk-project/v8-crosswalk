// Copyright 2014 the V8 project authors. All rights reserved.
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

function testFloat32x4LoadAndStore() {
  var f32_array = new Float32Array(12);
  for (var i = 0; i < 12; ++i)
    f32_array[i] = 1.0 + i;

  var v1 = SIMD.Float32x4.load(f32_array, 0);
  var v2 = SIMD.Float32x4.load(f32_array, 4);
  var v3 = SIMD.Float32x4.load(f32_array, 8);

  assertEquals(1.0, SIMD.Float32x4.extractLane(v1, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(v1, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(v1, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(v1, 3));

  assertEquals(5.0, SIMD.Float32x4.extractLane(v2, 0));
  assertEquals(6.0, SIMD.Float32x4.extractLane(v2, 1));
  assertEquals(7.0, SIMD.Float32x4.extractLane(v2, 2));
  assertEquals(8.0, SIMD.Float32x4.extractLane(v2, 3));

  assertEquals(9.0, SIMD.Float32x4.extractLane(v3, 0));
  assertEquals(10.0, SIMD.Float32x4.extractLane(v3, 1));
  assertEquals(11.0, SIMD.Float32x4.extractLane(v3, 2));
  assertEquals(12.0, SIMD.Float32x4.extractLane(v3, 3));

  SIMD.Float32x4.store(f32_array, 0, SIMD.Float32x4(12.0, 11.0, 10.0, 9.0));
  SIMD.Float32x4.store(f32_array, 4, SIMD.Float32x4(8.0, 7.0, 6.0, 5.0));
  SIMD.Float32x4.store(f32_array, 8, SIMD.Float32x4(4.0, 3.0, 2.0, 1.0));

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, f32_array[i]);
}

testFloat32x4LoadAndStore();
testFloat32x4LoadAndStore();
%OptimizeFunctionOnNextCall(testFloat32x4LoadAndStore);
testFloat32x4LoadAndStore();

function testFloat32x4LoadXAndStoreX() {
  var f32_array = new Float32Array(12);
  for (var i = 0; i < 12; ++i)
    f32_array[i] = 1.0 + i;

  for (var i = 0; i < 12; ++i) {
    var v = SIMD.Float32x4.load1(f32_array, i);

    assertEquals(1.0 + i, SIMD.Float32x4.extractLane(v, 0));
    assertEquals(0.0, SIMD.Float32x4.extractLane(v, 1));
    assertEquals(0.0, SIMD.Float32x4.extractLane(v, 2));
    assertEquals(0.0, SIMD.Float32x4.extractLane(v, 3));
  }

  for (var i = 0; i < 12; ++i) {
    SIMD.Float32x4.store1(f32_array, i, SIMD.Float32x4(12.0 - i, 0.0, 0.0, 0.0));
  }

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, f32_array[i]);
}

testFloat32x4LoadXAndStoreX();
testFloat32x4LoadXAndStoreX();
%OptimizeFunctionOnNextCall(testFloat32x4LoadXAndStoreX);
testFloat32x4LoadXAndStoreX();

function testFloat32x4LoadXYAndStoreXY() {
  var f32_array = new Float32Array(12);
  for (var i = 0; i < 12; ++i)
    f32_array[i] = 1.0 + i;

  for (var i = 0; i < 12; i += 2) {
    var v = SIMD.Float32x4.load2(f32_array, i);

    assertEquals(1.0 + i, SIMD.Float32x4.extractLane(v, 0));
    assertEquals(2.0 + i, SIMD.Float32x4.extractLane(v, 1));
    assertEquals(0.0, SIMD.Float32x4.extractLane(v, 2));
    assertEquals(0.0, SIMD.Float32x4.extractLane(v, 3));
  }

  for (var i = 0; i < 12; i += 2) {
    SIMD.Float32x4.store2(f32_array, i, SIMD.Float32x4(12.0 - i, 11.0 - i, 0.0, 0.0));
  }

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, f32_array[i]);
}

testFloat32x4LoadXYAndStoreXY();
testFloat32x4LoadXYAndStoreXY();
%OptimizeFunctionOnNextCall(testFloat32x4LoadXYAndStoreXY);
testFloat32x4LoadXYAndStoreXY();

function testFloat32x4LoadXYZAndStoreXYZ() {
  var f32_array = new Float32Array(12);
  for (var i = 0; i < 12; ++i)
    f32_array[i] = 1.0 + i;

  for (var i = 0; i < 12; i += 3) {
    var v = SIMD.Float32x4.load3(f32_array, i);

    assertEquals(1.0 + i, SIMD.Float32x4.extractLane(v, 0));
    assertEquals(2.0 + i, SIMD.Float32x4.extractLane(v, 1));
    assertEquals(3.0 + i, SIMD.Float32x4.extractLane(v, 2));
    assertEquals(0.0, SIMD.Float32x4.extractLane(v, 3));
  }

  for (var i = 0; i < 12; i += 3) {
    SIMD.Float32x4.store3(f32_array, i, SIMD.Float32x4(12.0 - i, 11.0 - i, 10.0 - i, 0.0));
  }

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, f32_array[i]);
}

testFloat32x4LoadXYZAndStoreXYZ();
testFloat32x4LoadXYZAndStoreXYZ();
%OptimizeFunctionOnNextCall(testFloat32x4LoadXYZAndStoreXYZ);
testFloat32x4LoadXYZAndStoreXYZ();

function testFloat32x4LoadAndStoreFromInt8Array() {
  var f32_array = new Float32Array(12);
  for (var i = 0; i < 12; ++i)
    f32_array[i] = 1.0 + i;

  var i8_array = new Int8Array(f32_array.buffer);

  var v1 = SIMD.Float32x4.load(i8_array, 0);
  var v2 = SIMD.Float32x4.load(i8_array, 16);
  var v3 = SIMD.Float32x4.load(i8_array, 32);

  assertEquals(1.0, SIMD.Float32x4.extractLane(v1, 0));
  assertEquals(2.0, SIMD.Float32x4.extractLane(v1, 1));
  assertEquals(3.0, SIMD.Float32x4.extractLane(v1, 2));
  assertEquals(4.0, SIMD.Float32x4.extractLane(v1, 3));

  assertEquals(5.0, SIMD.Float32x4.extractLane(v2, 0));
  assertEquals(6.0, SIMD.Float32x4.extractLane(v2, 1));
  assertEquals(7.0, SIMD.Float32x4.extractLane(v2, 2));
  assertEquals(8.0, SIMD.Float32x4.extractLane(v2, 3));

  assertEquals(9.0, SIMD.Float32x4.extractLane(v3, 0));
  assertEquals(10.0, SIMD.Float32x4.extractLane(v3, 1));
  assertEquals(11.0, SIMD.Float32x4.extractLane(v3, 2));
  assertEquals(12.0, SIMD.Float32x4.extractLane(v3, 3));

  SIMD.Float32x4.store(i8_array, 0, SIMD.Float32x4(12.0, 11.0, 10.0, 9.0));
  SIMD.Float32x4.store(i8_array, 16, SIMD.Float32x4(8.0, 7.0, 6.0, 5.0));
  SIMD.Float32x4.store(i8_array, 32, SIMD.Float32x4(4.0, 3.0, 2.0, 1.0));

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, f32_array[i]);
}

testFloat32x4LoadAndStoreFromInt8Array();
testFloat32x4LoadAndStoreFromInt8Array();
%OptimizeFunctionOnNextCall(testFloat32x4LoadAndStoreFromInt8Array);
testFloat32x4LoadAndStoreFromInt8Array();

function testInt32x4LoadAndStore() {
  var i32_array = new Int32Array(12);
    for (var i = 0; i < 12; ++i)
    i32_array[i] = 1 + i;

  var v1 = SIMD.Int32x4.load(i32_array, 0);
  var v2 = SIMD.Int32x4.load(i32_array, 4);
  var v3 = SIMD.Int32x4.load(i32_array, 8);

  assertEquals(1, SIMD.Int32x4.extractLane(v1, 0));
  assertEquals(2, SIMD.Int32x4.extractLane(v1, 1));
  assertEquals(3, SIMD.Int32x4.extractLane(v1, 2));
  assertEquals(4, SIMD.Int32x4.extractLane(v1, 3));

  assertEquals(5, SIMD.Int32x4.extractLane(v2, 0));
  assertEquals(6, SIMD.Int32x4.extractLane(v2, 1));
  assertEquals(7, SIMD.Int32x4.extractLane(v2, 2));
  assertEquals(8, SIMD.Int32x4.extractLane(v2, 3));

  assertEquals(9, SIMD.Int32x4.extractLane(v3, 0));
  assertEquals(10, SIMD.Int32x4.extractLane(v3, 1));
  assertEquals(11, SIMD.Int32x4.extractLane(v3, 2));
  assertEquals(12, SIMD.Int32x4.extractLane(v3, 3));

  SIMD.Int32x4.store(i32_array, 0, SIMD.Int32x4(12, 11, 10, 9));
  SIMD.Int32x4.store(i32_array, 4, SIMD.Int32x4(8, 7, 6, 5));
  SIMD.Int32x4.store(i32_array, 8, SIMD.Int32x4(4, 3, 2, 1));

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, i32_array[i]);
}

testInt32x4LoadAndStore();
testInt32x4LoadAndStore();
%OptimizeFunctionOnNextCall(testInt32x4LoadAndStore);
testInt32x4LoadAndStore();
