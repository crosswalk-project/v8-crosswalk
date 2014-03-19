// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_XDK_H_
#define V8_XDK_H_

// ----------------------------------------------------------------------------
//
//                          XDK profiling support for V8
//
//  SOURCES:
//
//  1. XDK agent source files are located in v8/src/third_party/xdk folder.
//
//       To integrate this stuff into V8 build system you need to modify
//       two v8 files:
//
//       1. v8/build/features.gypi
//           'v8_enable_xdkprof': 1,
//       2. v8/tools/gyp/v8.gyp
//           ['v8_enable_xdkprof==1', {
//             'dependencies': ['../../src/third_party/xdk/xdk-v8.gyp:v8_xdk',],
//           }],
//
//  2. Two V8 files v8/src/log.cc and v8/src/log.h need to be modified
//
//       The changes related to start CPU ticks collection using V8 built-in
//       profiler.
//       We are working on reduce these changes up to 2 lines:
//
//           #include "third_party/xdk/xdk-v8.h"
//           bool Logger::SetUp(Isolate* isolate) {
//             ...
//             xdk::XDKInitializeForV8(isolate);
//             ...
//           }
//
//  OVERVIEW:
//
//  Start up
//
//    XDK agent is initialized as a part of V8 built-in profiler on process
//    start up. V8 built-in profiler should be paused (CPU ticks are not
//    collected).
//
//           v8/src/log.cc:
//           bool Logger::SetUp(Isolate* isolate) {
//             ...
//             xdk::XDKInitializeForV8(isolate);
//             ...
//           }
//
//      XDKInitializeForV8() function
//      1. Checks whether XDK agent can be initialized. If a marker file is not
//         found that initialization will be discarded.
//      2. Starts a listener thread to accept start / stop profiling command
//         from AppAnalyzer (xdk/xdk-agent.cc).
//      3. Registeres a callback to consume the CodeAdded, CodeMoved,
//         CodeDeleted events and events related to source line info by
//         the agent.
//
//  Runtime
//
//    XDK profiler consumes the code events (EventHandler() in xdk/xdk-agent.cc)
//    V8 emits these events even when CPU ticks collection is paused.
//    The profiler uses the code events to maintain a function snapshot (list of
//    code ranges assosiated with function name and source line info)
//    (xdk-code-map.cc).
//
//    Start profiling
//
//      When the profiler receives a command to start profiling that it calls
//      resumeSampling() (xdk/xdk-agent.cc) which
//      1. Creates a new trace file to log the ticks and code events
//      2. Puts the function snapshot into the trace file
//      3. Resumes CPU ticks collection
//
//    Stop profiling
//
//      When the profiler receives a command to stop profiling that it calls
//      pauseSampling() (xdk/xdk-agent.cc) which stops the CPU ticks collection.
//      Note that the agent continues to consume the code events to maintain
//      the function snapshot.
//
//      When collection is stopped that AppAnalyzer takes the trace file for
//      processing.
//
// ----------------------------------------------------------------------------

namespace xdk {

// This function
// - Overrides the V8 flags to specify a new logfile for writting profiling data
//   (CPU ticks and Code* events).
// - Registers callback to get line number info and code events from V8 built-in
//   profiler. These data are needed to mantain the code map.
// - Starts the XDK agent listener thread which is awaiting for start and stop
//   profiling commands.
void XDKInitializeForV8(v8::internal::Isolate* isolate);

}  // namespace XDK

#endif  // V8_XDK_H_

