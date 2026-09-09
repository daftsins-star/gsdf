---
description: Decompose a phase into executable plans
argument-hint: "[N] [--auto] [--research|--skip-research]"
allowed-tools: [Bash, Read, Write, Glob, Grep, Task, Agent, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Arguments: `$ARGUMENTS`

<objective>
Turn one phase into 1–4 self-contained PLAN.md files. One subagent. Plans are prompts — the
executor gets a plan and the files it names, and nothing else.
</objective>

<process>

**1. Brief.** N defaults to the current phase (`gsdf next`).

```bash
.claude/bin/gsdf phase dir N     # creates the directory if the roadmap has the phase but the tree doesn't
.claude/bin/gsdf context N
```

**2. Spawn one `gsdf-planner`** in mode `phase`. Pass it, verbatim:
- the entire `gsdf context N` output,
- the phase directory's absolute path,
- `--research` / `--skip-research` if the user gave one.

Do not add your own summary of the project on top. The context command is the briefing; padding
it is how a planner ends up with 30k tokens of preamble before it reads a line of code.

**3. Check what came back** (`gsdf plans N`, and read the frontmatter only):

| Check | If it fails |
|---|---|
| Every plan file listed actually exists | re-spawn |
| `estimated_tokens < 120000` on every plan | re-spawn: "split plan MM" |
| Every `<verify>` has a `<fails_when>` | re-spawn: "add failure signals" |
| No two plans in the same wave name the same file | re-spawn: "serialise MM and MM" |

**One retry, maximum.** Re-spawn once with the specific instruction. If it comes back wrong
again, show what's wrong and stop — don't hand a broken plan to an executor and don't fix the
plan yourself; you'd be doing the planner's job with a polluted context.

**4. Report.**

```
Phase NN — <n> plans, waves <gsdf waves N>
<the planner's 5 lines>
```

Without `--auto`, one `AskUserQuestion`: proceed to execute, adjust, or stop. With `--auto`,
say `Next: /gsdf:execute N` and stop.

</process>

<success_criteria>
- Exactly one subagent (two only if the single retry fired).
- Every plan carries `<fails_when>` on every verify and a concrete `## Try it`.
- No file read into this session that `gsdf` could have summarised.
</success_criteria>
