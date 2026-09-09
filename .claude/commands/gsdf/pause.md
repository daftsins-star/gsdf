---
description: Save a handoff and stop — resume in a fresh session
argument-hint: "[N]"
effort: low
allowed-tools: [Bash, Read, Write, Glob, Grep]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Phase: `$ARGUMENTS` (default: current)

<objective>
A session ends mid-phase. `gsdf next` will recover the position; nothing recovers the reasoning —
which approach was rejected and why, what the user said in passing, which half-edited file is
deliberate. Write that down, then stop.
</objective>

<process>

**1. Locate.** Run and show:

```bash
.claude/bin/gsdf next
.claude/bin/gsdf state
```

If `gsdf next` says `new-project`, say "No `.planning/` here — nothing to pause" and stop.
Otherwise take the phase number N from `gsdf next`; `gsdf phase dir N` resolves its directory
(creating it if absent). On `milestone-done` there is no phase — write to
`.planning/continue-here.md` instead.

**2. Measure, never assert.** Run all four and keep the real output:

```bash
git status --porcelain
git for-each-ref refs/gsdf/iter/
.claude/bin/gsdf iter list N
.claude/bin/gsdf plans N
```

The uncommitted-file list in the handoff is **copied from `git status --porcelain`**, not
remembered and not summarised. Truncate at 50 entries and name the elided count ("+ 31 more").
Never round it to empty: a dirty tree reported as clean is the one error a resuming session
cannot recover from, because it will plan on top of work it doesn't know exists.

**3. Write the handoff** to `<phase dir>/.continue-here.md` (leading dot), or to
`.planning/continue-here.md` (no dot) when there is no phase. Those two paths, exactly — `gsdf
context N` reads those and only those, so a handoff anywhere else is invisible to every later
planner and executor, and the next session starts cold.

Write for a Claude with no memory of this session. Under ~60 lines: this file is injected into
every later `gsdf context N` call, so its length is a tax on all of them.

```markdown
---
phase: NN
status: paused
last_updated: YYYY-MM-DD
---
## Where we are
<2–3 lines: what this phase is for, how far it got>

## Done
- <shipped and verified>

## Left
- <named, specific, in order>

## Decisions this session
- <what was chosen, and the reason that won't be obvious from the diff>

## Blockers
- <or "none">

## Uncommitted work
<the measured git status --porcelain list>
Iterate snapshots: <the refs/gsdf/iter/ refs>
Recover one with `git stash apply <ref>`.

## Next action
<one specific first action — a file and a change, not "continue the phase">
```

**4. Record the position through the CLI:**

```bash
.claude/bin/gsdf state position "<one line: where this stopped and why>"
.claude/bin/gsdf state set status paused
```

Never edit STATE.md directly — the CLI takes a lock, and a hand-edit loses a concurrent write.

**5. Commit nothing.** Not the code: iterate mode accumulates on purpose, and pausing is not
approving. `gsdf iter log` has already parked recoverable snapshots under `refs/gsdf/iter/NN/`.

The handoff itself is a planning artifact and gets the standard treatment — unless
`config.commit_docs` is `false` or `.planning/` is gitignored (`git check-ignore -q .planning`),
in which case skip it and say the handoff is untracked:

```bash
git add -N <handoff> && git commit --only <handoff> -m "docs(NN): pause"
```

**6. Report three lines.** Where the handoff is, what the next action is, and
``Resume with `/gsdf:resume`.``

</process>

<success_criteria>
- The handoff is at one of the two paths `gsdf context N` reads, and under ~60 lines.
- Its uncommitted list is a copy of real `git status --porcelain` output, never an empty guess.
- Zero subagents, zero code commits. `gsdf state` says `paused`.
</success_criteria>
