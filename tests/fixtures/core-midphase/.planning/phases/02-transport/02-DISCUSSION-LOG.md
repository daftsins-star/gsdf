# Discussion Log — Phase 02 Transport

## Gray area: loop point representation

**Asked:** seconds, samples, or beats?
**Answered:** int64 samples. Beats get derived from the host tempo at read time.
**Why:** float seconds drift over long playback; beats are not stable if tempo automates.

## Gray area: crossfade shape

**Asked:** linear, equal-power, or user-selectable?
**Answered:** equal-power, fixed.
**Why:** linear dips ~3 dB at the join on correlated material. User-selectable is a v2 knob.

## Gray area: what happens when the crossfade is longer than the loop

**Asked:** clamp, error, or wrap?
**Answered:** deferred — not decided this phase.
