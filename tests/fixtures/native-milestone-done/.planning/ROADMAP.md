# Roadmap: Widget

## Phases

- [x] **Phase 1: Drive** - Drive parameter and antialiased waveshaper
- [x] **Phase 2: UI** - Webview knob and meter

## Phase Details

### Phase 1: Drive
**Goal**: Audible, alias-free saturation driven by one parameter.
type: dsp
**Requirements**: REQ-01, REQ-02, REQ-03
**Success Criteria** (what must be TRUE):
  1. Aliasing stays below -80 dBFS on a 1 kHz sine at full drive
  2. Perceived loudness is within 1 LU across the drive range
**Plans**: 2 plans

### Phase 2: UI
**Goal**: A knob and meter in the browser, bound to the plugin.
type: ui
**Requirements**: REQ-04
**Success Criteria** (what must be TRUE):
  1. `npm run dev` serves the UI standalone
**Plans**: TBD
