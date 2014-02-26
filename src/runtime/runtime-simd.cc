// Copyright 2014 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "src/v8.h"

#include "src/arguments.h"
#include "src/base/bits.h"
#include "src/bootstrapper.h"
#include "src/codegen.h"
#include "src/runtime/runtime-utils.h"


namespace v8 {
namespace internal {


RUNTIME_FUNCTION(Runtime_AllocateFloat32x4) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 0);

  float32x4_value_t zero = {{0, 0, 0, 0}};
  return *isolate->factory()->NewFloat32x4(zero);
}


RUNTIME_FUNCTION(Runtime_AllocateFloat64x2) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 0);

  float64x2_value_t zero = {{0, 0}};
  return *isolate->factory()->NewFloat64x2(zero);
}


RUNTIME_FUNCTION(Runtime_AllocateInt32x4) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 0);

  int32x4_value_t zero = {{0, 0, 0, 0}};
  return *isolate->factory()->NewInt32x4(zero);
}


#define RETURN_Float32x4_RESULT(value)                                         \
  return *isolate->factory()->NewFloat32x4(value);


#define RETURN_Float64x2_RESULT(value)                                         \
  return *isolate->factory()->NewFloat64x2(value);


#define RETURN_Int32x4_RESULT(value)                                           \
  return *isolate->factory()->NewInt32x4(value);


RUNTIME_FUNCTION(Runtime_CreateFloat32x4) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 4);
  RUNTIME_ASSERT(args[0]->IsNumber());
  RUNTIME_ASSERT(args[1]->IsNumber());
  RUNTIME_ASSERT(args[2]->IsNumber());
  RUNTIME_ASSERT(args[3]->IsNumber());

  float32x4_value_t value;
  value.storage[0] = static_cast<float>(args.number_at(0));
  value.storage[1] = static_cast<float>(args.number_at(1));
  value.storage[2] = static_cast<float>(args.number_at(2));
  value.storage[3] = static_cast<float>(args.number_at(3));

  RETURN_Float32x4_RESULT(value);
}


RUNTIME_FUNCTION(Runtime_CreateFloat64x2) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 2);
  RUNTIME_ASSERT(args[0]->IsNumber());
  RUNTIME_ASSERT(args[1]->IsNumber());

  float64x2_value_t value;
  value.storage[0] = args.number_at(0);
  value.storage[1] = args.number_at(1);

  RETURN_Float64x2_RESULT(value);
}


RUNTIME_FUNCTION(Runtime_CreateInt32x4) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 4);
  RUNTIME_ASSERT(args[0]->IsNumber());
  RUNTIME_ASSERT(args[1]->IsNumber());
  RUNTIME_ASSERT(args[2]->IsNumber());
  RUNTIME_ASSERT(args[3]->IsNumber());

  int32x4_value_t value;
  value.storage[0] = NumberToInt32(args[0]);
  value.storage[1] = NumberToInt32(args[1]);
  value.storage[2] = NumberToInt32(args[2]);
  value.storage[3] = NumberToInt32(args[3]);

  RETURN_Int32x4_RESULT(value);
}


// Used to convert between uint32_t and float32 without breaking strict
// aliasing rules.
union float32_uint32 {
  float f;
  uint32_t u;
  float32_uint32(float v) {
    f = v;
  }
  float32_uint32(uint32_t v) {
    u = v;
  }
};


union float64_uint64 {
  double f;
  uint64_t u;
  float64_uint64(double v) {
    f = v;
  }
  float64_uint64(uint64_t v) {
    u = v;
  }
};


RUNTIME_FUNCTION(Runtime_Float32x4GetSignMask) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 1);
  CONVERT_ARG_CHECKED(Float32x4, self, 0);
  float32_uint32 x(self->x());
  float32_uint32 y(self->y());
  float32_uint32 z(self->z());
  float32_uint32 w(self->w());
  uint32_t mx = (x.u & 0x80000000) >> 31;
  uint32_t my = (y.u & 0x80000000) >> 31;
  uint32_t mz = (z.u & 0x80000000) >> 31;
  uint32_t mw = (w.u & 0x80000000) >> 31;
  uint32_t value = mx | (my << 1) | (mz << 2) | (mw << 3);
  return *isolate->factory()->NewNumberFromUint(value);
}


