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
//
// Flags: --simd_object --allow-natives-syntax --noturbo_osr --noturbo_deoptimization

function asmModule(stdlib, imports, buffer) {
  "use asm"
  var i4 = stdlib.SIMD.int32x4;
  var i4check = i4.check;
  var i4add = i4.add;
  var i4and = i4.and;
  var i4sub = i4.sub;
  var i4mul = i4.mul;
  var i4or = i4.or;
  var i4xor = i4.xor;
  var i4bool = i4.bool;
  var i4select = i4.select;
  var i4shuffle = i4.shuffle;
  var i4neg = i4.neg;
  var i4not = i4.not;
  var i4splat = i4.splat;
  var i4swizzle = i4.swizzle;
  var i4shiftLeftByScalar = i4.shiftLeftByScalar;
  var i4shiftRightLogicalByScalar = i4.shiftRightLogicalByScalar;
  var i4shiftRightArithmeticByScalar = i4.shiftRightArithmeticByScalar;
  var i4equal = i4.equal;
  var i4greaterThan = i4.greaterThan;
  var i4lessThan = i4.lessThan;
  var i4withX = i4.withX;
  var i4withY = i4.withY;
  var i4withZ = i4.withZ;
  var i4withW = i4.withW;

  var a = i4check(imports.a);
  var b = i4check(imports.b);

  function add(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4add(a, b);
    return i4check(ret);
  }

  function addLocal() {
    var a = i4(+1, +2, +3, +4);
    var b = i4(+5, +6, +7, +8);
    var ret = i4();
    ret = i4add(a, b);
    return i4check(ret);
  }

  function addImports() {
    var ret = i4();
    ret = i4add(a, b);
    return i4check(ret);
  }

  function sub(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4sub(a, b);
    return i4check(ret);
  }

  function subLocal() {
    var a = i4(+1, +2, +3, +4);
    var b = i4(+5, +6, +7, +8);
    var ret = i4();
    ret = i4sub(a, b);
    return i4check(ret);
  }

  function subImports() {
    var ret = i4();
    ret = i4sub(a, b);
    return i4check(ret);
  }

  function mul(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4mul(a, b);
    return i4check(ret);
  }

  function mulLocal() {
    var a = i4(+1, +2, +3, +4);
    var b = i4(+5, +6, +7, +8);
    var ret = i4();
    ret = i4mul(a, b);
    return i4check(ret);
  }

  function mulImports() {
    var ret = i4();
    ret = i4mul(a, b);
    return i4check(ret);
  }

  function and(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4and(a, b);
    return i4check(ret);
  }

  function andLocal() {
    var a = i4(+1, +2, +3, +4);
    var b = i4(+5, +6, +7, +8);
    var ret = i4();
    ret = i4and(a, b);
    return i4check(ret);
  }

  function andImports() {
    var ret = i4();
    ret = i4and(a, b);
    return i4check(ret);
  }

  function or(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4or(a, b);
    return i4check(ret);
  }

  function orLocal() {
    var a = i4(+1, +2, +3, +4);
    var b = i4(+5, +6, +7, +8);
    var ret = i4();
    ret = i4or(a, b);
    return i4check(ret);
  }

  function orImports() {
    var ret = i4();
    ret = i4or(a, b);
    return i4check(ret);
  }

  function xor(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4xor(a, b);
    return i4check(ret);
  }

  function xorLocal() {
    var a = i4(+1, +2, +3, +4);
    var b = i4(+5, +6, +7, +8);
    var ret = i4();
    ret = i4xor(a, b);
    return i4check(ret);
  }

  function xorImports() {
    var ret = i4();
    ret = i4xor(a, b);
    return i4check(ret);
  }

  function getx(a) {
    a = i4check(a);
    var x = a.x;
    return x | 0;
  }

  function gety(a) {
    a = i4check(a);
    var y = a.y;
    return y | 0;
  }

  function getz(a) {
    a = i4check(a);
    var z = a.z;
    return z | 0;
  }

  function getw(a) {
    a = i4check(a);
    var w = a.w;
    return w | 0;
  }

  function getSignMask(a) {
    a = i4check(a);
    var s = a.signMask;
    return s | 0;
  }

  function getflagX(a) {
    a = i4check(a);
    var fx = a.flagX;
    return fx;
  }

  function getflagY(a) {
    a = i4check(a);
    var fy = a.flagY;
    return fy;
  }

  function getflagZ(a) {
    a = i4check(a);
    var fz = a.flagZ;
    return fz;
  }

  function getflagW(a) {
    a = i4check(a);
    var fw = a.flagW;
    return fw;
  }

  function neg(a) {
    a = i4check(a);
    var ret = i4();
    ret = i4neg(a);
    return i4check(ret);
  }

  function not(a) {
    a = i4check(a);
    var ret = i4();
    ret = i4not(a);
    return i4check(ret);
  }

  function splat(v) {
    v = v | 0;
    var ret = i4();
    ret = i4splat(v);
    return i4check(ret);
  }

  function withX(a, b) {
    a = i4check(a);
    b = b | 0;
    var ret = i4();
    ret = i4withX(a, b);
    return i4check(ret);
  }

  function withY(a, b) {
    a = i4check(a);
    b = b | 0;
    var ret = i4();
    ret = i4withY(a, b);
    return i4check(ret);
  }

  function withZ(a, b) {
    a = i4check(a);
    b = b | 0;
    var ret = i4();
    ret = i4withZ(a, b);
    return i4check(ret);
  }

  function withW(a, b) {
    a = i4check(a);
    b = b | 0;
    var ret = i4();
    ret = i4withW(a, b);
    return i4check(ret);
  }

  function getxLocal() {
    var a = i4(+1, +2, +3, +4);
    var x = a.x;
    return x | 0;
  }

  function getyLocal() {
    var a = i4(+1, +2, +3, +4);
    var y = a.y;
    return y | 0;
  }

  function getzLocal() {
    var a = i4(+1, +2, +3, +4);
    var z = a.z;
    return z | 0;
  }

  function getwLocal() {
    var a = i4(+1, +2, +3, +4);
    var w = a.w;
    return w | 0;
  }

  function getSignMaskLocal() {
    var a = i4(+1, +2, +3, +4);
    var s = a.signMask;
    return s | 0;
  }

  function getflagXLocal() {
    var a = i4(+1, +2, +3, +4);
    var fx = a.flagX;
    return fx;
  }

  function getflagYLocal() {
    var a = i4(+1, +2, +3, +4);
    var fy = a.flagY;
    return fy;
  }

  function getflagZLocal() {
    var a = i4(+1, +2, +3, +4);
    var fz = a.flagZ;
    return fz;
  }

  function getflagWLocal() {
    var a = i4(+1, +2, +3, +4);
    var fw = a.flagW;
    return fw;
  }

  function negLocal() {
    var a = i4(+1, +2, +3, +4);
    var ret  = i4();
    ret = i4neg(a);
    return i4check(ret);
  }

  function notLocal() {
    var a = i4(+1, +2, +3, +4);
    var ret  = i4();
    ret = i4not(a);
    return i4check(ret);
  }

  function withXLocal(b) {
    var a = i4(+1, +2, +3, +4);
    b = b | 0;
    var ret = i4();
    ret = i4withX(a, b);
    return i4check(ret);
  }

  function withYLocal(b) {
    var a = i4(+1, +2, +3, +4);
    b = b | 0;
    var ret = i4();
    ret = i4withY(a, b);
    return i4check(ret);
  }

  function withZLocal(b) {
    var a = i4(+1, +2, +3, +4);
    b = b | 0;
    var ret = i4();
    ret = i4withZ(a, b);
    return i4check(ret);
  }

  function withWLocal(b) {
    var a = i4(+1, +2, +3, +4);
    b = b | 0;
    var ret = i4();
    ret = i4withW(a, b);
    return i4check(ret);
  }

  function getxImports() {
    var x = a.x;
    return x | 0;
  }

  function getyImports() {
    var y = a.y;
    return y | 0;
  }

  function getzImports() {
    var z = a.z;
    return z | 0;
  }

  function getwImports() {
    var w = a.w;
    return w | 0;
  }

  function bool(x, y, z, w) {
    var ret = i4();
    ret = i4bool(x, y, z, w);
    return ret;
  }

  function select(s, t, f) {
    s = i4check(s);
    t = i4check(t);
    f = i4check(f);
    var ret = i4();
    ret = i4select(s, t, f);
    return i4check(ret);
  }

  function shuffle1(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4shuffle(a, b, 0, 0, 4, 4);
    return i4check(ret);
  }

  function shuffle2(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4shuffle(a, b, 1, 1, 5, 5);
    return i4check(ret);
  }

  function shuffle3(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4shuffle(a, b, 2, 2, 6, 6);
    return i4check(ret);
  }

  function shuffle4(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4shuffle(a, b, 3, 3, 7, 7);
    return i4check(ret);
  }

  function shuffle5(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4shuffle(a, b, 3, 2, 5, 4);
    return i4check(ret);
  }

  function shuffle6(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4shuffle(a, b, 6, 7, 2, 3);
    return i4check(ret);
  }

  function getSignMaskImports() {
    var s = a.signMask;
    return s | 0;
  }

  function getflagXImports() {
    var fx = a.flagX;
    return fx;
  }

  function getflagYImports() {
    var fy = a.flagY;
    return fy;
  }

  function getflagZImports() {
    var fz = a.flagZ;
    return fz;
  }

  function getflagWImports() {
    var fw = a.flagW;
    return fw;
  }

  function negImports() {
    var ret  = i4();
    ret = i4neg(a);
    return i4check(ret);
  }

  function notImports() {
    var ret  = i4();
    ret = i4not(a);
    return i4check(ret);
  }

  function swizzle1(a) {
    a = i4check(a);
    var ret = i4();
    ret = i4swizzle(a, 0, 0, 0, 0);
    return i4check(ret);
  }

  function swizzle2(a) {
    a = i4check(a);
    var ret = i4();
    ret = i4swizzle(a, 3, 2, 1, 0);
    return i4check(ret);
  }

  function shiftLeftByScalar(a, n) {
    a = i4check(a);
    n = n | 0;
    var ret = i4();
    ret = i4shiftLeftByScalar(a, n);
    return i4check(ret);
  }

  function shiftLeftByScalarConst(a) {
    a = i4check(a);
    var ret = i4();
    ret = i4shiftLeftByScalar(a, 2);
    return i4check(ret);
  }

  function shiftRightLogicalByScalar (a, n) {
    a = i4check(a);
    n = n | 0;
    var ret = i4();
    ret = i4shiftRightLogicalByScalar(a, n);
    return i4check(ret);
  }

  function shiftRightLogicalByScalarConst(a) {
    a = i4check(a);
    var ret = i4();
    ret = i4shiftRightLogicalByScalar(a, 2);
    return i4check(ret);
  }

  function shiftRightArithmeticByScalar(a, n) {
    a = i4check(a);
    n = n | 0;
    var ret = i4();
    ret = i4shiftRightArithmeticByScalar(a, n);
    return i4check(ret);
  }

  function shiftRightArithmeticByScalarConst(a) {
    a = i4check(a);
    var ret = i4();
    ret = i4shiftRightArithmeticByScalar(a, 2);
    return i4check(ret);
  }

  function equal(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4equal(a, b);
    return i4check(ret);
  }

  function greaterThan(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4greaterThan(a, b);
    return i4check(ret);
  }

  function lessThan(a, b) {
    a = i4check(a);
    b = i4check(b);
    var ret = i4();
    ret = i4lessThan(a, b);
    return i4check(ret);
  }

  function withXImports(b) {
    b = b | 0;
    var ret = i4();
    ret = i4withX(a, b);
    return i4check(ret);
  }

  function withYImports(b) {
    b = b | 0;
    var ret = i4();
    ret = i4withY(a, b);
    return i4check(ret);
  }

  function withZImports(b) {
    b = b | 0;
    var ret = i4();
    ret = i4withZ(a, b);
    return i4check(ret);
  }

  function withWImports(b) {
    b = b | 0;
    var ret = i4();
    ret = i4withW(a, b);
    return i4check(ret);
  }

  return {add : add, addLocal : addLocal, addImports : addImports,
          sub : sub, subLocal : subLocal, subImports : subImports,
          mul : mul, mulLocal : mulLocal, mulImports : mulImports,
          and : and, andLocal : andLocal, andImports : andImports,
          or : or, orLocal : orLocal, orImports : orImports,
          xor : xor, xorLocal : xorLocal, xorImports : xorImports,
          getx : getx, getxLocal : getxLocal, getxImports : getxImports,
          gety : gety, getyLocal : getyLocal, getyImports : getyImports,
          getz : getz, getzLocal : getzLocal, getzImports : getzImports,
          getw : getw, getwLocal : getwLocal, getwImports : getwImports,
          bool : bool, select : select, shuffle1 : shuffle1, shuffle2 : shuffle2,
          shuffle3 : shuffle3, shuffle4 : shuffle4, shuffle5 : shuffle5, shuffle6 : shuffle6,
          getSignMask : getSignMask, getSignMaskLocal : getSignMaskLocal, getSignMaskImports : getSignMaskImports,
          getflagX : getflagX, getflagXLocal : getflagXLocal, getflagXImports : getflagXImports,
          getflagY : getflagY, getflagYLocal : getflagYLocal, getflagYImports : getflagYImports,
          getflagZ : getflagZ, getflagZLocal : getflagZLocal, getflagZImports : getflagZImports,
          getflagW : getflagW, getflagWLocal : getflagWLocal, getflagWImports : getflagWImports,
          not : not, notLocal : notLocal, notImports : notImports,
          neg : neg, negLocal : negLocal, negImports : negImports,
          splat : splat, swizzle1 : swizzle1, swizzle2 : swizzle2,
          shiftLeftByScalar : shiftLeftByScalar, shiftLeftByScalarConst : shiftLeftByScalarConst,
          shiftRightLogicalByScalar : shiftRightLogicalByScalar,
          shiftRightLogicalByScalarConst : shiftRightLogicalByScalarConst,
          shiftRightArithmeticByScalar : shiftRightArithmeticByScalar,
          shiftRightArithmeticByScalarConst : shiftRightArithmeticByScalarConst,
          equal : equal, greaterThan : greaterThan, lessThan : lessThan,
          withX : withX, withXLocal : withXLocal, withXImports : withXImports,
          withY : withY, withYLocal : withYLocal, withYImports : withYImports,
          withZ : withZ, withZLocal : withZLocal, withZImports : withZImports,
          withW : withW, withWLocal : withWLocal, withWImports : withWImports
          };
}


