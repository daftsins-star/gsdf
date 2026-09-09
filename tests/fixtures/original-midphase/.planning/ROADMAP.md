# Roadmap: TestPlug

## Overview

Foundation first (build system, plugin skeleton), then the gain stage and its parameter,
then the webview UI, then packaging.

## Phases

- [x] **Phase 1: Foundation** - CMake project, JUCE plugin skeleton, passing test target
- [ ] **Phase 2: Gain stage** - Gain parameter in APVTS, applied in processBlock, bypass
- [ ] **Phase 3: Webview UI** - Knob, dB readout, bypass button bound to parameters
- [ ] **Phase 4: Packaging** - Installer, pluginval clean at strictness 5

## Phase Details

### Phase 1: Foundation
**Goal**: A VST3 that loads and passes an empty ctest suite.
**Depends on**: Nothing (first phase)
**Requirements**: [REQ-01]
**Success Criteria** (what must be TRUE):
  1. `cmake --build build` produces a .vst3 bundle
  2. `ctest` exits 0
**Plans**: 2 plans

Plans:
- [x] 01-01: CMake + JUCE fetch
- [x] 01-02: Plugin skeleton and test target

### Phase 2: Gain stage
**Goal**: A working, automatable gain parameter applied to the audio, plus bypass.
**Depends on**: Phase 1
**Requirements**: [REQ-02, REQ-03, REQ-06]
**Success Criteria** (what must be TRUE):
  1. Host shows a Gain parameter with range -60..+12 dB
  2. Audio is attenuated by the set amount
  3. Bypass passes audio through bit-identical
**Plans**: 2 plans

Plans:
- [x] 02-01: Gain parameter in APVTS
- [ ] 02-02: Apply gain in processBlock, add bypass

### Phase 3: Webview UI
**Goal**: A browser-openable UI bound to the plugin parameters.
**Depends on**: Phase 2
**Requirements**: [REQ-04, REQ-05]
**Success Criteria** (what must be TRUE):
  1. `npm run dev` serves the UI standalone
  2. Knob movement changes the gain parameter
**Plans**: TBD

### Phase 4: Packaging
**Goal**: Signed installer, pluginval clean.
**Depends on**: Phase 3
**Requirements**: [REQ-01]
**Success Criteria** (what must be TRUE):
  1. pluginval strictness 5 passes
**Plans**: TBD