RUNTIME_FUNCTION(Runtime_Float64x2GetSignMask) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 1);
  CONVERT_ARG_CHECKED(Float64x2, self, 0);
  float64_uint64 x(self->x());
  float64_uint64 y(self->y());
  uint64_t mx = x.u >> 63;
  uint64_t my = y.u >> 63;
  uint32_t value = uint32_t(mx | (my << 1));
  return *isolate->factory()->NewNumberFromUint(value);
}


RUNTIME_FUNCTION(Runtime_Int32x4GetSignMask) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 1);
  CONVERT_ARG_CHECKED(Int32x4, self, 0);
  uint32_t mx = (self->x() & 0x80000000) >> 31;
  uint32_t my = (self->y() & 0x80000000) >> 31;
  uint32_t mz = (self->z() & 0x80000000) >> 31;
  uint32_t mw = (self->w() & 0x80000000) >> 31;
  uint32_t value = mx | (my << 1) | (mz << 2) | (mw << 3);
  return *isolate->factory()->NewNumberFromUint(value);
}


#define LANE_VALUE(VALUE, LANE) \
  VALUE->LANE()


#define LANE_FLAG(VALUE, LANE)  \
  VALUE->LANE() != 0


#define SIMD128_LANE_ACCESS_FUNCTIONS(V)                      \
  V(Float32x4, GetX, NewNumber, x, LANE_VALUE)       \
  V(Float32x4, GetY, NewNumber, y, LANE_VALUE)       \
  V(Float32x4, GetZ, NewNumber, z, LANE_VALUE)       \
  V(Float32x4, GetW, NewNumber, w, LANE_VALUE)       \
  V(Float64x2, GetX, NewNumber, x, LANE_VALUE)       \
  V(Float64x2, GetY, NewNumber, y, LANE_VALUE)       \
  V(Int32x4, GetX, NewNumberFromInt, x, LANE_VALUE)            \
  V(Int32x4, GetY, NewNumberFromInt, y, LANE_VALUE)            \
  V(Int32x4, GetZ, NewNumberFromInt, z, LANE_VALUE)            \
  V(Int32x4, GetW, NewNumberFromInt, w, LANE_VALUE)            \
  V(Int32x4, GetFlagX, ToBoolean, x, LANE_FLAG)               \
  V(Int32x4, GetFlagY, ToBoolean, y, LANE_FLAG)               \
  V(Int32x4, GetFlagZ, ToBoolean, z, LANE_FLAG)               \
  V(Int32x4, GetFlagW, ToBoolean, w, LANE_FLAG)


#define DECLARE_SIMD_LANE_ACCESS_FUNCTION(                    \
    TYPE, NAME, HEAP_FUNCTION, LANE, ACCESS_FUNCTION)         \
RUNTIME_FUNCTION(Runtime_##TYPE##NAME) {        \
  HandleScope scope(isolate);                                 \
  DCHECK(args.length() == 1);                                 \
                                                              \
  CONVERT_ARG_CHECKED(TYPE, a, 0);                            \
                                                              \
  return *isolate->factory()->HEAP_FUNCTION(                  \
      ACCESS_FUNCTION(a, LANE));                              \
}


SIMD128_LANE_ACCESS_FUNCTIONS(DECLARE_SIMD_LANE_ACCESS_FUNCTION)


template<typename T>
static inline T Neg(T a) {
  return -a;
}


template<typename T>
static inline T Not(T a) {
  return ~a;
}


template<typename T>
static inline T Reciprocal(T a) {
  UNIMPLEMENTED();
}


template<>
inline float Reciprocal<float>(float a) {
  return 1.0f / a;
}


template<typename T>
static inline T ReciprocalSqrt(T a) {
  UNIMPLEMENTED();
}


template<>
inline float ReciprocalSqrt<float>(float a) {
  return sqrtf(1.0f / a);
}


template<typename T>
static inline T Sqrt(T a) {
  UNIMPLEMENTED();
}


template<>
inline float Sqrt<float>(float a) {
  return sqrtf(a);
}


