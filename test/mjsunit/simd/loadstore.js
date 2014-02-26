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

// Flags: --simd_object --allow-natives-syntax

function testFloat32x4LoadAndStore() {
  var f32_array = new Float32Array(12);
  for (var i = 0; i < 12; ++i)
    f32_array[i] = 1.0 + i;

  var v1 = SIMD.float32x4.load(f32_array, 0);
  var v2 = SIMD.float32x4.load(f32_array, 4);
  var v3 = SIMD.float32x4.load(f32_array, 8);

  assertEquals(1.0, v1.x);
  assertEquals(2.0, v1.y);
  assertEquals(3.0, v1.z);
  assertEquals(4.0, v1.w);

  assertEquals(5.0, v2.x);
  assertEquals(6.0, v2.y);
  assertEquals(7.0, v2.z);
  assertEquals(8.0, v2.w);

  assertEquals(9.0, v3.x);
  assertEquals(10.0, v3.y);
  assertEquals(11.0, v3.z);
  assertEquals(12.0, v3.w);

  SIMD.float32x4.store(f32_array, 0, SIMD.float32x4(12.0, 11.0, 10.0, 9.0));
  SIMD.float32x4.store(f32_array, 4, SIMD.float32x4(8.0, 7.0, 6.0, 5.0));
  SIMD.float32x4.store(f32_array, 8, SIMD.float32x4(4.0, 3.0, 2.0, 1.0));

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
    var v = SIMD.float32x4.loadX(f32_array, i);

    assertEquals(1.0 + i, v.x);
    assertEquals(0.0, v.y);
    assertEquals(0.0, v.z);
    assertEquals(0.0, v.w);
  }

  for (var i = 0; i < 12; ++i) {
    SIMD.float32x4.storeX(f32_array, i, SIMD.float32x4(12.0 - i, 0.0, 0.0, 0.0));
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
    var v = SIMD.float32x4.loadXY(f32_array, i);

    assertEquals(1.0 + i, v.x);
    assertEquals(2.0 + i, v.y);
    assertEquals(0.0, v.z);
    assertEquals(0.0, v.w);
  }

  for (var i = 0; i < 12; i += 2) {
    SIMD.float32x4.storeXY(f32_array, i, SIMD.float32x4(12.0 - i, 11.0 - i, 0.0, 0.0));
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
    var v = SIMD.float32x4.loadXYZ(f32_array, i);

    assertEquals(1.0 + i, v.x);
    assertEquals(2.0 + i, v.y);
    assertEquals(3.0 + i, v.z);
    assertEquals(0.0, v.w);
  }

  for (var i = 0; i < 12; i += 3) {
    SIMD.float32x4.storeXYZ(f32_array, i, SIMD.float32x4(12.0 - i, 11.0 - i, 10.0 - i, 0.0));
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

  var v1 = SIMD.float32x4.load(i8_array, 0);
  var v2 = SIMD.float32x4.load(i8_array, 16);
  var v3 = SIMD.float32x4.load(i8_array, 32);

  assertEquals(1.0, v1.x);
  assertEquals(2.0, v1.y);
  assertEquals(3.0, v1.z);
  assertEquals(4.0, v1.w);

  assertEquals(5.0, v2.x);
  assertEquals(6.0, v2.y);
  assertEquals(7.0, v2.z);
  assertEquals(8.0, v2.w);

  assertEquals(9.0, v3.x);
  assertEquals(10.0, v3.y);
  assertEquals(11.0, v3.z);
  assertEquals(12.0, v3.w);

  SIMD.float32x4.store(i8_array, 0, SIMD.float32x4(12.0, 11.0, 10.0, 9.0));
  SIMD.float32x4.store(i8_array, 16, SIMD.float32x4(8.0, 7.0, 6.0, 5.0));
  SIMD.float32x4.store(i8_array, 32, SIMD.float32x4(4.0, 3.0, 2.0, 1.0));

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, f32_array[i]);
}

testFloat32x4LoadAndStoreFromInt8Array();
testFloat32x4LoadAndStoreFromInt8Array();
%OptimizeFunctionOnNextCall(testFloat32x4LoadAndStoreFromInt8Array);
testFloat32x4LoadAndStoreFromInt8Array();

function testFloat64x2LoadAndStore() {
  var f64_array = new Float64Array(6);
  for (var i = 0; i < 6; ++i)
    f64_array[i] = 1.0 + i;

  var v1 = SIMD.float64x2.load(f64_array, 0);
  var v2 = SIMD.float64x2.load(f64_array, 2);
  var v3 = SIMD.float64x2.load(f64_array, 4);

  assertEquals(1.0, v1.x);
  assertEquals(2.0, v1.y);

  assertEquals(3.0, v2.x);
  assertEquals(4.0, v2.y);

  assertEquals(5.0, v3.x);
  assertEquals(6.0, v3.y);

  SIMD.float64x2.store(f64_array, 0, SIMD.float64x2(6.0, 5.0));
  SIMD.float64x2.store(f64_array, 2, SIMD.float64x2(4.0, 3.0));
  SIMD.float64x2.store(f64_array, 4, SIMD.float64x2(2.0, 1.0));

  for (var i = 0; i < 6; ++i)
    assertEquals(6.0 - i, f64_array[i]);
}

testFloat64x2LoadAndStore();
testFloat64x2LoadAndStore();
%OptimizeFunctionOnNextCall(testFloat64x2LoadAndStore);
testFloat64x2LoadAndStore();

function testInt32x4LoadAndStore() {
  var i32_array = new Int32Array(12);
    for (var i = 0; i < 12; ++i)
    i32_array[i] = 1 + i;

  var v1 = SIMD.int32x4.load(i32_array, 0);
  var v2 = SIMD.int32x4.load(i32_array, 4);
  var v3 = SIMD.int32x4.load(i32_array, 8);

  assertEquals(1, v1.x);
  assertEquals(2, v1.y);
  assertEquals(3, v1.z);
  assertEquals(4, v1.w);

  assertEquals(5, v2.x);
  assertEquals(6, v2.y);
  assertEquals(7, v2.z);
  assertEquals(8, v2.w);

  assertEquals(9, v3.x);
  assertEquals(10, v3.y);
  assertEquals(11, v3.z);
  assertEquals(12, v3.w);

  SIMD.int32x4.store(i32_array, 0, SIMD.int32x4(12, 11, 10, 9));
  SIMD.int32x4.store(i32_array, 4, SIMD.int32x4(8, 7, 6, 5));
  SIMD.int32x4.store(i32_array, 8, SIMD.int32x4(4, 3, 2, 1));

  for (var i = 0; i < 12; ++i)
    assertEquals(12.0 - i, i32_array[i]);
}

testInt32x4LoadAndStore();
testInt32x4LoadAndStore();
%OptimizeFunctionOnNextCall(testInt32x4LoadAndStore);
testInt32x4LoadAndStore();