var a = SIMD.int32x4(+1, +2, +3, +4);
var b = SIMD.int32x4(+5, +6, +7, +8);
var m = asmModule(this, {a : a, b : b});
// and
var result = m.add(a, b);
var expected = SIMD.int32x4.add(a, b);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.addLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.addImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// sub
var result = m.sub(a, b);
var expected = SIMD.int32x4.sub(a, b);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.subLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.subImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// mul
var result = m.mul(a, b);
var expected = SIMD.int32x4.mul(a, b);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.mulLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.mulImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// and
var result = m.and(a, b);
var expected = SIMD.int32x4.and(a, b);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.andLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.andImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// or
var result = m.or(a, b);
var expected = SIMD.int32x4.or(a, b);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.orLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.orImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// xor
var result = m.xor(a, b);
var expected = SIMD.int32x4.xor(a, b);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.xorLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.xorImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// getx
var result = m.getx(a);
var expected = a.x;
assertEquals(result, expected);

var result = m.getxLocal();
assertEquals(result, expected);

var result = m.getxImports();
assertEquals(result, expected);

// gety
var result = m.gety(a);
var expected = a.y;
assertEquals(result, expected);

var result = m.getyLocal();
assertEquals(result, expected);

var result = m.getyImports();
assertEquals(result, expected);

