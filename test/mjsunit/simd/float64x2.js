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

function testConstructor() {
  var f4 = SIMD.float64x2(1.0, 2.0);
  assertEquals(1.0, f4.x);
  assertEquals(2.0, f4.y);

  f4 = SIMD.float64x2(1.1, 2.2);
  assertEquals(1.1, f4.x);
  assertEquals(2.2, f4.y);
}

testConstructor();
testConstructor();
%OptimizeFunctionOnNextCall(testConstructor);
testConstructor();

function testZeroConstructor() {
  var z4 = SIMD.float64x2.zero();
  assertEquals(0.0, z4.x);
  assertEquals(0.0, z4.y);
}

testZeroConstructor();
testZeroConstructor();
%OptimizeFunctionOnNextCall(testZeroConstructor);
testZeroConstructor();

function testSplatConstructor() {
  var z4 = SIMD.float64x2.splat(5.0);
  assertEquals(5.0, z4.x);
  assertEquals(5.0, z4.y);
}

testSplatConstructor();
testSplatConstructor();
%OptimizeFunctionOnNextCall(testSplatConstructor);
testSplatConstructor();

function testTypeof() {
  var z4 = SIMD.float64x2.zero();
  assertEquals(typeof(z4), "float64x2");

  var new_z4 = new SIMD.float64x2(0, 0);
  assertEquals(typeof(new_z4), "object");
  assertEquals(typeof(new_z4.valueOf()), "float64x2");
  assertEquals(Object.prototype.toString.call(new_z4), "[object float64x2]");
}

testTypeof();

function testSignMaskGetter() {
  var a = SIMD.float64x2(-1.0, -2.0);
  assertEquals(0x3, a.signMask);
  var b = SIMD.float64x2(1.0, 2.0);
  assertEquals(0x0, b.signMask);
  var c = SIMD.float64x2(1.0, -2.0);
  assertEquals(0x2, c.signMask);
}

testSignMaskGetter();
testSignMaskGetter();
%OptimizeFunctionOnNextCall(testSignMaskGetter);
testSignMaskGetter();

function testSIMDAbs() {
  var a4 = SIMD.float64x2(1.0, -1.0);
  var b4 = SIMD.float64x2.abs(a4);

  assertEquals(1.0, b4.x);
  assertEquals(1.0, b4.y);
}

testSIMDAbs();
testSIMDAbs();
%OptimizeFunctionOnNextCall(testSIMDAbs);
testSIMDAbs();

function testSIMDNeg() {
  var a4 = SIMD.float64x2(1.0, -1.0);
  var b4 = SIMD.float64x2.neg(a4);

  assertEquals(-1.0, b4.x);
  assertEquals(1.0, b4.y);
}

testSIMDNeg();
testSIMDNeg();
%OptimizeFunctionOnNextCall(testSIMDNeg);
testSIMDNeg();

function testSIMDAdd() {
  var a4 = SIMD.float64x2(1.0, 1.0);
  var b4 = SIMD.float64x2(2.0, 2.0);
  var c4 = SIMD.float64x2.add(a4, b4);

  assertEquals(3.0, c4.x);
  assertEquals(3.0, c4.y);
}

testSIMDAdd();
testSIMDAdd();
%OptimizeFunctionOnNextCall(testSIMDAdd);
testSIMDAdd();

function testSIMDSub() {
  var a4 = SIMD.float64x2(1.0, 1.0);
  var b4 = SIMD.float64x2(2.0, 2.0);
  var c4 = SIMD.float64x2.sub(a4, b4);

  assertEquals(-1.0, c4.x);
  assertEquals(-1.0, c4.y);
}

testSIMDSub();
testSIMDSub();
%OptimizeFunctionOnNextCall(testSIMDSub);
testSIMDSub();

function testSIMDMul() {
  var a4 = SIMD.float64x2(1.0, 1.0);
  var b4 = SIMD.float64x2(2.0, 2.0);
  var c4 = SIMD.float64x2.mul(a4, b4);

  assertEquals(2.0, c4.x);
  assertEquals(2.0, c4.y);
}

