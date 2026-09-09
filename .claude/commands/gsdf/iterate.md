---
description: Re-enter iterate mode for a phase after /clear
argument-hint: "[N]"
allowed-tools: [Bash, Read, Edit, Write, Glob, Grep]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Phase: `$ARGUMENTS` (default: current)

<objective>
Iterate mode is the point of GSDF. The phase is built; now you and the user make it right by
talking, with no plans, no subagents and no ceremony. This command re-enters that state in a
fresh session — `/gsdf:execute` enters it automatically the first time.
</objective>

<process>

**Restore.** Run and show:

```bash
.claude/bin/gsdf tryit N        # how to see the work, and what needs a human eye
.claude/bin/gsdf iter list N    # every change already accepted this session
```

Then one line: *"Iterate mode, phase NN, `<k>` changes so far. Tell me what to change. Say
**approved** when it's right."*

If `gsdf next` doesn't say `iterate NN`, say what state the phase is actually in and stop.

</process>

<iterate_loop>

**Edit directly.** Read the file, change it, done. No PLAN.md, no `gsdf-executor`, no
`/gsdf:quick`. This is the whole point of the mode — a subagent here costs a cold-start
context to move a slider 4px.

**Verify the smallest thing that proves it.** From `config.verify`:
- UI markup/CSS/JS → `verify.ui`; skip entirely if `verify.ui_dev` is running and hot-reloads.
- DSP or any C++ → `verify.build`, plus `verify.test` if you touched behaviour a test covers.
- A doc, a comment, a string → nothing.

**Say what you did in one line, and how to see it.** Not a summary of the diff. "Knob min-size
is now 44px and scales with the parent — refresh the browser."

**Log accepted changes, one line each:**

```bash
.claude/bin/gsdf iter log N "<what they wanted> → <what you did> [files]"
```

A change is accepted when the user says so *or* moves on to the next request without objecting.
Don't ask "was that right?" — asking is what makes this slow.

**Rules the user states, log as decisions.** "always", "from now on", "all the knobs should" →
prefix the logged line `DECISION:`. Those get promoted to STATE.md on approve and survive the phase.

**Ask only when genuinely ambiguous** — two readings that lead to different edits. Otherwise pick
the obvious one, do it, and say which reading you took.

**New feature ≠ iteration.** If the request is a new capability rather than a correction to what
this phase delivered, say so in one sentence and offer `/gsdf:quick "<it>"` or "I'll log it as
deferred". Don't quietly grow the phase. Phase boundaries are fixed; iterating clarifies HOW
this phase's work behaves, not WHETHER to add more to it.

**No commits.** The tree accumulates until approve. Deliberate.

**Every 10 logged changes**, print exactly one line: *"10 changes logged. Safe to `/clear` and
`/gsdf:iterate N` if the session feels slow."*

**"approved" / "approve" / "looks good, done"** → run `/gsdf:approve N`.

</iterate_loop>

<success_criteria>
- Zero subagents, zero plan files, zero commits.
- One `gsdf iter log` line per accepted change, and no more.
- The user can always see how to check the change themselves.
</success_criteria>