template<>
inline double Sqrt<double>(double a) {
  return sqrt(a);
}


#define SIMD128_UNARY_FUNCTIONS(V)                            \
  V(Float32x4, Abs)                                           \
  V(Float32x4, Neg)                                           \
  V(Float32x4, Reciprocal)                                    \
  V(Float32x4, ReciprocalSqrt)                                \
  V(Float32x4, Sqrt)                                          \
  V(Float64x2, Abs)                                           \
  V(Float64x2, Neg)                                           \
  V(Float64x2, Sqrt)                                          \
  V(Int32x4, Neg)                                             \
  V(Int32x4, Not)


#define DECLARE_SIMD_UNARY_FUNCTION(TYPE, FUNCTION)           \
RUNTIME_FUNCTION(Runtime_##TYPE##FUNCTION) {    \
  HandleScope scope(isolate);                                 \
  DCHECK(args.length() == 1);                                 \
                                                              \
  CONVERT_ARG_CHECKED(TYPE, a, 0);                            \
                                                              \
  TYPE::value_t result;                                       \
  for (int i = 0; i < TYPE::kLanes; i++) {                    \
    result.storage[i] = FUNCTION(a->getAt(i));                \
  }                                                           \
                                                              \
  RETURN_##TYPE##_RESULT(result);                             \
}


SIMD128_UNARY_FUNCTIONS(DECLARE_SIMD_UNARY_FUNCTION)


template<typename T1, typename T2>
inline void BitsTo(T1 s, T2* t) {
  memcpy(t, &s, sizeof(T2));
}


template<typename T1, typename T2>
inline void To(T1 s, T2* t) {
}


template<>
inline void To<int32_t, float>(int32_t s, float* t) {
  *t = static_cast<float>(s);
}


template<>
inline void To<float, int32_t>(float s, int32_t* t) {
  *t = DoubleToInt32(static_cast<double>(s));
}


#define SIMD128_CONVERSION_FUNCTIONS(V)                       \
  V(Float32x4, BitsTo, Int32x4)                               \
  V(Float32x4, To, Int32x4)                                   \
  V(Int32x4, BitsTo, Float32x4)                               \
  V(Int32x4, To, Float32x4)


#define DECLARE_SIMD_CONVERSION_FUNCTION(                     \
    SOURCE_TYPE, FUNCTION, TARGET_TYPE)                       \
RUNTIME_FUNCTION(                               \
    Runtime_##SOURCE_TYPE##FUNCTION##TARGET_TYPE) {           \
  HandleScope scope(isolate);                                 \
  DCHECK(args.length() == 1);                                 \
                                                              \
  CONVERT_ARG_CHECKED(SOURCE_TYPE, a, 0);                     \
                                                              \
  TARGET_TYPE::value_t result;                                \
  for (int i = 0; i < SOURCE_TYPE::kLanes; i++) {             \
    FUNCTION(a->getAt(i), &result.storage[i]);                \
  }                                                           \
                                                              \
  RETURN_##TARGET_TYPE##_RESULT(result);                      \
}


SIMD128_CONVERSION_FUNCTIONS(DECLARE_SIMD_CONVERSION_FUNCTION)


template<typename T>
static inline T Add(T a, T b) {
  return a + b;
}


template<typename T>
static inline T Div(T a, T b) {
  return a / b;
}


template<typename T>
static inline T Mul(T a, T b) {
  return a * b;
}


template<typename T>
static inline T Sub(T a, T b) {
  return a - b;
}


template<typename T>
static inline int32_t Equal(T a, T b) {
  return a == b ? -1 : 0;
}


template<typename T>
static inline int32_t NotEqual(T a, T b) {
  return a != b ? -1 : 0;
}


template<typename T>
static inline int32_t GreaterThanOrEqual(T a, T b) {
  return a >= b ? -1 : 0;
}


template<typename T>
static inline int32_t GreaterThan(T a, T b) {
  return a > b ? -1 : 0;
}


template<typename T>
static inline int32_t LessThan(T a, T b) {
  return a < b ? -1 : 0;
}


template<typename T>
static inline int32_t LessThanOrEqual(T a, T b) {
  return a <= b ? -1 : 0;
}


