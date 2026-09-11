---
phase: {{PHASE}}
plan: {{PLAN}}
status: complete
commits: [abc123f, def456g]
---
# Summary {{PHASE}}-{{PLAN}}

## Delivered
Must-haves mirrored, each ✅/❌ with one line of evidence.

## Verification

Evidence, not adjectives: the exit code, plus the one output line you judged against
`<fails_when>`. "pass" is a claim; `exit 0 · 12/12 tests passed` is the thing that makes it
checkable by someone who was not here.

| Task | Command | Exit | The line that decided it |
|---|---|---|---|
| 1 | cmake --build build --config Release && ctest -R Gain | 0 | `12/12 tests passed` |

## Try it
Copied from PLAN, corrected to reality (actual paths, actual commands). This is what iterate
mode shows the user.

## Needs human check
Things no command can verify: visual, UX, sound. One bullet each. Feeds iterate mode.

## Deviations
"None" or bullets.

## Findings

What this work taught that is true on a *different* project. One line each, and only when
there is something — most tasks teach nothing reusable and should leave this empty.

- <the claim, stated so it stands alone> — looked like: <the symptom you saw first>

The bug you fixed belongs in Deviations; the misconception that let it survive belongs here.
`gsdf findings N` collects these at approve, so a line written here outlives the phase.

## Deferred
Out-of-scope defects found. Orchestrator copies these to STATE.md.

## Iterations
(empty until approve; approve appends the NN-ITERATIONS.md log here)
