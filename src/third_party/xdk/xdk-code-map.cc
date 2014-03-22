// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "xdk-code-map.h"
#include <sstream>

namespace xdk {
namespace internal {

static std::string replaceAddress(const std::string& str,
                                  v8engine::Address addr) {
  // The input str: code-creation,LazyCompile,0,0x3851c4e0,200," native uri.js"
  std::string first;
  std::string end;

  std::size_t found = str.find(',');
  if (found != std::string::npos) {
    found = str.find(',', found + 1);
    if (found != std::string::npos) {
      found = str.find(',', found + 1);
      if (found != std::string::npos) {
        first = str.substr(0, found);
        found = str.find(',', found + 1);
        if (found != std::string::npos) {
          end = str.substr(found, str.size() - found);
        }
      }
    }
  }

  if (!first.size() || !end.size()) return str;

  std::stringstream ss;
  ss << first << ','
     << std::showbase << std::hex << static_cast<void*>(addr) << end;
  return ss.str();
}


Function::Function(v8engine::Address codeAddr, uint32_t codeLen,
                   const std::string& name, const std::string& type,
                   const LineMap* lineMap)
    : m_codeAddr(codeAddr), m_codeLen(codeLen), m_name(name), m_type(type) {
  CHECK(codeAddr);
  CHECK(codeLen);
  // Can't be empty because it's came from CodeCreation(...) events
  CHECK(!name.empty());
  m_logLine = m_name;

  if (lineMap && lineMap->getSize()) m_lineMap = *lineMap;
}


void FunctionSnapshot::removeAll(const Range& range) {
  CodeMap::iterator low = m_impl.lower_bound(range);
  CodeMap::iterator up = m_impl.upper_bound(range);
  CodeMap::iterator::difference_type num = std::distance(low, up);

  if (num) {
    XDKLog("xdk: %d ranges were overlapped and removed\n", num);

    CodeMap::iterator itr = low;
    for (; itr != up; ++itr) {
      XDKLog("xdk:  ovrl&removed addr=0x%x len=0x%x name=%s\n",
             itr->first.start(), itr->first.length(),
             itr->second.getLogLine().c_str());
    }
    m_impl.erase(low, up);
  }
}


void FunctionSnapshot::insert(const Function& func) {
  v8engine::Address codeAddr = func.getCodeAddress();
  uint32_t codeLen = func.getCodeLength();
  CHECK(codeAddr);
  CHECK(codeLen);

  Range range(codeAddr, codeLen);

  removeAll(range);

  std::pair<CodeMap::iterator, bool> res =
    m_impl.insert(std::make_pair(range, func));
  CHECK(res.second);

  XDKLog("xdk: size=%d added addr=0x%x name=%s\n",
         m_impl.size(), range.start(), func.getLogLine().c_str());
}


void FunctionSnapshot::remove(v8engine::Address codeAddr) {
  if (!codeAddr) return;
  CodeMap::iterator itr = m_impl.find(Range(codeAddr, 1));
  if (itr != m_impl.end()) {
    std::string name = itr->second.getLogLine();
    uint32_t len = itr->first.length();
    m_impl.erase(itr);
    XDKLog("xdk: size=%d removed addr=0x%x name=%s\n",
           m_impl.size(), codeAddr, len, name.c_str());
  }
}


void FunctionSnapshot::move(v8engine::Address from, v8engine::Address to) {
  if (!from || !to) return;
  if (from == to) return;

  CodeMap::iterator itr = m_impl.find(Range(from, 1));
  if (itr == m_impl.end()) {
    XDKLog("xdk: couldn't find a code to move from=0x%x to=0x%x\n", from, to);
    return;
  }
  if (itr->first.start() != from) {
    XDKLog("xdk: discarded move from=0x%x to=0x%x\n", from, to);
    return;
  }

  uint32_t codeLen = itr->second.getCodeLength();
  const LineMap& lines = itr->second.getLineMap();

  // In case of CodeMoved we have to check that name contains the same code
  // addr and code length as the input params and replace if they are different.
  const std::string& orig = itr->second.getName();
  std::string name = replaceAddress(orig, to);

  const std::string& type = itr->second.getType();
  Function toEntry(to, codeLen, name, type, &lines);

  m_impl.erase(itr);

  Range range(to, codeLen);
  removeAll(range);

  // Now ready to move

  bool ok = m_impl.insert(std::make_pair(range, toEntry)).second;
  CHECK(ok);

  XDKLog("xdk: size=%d moved from=0x%x to=0x%x name=%s\n",
         m_impl.size(), from, to, toEntry.getLogLine().c_str());
}

} }  // namespace xdk::internal