template<typename T>
static inline T And(T a, T b) {
  return a & b;
}


template<typename T>
static inline T Or(T a, T b) {
  return a | b;
}


template<typename T>
static inline T Xor(T a, T b) {
  return a ^ b;
}


#define SIMD128_BINARY_FUNCTIONS(V)                           \
  V(Float32x4, Add, Float32x4)                                \
  V(Float32x4, Div, Float32x4)                                \
  V(Float32x4, Max, Float32x4)                                \
  V(Float32x4, Min, Float32x4)                                \
  V(Float32x4, Mul, Float32x4)                                \
  V(Float32x4, Sub, Float32x4)                                \
  V(Float32x4, Equal, Int32x4)                                \
  V(Float32x4, NotEqual, Int32x4)                             \
  V(Float32x4, GreaterThanOrEqual, Int32x4)                   \
  V(Float32x4, GreaterThan, Int32x4)                          \
  V(Float32x4, LessThan, Int32x4)                             \
  V(Float32x4, LessThanOrEqual, Int32x4)                      \
  V(Float64x2, Add, Float64x2)                                \
  V(Float64x2, Div, Float64x2)                                \
  V(Float64x2, Max, Float64x2)                                \
  V(Float64x2, Min, Float64x2)                                \
  V(Float64x2, Mul, Float64x2)                                \
  V(Float64x2, Sub, Float64x2)                                \
  V(Int32x4, Add, Int32x4)                                    \
  V(Int32x4, And, Int32x4)                                    \
  V(Int32x4, Mul, Int32x4)                                    \
  V(Int32x4, Or, Int32x4)                                     \
  V(Int32x4, Sub, Int32x4)                                    \
  V(Int32x4, Xor, Int32x4)                                    \
  V(Int32x4, Equal, Int32x4)                                  \
  V(Int32x4, GreaterThan, Int32x4)                            \
  V(Int32x4, LessThan, Int32x4)


#define DECLARE_SIMD_BINARY_FUNCTION(                         \
    TYPE, FUNCTION, RETURN_TYPE)                              \
RUNTIME_FUNCTION(Runtime_##TYPE##FUNCTION) {    \
  HandleScope scope(isolate);                                 \
  DCHECK(args.length() == 2);                                 \
                                                              \
  CONVERT_ARG_CHECKED(TYPE, a, 0);                            \
  CONVERT_ARG_CHECKED(TYPE, b, 1);                            \
                                                              \
  RETURN_TYPE::value_t result;                                \
  for (int i = 0; i < TYPE::kLanes; i++) {                    \
    result.storage[i] = FUNCTION(a->getAt(i), b->getAt(i));   \
  }                                                           \
                                                              \
  RETURN_##RETURN_TYPE##_RESULT(result);                      \
}


SIMD128_BINARY_FUNCTIONS(DECLARE_SIMD_BINARY_FUNCTION)


#define SIMD128_SWIZZLE_FUNCTIONS(V)                          \
  V(Float32x4)                                                \
  V(Int32x4)


#define DECLARE_SIMD_SWIZZLE_FUNCTION(TYPE)                   \
RUNTIME_FUNCTION(Runtime_##TYPE##Swizzle) {                   \
  HandleScope scope(isolate);                                 \
  DCHECK(args.length() == 5);                                 \
                                                              \
  CONVERT_ARG_CHECKED(TYPE, a, 0);                            \
  RUNTIME_ASSERT(args[1]->IsNumber());                        \
  uint32_t x = NumberToUint32(args[1]);                       \
  RUNTIME_ASSERT(args[2]->IsNumber());                        \
  uint32_t y = NumberToUint32(args[2]);                       \
  RUNTIME_ASSERT(args[3]->IsNumber());                        \
  uint32_t z = NumberToUint32(args[3]);                       \
  RUNTIME_ASSERT(args[4]->IsNumber());                        \
  uint32_t w = NumberToUint32(args[4]);                       \
                                                              \
  TYPE::value_t result;                                       \
  result.storage[0] = a->getAt(x & 0x3);                      \
  result.storage[1] = a->getAt(y & 0x3);                      \
  result.storage[2] = a->getAt(z & 0x3);                      \
  result.storage[3] = a->getAt(w & 0x3);                      \
                                                              \
  RETURN_##TYPE##_RESULT(result);                             \
}