testSIMDMul();
testSIMDMul();
%OptimizeFunctionOnNextCall(testSIMDMul);
testSIMDMul();

function testSIMDDiv() {
  var a4 = SIMD.float64x2(1.0, 1.0);
  var b4 = SIMD.float64x2(2.0, 2.0);
  var c4 = SIMD.float64x2.div(a4, b4);

  assertEquals(0.5, c4.x);
  assertEquals(0.5, c4.y);
}

testSIMDDiv();
testSIMDDiv();
%OptimizeFunctionOnNextCall(testSIMDDiv);
testSIMDDiv();

function testSIMDClamp() {
  var m = SIMD.float64x2(1.0, -2.0);
  var lo = SIMD.float64x2(0.0, 0.0);
  var hi = SIMD.float64x2(2.0, 2.0);
  m = SIMD.float64x2.clamp(m, lo, hi);
  assertEquals(1.0, m.x);
  assertEquals(0.0, m.y);
}

testSIMDClamp();
testSIMDClamp();
%OptimizeFunctionOnNextCall(testSIMDClamp);
testSIMDClamp();

function testSIMDMin() {
  var m = SIMD.float64x2(1.0, 2.0);
  var n = SIMD.float64x2(1.0, 0.0);
  m = SIMD.float64x2.min(m, n);
  assertEquals(1.0, m.x);
  assertEquals(0.0, m.y);
}

testSIMDMin();
testSIMDMin();
%OptimizeFunctionOnNextCall(testSIMDMin);
testSIMDMin();

function testSIMDMax() {
  var m = SIMD.float64x2(1.0, 2.0);
  var n = SIMD.float64x2(1.0, 0.0);
  m = SIMD.float64x2.max(m, n);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
}

testSIMDMax();
testSIMDMax();
%OptimizeFunctionOnNextCall(testSIMDMax);
testSIMDMax();

function testSIMDScale() {
  var m = SIMD.float64x2(1.0, -2.0);
  m = SIMD.float64x2.scale(m, 20.0);
  assertEquals(20.0, m.x);
  assertEquals(-40.0, m.y);
}

testSIMDScale();
testSIMDScale();
%OptimizeFunctionOnNextCall(testSIMDScale);
testSIMDScale();

function testSIMDSqrt() {
  var m = SIMD.float64x2(1.0, 4.0);
  m = SIMD.float64x2.sqrt(m);
  assertEquals(1.0, m.x);
  assertEquals(2.0, m.y);
}

testSIMDSqrt();
testSIMDSqrt();
%OptimizeFunctionOnNextCall(testSIMDSqrt);
testSIMDSqrt();

function testSIMDSetters() {
  var f = SIMD.float64x2.zero();
  assertEquals(0.0, f.x);
  assertEquals(0.0, f.y);
  f = SIMD.float64x2.withX(f, 4.0);
  assertEquals(4.0, f.x);
  f = SIMD.float64x2.withY(f, 3.0);
  assertEquals(3.0, f.y);
}

testSIMDSetters();
testSIMDSetters();
%OptimizeFunctionOnNextCall(testSIMDSetters);
testSIMDSetters();

function testFloat64x2ArrayBasic() {
  var a = new Float64x2Array(1);
  assertEquals(1, a.length);
  assertEquals(16, a.byteLength);
  assertEquals(16, a.BYTES_PER_ELEMENT);
  assertEquals(16, Float64x2Array.BYTES_PER_ELEMENT);
  assertEquals(0, a.byteOffset);
  assertTrue(undefined != a.buffer);
  var b = new Float64x2Array(4);
  assertEquals(4, b.length);
  assertEquals(64, b.byteLength);
  assertEquals(16, b.BYTES_PER_ELEMENT);
  assertEquals(16, Float64x2Array.BYTES_PER_ELEMENT);
  assertEquals(0, b.byteOffset);
  assertTrue(undefined != b.buffer);
}

