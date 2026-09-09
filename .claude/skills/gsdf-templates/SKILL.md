---
name: gsdf-templates
description: Artifact templates for GSDF — PLAN, SUMMARY, ITERATIONS, CONTEXT, PROJECT, ROADMAP, STATE.
---

# gsdf-templates

The exact shapes GSDF writes. Read the one you need; don't guess a format.

| Writing | Template | Lands at |
|---|---|---|
| A phase plan | `PLAN.template.md` | `.planning/phases/NN-slug/NN-MM-PLAN.md` |
| A plan summary | `SUMMARY.template.md` | `.planning/phases/NN-slug/NN-MM-SUMMARY.md` |
| Iterate-mode log | `ITERATIONS.template.md` | `.planning/phases/NN-slug/NN-ITERATIONS.md` |
| Discuss output | `CONTEXT.template.md` | `.planning/phases/NN-slug/NN-CONTEXT.md` |
| Project brief | `PROJECT.template.md` | `.planning/PROJECT.md` |
| Roadmap | `ROADMAP.template.md` | `.planning/ROADMAP.md` |
| Project state | `STATE.template.md` | `.planning/STATE.md` |

**Filenames are GSD-native and prefixed.** `02-01-PLAN.md`, never `PLAN.md`. The one exception
is `.planning/quick/NNN-slug/`, which uses unprefixed `PLAN.md` / `SUMMARY.md` — both GSDs do.

**On an existing project, the file's format wins.** If STATE.md already uses
`## Current Position` and `### Decisions`, keep those headings — never add a second set.
`gsdf state` handles this; write through it rather than editing STATE.md by hand.