SIMD128_SWIZZLE_FUNCTIONS(DECLARE_SIMD_SWIZZLE_FUNCTION)


#define SIMD128_SHUFFLE_FUNCTIONS(V)                          \
  V(Float32x4)                                                \
  V(Int32x4)


#define DECLARE_SIMD_SHUFFLE_FUNCTION(TYPE)                   \
RUNTIME_FUNCTION(Runtime_##TYPE##Shuffle) {                   \
  HandleScope scope(isolate);                                 \
  DCHECK(args.length() == 6);                                 \
                                                              \
  CONVERT_ARG_CHECKED(TYPE, a, 0);                            \
  CONVERT_ARG_CHECKED(TYPE, b, 1);                            \
  RUNTIME_ASSERT(args[2]->IsNumber());                        \
  uint32_t x = NumberToUint32(args[2]);                       \
  RUNTIME_ASSERT(args[3]->IsNumber());                        \
  uint32_t y = NumberToUint32(args[3]);                       \
  RUNTIME_ASSERT(args[4]->IsNumber());                        \
  uint32_t z = NumberToUint32(args[4]);                       \
  RUNTIME_ASSERT(args[5]->IsNumber());                        \
  uint32_t w = NumberToUint32(args[5]);                       \
                                                              \
  TYPE::value_t result;                                       \
  result.storage[0] = x < 4 ?                                 \
      a->getAt(x & 0x3) : b->getAt((x - 4) & 0x3);            \
  result.storage[1] = y < 4 ?                                 \
      a->getAt(y & 0x3) : b->getAt((y - 4) & 0x3);            \
  result.storage[2] = z < 4 ?                                 \
      a->getAt(z & 0x3) : b->getAt((z - 4) & 0x3);            \
  result.storage[3] = w < 4 ?                                 \
      a->getAt(w & 0x3) : b->getAt((w - 4) & 0x3);            \
                                                              \
  RETURN_##TYPE##_RESULT(result);                             \
}


SIMD128_SHUFFLE_FUNCTIONS(DECLARE_SIMD_SHUFFLE_FUNCTION)


RUNTIME_FUNCTION(Runtime_Float32x4Scale) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 2);

  CONVERT_ARG_CHECKED(Float32x4, self, 0);
  RUNTIME_ASSERT(args[1]->IsNumber());

  float _s = static_cast<float>(args.number_at(1));
  float32x4_value_t result;
  result.storage[0] = self->x() * _s;
  result.storage[1] = self->y() * _s;
  result.storage[2] = self->z() * _s;
  result.storage[3] = self->w() * _s;

  RETURN_Float32x4_RESULT(result);
}


RUNTIME_FUNCTION(Runtime_Float64x2Scale) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 2);

  CONVERT_ARG_CHECKED(Float64x2, self, 0);
  RUNTIME_ASSERT(args[1]->IsNumber());

  double _s = args.number_at(1);
  float64x2_value_t result;
  result.storage[0] = self->x() * _s;
  result.storage[1] = self->y() * _s;

  RETURN_Float64x2_RESULT(result);
}


#define ARG_TO_FLOAT32(x) \
  CONVERT_DOUBLE_ARG_CHECKED(t, 1); \
  float x = static_cast<float>(t);


#define ARG_TO_FLOAT64(x) \
  CONVERT_DOUBLE_ARG_CHECKED(x, 1); \


#define ARG_TO_INT32(x) \
  RUNTIME_ASSERT(args[1]->IsNumber()); \
  int32_t x = NumberToInt32(args[1]);


#define ARG_TO_BOOLEAN(x) \
  CONVERT_BOOLEAN_ARG_CHECKED(flag, 1); \
  int32_t x = flag ? -1 : 0;

