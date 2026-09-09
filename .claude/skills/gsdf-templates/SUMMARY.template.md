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
| Task | Command | Result |
|---|---|---|
| 1 | cmake --build build --config Release && ctest -R Gain | pass |

## Try it
Copied from PLAN, corrected to reality (actual paths, actual commands). This is what iterate
mode shows the user.

## Needs human check
Things no command can verify: visual, UX, sound. One bullet each. Feeds iterate mode.

## Deviations
"None" or bullets.

## Deferred
Out-of-scope defects found. Orchestrator copies these to STATE.md.

## Iterations
(empty until approve; approve appends the NN-ITERATIONS.md log here)
