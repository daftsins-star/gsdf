---
description: Restore a paused session from its handoff
argument-hint: "[N]"
effort: low
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Phase: `$ARGUMENTS` (default: current)

<objective>
Pick up a paused session in a fresh one: restore the reasoning from the handoff, the position from
the filesystem, then route. This is `/gsdf:progress` plus the judgment a directory listing can't
hold.
</objective>

<process>

**1. Position.** Run and show:

```bash
.claude/bin/gsdf next
.claude/bin/gsdf context N
```

`gsdf context N` already carries the handoff as its `## Handoff (continue-here.md)` section,
capped at 40 lines. If `gsdf next` says `new-project`, stop and say: "No `.planning/` here — run
`/gsdf:new-project`."

**2. Read the handoff in full** from `<phase dir>/.continue-here.md` or
`.planning/continue-here.md` (`gsdf phase dir N` gives the directory). This is the only file this
command opens directly, and only because the 40-line cap can clip the `## Next action` — which is
the one line worth resuming for.

If neither path exists, say "No handoff here — nothing was paused. Restoring position only; that
is `/gsdf:progress`'s job." Then route as in step 5 and stop.

**3. Re-measure what went stale.** The handoff's uncommitted list is from *then*:

```bash
git status --porcelain
git for-each-ref refs/gsdf/iter/
```

Report any difference in one line. A file the handoff listed as uncommitted that is now clean
means someone committed or reverted it since — say so rather than trusting the file. The handoff
is a memory, not a measurement.

**4. Restore, in at most six lines:** where we are, what is left, blockers, uncommitted work (as
re-measured), and the next action the handoff names.

**5. Route on `gsdf next`, not on the handoff.** The filesystem is the source of truth; the
handoff supplies the why, never the position — it may be days old and the tree may have moved.
Same mapping `/gsdf:progress` uses:

| `gsdf next` | Say |
|---|---|
| `plan NN` | ``Next: `/gsdf:plan NN`.`` |
| `execute NN` | ``Next: `/gsdf:execute NN`.`` |
| `iterate NN` | Re-enter iterate mode inline, exactly as `/gsdf:iterate` does: `gsdf tryit N`, `gsdf iter list N`, then the one-line prompt. |
| `blocked NN` | Name the blocked plan from `gsdf plans NN`, then: ``Phase NN is blocked — a blocked plan usually means the plan was wrong: `/gsdf:plan NN`.`` Never route a blocked phase into iterate mode. |
| `milestone-done` | ``Every phase is complete. Run `/gsdf:progress --next` to close the milestone.`` |

**6. Consume the handoff.** Once it has been restored, delete it and say so in one line:

```bash
git rm <handoff>     # if tracked
rm <handoff>         # if not — step 4 has already printed what it said
```

A handoff left in place is injected into every subsequent `gsdf context N`, which is how a planner
ends up planning against a session that ended last week.

**7. Nothing else runs without the user's go-ahead** — except re-entering iterate mode, which is a
state, not an action.

</process>

<success_criteria>
- The user knows where they are, why, and what is uncommitted, without reading a file themselves.
- Exactly one next command named, chosen from `gsdf next` — or iterate mode entered inline.
- The handoff is gone, and that was said out loud.
- Zero subagents, zero code commits.
</success_criteria>