#define SIMD128_SET_LANE_FUNCTIONS(V)                         \
  V(Float32x4, WithX, ARG_TO_FLOAT32, 0)                      \
  V(Float32x4, WithY, ARG_TO_FLOAT32, 1)                      \
  V(Float32x4, WithZ, ARG_TO_FLOAT32, 2)                      \
  V(Float32x4, WithW, ARG_TO_FLOAT32, 3)                      \
  V(Float64x2, WithX, ARG_TO_FLOAT64, 0)                      \
  V(Float64x2, WithY, ARG_TO_FLOAT64, 1)                      \
  V(Int32x4, WithX, ARG_TO_INT32, 0)                          \
  V(Int32x4, WithY, ARG_TO_INT32, 1)                          \
  V(Int32x4, WithZ, ARG_TO_INT32, 2)                          \
  V(Int32x4, WithW, ARG_TO_INT32, 3)                          \
  V(Int32x4, WithFlagX, ARG_TO_BOOLEAN, 0)                    \
  V(Int32x4, WithFlagY, ARG_TO_BOOLEAN, 1)                    \
  V(Int32x4, WithFlagZ, ARG_TO_BOOLEAN, 2)                    \
  V(Int32x4, WithFlagW, ARG_TO_BOOLEAN, 3)


#define DECLARE_SIMD_SET_LANE_FUNCTION(                       \
    TYPE, NAME, ARG_FUNCTION, LANE)                           \
RUNTIME_FUNCTION(Runtime_##TYPE##NAME) {        \
  HandleScope scope(isolate);                                 \
  DCHECK(args.length() == 2);                                 \
                                                              \
  CONVERT_ARG_CHECKED(TYPE, a, 0);                            \
  ARG_FUNCTION(value);                                        \
                                                              \
  TYPE::value_t result;                                       \
  for (int i = 0; i < TYPE::kLanes; i++) {                    \
    if (i != LANE)                                            \
      result.storage[i] = a->getAt(i);                        \
    else                                                      \
      result.storage[i] = value;                              \
  }                                                           \
                                                              \
  RETURN_##TYPE##_RESULT(result);                             \
}


SIMD128_SET_LANE_FUNCTIONS(DECLARE_SIMD_SET_LANE_FUNCTION)


RUNTIME_FUNCTION(Runtime_Float32x4Clamp) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 3);

  CONVERT_ARG_CHECKED(Float32x4, self, 0);
  CONVERT_ARG_CHECKED(Float32x4, lo, 1);
  CONVERT_ARG_CHECKED(Float32x4, hi, 2);

  float32x4_value_t result;
  float _x = self->x() > lo->x() ? self->x() : lo->x();
  float _y = self->y() > lo->y() ? self->y() : lo->y();
  float _z = self->z() > lo->z() ? self->z() : lo->z();
  float _w = self->w() > lo->w() ? self->w() : lo->w();
  result.storage[0] = _x > hi->x() ? hi->x() : _x;
  result.storage[1] = _y > hi->y() ? hi->y() : _y;
  result.storage[2] = _z > hi->z() ? hi->z() : _z;
  result.storage[3] = _w > hi->w() ? hi->w() : _w;

  RETURN_Float32x4_RESULT(result);
}


RUNTIME_FUNCTION(Runtime_Float64x2Clamp) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 3);

  CONVERT_ARG_CHECKED(Float64x2, self, 0);
  CONVERT_ARG_CHECKED(Float64x2, lo, 1);
  CONVERT_ARG_CHECKED(Float64x2, hi, 2);

  float64x2_value_t result;
  double _x = self->x() > lo->x() ? self->x() : lo->x();
  double _y = self->y() > lo->y() ? self->y() : lo->y();
  result.storage[0] = _x > hi->x() ? hi->x() : _x;
  result.storage[1] = _y > hi->y() ? hi->y() : _y;

  RETURN_Float64x2_RESULT(result);
}


RUNTIME_FUNCTION(Runtime_Float32x4ShuffleMix) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 3);

  CONVERT_ARG_CHECKED(Float32x4, first, 0);
  CONVERT_ARG_CHECKED(Float32x4, second, 1);
  RUNTIME_ASSERT(args[2]->IsNumber());

  uint32_t m = NumberToUint32(args[2]);
  float32x4_value_t result;
  float data1[4] = { first->x(), first->y(), first->z(), first->w() };
  float data2[4] = { second->x(), second->y(), second->z(), second->w() };
  result.storage[0] = data1[m & 0x3];
  result.storage[1] = data1[(m >> 2) & 0x3];
  result.storage[2] = data2[(m >> 4) & 0x3];
  result.storage[3] = data2[(m >> 6) & 0x3];

  RETURN_Float32x4_RESULT(result);
}


