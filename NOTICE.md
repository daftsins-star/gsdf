# NOTICE

GSDF is an independent workflow. It vendors no code from either project below, but it is
directly descended from both and borrows their wording, their artifact formats, and several
of their hard-won rules. Both are MIT licensed.

## get-shit-done

Copyright (c) 2025 Lex Christopherson — https://github.com/ludicrypt/get-shit-done — MIT.

The `.planning/` directory layout, the `NN-MM-PLAN.md` / `NN-MM-SUMMARY.md` naming, XML
`<task>` plans, atomic per-task commits, the executor's deviation rules (auto-fix bugs,
auto-add missing critical behaviour, stop on anything that changes the plan's shape), and
the discuss guardrail that phase boundaries are fixed and scope creep gets captured rather
than absorbed.

## gsd-core

Copyright (c) 2026 Open GSD — https://github.com/open-gsd/gsd-core — MIT.

The `<fails_when>` requirement and its rationale — *a command with no expressible failure mode
is not an acceptance test*, and the authoring test *"if this command were silently doing
nothing, what in its output would tell me?"* — plus `effort:` command frontmatter, `wave:` /
`depends_on:` plan frontmatter, and the plan-checker's fits-a-fresh-context and
requirement-coverage checks, which GSDF folds into the planner's own self-check.

## Compatibility

GSDF reads and writes the same `.planning/` layout as both projects and is designed to pick
up a project mid-phase under either one without a migration step. It never renames, moves or
deletes a file it did not create. Where the two projects' formats differ, GSDF reads both and
writes back in whichever format the file already uses.
