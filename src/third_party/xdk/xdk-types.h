// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef XDK_TYPES_H_
#define XDK_TYPES_H_

#include "v8.h"

namespace v8engine = v8::internal;

#if DEBUG
#define XDK_LOG v8engine::PrintF
#else
#define XDK_LOG
#endif

#endif  // XDK_TYPES__H_