RUNTIME_FUNCTION(Runtime_Float32x4Select) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 3);

  CONVERT_ARG_CHECKED(Int32x4, self, 0);
  CONVERT_ARG_CHECKED(Float32x4, tv, 1);
  CONVERT_ARG_CHECKED(Float32x4, fv, 2);

  uint32_t _maskX = self->x();
  uint32_t _maskY = self->y();
  uint32_t _maskZ = self->z();
  uint32_t _maskW = self->w();
  // Extract floats and interpret them as masks.
  float32_uint32 tvx(tv->x());
  float32_uint32 tvy(tv->y());
  float32_uint32 tvz(tv->z());
  float32_uint32 tvw(tv->w());
  float32_uint32 fvx(fv->x());
  float32_uint32 fvy(fv->y());
  float32_uint32 fvz(fv->z());
  float32_uint32 fvw(fv->w());
  // Perform select.
  float32_uint32 tempX((_maskX & tvx.u) | (~_maskX & fvx.u));
  float32_uint32 tempY((_maskY & tvy.u) | (~_maskY & fvy.u));
  float32_uint32 tempZ((_maskZ & tvz.u) | (~_maskZ & fvz.u));
  float32_uint32 tempW((_maskW & tvw.u) | (~_maskW & fvw.u));

  float32x4_value_t result;
  result.storage[0] = tempX.f;
  result.storage[1] = tempY.f;
  result.storage[2] = tempZ.f;
  result.storage[3] = tempW.f;

  RETURN_Float32x4_RESULT(result);
}


RUNTIME_FUNCTION(Runtime_Int32x4Select) {
  HandleScope scope(isolate);
  DCHECK(args.length() == 3);

  CONVERT_ARG_CHECKED(Int32x4, self, 0);
  CONVERT_ARG_CHECKED(Int32x4, tv, 1);
  CONVERT_ARG_CHECKED(Int32x4, fv, 2);

  uint32_t _maskX = self->x();
  uint32_t _maskY = self->y();
  uint32_t _maskZ = self->z();
  uint32_t _maskW = self->w();

  int32x4_value_t result;
  result.storage[0] = (_maskX & tv->x()) | (~_maskX & fv->x());
  result.storage[1] = (_maskY & tv->y()) | (~_maskY & fv->y());
  result.storage[2] = (_maskZ & tv->z()) | (~_maskZ & fv->z());
  result.storage[3] = (_maskW & tv->w()) | (~_maskW & fv->w());

  RETURN_Int32x4_RESULT(result);
}


template <int n>
inline void CopyBytes(uint8_t* target, uint8_t* source) {
  for (int i = 0; i < n; i++) {
    *(target++) = *(source++);
  }
}


template<typename T, int Bytes>
inline static bool SimdTypeLoadValue(
    Isolate* isolate,
    Handle<JSArrayBuffer> buffer,
    Handle<Object> byte_offset_obj,
    T* result) {
  size_t byte_offset = 0;
  if (!TryNumberToSize(isolate, *byte_offset_obj, &byte_offset)) {
    return false;
  }

  size_t buffer_byte_length =
      NumberToSize(isolate, buffer->byte_length());
  if (byte_offset + Bytes > buffer_byte_length)  {  // overflow
    return false;
  }

  union Value {
    T data;
    uint8_t bytes[sizeof(T)];
  };

  Value value;
  memset(value.bytes, 0, sizeof(T));
  uint8_t* source =
      static_cast<uint8_t*>(buffer->backing_store()) + byte_offset;
  DCHECK(Bytes <= sizeof(T));
  CopyBytes<Bytes>(value.bytes, source);
  *result = value.data;
  return true;
}


