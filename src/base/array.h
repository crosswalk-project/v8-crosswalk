// -*- C++ -*-
//===---------------------------- array -----------------------------------===//
//
//                     The LLVM Compiler Infrastructure
//
// This file is dual licensed under the MIT and the University of Illinois Open
// Source Licenses. See LICENSE.TXT for details.
//
//===----------------------------------------------------------------------===//

#ifndef _LIBCPP_ARRAY
#define _LIBCPP_ARRAY

/*
    array synopsis

namespace std
{
template <class T, size_t N >
struct array
{
    // types:
    typedef T & reference;
    typedef const T & const_reference;
    typedef implementation defined iterator;
    typedef implementation defined const_iterator;
    typedef size_t size_type;
    typedef ptrdiff_t difference_type;
    typedef T value_type;
    typedef T* pointer;
    typedef const T* const_pointer;
    typedef std::reverse_iterator<iterator> reverse_iterator;
    typedef std::reverse_iterator<const_iterator> const_reverse_iterator;

    // No explicit construct/copy/destroy for aggregate type
    void fill(const T& u);
    void swap(array& a);

    // iterators:
    iterator begin();
    const_iterator begin() const;
    iterator end();
    const_iterator end() const;

    reverse_iterator rbegin();
    const_reverse_iterator rbegin() const;
    reverse_iterator rend();
    const_reverse_iterator rend() const;

    const_iterator cbegin() const;
    const_iterator cend() const;
    const_reverse_iterator crbegin() const;
    const_reverse_iterator crend() const;

    // capacity:
    size_type size() const;
    size_type max_size() const;
    bool empty() const;

    // element access:
    reference operator[](size_type n);
    const_reference operator[](size_type n) const;
    const_reference at(size_type n) const;
    reference at(size_type n);

    reference front();
    const_reference front() const;
    reference back();
    const_reference back() const;

    T* data();
    const T* data() const;
};

template <class T, size_t N>
  bool operator==(const array<T,N>& x, const array<T,N>& y);
template <class T, size_t N>
  bool operator!=(const array<T,N>& x, const array<T,N>& y);
template <class T, size_t N>
  bool operator<(const array<T,N>& x, const array<T,N>& y);
template <class T, size_t N>
  bool operator>(const array<T,N>& x, const array<T,N>& y);
template <class T, size_t N>
  bool operator<=(const array<T,N>& x, const array<T,N>& y);
template <class T, size_t N>
  bool operator>=(const array<T,N>& x, const array<T,N>& y);

}  // std

*/

#include <type_traits>
#include <utility>
#include <iterator>
#include <algorithm>
#include <stdexcept>
#include "src/base/logging.h"

namespace v8 {
namespace base {

template <class _Tp, size_t _Size>
struct array
{
    // types:
    typedef array __self;
    typedef _Tp                                   value_type;
    typedef value_type&                           reference;
    typedef const value_type&                     const_reference;
    typedef value_type*                           iterator;
    typedef const value_type*                     const_iterator;
    typedef value_type*                           pointer;
    typedef const value_type*                     const_pointer;
    typedef size_t                                size_type;
    typedef ptrdiff_t                             difference_type;
    typedef std::reverse_iterator<iterator>       reverse_iterator;
    typedef std::reverse_iterator<const_iterator> const_reverse_iterator;

    value_type __elems_[_Size > 0 ? _Size : 1];

    // No explicit construct/copy/destroy for aggregate type
    V8_INLINE void fill(const value_type& __u)
        {std::fill_n(__elems_, _Size, __u);}
    V8_INLINE
    void swap(array& __a)
        {std::swap_ranges(__elems_, __elems_ + _Size, __a.__elems_);}

    // iterators:
    V8_INLINE
    iterator begin() {return iterator(__elems_);}
    V8_INLINE
    const_iterator begin() const {return const_iterator(__elems_);}
    V8_INLINE
    iterator end() {return iterator(__elems_ + _Size);}
    V8_INLINE
    const_iterator end() const {return const_iterator(__elems_ + _Size);}

    V8_INLINE
    reverse_iterator rbegin() {return reverse_iterator(end());}
    V8_INLINE
    const_reverse_iterator rbegin() const {return const_reverse_iterator(end());}
    V8_INLINE
    reverse_iterator rend() {return reverse_iterator(begin());}
    V8_INLINE
    const_reverse_iterator rend() const {return const_reverse_iterator(begin());}

    V8_INLINE
    const_iterator cbegin() const {return begin();}
    V8_INLINE
    const_iterator cend() const {return end();}
    V8_INLINE
    const_reverse_iterator crbegin() const {return rbegin();}
    V8_INLINE
    const_reverse_iterator crend() const {return rend();}

    // capacity:
    V8_INLINE
    size_type size() const {return _Size;}
    V8_INLINE
    size_type max_size() const {return _Size;}
    V8_INLINE
    bool empty() const {return _Size == 0;}

    // element access:
    V8_INLINE reference operator[](size_type __n)             {return __elems_[__n];}
    V8_INLINE const_reference operator[](size_type __n) const {return __elems_[__n];}
    reference at(size_type __n);
    const_reference at(size_type __n) const;

    V8_INLINE reference front()             {return __elems_[0];}
    V8_INLINE const_reference front() const {return __elems_[0];}
    V8_INLINE reference back()              {return __elems_[_Size > 0 ? _Size-1 : 0];}
    V8_INLINE const_reference back() const  {return __elems_[_Size > 0 ? _Size-1 : 0];}

    V8_INLINE
    value_type* data() {return __elems_;}
    V8_INLINE
    const value_type* data() const {return __elems_;}
};

template <class _Tp, size_t _Size>
typename array<_Tp, _Size>::reference
array<_Tp, _Size>::at(size_type __n)
{
    if (__n >= _Size)
        FATAL("array::at out_of_range");
    return __elems_[__n];
}

template <class _Tp, size_t _Size>
typename array<_Tp, _Size>::const_reference
array<_Tp, _Size>::at(size_type __n) const
{
    if (__n >= _Size)
        FATAL("array::at out_of_range");
    return __elems_[__n];
}

template <class _Tp, size_t _Size>
V8_INLINE
bool
operator==(const array<_Tp, _Size>& __x, const array<_Tp, _Size>& __y)
{
    return std::equal(__x.__elems_, __x.__elems_ + _Size, __y.__elems_);
}

template <class _Tp, size_t _Size>
V8_INLINE
bool
operator!=(const array<_Tp, _Size>& __x, const array<_Tp, _Size>& __y)
{
    return !(__x == __y);
}

template <class _Tp, size_t _Size>
V8_INLINE
bool
operator<(const array<_Tp, _Size>& __x, const array<_Tp, _Size>& __y)
{
    return std::lexicographical_compare(__x.__elems_, __x.__elems_ + _Size, __y.__elems_, __y.__elems_ + _Size);
}

template <class _Tp, size_t _Size>
V8_INLINE
bool
operator>(const array<_Tp, _Size>& __x, const array<_Tp, _Size>& __y)
{
    return __y < __x;
}

template <class _Tp, size_t _Size>
V8_INLINE
bool
operator<=(const array<_Tp, _Size>& __x, const array<_Tp, _Size>& __y)
{
    return !(__y < __x);
}

template <class _Tp, size_t _Size>
V8_INLINE
bool
operator>=(const array<_Tp, _Size>& __x, const array<_Tp, _Size>& __y)
{
    return !(__x < __y);
}

} }  // namespace v8::base

#endif  // _LIBCPP_ARRAY