testFloat64x2ArrayBasic();

function testFloat64x2ArrayGetAndSet() {
  var a = new Float64x2Array(4);
  a[0] = SIMD.float64x2(1, 2);
  a[1] = SIMD.float64x2(5, 6);
  a[2] = SIMD.float64x2(9, 10);
  a[3] = SIMD.float64x2(13, 14);
  assertEquals(a[0].x, 1);
  assertEquals(a[0].y, 2);

  assertEquals(a[1].x, 5);
  assertEquals(a[1].y, 6);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);

  assertEquals(a[3].x, 13);
  assertEquals(a[3].y, 14);

  var b = new Float64x2Array(4);
  b.setAt(0,SIMD.float64x2(1, 2));
  b.setAt(1,SIMD.float64x2(5, 6));
  b.setAt(2,SIMD.float64x2(9, 10));
  b.setAt(3,SIMD.float64x2(13, 14));

  assertEquals(b.getAt(0).x, 1);
  assertEquals(b.getAt(0).y, 2);

  assertEquals(b.getAt(1).x, 5);
  assertEquals(b.getAt(1).y, 6);

  assertEquals(b.getAt(2).x, 9);
  assertEquals(b.getAt(2).y, 10);

  assertEquals(b.getAt(3).x, 13);
  assertEquals(b.getAt(3).y, 14);
}

testFloat64x2ArrayGetAndSet();

function testFloat64x2ArraySwap() {
  var a = new Float64x2Array(4);
  a[0] = SIMD.float64x2(1, 2);
  a[1] = SIMD.float64x2(5, 6);
  a[2] = SIMD.float64x2(9, 10);
  a[3] = SIMD.float64x2(13, 14);

  // Swap element 0 and element 3
  var t = a[0];
  a[0] = a[3];
  a[3] = t;

  assertEquals(a[3].x, 1);
  assertEquals(a[3].y, 2);

  assertEquals(a[1].x, 5);
  assertEquals(a[1].y, 6);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);

  assertEquals(a[0].x, 13);
  assertEquals(a[0].y, 14);
}

testFloat64x2ArraySwap();

function testFloat64x2ArrayCopy() {
  var a = new Float64x2Array(4);
  a[0] = SIMD.float64x2(1, 2);
  a[1] = SIMD.float64x2(5, 6);
  a[2] = SIMD.float64x2(9, 10);
  a[3] = SIMD.float64x2(13, 14);
  var b = new Float64x2Array(a);
  assertEquals(a[0].x, b[0].x);
  assertEquals(a[0].y, b[0].y);

  assertEquals(a[1].x, b[1].x);
  assertEquals(a[1].y, b[1].y);

  assertEquals(a[2].x, b[2].x);
  assertEquals(a[2].y, b[2].y);

  assertEquals(a[3].x, b[3].x);
  assertEquals(a[3].y, b[3].y);

  a[2] = SIMD.float64x2(17, 18);

  assertEquals(a[2].x, 17);
  assertEquals(a[2].y, 18);

  assertTrue(a[2].x != b[2].x);
  assertTrue(a[2].y != b[2].y);
}

testFloat64x2ArrayCopy();

function testFloat64x2ArrayViewBasic() {
  var a = new Float64Array(8);
  // view with no offset.
  var b = new Float64x2Array(a.buffer, 0);
  // view with offset.
  var c = new Float64x2Array(a.buffer, 16);
  // view with no offset but shorter than original list.
  var d = new Float64x2Array(a.buffer, 0, 1);
  assertEquals(a.length, 8);
  assertEquals(b.length, 4);
  assertEquals(c.length, 3);
  assertEquals(d.length, 1);
  assertEquals(a.byteLength, 64);
  assertEquals(b.byteLength, 64);
  assertEquals(c.byteLength, 48);
  assertEquals(d.byteLength, 16)
  assertEquals(a.byteOffset, 0);
  assertEquals(b.byteOffset, 0);
  assertEquals(c.byteOffset, 16);
  assertEquals(d.byteOffset, 0);
}

