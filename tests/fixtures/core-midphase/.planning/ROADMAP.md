# Roadmap: Sampler

## Overview

Scaffold the plugin and the streaming buffer, then transport-synced looping, then mapping
and the browser UI.

## Phases

- [x] **Phase 1: Scaffold** - Plugin skeleton, voice pool, disk streaming buffer
- [ ] **Phase 2: Transport** - Transport-synced looping with crossfades
- [ ] **Phase 3: Mapping UI** - Drop a folder, see the keyboard map

## Phase Details

### Phase 1: Scaffold
**Goal**: A plugin that streams one hardcoded WAV from disk without glitching.
**Depends on**: Nothing (first phase)
**Requirements**: REQ-02, REQ-03
**Status**: complete
**Success Criteria** (what must be TRUE):
  1. A 2 GB WAV plays back with no audible dropouts at 64-sample buffers
  2. No allocation occurs on the audio thread under the realtime sanitizer
**Plans**: 2 plans

Plans:
- [x] 01-01: Voice pool and preallocation
- [x] 01-02: Streaming ring buffer and background reader thread

### Phase 2: Transport
**Goal**: Loop points that stay sample-accurate against the host transport, with crossfades.
**Depends on**: Phase 1
**Requirements**: REQ-04, REQ-05
**Status**: pending
**Success Criteria** (what must be TRUE):
  1. A loop stays phase-locked to the host after 5 minutes of playback
  2. The loop join is inaudible at a 20 ms crossfade
**Plans**: 2 plans

Plans:
- [x] 02-01: Loop point storage and sample-accurate wrap
- [x] 02-02: Equal-power crossfade at the loop join

### Phase 3: Mapping UI
**Goal**: Drop a folder, see and edit the keyboard map.
**Depends on**: Phase 2
**Requirements**: REQ-01
**Status**: pending
**Success Criteria** (what must be TRUE):
  1. Dropping a folder maps every WAV by its filename note name
**Plans**: TBD
