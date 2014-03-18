// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef XDK_AGENT_H_
#define XDK_AGENT_H_

#include "v8.h"
#include "sampler.h"
#include "platform.h"
#include "platform/socket.h"
#include "platform/mutex.h"
#include "xdk-types.h"
#include "xdk-code-map.h"

// ----------------------------------------------------------------------------
//
// This file declares XDKAgent class which does
//
// - Handles the code events to maintain the code map.
// - Handles the line info events to assosiate the line info with code event.
// - Accepts start / stop profiling commands from AppAnalyzer.
//
// ----------------------------------------------------------------------------

namespace xdk {
namespace internal {

const int XDK_AGENT_PORT = 48899;

static const char* XDK_TRACE_FILE =
  "/data/data/com.intel.app_analyzer/files/result.xdk2v8";
static const char* XDK_MARKER_FILE =
  "/data/data/com.intel.app_analyzer/files/profiler.run";

// Callback called by V8 builtin logger.
void EventHandler(const v8::JitCodeEvent* event);

// XDK profiling agent. It starts a socket listener on the specific port and
// handles commands to start and stop sampling.
class XDKAgent : public v8engine::Thread {
 public:
  static XDKAgent& instance() {
    static XDKAgent instance;
    return instance;
  }

  void Run();

  bool setUp(v8engine::Isolate* isolate);

  void processCodeMovedEvent(const v8::JitCodeEvent* event);
  void processCodeRemovedEvent(const v8::JitCodeEvent* event);
  void processCodeAddedEvent(const v8::JitCodeEvent* event);
  void processLineMapAddedEvent(const v8::JitCodeEvent* event);

  inline v8engine::Isolate* isolate() { return m_isolate; }

 private:
  virtual ~XDKAgent();
  XDKAgent()
      : v8engine::Thread("xdk:agent"),
        m_port(XDK_AGENT_PORT),
        m_agent_access(new v8engine::Mutex()),
        m_server(new v8engine::Socket()),
        m_terminate(false),
        m_alive(false),
        m_isolate(NULL) {
  }
  XDKAgent(const XDKAgent&);
  XDKAgent& operator=(const XDKAgent&);

  void logFunctionSnapshot();
  void logLineNumberInfo(v8engine::Address codeAddr, const LineMap& lineInfo);

  void resumeSampling();
  void pauseSampling();

  bool m_alive;

  const int m_port;  // Port to use for the agent.
  v8engine::Socket* m_server;  // Server socket for listen/accept.
  v8engine::Mutex* m_agent_access;
  v8engine::Isolate* m_isolate;

  // The snapshot of compiled methods at present moment.
  FunctionSnapshot m_snapshot;

  // The processLineMapAddedEvent function adds a new map for code starting
  // address. Newly added map describes how ps offsets maps to internal pos,
  // but not how ps offsets maps to line number within source file.
  //
  // On CodeAdd event, processCodeAddedEvent function looks for line map for
  // a code address. If map is found that assign it to a object of Function type
  // in FunctionSnapshot. Before assign the pc offset to pos map is converted
  // to pc offset to source line.
  //
  // CodeMoved and CodeRemoved must not affect this map.
  // Current understanding of V8 code generator: V8 first emits LineStart event,
  // then bunch of LineAdd events, then LineEnd event, finally CodeAdded event.
  // Based on above no need to add any 'smart' logic on CodeMoved and
  // CodeRemoved for line map.
  //
  // Basically it should be always empty.
  LineMaps m_lineMaps;

  bool m_terminate;  // Termination flag for listening thread.
};

} }  // namespace xdk::internal

#endif  // XDK_AGENT_H_
