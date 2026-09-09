---
description: Lock phase decisions through a few option-based questions
argument-hint: "[N]"
allowed-tools: [Bash, Read, Write, Glob, Grep, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Phase: `$ARGUMENTS` (default: current)

<objective>
Settle the things only the user can settle, before the planner has to guess. Optional — skip it
and the planner decides for itself, which is often fine. Inline; no subagent.
</objective>

<process>

**1. Read the brief.** `gsdf context N`. Ignore its `## Context` section — that's the file you're
about to write. If it already exists, ask whether to add to it, replace it, or skip.

**2. Find 2–4 gray areas.** Not generic categories — the specific open questions *this* phase
has. Use the phase's `**Type**:` from the roadmap entry as your starting point:

| Type | Where the gray areas usually are |
|---|---|
| `ui` | layout and density, what each interaction does, empty/error/loading states, sizing |
| `dsp` | parameter ranges and defaults, curve/skew, quality vs CPU, what happens at the extremes |
| `infra` | file formats, error handling, what's versioned, what happens on failure |
| `mixed` | pick from the above by what the phase actually delivers |

**Don't ask about things Claude should decide:** implementation approach, architecture, which
API, performance strategy. Those are the planner's, and asking makes the user do your job.

**3. One `AskUserQuestion` per gray area**, 2–4 concrete options each. Concrete means values:
"-60..+12 dB, default 0" and "0..100%, default 25", not "wider range" and "narrower range".

**Options are a starting point, never a menu.** The user can always type their own answer, and
you must make that obvious rather than assume they know — say so in the question text, and treat
a typed answer as the expected case, not an exception. The point of the options is to show you
have thought about it and to give them something concrete to react to; it is not to constrain
them to three things you happened to think of. If they type something none of your options
covered, that is the question doing its job.

**Eight questions is the hard ceiling** across the whole session. Fewer is better. If an answer
opens a genuinely important follow-up, ask it and drop one of the others.

**Scope is fixed.** The phase boundary comes from ROADMAP.md. Discussion clarifies *how* this
phase's work behaves, never *whether* to add more to it. If the user proposes new capability:
"That's its own phase — I'll note it." Then `gsdf state defer "<it>"`. Capture it; don't act on it.

**4. Write `NN-CONTEXT.md`** in `gsdf phase dir N`, using `CONTEXT.template.md`:
`## Decisions` (what was chosen, with values), `## Rejected` (what wasn't, and why — this is what
stops the planner re-proposing it), `## Open questions for the planner` (what the user handed to
Claude on purpose).

**5.** Anything durable — a rule that outlives this phase — also goes to `gsdf state note "<it>"`.

**Commit the planning artifacts.** Both GSDs version `.planning/` as they go, and a plan that
only exists in the working tree is one `git clean` from gone. Unless `config.commit_docs` is
`false` or `.planning/` is gitignored (`git check-ignore -q .planning`):

```bash
git add -N .planning/phases/NN-slug/NN-CONTEXT.md && git commit --only .planning/phases/NN-slug/NN-CONTEXT.md -m "docs(NN): phase NN context"
```

`--only`, not `git add -A` — an executor may be committing in the same repo.

Then: `Next: /gsdf:plan N`.

</process>

<success_criteria>
- ≤ 8 questions, every one with concrete options.
- Nothing asked that Claude should have decided.
- Scope creep captured as deferred, not absorbed into the phase.
- `NN-CONTEXT.md` records values and reasons, not vibes.
- Zero subagents.
</success_criteria>
