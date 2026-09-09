# NOTES.md — borrowed passages (temporary, deleted at §11.8)

Sources studied: /tmp/gsd-src/original (get-shit-done, TÂCHES, MIT),
/tmp/gsd-src/core (gsd-core, open-gsd, branch `next`, MIT). Wording borrowed, machinery not.

## From gsd-core

- `gsd-core/references/planner-failing-direction.md`:
  - "A command with no expressible failure mode is not an acceptance test."
  - Authoring test: "if this command were silently doing nothing, what in its output would tell me?"
  - "Name an observable signal, not the word 'failure'." (`non-zero exit`, `"0 passed" in the summary`)
  - "TBD, TODO, N/A, none, unknown, ?, - are rejected outright as whole values."
  → GSDF planner + PLAN template. GSDF pairs `<fails_when>` with `<verify>` (core pairs with `<automated>`).
- `agents/gsd-plan-checker.md` Dimension 8: "Is every task's completion decided by an automated
  check that can actually fail?" → planner self-check step 4.
- `commands/gsd/*.md`: `effort: low` / `effort: max` frontmatter is real and current. GSDF uses `low` only.
- `gsd-core/templates/phase-prompt.md`: `wave:`, `depends_on:`, `files_modified:`, `requirements:`
  frontmatter; `<task type="auto">`, `<read_first>`, `<verify>`, `<done>`, `<acceptance_criteria>`.
- `gsd-core/templates/UAT.md`: real pass marker is frontmatter `status: complete` and per-test
  `result: pass` — NOT `status: passed`. Spec §4a's generous list must include these.
- `gsd-core/templates/continue-here.md`: real path is `.planning/phases/XX-name/.continue-here.md`,
  not only `.planning/continue-here.md`. Read both.
- `gsd-core/templates/state.md`: STATE.md body is identical to original's — `## Current Position`,
  `## Accumulated Context` → `### Decisions`. Adds YAML frontmatter (`status:`, `progress:`).

## From original get-shit-done

- `commands/gsd/discuss-phase.md`:
  - "Phase boundary from ROADMAP.md is FIXED. Discussion clarifies HOW to implement, not WHETHER to add more."
  - "That's its own phase. I'll note it for later."
  - Domain-aware gray areas: "Something users SEE → layout, density, interactions, states /
    users CALL → responses, errors, auth / users RUN → output format, flags, modes."
  - "Do NOT ask about (Claude handles these): technical implementation, architecture choices,
    performance concerns, scope expansion."
- `agents/gsd-executor.md` deviation rules → compressed to three lines in gsdf-executor:
  Rule 1 auto-fix bugs, Rule 2 auto-add missing critical (error handling, validation, null checks),
  Rule 3 stop on blocking. "You WILL discover work not in the plan. This is normal."
- `GSD-STYLE.md`: "Plans as prompts — PLAN.md files are executable, not documents to transform."
  Command section order `<objective>` → `<context>` → `<process>` → `<success_criteria>`.
- `get-shit-done/templates/roadmap.md`: `- [ ] **Phase 1: Name** - desc` checkbox list +
  `### Phase 1: Name` detail blocks with `**Goal**:` / `**Requirements**:`.
- `get-shit-done/templates/summary.md`: `## Accomplishments`, `## Task Commits` → tryit fallbacks.
