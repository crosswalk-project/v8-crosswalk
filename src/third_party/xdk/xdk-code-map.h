// Copyright (c) 2013 Intel Corporation. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef XDK_CODE_MAP_H_
#define XDK_CODE_MAP_H_

// ----------------------------------------------------------------------------
//
// This file contains the FunctionSnapshot and related objects declarations
//
// The FunctionSnapshot object maintains a map of JIT compiled functions.
// It is modified on code events(CodeAdded, CodeMoved and CodeDeleted) from
// V8 built-in profiler.
//
// ----------------------------------------------------------------------------

#include "xdk-types.h"
#include <map>
#include <list>
#include <string>
#include <algorithm>

namespace xdk {
namespace internal {

class LineMap;
typedef std::map<
          v8engine::Address,  // start address of code
          LineMap*> LineMaps;

// This class is used to record the JITted code position info for JIT
// code profiling.
class LineMap {
 public:
  struct LineEntry {
    LineEntry(size_t offset, size_t line)
      : pcOffset(offset), line(line) { }

    size_t pcOffset;  // PC offset from the begining of the code trace.
    size_t line;      // Can be either position returned from V8 assembler
                      // (which needs to be converted to src line) or src line
                      // number.
  };

  typedef std::list<LineEntry> Entries;

  void setPosition(size_t offset, size_t line) {
    addCodeLineEntry(LineEntry(offset, line));
  }

  inline size_t getSize() const { return m_lines.size(); }
  const Entries* getEntries() const { return &m_lines; }

 private:
  void addCodeLineEntry(const LineEntry& entry) { m_lines.push_back(entry); }

  Entries m_lines;
};

// This class describes the function reported with CodeAdded event.
class Function {
 public:
  explicit Function(v8engine::Address codeAddr, uint32_t codeLen,
                    const std::string& name, const std::string& type,
                    const LineMap* lineMap);

  inline v8engine::Address getCodeAddress() const { return m_codeAddr; }
  inline uint32_t getCodeLength() const { return m_codeLen; }

  inline const std::string& getType() const { return m_type; }
  inline const std::string& getName() const { return m_name; }
  inline const std::string& getLogLine() const { return m_logLine; }

  const LineMap& getLineMap() const { return m_lineMap; }

 private:
  v8engine::Address m_codeAddr;
  uint32_t m_codeLen;
  std::string m_name;
  std::string m_type;
  std::string m_logLine;
  LineMap m_lineMap;
};

// This class describes the code range related to object of Function type.
// The start address and length are taken from CodeAdded event.
class Range {
 public:
  class Comparator : public std::binary_function<Range&, Range&, bool> {
   public:
     bool operator()(const Range& l, const Range& r) const {
       return (l.start() + l.length() <= r.start());
     }
  };

  Range(v8engine::Address start, uint32_t length)
    : m_start(start), m_length(length) { }

  inline v8engine::Address start() const { return m_start; }
  inline uint32_t length() const { return m_length; }

 private:
  v8engine::Address m_start;
  uint32_t m_length;
};

// This class maintains a map of JIT compiled functions.
// The content is changed on CodeAdded, CodeMoved and CodeDeleted events.
typedef std::map<Range, const Function, Range::Comparator> CodeMap;

class FunctionSnapshot {
 public:
  explicit FunctionSnapshot() {}
  virtual ~FunctionSnapshot() { m_impl.clear(); }

  void insert(const Function& func);
  void move(v8engine::Address from, v8engine::Address to);
  void remove(v8engine::Address addr);

  inline const CodeMap& entries() { return m_impl; }

 private:
  FunctionSnapshot(const FunctionSnapshot&);
  FunctionSnapshot& operator=(const FunctionSnapshot&);

  void removeAll(const Range& range);

  CodeMap m_impl;
};

} }  // namespace xdk::internal

#endif  // XDK_CODE_MAP_H_
