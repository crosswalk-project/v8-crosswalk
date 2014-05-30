// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef XDK_TYPES_H_
#define XDK_TYPES_H_

#include "v8.h"
#include "platform.h"

namespace v8engine = v8::internal;

static void XDKLog(const char* msg, ...) {
#if DEBUG
  va_list arguments;
  va_start(arguments, msg);
  v8engine::OS::VPrint(msg, arguments);
  va_end(arguments);
#endif
}

#endif  // XDK_TYPES__H_

