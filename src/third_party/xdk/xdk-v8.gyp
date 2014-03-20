# Copyright (c) 2013 Intel Corporation. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

{
  'variables': {
    'v8_code': 1,
   },
  'includes': ['../../../build/toolchain.gypi', '../../../build/features.gypi'],
  'targets': [
    {
      'target_name': 'v8_xdk',
      'type': 'static_library',
      'conditions': [
        ['want_separate_host_toolset==1', {
          'toolsets': ['host', 'target'],
        }, {
          'toolsets': ['target'],
        }],
      ],
      'include_dirs+': [
        '../../',
      ],
      'sources': [
        'xdk-v8.h',
        'xdk-v8.cc',
        'xdk-agent.h',
        'xdk-agent.cc',
        'xdk-code-map.h',
        'xdk-code-map.cc',
        'xdk-types.h',
      ],
      'direct_dependent_settings': {
        'conditions': [
          ['OS != "win"', {
            'libraries': ['-ldl',],
          }],
        ],
      },
    },
  ]
}
