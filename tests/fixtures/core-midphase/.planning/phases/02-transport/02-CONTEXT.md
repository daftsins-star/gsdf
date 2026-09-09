# Phase 2 Context: Transport

## Decisions

- Loop points are int64 sample offsets. Never seconds, never beats.
- Crossfade is equal-power (sin/cos), fixed shape, length configurable 0–50 ms.
- Loop wrap happens inside the voice, not in the streaming reader.

## Rejected

- User-selectable crossfade shape — v2.
- Beat-derived loop points — unstable under tempo automation.

## Open questions for the planner

- Behaviour when crossfade length exceeds the loop length. Undecided; pick something safe.