testFloat64x2ArrayViewBasic();

function testFloat64x2ArrayViewValues() {
  var a = new Float64Array(8);
  var b = new Float64x2Array(a.buffer, 0);
  var c = new Float64x2Array(a.buffer, 16);
  var d = new Float64x2Array(a.buffer, 0, 1);
  var start = 100;
  for (var i = 0; i < b.length; i++) {
    assertEquals(0.0, b[i].x);
    assertEquals(0.0, b[i].y);
  }
  for (var i = 0; i < c.length; i++) {
    assertEquals(0.0, c[i].x);
    assertEquals(0.0, c[i].y);
  }
  for (var i = 0; i < d.length; i++) {
    assertEquals(0.0, d[i].x);
    assertEquals(0.0, d[i].y);
  }
  for (var i = 0; i < a.length; i++) {
    a[i] = i+start;
  }
  for (var i = 0; i < b.length; i++) {
    assertTrue(0.0 != b[i].x);
    assertTrue(0.0 != b[i].y);
  }
  for (var i = 0; i < c.length; i++) {
    assertTrue(0.0 != c[i].x);
    assertTrue(0.0 != c[i].y);
  }
  for (var i = 0; i < d.length; i++) {
    assertTrue(0.0 != d[i].x);
    assertTrue(0.0 != d[i].y);
  }
  assertEquals(start+0, b[0].x);
  assertEquals(start+1, b[0].y);
  assertEquals(start+2, b[1].x);
  assertEquals(start+3, b[1].y);
  assertEquals(start+4, b[2].x);
  assertEquals(start+5, b[2].y);
  assertEquals(start+6, b[3].x);
  assertEquals(start+7, b[3].y);

  assertEquals(start+2, c[0].x);
  assertEquals(start+3, c[0].y);
  assertEquals(start+4, c[1].x);
  assertEquals(start+5, c[1].y);
  assertEquals(start+6, c[2].x);
  assertEquals(start+7, c[2].y);

  assertEquals(start+0, d[0].x);
  assertEquals(start+1, d[0].y);
}

testFloat64x2ArrayViewValues();

function testViewOnFloat64x2Array() {
  var a = new Float64x2Array(4);
  a[0] = SIMD.float64x2(1, 2);
  a[1] = SIMD.float64x2(5, 6);
  a[2] = SIMD.float64x2(9, 10);
  a[3] = SIMD.float64x2(13, 14);
  assertEquals(a[0].x, 1);
  assertEquals(a[0].y, 2);

  assertEquals(a[1].x, 5);
  assertEquals(a[1].y, 6);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);

  assertEquals(a[3].x, 13);
  assertEquals(a[3].y, 14);

  // Create view on a.
  var b = new Float64Array(a.buffer);
  assertEquals(b.length, 8);
  assertEquals(b.byteLength, 64);
  b[2] = 99.0;
  b[6] = 1.0;

  // Observe changes in "a"
  assertEquals(a[0].x, 1);
  assertEquals(a[0].y, 2);

  assertEquals(a[1].x, 99.0);
  assertEquals(a[1].y, 6);

  assertEquals(a[2].x, 9);
  assertEquals(a[2].y, 10);

  assertEquals(a[3].x, 1.0);
  assertEquals(a[3].y, 14);
}

testViewOnFloat64x2Array();

function testArrayOfFloat64x2() {
  var a = [];
  var a4 = new Float64x2Array(2);
  for (var i = 0; i < a4.length; i++) {
    a[i] = SIMD.float64x2(i, i + 1);
    a4[i] = SIMD.float64x2(i, i + 1);
  }

  for (var i = 0; i < a4.length; i++) {
    assertEquals(a[i].x, a4[i].x);
    assertEquals(a[i].y, a4[i].y);
  }
}

testArrayOfFloat64x2();