// getz
var result = m.getz(a);
var expected = a.z;
assertEquals(result, expected);

var result = m.getzLocal();
assertEquals(result, expected);

var result = m.getzImports();
assertEquals(result, expected);

// getw
var result = m.getw(a);
var expected = a.w;
assertEquals(result, expected);

var result = m.getwLocal();
assertEquals(result, expected);

var result = m.getwImports();
assertEquals(result, expected);

//splat
var result = m.splat(+5);
var expected = SIMD.int32x4.splat(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// not
var result = m.not(a);
var expected = SIMD.int32x4.not(a);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.notLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.notImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// neg
var result = m.neg(a);
var expected = SIMD.int32x4.neg(a);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.negLocal();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.negImports();
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// WithX
var result = m.withX(a, +5);
var expected = SIMD.int32x4.withX(a, +5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withXLocal(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withXImports(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// WithY
var result = m.withY(a, +5);
var expected = SIMD.int32x4.withY(a, +5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withYLocal(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withYImports(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// WithZ
var result = m.withZ(a, +5);
var expected = SIMD.int32x4.withZ(a, +5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withZLocal(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withZImports(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// WithW
var result = m.withW(a, +5);
var expected = SIMD.int32x4.withW(a, +5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withWLocal(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.withWImports(+5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.bool(true, false, true, false);
var expected = SIMD.int32x4.bool(true, false, true, false);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var s = SIMD.int32x4.bool(true, true, false, false);
var t = SIMD.int32x4(1, 2, 3, 4);
var f = SIMD.int32x4(5, 6, 7, 8);
var result = m.select(s, t, f);
var expected = SIMD.int32x4.select(s, t, f);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var a = SIMD.int32x4(1, 2, 3, 4);
var b = SIMD.int32x4(5, 6, 7, 8);
var result = m.shuffle1(a, b);
var expected = SIMD.int32x4.shuffle(a, b, 0, 0, 4, 4);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shuffle2(a, b);
var expected = SIMD.int32x4.shuffle(a, b, 1, 1, 5, 5);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shuffle3(a, b);
var expected = SIMD.int32x4.shuffle(a, b, 2, 2, 6, 6);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shuffle4(a, b);
var expected = SIMD.int32x4.shuffle(a, b, 3, 3, 7, 7);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shuffle5(a, b);
var expected = SIMD.int32x4.shuffle(a, b, 3, 2, 5, 4);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shuffle6(a, b);
var expected = SIMD.int32x4.shuffle(a, b, 6, 7, 2, 3);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// getsignmask
var result = m.getSignMask(a);
var expected = a.signMask;
assertEquals(result, expected);

var result = m.getSignMaskLocal();
assertEquals(result, expected);

var result = m.getSignMaskImports();
assertEquals(result, expected);

// getFlagX
var result = m.getflagX(a);
var expected = a.flagX;
assertEquals(result, expected);

var result = m.getflagXLocal();
assertEquals(result, expected);

var result = m.getflagXImports();
assertEquals(result, expected);

// getFlagY
var result = m.getflagY(a);
var expected = a.flagY;
assertEquals(result, expected);

var result = m.getflagYLocal();
assertEquals(result, expected);

var result = m.getflagYImports();
assertEquals(result, expected);

// getFlagZ
var result = m.getflagZ(a);
var expected = a.flagZ;
assertEquals(result, expected);

var result = m.getflagZLocal();
assertEquals(result, expected);

var result = m.getflagZImports();
assertEquals(result, expected);

// getFlagW
var result = m.getflagW(a);
var expected = a.flagW;
assertEquals(result, expected);

var result = m.getflagWLocal();
assertEquals(result, expected);

var result = m.getflagWImports();
assertEquals(result, expected);

var result = m.swizzle1(SIMD.int32x4(1, 2, 3, 4));
var expected = SIMD.int32x4.swizzle(SIMD.int32x4(1, 2, 3, 4), 0, 0, 0, 0);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.swizzle2(SIMD.int32x4(1, 2, 3, 4));
var expected = SIMD.int32x4.swizzle(SIMD.int32x4(1, 2, 3, 4), 3, 2, 1, 0);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var a = SIMD.int32x4(1, 2, 100, 0);
var result = m.shiftLeftByScalar(a, 2);
var expected = SIMD.int32x4.shiftLeftByScalar(a, 2);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shiftLeftByScalarConst(a);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shiftRightLogicalByScalar(a, 2);
var expected = SIMD.int32x4.shiftRightLogicalByScalar(a, 2);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shiftRightLogicalByScalarConst(a);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shiftRightArithmeticByScalar(a, 2);
var expected = SIMD.int32x4.shiftRightArithmeticByScalar(a, 2);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.shiftRightArithmeticByScalarConst(a);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var a = SIMD.int32x4(1, 2, 100, 1);
var b = SIMD.int32x4(2, 2, 1, 100);
var result = m.equal(a, b);
var expected = SIMD.int32x4.equal(a, b)
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.greaterThan(a, b);
var expected = SIMD.int32x4.greaterThan(a, b)
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

var result = m.lessThan(a, b);
var expected = SIMD.int32x4.lessThan(a, b)
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);


function asmModule2(stdlib, imports, buffer) {
  "use asm"
  var i4 = stdlib.SIMD.int32x4;
  var i4check = i4.check;
  var i4load = i4.load;
  var i4loadX = i4.loadX;
  var i4loadXY = i4.loadXY;
  var i4loadXYZ = i4.loadXYZ;
  var i4store = i4.store;
  var i4storeX = i4.storeX;
  var i4storeXY = i4.storeXY;
  var i4storeXYZ = i4.storeXYZ;
  var uint8array = new stdlib.Uint8Array(buffer);
  var i32array = new stdlib.Int32Array(buffer);

  function loadI32(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4load(i32array, a | 0);
    return i4check(ret);
  }

  function loadI32X(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4loadX(i32array, a | 0);
    return i4check(ret);
  }

  function loadI32XY(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4loadXY(i32array, a | 0);
    return i4check(ret);
  }

  function loadI32XYZ(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4loadXYZ(i32array, a);
    return i4check(ret);
  }

  function loadU8(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4load(uint8array, a | 0);
    return i4check(ret);
  }

  function loadU8X(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4loadX(uint8array, a | 0);
    return i4check(ret);
  }

  function loadU8XY(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4loadXY(uint8array, a | 0);
    return i4check(ret);
  }

  function loadU8XYZ(a) {
    a = a | 0;
    var ret = i4(0, 0, 0, 0);
    ret = i4loadXYZ(uint8array, a);
    return i4check(ret);
  }

  function storeI32(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4store(i32array, a, v);
  }

  function storeI32X(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4storeX(i32array, a, v);
  }

  function storeI32XY(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4storeXY(i32array, a, v);
  }

  function storeI32XYZ(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4storeXYZ(i32array, a, v);
  }

  function storeU8(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4store(uint8array, a, v);
  }

  function storeU8X(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4storeX(uint8array, a, v);
  }

  function storeU8XY(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4storeXY(uint8array, a, v);
  }

  function storeU8XYZ(a, v) {
    a =  a | 0;
    v = i4check(v);
    i4storeXYZ(uint8array, a, v);
  }

  return {
          loadI32 : loadI32, loadI32X : loadI32X, loadI32XY : loadI32XY, loadI32XYZ : loadI32XYZ,
          loadU8 : loadU8, loadU8X : loadU8X, loadU8XY : loadU8XY, loadU8XYZ : loadU8XYZ,
          storeI32 : storeI32, storeI32X : storeI32X, storeI32XY : storeI32XY, storeI32XYZ : storeI32XYZ,
          storeU8 : storeU8, storeU8X : storeU8X, storeU8XY : storeU8XY, storeU8XYZ : storeU8XYZ,
          };
}


var heap = new ArrayBuffer(0x4000);
var i32array = new Int32Array(heap);
var uint8array = new Uint8Array(heap);
for (var i = 0; i < 0x4000; i = i + 4) {
  i32array[i>>2] = i / 4;
}
var m = asmModule2(this, {}, heap);
// Int32Array
var result = m.loadI32(4);
var expected = SIMD.int32x4.load(i32array, 4);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);
// Uint8Array
var result = m.loadU8(4 << 2);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// Int32Array
var result = m.loadI32X(4);
var expected = SIMD.int32x4.loadX(i32array, 4);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);
// Uint8Array
var result = m.loadU8X(4 << 2);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// Int32Array
var result = m.loadI32XY(4);
var expected = SIMD.int32x4.loadXY(i32array, 4);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);
// Uint8Array
var result = m.loadU8XY(4 << 2);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// Int32Array
var result = m.loadI32XYZ(4);
var expected = SIMD.int32x4.loadXYZ(i32array, 4);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);
// Uint8Array
var result = m.loadU8XYZ(4 << 2);
assertEquals(result.x, expected.x);
assertEquals(result.y, expected.y);
assertEquals(result.z, expected.z);
assertEquals(result.w, expected.w);

// Int32Array
m.storeI32(4, SIMD.int32x4(1, 2, 3, 4));
var result = SIMD.int32x4.load(i32array, 4);
assertEquals(result.x, 1);
assertEquals(result.y, 2);
assertEquals(result.z, 3);
assertEquals(result.w, 4);
// Uint8Array
m.storeU8(4<<2, SIMD.int32x4(5, 6, 7, 8));
var result = SIMD.int32x4.load(uint8array, 4<<2);
assertEquals(result.x, 5);
assertEquals(result.y, 6);
assertEquals(result.z, 7);
assertEquals(result.w, 8);

// Int32Array
m.storeI32X(8, SIMD.int32x4(1, 2, 3, 4));
var result = SIMD.int32x4.load(i32array, 8);
assertEquals(result.x, 1);
assertEquals(result.y, 9);
assertEquals(result.z, 10);
assertEquals(result.w, 11);
// Uint8Array
m.storeU8X(8<<2, SIMD.int32x4(5, 6, 7, 8));
var result = SIMD.int32x4.load(uint8array, 8<<2);
assertEquals(result.x, 5);
assertEquals(result.y, 9);
assertEquals(result.z, 10);
assertEquals(result.w, 11);

// Int32Array
m.storeI32XY(12, SIMD.int32x4(1, 2, 3, 4));
var result = SIMD.int32x4.load(i32array, 12);
assertEquals(result.x, 1);
assertEquals(result.y, 2);
assertEquals(result.z, 14);
assertEquals(result.w, 15);
// Uint8Array
m.storeU8XY(12<<2, SIMD.int32x4(5, 6, 7, 8));
var result = SIMD.int32x4.load(uint8array, 12<<2);
assertEquals(result.x, 5);
assertEquals(result.y, 6);
assertEquals(result.z, 14);
assertEquals(result.w, 15);

// Int32Array
m.storeI32XYZ(16, SIMD.int32x4(1, 2, 3, 4));
var result = SIMD.int32x4.load(i32array, 16);
assertEquals(result.x, 1);
assertEquals(result.y, 2);
assertEquals(result.z, 3);
assertEquals(result.w, 19);
// Uint8Array
m.storeU8XYZ(16<<2, SIMD.int32x4(5, 6, 7, 8));
var result = SIMD.int32x4.load(uint8array, 16<<2);
assertEquals(result.x, 5);
assertEquals(result.y, 6);
assertEquals(result.z, 7);
assertEquals(result.w, 19);
