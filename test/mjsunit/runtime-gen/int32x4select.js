// Copyright 2014 the V8 project authors. All rights reserved.
// AUTO-GENERATED BY tools/generate-runtime-tests.py, DO NOT MODIFY
// Flags: --allow-natives-syntax --harmony --simd-object
var _self = SIMD.int32x4(0, 0, 0, 0);
var _tv = SIMD.float32x4(0.0, 0.0, 0.0, 0.0);
var _fv = SIMD.float32x4(0.0, 0.0, 0.0, 0.0);
%Int32x4Select(_self, _tv, _fv);
