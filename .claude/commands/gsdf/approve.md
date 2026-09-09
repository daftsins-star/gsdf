---
description: Approve the phase — verify, one commit, advance
argument-hint: "[N]"
effort: low
allowed-tools: [Bash, Read, Edit, Glob, Grep]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Phase: `$ARGUMENTS` (default: current)

<objective>
Close out an iterate session: prove it still builds, commit the accumulated work once, fold the
iteration log into the record, and move to the next phase.
</objective>

<process>

Also triggered without the command — when the user says "approved", "approve", "looks good,
done", or similar while in iterate mode.

**0. Confirm that's what this is.** Run `.claude/bin/gsdf next` first. If it does not say
`iterate NN`, this is not an approval — say what state the phase is actually in and **stop**.
This command commits and advances a phase; "approved" said about something else entirely must
never be enough to fire it.

**1. Verify.** Read the commands from `config.json` and run, in order:
`verify.build`, then `verify.test`, and `verify.ui` if this phase touched `config.ui_dir`.

If any fails: show the failing output, say **"Not approved — <what broke>. Still in iterate
mode."**, and stop. Do not commit. Do not advance. Fixing it is the next iteration.

**2. Commit.** Only if the tree is dirty. `git add -A` stages *everything*, so look first:

```bash
git status --porcelain | wc -l
git status --porcelain | grep -aE '(^|/)(build|node_modules|dist|target|\.venv|DerivedData)/' | head
```

If the second command prints anything, **stop**: the project's `.gitignore` is missing entries
and approving would commit build output. Say which paths, and offer to add them to `.gitignore`
first. A JUCE `build/` directory is gigabytes — this is not a tidiness point.

If more than ~60 files are staged, show the user the list and get a yes before continuing.

```bash
git add -A
git commit -m "feat(NN): approve phase NN — <k> iterations"
```

`k` is `gsdf iter count N`. This is the one commit for the whole iterate session — that is the
design, not an oversight.

**3. Fold the log in.** `gsdf iter list N`, then append those lines under the `## Iterations`
heading of **every** `NN-MM-SUMMARY.md` in the phase. If a summary has no such heading (older
GSD summaries don't), add it at the end.

**4. Promote decisions.** Every logged line beginning `DECISION:` becomes
`gsdf state note "<the line without the prefix>"`. These outlive the phase — that's the point.

**5. Advance.**

```bash
.claude/bin/gsdf phase advance N    # stamps NN approved and flips its ROADMAP marker
                                    # ALWAYS pass N — without it, advance acts on whatever
                                    # phase is current, which is no longer this one
.claude/bin/gsdf state set status idle
.claude/bin/gsdf state position "Phase NN approved, <k> iterations. Next: phase <NN+1>."
```

**6. Report — four lines, no more.**

```
Approved phase NN — <k> iterations, commit <hash>.
Verified: build ✅  test ✅  ui ✅
Next: <NN+1> <slug>
Next: `/gsdf:discuss <NN+1>` or `/gsdf:plan <NN+1>`.
```

</process>

<success_criteria>
- Nothing was approved that doesn't build.
- Exactly one commit (or none, if the tree was already clean).
- `gsdf next` now names the following phase.
- No UAT file, no verification report, no subagent. None of those exist here.
</success_criteria>