template<typename T, int Bytes>
static bool SimdTypeStoreValue(
    Isolate* isolate,
    Handle<JSArrayBuffer> buffer,
    Handle<Object> byte_offset_obj,
    T data) {
  size_t byte_offset = 0;
  if (!TryNumberToSize(isolate, *byte_offset_obj, &byte_offset)) {
    return false;
  }

  size_t buffer_byte_length =
      NumberToSize(isolate, buffer->byte_length());
  if (byte_offset + Bytes > buffer_byte_length)  {  // overflow
    return false;
  }

  union Value {
    T data;
    uint8_t bytes[sizeof(T)];
  };

  Value value;
  value.data = data;

  uint8_t* target =
      static_cast<uint8_t*>(buffer->backing_store()) + byte_offset;
  DCHECK(Bytes <= sizeof(T));
  CopyBytes<Bytes>(target, value.bytes);
  return true;
}


#define SIMD128_LOAD_RUNTIME_FUNCTION(Type, ValueType, Lanes, Bytes)   \
RUNTIME_FUNCTION(Runtime_##Type##Load##Lanes) {                        \
  HandleScope scope(isolate);                                          \
  DCHECK(args.length() == 2);                                          \
  CONVERT_ARG_HANDLE_CHECKED(JSArrayBuffer, buffer, 0);                \
  CONVERT_NUMBER_ARG_HANDLE_CHECKED(offset, 1);                        \
  ValueType result;                                                    \
  if (SimdTypeLoadValue<ValueType, Bytes>(                             \
          isolate, buffer, offset, &result)) {                         \
    return *isolate->factory()->New##Type(result);                     \
  } else {                                                             \
    THROW_NEW_ERROR_RETURN_FAILURE(                                    \
        isolate, NewRangeError("invalid_offset",                       \
        HandleVector<Object>(NULL, 0)));                               \
  }                                                                    \
}


SIMD128_LOAD_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, XYZW, 16)
SIMD128_LOAD_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, XYZ, 12)
SIMD128_LOAD_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, XY, 8)
SIMD128_LOAD_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, X, 4)
SIMD128_LOAD_RUNTIME_FUNCTION(Float64x2, float64x2_value_t, XY, 16)
SIMD128_LOAD_RUNTIME_FUNCTION(Float64x2, float64x2_value_t, X, 8)
SIMD128_LOAD_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, XYZW, 16)
SIMD128_LOAD_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, XYZ, 12)
SIMD128_LOAD_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, XY, 8)
SIMD128_LOAD_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, X, 4)


#define SIMD128_STORE_RUNTIME_FUNCTION(Type, ValueType, Lanes, Bytes)       \
RUNTIME_FUNCTION(Runtime_##Type##Store##Lanes) {                            \
  HandleScope scope(isolate);                                               \
  DCHECK(args.length() == 3);                                               \
  CONVERT_ARG_HANDLE_CHECKED(JSArrayBuffer, buffer, 0);                     \
  CONVERT_NUMBER_ARG_HANDLE_CHECKED(offset, 1);                             \
  CONVERT_ARG_CHECKED(Type, value, 2);                                      \
  ValueType v = value->get();                                               \
  if (SimdTypeStoreValue<ValueType, Bytes>(isolate, buffer, offset, v)) {   \
    return isolate->heap()->undefined_value();                              \
  } else {                                                                  \
    THROW_NEW_ERROR_RETURN_FAILURE(                                         \
      isolate, NewRangeError("invalid_offset",                              \
      HandleVector<Object>(NULL, 0)));                                      \
  }                                                                         \
}


SIMD128_STORE_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, XYZW, 16)
SIMD128_STORE_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, XYZ, 12)
SIMD128_STORE_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, XY, 8)
SIMD128_STORE_RUNTIME_FUNCTION(Float32x4, float32x4_value_t, X, 4)
SIMD128_STORE_RUNTIME_FUNCTION(Float64x2, float64x2_value_t, XY, 16)
SIMD128_STORE_RUNTIME_FUNCTION(Float64x2, float64x2_value_t, X, 8)
SIMD128_STORE_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, XYZW, 16)
SIMD128_STORE_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, XYZ, 12)
SIMD128_STORE_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, XY, 8)
SIMD128_STORE_RUNTIME_FUNCTION(Int32x4, int32x4_value_t, X, 4)


}
}  // namespace v8::internal
