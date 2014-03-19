// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "../../../include/v8.h"
#include "xdk-v8.h"
#include "xdk-agent.h"

namespace xdk {

void XDKInitializeForV8(v8::internal::Isolate* isolate) {
  if (!internal::XDKAgent::instance().setUp(isolate)) return;

  XDK_LOG("xdk: XDKInitializeForV8\n");

  // The --prof flag is requred for now to enable the CPU ticks collection.
  // This flag will be removed once xdk agent implements own sampler.
  const char* flags = "--prof";
  v8::V8::SetFlagsFromString(flags, static_cast<int>(strlen(flags)));

  v8::V8::SetJitCodeEventHandler(v8::kJitCodeEventDefault,
                                 xdk::internal::EventHandler);

  internal::XDKAgent::instance().Start();
}

}  // namespace xdk
