---
description: Run a phase's plans in waves, then enter iterate mode
argument-hint: "[N] [--wave W]"
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Task, Agent, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Arguments: `$ARGUMENTS`

<objective>
Execute every plan in the phase, one subagent per plan, waves in parallel — then hand the result
to the user and enter iterate mode.
</objective>

<process>

**0. Confirm this is the right move.** `gsdf next`. If it doesn't say `execute NN` and the user
didn't name a phase explicitly, say what state the phase is in and **stop** — this command spawns
subagents that write code and commit, so it must never fire on a guess.

**1. Schedule.** `gsdf waves N`, then `gsdf conflicts N` — if that exits non-zero, two plans in a
wave write the same file and running them in parallel would lose writes. Stop and re-plan.
Skip any plan that already has a SUMMARY — it ran. `--wave W` runs only that wave.

**2. Per wave: spawn one `gsdf-executor` per plan, all in a single message** so they run
concurrently. Each gets one thing: the absolute path to its PLAN.md. Nothing else — the plan is
self-contained by construction.

Wait for the whole wave before starting the next. Read each returned `## Delivered` block.

**Never read the full SUMMARY.md files into this session.** That is what `gsdf tryit` is for, and
the difference is a few hundred tokens against several thousand.

**3. If any executor reports `blocked`:** stop. Don't start the next wave. Show which plan, which
task, and the verify output it gave, then say what the choices are. A blocked plan means the plan
was wrong; the fix is usually `/gsdf:plan N` again, not another execute.

**4. After the last wave — only if the whole phase ran.** Check `gsdf next` first: it must say
`iterate NN`. With `--wave W` you ran one wave of several, so it will still say `execute NN` —
print what is left and stop there. Entering iterate mode on a phase whose remaining plans have
never run marks it ready for review when half of it does not exist yet.

```bash
.claude/bin/gsdf state defer "<each Deferred bullet from each summary>"
.claude/bin/gsdf state set status iterating
.claude/bin/gsdf state position "Phase NN executed, iterating."
.claude/bin/gsdf iter start N                   # creates NN-ITERATIONS.md, logs nothing
.claude/bin/gsdf tryit N
```

Print the `tryit` output — that's the build/open instructions and the list of things only a human
can judge.

**5. Offer the UI, if there is one.** If `config.ui_dir` exists and this phase touched it, offer
to run `config.verify.ui_dev` in the background so the UI is open in a browser before the user
starts reviewing. One line, and take yes/no.

**6. Enter iterate mode.** Say, in one line:

*"Iterate mode. Tell me what to change. Say **approved** when it's right, or `/gsdf:approve`."*

Then follow `iterate.md` for everything that comes next: edit inline, verify the smallest
relevant thing, `gsdf iter log` per accepted change, no commits until approve.

</process>

<success_criteria>
- One subagent per plan. No planner, no verifier, no checker.
- Wave N+1 never starts before wave N finished.
- The session ends inside iterate mode, with `NN-ITERATIONS.md` created and the Try-it printed.
- Every task produced its own commit; approve will produce exactly one more.
</success_criteria>
