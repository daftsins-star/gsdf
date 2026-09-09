---
description: One-off task outside the current phase
argument-hint: "\"<task>\" [--plan-first]"
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Task, Agent]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Task: `$ARGUMENTS`

<objective>
Work that isn't part of the current phase and doesn't deserve one: a version string, a build
flag, a rename. One spawn, zero questions.

**Not for fixes to the phase you're iterating on** — that's iterate mode, and it's free.
</objective>

<process>

**0.** If `$ARGUMENTS` is empty, **stop** and ask what the task is. This command spawns a
subagent that writes code and commits; it must never run on an inferred task.

**1.** `.claude/bin/gsdf quick new "<slug>"` → prints the directory. Slug from the task, 2–4 words.

**2. Write `PLAN.md` in that directory yourself** (unprefixed name — `quick/NNN-slug/PLAN.md` —
both GSDs do it this way). Use `PLAN.template.md`, one plan, 1–3 tasks, `depends_on: []`.
Every `<verify>` comes from `config.verify` and carries a `<fails_when>` naming an observable
signal. Grep the repo first so the `<action>` names real files and real APIs — a quick task that
sends the executor hunting isn't quick.

With `--plan-first`, spawn **one** `gsdf-planner` in mode `phase` instead, telling it to write a
single plan to that directory.

**3.** Spawn **one** `gsdf-executor` with the absolute path to that PLAN.md. Wait.

**4.** Print its `## Delivered` block and the commit hashes. Nothing else.

**Ask nothing.** Ambiguity gets resolved by choosing the obvious reading and stating it in the
plan's `## Context`. If the task is genuinely too big for one plan, say so in one sentence and
suggest `/gsdf:phase` work instead — don't split it into three quick tasks.

Never touch `.planning/phases/`, STATE.md's position, or the ROADMAP. A quick task is outside
the phase flow by definition. Real defects it turns up go to `gsdf state defer "<it>"`.

</process>

<success_criteria>
- Exactly one subagent spawned.
- Zero questions asked.
- One commit per task, plus the executor's `docs(...)` commit, all inside `.planning/quick/NNN-slug/`.
- `gsdf next` reports exactly what it did before.
</success_criteria>
