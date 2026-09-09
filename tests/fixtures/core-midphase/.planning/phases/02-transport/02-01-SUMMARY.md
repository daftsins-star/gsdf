---
phase: 02-transport
plan: 01
status: complete
duration: 22min
completed: 2026-09-04
---

# Phase 2 Plan 01: Loop points Summary

**Loop points are int64 sample offsets and playback wraps with zero accumulated drift.**

## Accomplishments

- `Source/dsp/LoopPoints.h` is header-only and JUCE-free, unit tested standalone
- Wrap subtracts the loop length instead of assigning the start, preserving intra-block overshoot
- Drift after 5 simulated minutes measures exactly 0 samples

## Task Commits

1. **Task 1: LoopPoints struct** - `9f8e7d6` (feat)
2. **Task 2: Sample-accurate wrap in the voice** - `5c4b3a2` (feat)

## Deviations from Plan

None.

## Next Phase Readiness

02-02 can crossfade across the wrap point using LoopPoints::crossfadeSamples.
