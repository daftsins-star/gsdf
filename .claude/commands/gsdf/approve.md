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

**2. Fold the log in.** `gsdf iter list N`, then append those lines under the `## Iterations`
heading of **every** `NN-MM-SUMMARY.md` in the phase. If a summary has no such heading (older
GSD summaries don't), add it at the end.

**3. Promote decisions.** Every logged line beginning `DECISION:` becomes
`gsdf state note "<the line without the prefix>"`. These outlive the phase — that's the point.

**3a. Harvest what the phase taught — `NN-FINDINGS.md`.** Optional in the sense that some
phases teach nothing reusable; not optional in the sense of "skip it because you're busy".

Re-read `gsdf iter list N` and the phase's summaries, and ask of each: *is this true on a
different project?* If yes it is a finding. The bug you fixed is not one; the misconception
that let it survive review is. Project history — dates, phase counts, renames — never is.

Write the survivors to `NN-FINDINGS.md` in the phase dir using
`gsdf-templates/FINDINGS.template.md`, one `##` section per note, each carrying `cluster:`,
`symptoms:` and optional `see:`. Write `symptoms:` in the words someone would use *before*
knowing the cause — that is what makes the note findable next time.

Then, if `lb-promote.py` is on PATH, promote them:

```bash
lb-promote.py .planning/phases/NN-slug/NN-FINDINGS.md
```

It writes finished, autolinked notes straight into the knowledge vault and leaves the Inbox
alone. It is idempotent — re-running reports what already exists rather than duplicating.
If the tool is absent, still write the file: living-brain harvests `**/*FINDINGS.md`, and the
file is the durable artefact either way.

**Most phases yield one or two findings. Zero is a normal, reportable answer** — say "nothing
reusable" and move on. Padding this with project history is worse than leaving it empty,
because it puts noise somewhere that is trusted to be signal.

**4. Advance.**

```bash
.claude/bin/gsdf phase advance N    # stamps NN approved and flips its ROADMAP marker
                                    # ALWAYS pass N — without it, advance acts on whatever
                                    # phase is current, which is no longer this one
.claude/bin/gsdf state set status idle
.claude/bin/gsdf state position "Phase NN approved, <k> iterations. Next: phase <NN+1>."
```

**5. Commit — once, last.** Everything above writes files, so committing before them would
leave the phase's own bookkeeping dirty. `git add -A` stages *everything*, so look first:

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

`k` is `gsdf iter count N`, read before step 4. This is the one commit for the whole iterate
session, and it must leave the tree clean — verify with `git status --porcelain` after.

**6. Report — five lines, no more.**

```
Approved phase NN — <k> iterations, commit <hash>.
Verified: build ✅  test ✅  ui ✅
Findings: <n> promoted to the vault (or "none — nothing reusable")
Next: <NN+1> <slug>
Next: `/gsdf:discuss <NN+1>` or `/gsdf:plan <NN+1>`.
```

</process>

<success_criteria>
- Nothing was approved that doesn't build.
- What the phase taught outlived it, or was explicitly reported as nothing.
- Exactly one commit (or none, if the tree was already clean).
- `gsdf next` now names the following phase.
- No UAT file, no verification report, no subagent. None of those exist here.
</success_criteria>
