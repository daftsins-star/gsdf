---
phase: {{PHASE}}
plan: {{PLAN}}
depends_on: []
estimated_tokens: 45000
requirements: [REQ-03, REQ-05]
---
# Plan {{PHASE}}-{{PLAN}}: <title>

## Goal
One paragraph: what exists after this that didn't before.

## Context
Only what the executor needs. ≤ 30 lines. Point to files, don't quote them.

## Tasks

<task id="1">
  <name>Add gain parameter to APVTS</name>
  <files>Source/PluginProcessor.h, Source/PluginProcessor.cpp</files>
  <action>Precise steps. Name the API. Name what NOT to do and why.</action>
  <verify>cmake --build build --config Release && ctest --test-dir build -R Gain</verify>
  <fails_when>build error, or any ctest line reports Failed, or exit code != 0</fails_when>
  <done>Gain param appears in host, range -60..+12 dB, default 0</done>
</task>

## Must-haves
- [ ] One bullet per observable outcome.

## Try it
How the user will see this working after execution. Concrete: the target to build, the file to
open, the URL. For webview UI work: how to open the UI standalone in a browser without a DAW.
