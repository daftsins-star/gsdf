---
phase: 02-transport
plan: 02
status: complete
duration: 31min
completed: 2026-09-05
---

# Phase 2 Plan 02: Crossfade Summary

**The loop join is crossfaded with an equal-power curve and measures below -60 dBFS.**

## Accomplishments

- `Source/dsp/Crossfade.h` precomputes sin/cos gain pairs at prepare time
- Read-ahead buffer sized in prepareToPlay; nothing allocates in the audio thread
- Discontinuity at the join measures -71 dBFS on the pad material, -64 dBFS on drums

## Task Commits

1. **Task 1: Equal-power crossfade table** - `1a2b3c4` (feat)
2. **Task 2: Apply the crossfade at the loop join** - `7d8e9f0` (feat)

## Deviations from Plan

- Read-ahead buffer had to be doubled: at 50 ms and 96 kHz the original size underran.
  Sized from the maximum crossfade length instead of a constant.

## Deferred

- Crossfade lengths longer than the loop itself still overlap the loop start. Clamped to
  half the loop length as a stopgap; needs a real decision.
