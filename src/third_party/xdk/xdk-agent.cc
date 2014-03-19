// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifdef __linux__
#include <sys/stat.h>
#endif  // __linux__

#include "xdk-agent.h"
#include <vector>
#include <string>
#include <sstream>
#include "platform.h"
#include "log-utils.h"

namespace xdk {
namespace internal {

static unsigned int XDK_COMMAND_LENGTH = 100;  // It should be enough.

static const char* XDK_TRACE_FILE =
  "/data/data/com.intel.app_analyzer/files/result.xdk2v8";

static const char* XDK_MARKER_FILE =
  "/data/data/com.intel.app_analyzer/files/profiler.run";

// SetIdle has the same semantics as CpuProfiler::SetIdle has (v8/src/api.cc)
// It is used to tell the sampler that XDK agent is idle (it is not busy with
// some tasks). If the agent is idle that the sampler put a IDLE VM state into
// the Tick record. The samples happen during IDLE will be attributed to (idle)
// line in the XDK viewer.
static void SetIdle(bool isIdle, v8engine::Isolate* isolate) {
  CHECK(isolate);
  v8engine::StateTag state = isolate->current_vm_state();
  if (isolate->js_entry_sp() != NULL) return;
  if (state == v8engine::EXTERNAL || state == v8engine::IDLE) {
    if (isIdle) {
      isolate->set_current_vm_state(v8engine::IDLE);
    } else if (state == v8engine::IDLE) {
      isolate->set_current_vm_state(v8engine::EXTERNAL);
    }
  }
}


bool XDKAgent::setUp(v8engine::Isolate* isolate) {
  CHECK(isolate);

  if (m_isolate) {
    // The setUp method is called for the main thread first, then may be called
    // again if the app uses Workers (each Worker object has own V8 instance).
    // XDK agent does not support JavaScript Worker currently.
    XDK_LOG("xdk: Agent is already initialized\n");
    return false;
  }

  FILE* file = v8engine::OS::FOpen(XDK_MARKER_FILE, "r");
  if (file == NULL) {
    return false;
  }

  fclose(file);
  m_alive = true;
  m_isolate = isolate;

  return m_alive;
}


void XDKAgent::resumeSampling() {
  v8engine::LockGuard<v8engine::Mutex> l(m_agent_access);
  CHECK(m_isolate);

  v8engine::Log* log = m_isolate->logger()->XDKGetLog();
  CHECK(log);

  // Create a new log file for new profiling session
  CHECK(!log->IsEnabled());
  log->Initialize(XDK_TRACE_FILE);

#ifdef __linux__
  int mode = S_IRUSR|S_IROTH|S_IRGRP|S_IWUSR|S_IWOTH|S_IWGRP;
  if (chmod(XDK_TRACE_FILE, mode) != 0) {
    XDK_LOG("xdk: Couldn't change permissions for a trace file\n");
  }
#endif  // __linux__

  CHECK(log->IsEnabled());

  logFunctionSnapshot();

  // Write a marker line into the log for testing purpose
  v8engine::Log::MessageBuilder msg(log);
  msg.Append("Profiler started.\n");
  msg.WriteToLogFile();

  // Resume collection the CPU Tick events
  m_isolate->logger()->XDKResumeProfiler();
  XDK_LOG("xdk: Sampling is resumed\n");

  SetIdle(true, m_isolate);
}


void XDKAgent::pauseSampling() {
  // Pause collection the CPU Tick events
  CHECK(m_isolate);
  m_isolate->logger()->StopProfiler();

  // Use v8 logger internals to close the trace file.
  // Once XDK agent implements own sampler this will be removed.
  v8engine::Log* log = m_isolate->logger()->XDKGetLog();
  CHECK(log);
  log->stop();
  log->Close();

  XDK_LOG("xdk: Sampling is stopped\n");
}


struct ObjectDeallocator {
  template<typename T>
  void operator()(const T& obj) const { delete obj.second; }
};


XDKAgent::~XDKAgent() {
  if (!m_alive) return;

  CHECK(m_isolate);

  m_terminate = true;
  CHECK(m_server);

  std::for_each(m_lineMaps.begin(), m_lineMaps.end(), ObjectDeallocator());
  m_lineMaps.clear();

  m_server->Shutdown();

  Join();

  delete m_server;
}


// The XDK listener thread.
void XDKAgent::Run() {
  v8engine::Isolate::EnsureDefaultIsolate();
  v8engine::DisallowHeapAllocation no_allocation;
  v8engine::DisallowHandleAllocation no_handles;
  v8engine::DisallowHandleDereference no_deref;

  XDK_LOG("xdk: Listener thread is running\n");
  CHECK(m_server);

  bool ok = m_server->Bind(m_port);
  if (!ok) {
    XDK_LOG("xdk: Unable to bind port=%d %d\n",
            m_port, v8engine::Socket::GetLastError());
    return;
  }

  char buf[XDK_COMMAND_LENGTH];

  const std::string cmdStart = "start";
  const std::string cmdStop = "stop";

  while (!m_terminate) {
    XDK_LOG("xdk: Listener thread is waiting for connection\n");

    ok = m_server->Listen(1);
    XDK_LOG("xdk: Listener thread got a connection request. Return value=%d\n",
             v8engine::Socket::GetLastError());
    if (ok) {
      v8engine::Socket* client = m_server->Accept();
      if (client == NULL) {
        XDK_LOG("xdk: Accept failed %d\n", v8engine::Socket::GetLastError());
        continue;
      }

      XDK_LOG("xdk: Connected\n");

      int bytes_read = client->Receive(buf, sizeof(buf) - 1);
      if (bytes_read == 0) {
        XDK_LOG("xdk: Receive failed %d\n", v8engine::Socket::GetLastError());
        break;
      }
      buf[bytes_read] = '\0';

  #ifdef WIN32
      if (bytes_read > 3) buf[bytes_read - 2] = '\0';  // remove CR+LF symbols
  #else
      if (bytes_read > 2) buf[bytes_read - 1] = '\0';  // remove LF symbol
  #endif

      std::string clientCommand(&buf[0]);
      XDK_LOG("xdk: Got '%s' profiling command\n", clientCommand.c_str());

      if (clientCommand == cmdStart) {
        resumeSampling();
      } else if (clientCommand == cmdStop) {
        pauseSampling();
      } else {
        XDK_LOG("xdk: '%s' is not handled command\n", clientCommand.c_str());
        break;
      }
    }
  }

  XDK_LOG("xdk: Listener thread is stopped\n");
  return;
}


void XDKAgent::processCodeMovedEvent(const v8::JitCodeEvent* event) {
  v8engine::LockGuard<v8engine::Mutex> l(m_agent_access);
  v8engine::Address from = static_cast<v8engine::Address>(event->code_start);
  v8engine::Address to = static_cast<v8engine::Address>(event->new_code_start);

  if (!from || !to) return;
  XDK_LOG("xdk: CODE_MOVED from=0x%x to=0x%x\n", from, to);
  m_snapshot.move(from, to);
}


void XDKAgent::processCodeRemovedEvent(const v8::JitCodeEvent* event) {
  v8engine::LockGuard<v8engine::Mutex> l(m_agent_access);
  v8engine::Address addr = static_cast<v8engine::Address>(event->code_start);

  if (!addr) return;
  XDK_LOG("xdk: CODE_REMOVED for addr=0x%x\n", addr);
  m_snapshot.remove(addr);
}


void XDKAgent::processCodeAddedEvent(const v8::JitCodeEvent* event) {
  v8engine::LockGuard<v8engine::Mutex> l(m_agent_access);

  v8engine::Address codeAddr =
    static_cast<v8engine::Address>(event->code_start);
  uint32_t codeLen = event->code_len;

  if (!codeAddr || !codeLen) return;
  XDK_LOG("xdk: CODE_ADDED for addr=0x%x len=0x%x\n", codeAddr, codeLen);

  // Look for line number information
  LineMap* lineMap = NULL;
  LineMaps::iterator itr = m_lineMaps.find(codeAddr);
  if (itr == m_lineMaps.end()) {
    XDK_LOG("xdk: Unable to find line info for addr=0x%x\n", codeAddr);
  } else {
    lineMap = itr->second;

    // Remove line map if no chance to get source lines for it
    v8::Handle<v8::Script> script = event->script;
    if (*script == NULL) {
      XDK_LOG("xdk: Script is empty. No line info for addr=0x%x.\n", codeAddr);
      delete lineMap;
      lineMap = NULL;
      m_lineMaps.erase(codeAddr);
    } else {
      // Convert V8 pos value into source line number.
      LineMap::Entries* entries =
        const_cast<LineMap::Entries*>(lineMap->getEntries());
      CHECK(entries);
      CHECK(entries->size());
      XDK_LOG("xdk: Found line info (%d lines) for addr=0x%x\n",
              entries->size(), codeAddr);
      size_t srcLine = 0;
      LineMap::Entries::iterator lineItr = entries->begin();
      LineMap::Entries::iterator lineEnd = entries->end();
      for (; lineItr != lineEnd; ++lineItr) {
        srcLine = script->GetLineNumber(lineItr->line) + 1;
        lineItr->line = srcLine;
        XDK_LOG("xdk:   offset=%p line=%d\n", lineItr->pcOffset, lineItr->line);
      }
    }
  }

  std::string funcType;
  std::string name(event->name.str, event->name.len);
  Function func(codeAddr, codeLen, name, funcType, lineMap);

  if (lineMap) {
    // Put the line number information for the given method into the trace file
    // if profiling session is running.
    logLineNumberInfo(codeAddr, *lineMap);

    // Release memory allocated on CODE_START_LINE_INFO_RECORDING
    delete lineMap;
    lineMap = NULL;
    m_lineMaps.erase(codeAddr);
  }

  m_snapshot.insert(func);
}


void XDKAgent::processLineMapAddedEvent(const v8::JitCodeEvent* event) {
  v8engine::LockGuard<v8engine::Mutex> l(m_agent_access);
  v8engine::Address codeAddr =
    static_cast<v8engine::Address>(event->code_start);
  void* userData = event->user_data;

  if (!userData || !codeAddr) return;

  LineMap* lineMap = reinterpret_cast<LineMap*>(userData);
  if (lineMap->getSize() == 0) {
    XDK_LOG("xdk: CODE_END_LINE no entries for user_data=%p addr=0x%x\n",
            userData, codeAddr);
    return;
  }

  std::pair<LineMaps::iterator, bool>
    result = m_lineMaps.insert(std::make_pair(codeAddr, lineMap));
  if (!result.second) {
    m_lineMaps.erase(codeAddr);
    XDK_LOG("xdk: removed unprocessed line info for addr=0x%x\n", codeAddr);
    result = m_lineMaps.insert(std::make_pair(codeAddr, lineMap));
    CHECK(result.second);
  }

  XDK_LOG("xdk: CODE_END_LINE added %d entries for user_data=%p addr=0x%x\n",
           lineMap->getSize(), userData, codeAddr);
}


void EventHandler(const v8::JitCodeEvent* event) {
  // This callback is called regardless of whether profiling is running.
  //
  // By default profiling is launched in paused mode, the agent is awaiting
  // a command to resume profiling. At the same time, V8's JIT compiler is
  // working. The functions which are JIT-compiled while sampling is paused
  // are cached by V8's Logger and will be written in log (trace file) when
  // XDK resumes the profiling. The line number info for such functions are not
  // cached. We need to capture and cache the line number info and flush
  // the cache on resume profiling.

  if (event == NULL) return;

  switch (event->type) {
    case v8::JitCodeEvent::CODE_MOVED:
      XDKAgent::instance().processCodeMovedEvent(event);
      break;

    case v8::JitCodeEvent::CODE_REMOVED:
      XDKAgent::instance().processCodeRemovedEvent(event);
      break;

    case v8::JitCodeEvent::CODE_ADDED:
      XDKAgent::instance().processCodeAddedEvent(event);

    case v8::JitCodeEvent::CODE_ADD_LINE_POS_INFO: {
      void* userData = event->user_data;
      if (!userData) return;
      LineMap* lineMap = reinterpret_cast<LineMap*>(userData);
      size_t offset = event->line_info.offset;
      size_t pos = event->line_info.pos;
      lineMap->setPosition(offset, pos);
      XDK_LOG("xdk: CODE_ADD_LINE_POS for user_data=%p offset=0x%x pos=%d\n",
               userData, offset, pos);
      break;
    }

    case v8::JitCodeEvent::CODE_START_LINE_INFO_RECORDING: {
      v8::JitCodeEvent* data = const_cast<v8::JitCodeEvent*>(event);
      data->user_data = new LineMap();
      XDK_LOG("xdk: CODE_START_LINE for user_data=%p\n", event->user_data);
      break;
    }

    case v8::JitCodeEvent::CODE_END_LINE_INFO_RECORDING: {
      XDKAgent::instance().processLineMapAddedEvent(event);
      break;
    }

    default:
      XDK_LOG("xdk: Unknown event\n");
      break;
  }

  SetIdle(true, XDKAgent::instance().isolate());

  return;
}


void XDKAgent::logLineNumberInfo(v8engine::Address addr,
                                 const LineMap& lineInfo) {
  CHECK(addr);
  v8engine::Log* log = m_isolate->logger()->XDKGetLog();
  CHECK(log);
  if (!log->IsEnabled()) return;
  if (lineInfo.getSize() == 0) return;
  const LineMap::Entries* lines = lineInfo.getEntries();
  CHECK(lines);
  LineMap::Entries::const_iterator lineItr = lines->begin();
  LineMap::Entries::const_iterator lineEnd = lines->end();

  // Put 'src-pos' lines into the log in our own format
  for (; lineItr != lineEnd; ++lineItr) {
    v8engine::Log::MessageBuilder msg(m_isolate->logger()->XDKGetLog());
    msg.Append("src-pos,");
    msg.Append("0x%x,%d,%d\n", addr, lineItr->pcOffset, lineItr->line);
    msg.WriteToLogFile();
  }
}


void XDKAgent::logFunctionSnapshot() {
  CHECK(m_isolate);

  CodeMap::const_iterator funcItr = m_snapshot.entries().begin();
  CodeMap::const_iterator funcEnd = m_snapshot.entries().end();

  XDK_LOG("FunctionSnapshot: %d entries\n", m_snapshot.entries().size());
  if (m_snapshot.entries().size() == 0) return;

  unsigned int i = 1;

  for (; funcItr != funcEnd; ++funcItr, i++) {
    const Range& range = funcItr->first;
    const Function& func = funcItr->second;

    XDK_LOG("%d    %s\n", i, func.getLogLine().c_str());

    const LineMap& map = func.getLineMap();
    if (map.getSize()) {
      v8engine::Address codeAddr = range.start();
      XDK_LOG("  Found %d lines for addr=%p\n", map.getSize(), codeAddr);
      logLineNumberInfo(codeAddr, map);
    }

    // Write 'code-creation' line into the log
    v8engine::Log::MessageBuilder msg(m_isolate->logger()->XDKGetLog());
    msg.Append("%s\n", func.getLogLine().c_str());
    msg.WriteToLogFile();
  }
}

}}  // namespace xdk::internal
