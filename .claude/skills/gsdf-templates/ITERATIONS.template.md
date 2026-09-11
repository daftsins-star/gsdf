---
phase: {{PHASE}}
status: open
started: {{TIMESTAMP}}
approved: 
---
# Iterations — Phase {{PHASE}}

- 14:05 — Slider knob too small at 100% zoom → set min 44px, scaled with parent [ui/src/knob.css]
- 14:11 — Gain default should be -6 dB not 0 → changed APVTS default [Source/PluginProcessor.cpp]
- 14:12 — DECISION: all knobs use the same scaling rule going forward
- 14:31 — FINDING: a mirrored constant drifts silently — the runtime kept the old value and a test asserting the same literal stayed green (keep it to ONE line; `gsdf iter list` drops continuations)
