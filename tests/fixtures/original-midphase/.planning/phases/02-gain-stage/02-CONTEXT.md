# Phase 2 Context: Gain stage

## Decisions

- Gain range is -60..+12 dB, default 0 dB, skew factor 3.0 so unity sits near the middle.
- -60 dB snaps to silence (-inf) rather than being a very quiet signal.
- Bypass is a separate bool parameter, not a gain of 0 — hosts need real bypass reporting.
- Gain is smoothed over 20 ms to avoid zipper noise on automation.

## Rejected

- Linear gain in the APVTS — rejected, dB reads better in automation lanes.
- Per-sample dB→linear conversion — rejected, once per block with smoothing is enough.

## Open questions for the planner

- Whether to use `juce::SmoothedValue` or a hand-rolled one-pole. Planner decides.
