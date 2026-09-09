---
phase: 01
plan: 02
status: complete
commits: [ee55ff6, 778899a]
---
# Summary 01-02

## Delivered
- Aliasing below -80 dBFS at full drive ✅ — measured -87 dBFS on a 1 kHz sine.
- Loudness within 1 LU across the drive range ✅ — measured 0.6 LU spread.

## Verification
| Task | Command | Result |
|---|---|---|
| 1 | ctest --test-dir build -R Aliasing | pass (-87 dBFS) |
| 2 | ctest --test-dir build -R Loudness | pass (0.6 LU) |

## Try it
Build the standalone (`cmake --build build --target Widget_Standalone`), play a 1 kHz sine,
and sweep Drive: it should get dirtier without getting louder.

## Needs human check
- Does the saturation character sound right at 100%, or is it too aggressive?
- Is the gain compensation over-correcting at low drive?

## Deviations
- The near-zero denominator guard threshold had to be raised from 1e-6 to 1e-4; below that
  the fallback still produced a visible discontinuity in the transfer curve.

## Deferred
- The meter in the UI reads pre-shaper, not post. Wrong place, but out of scope for phase 1.

## Iterations
