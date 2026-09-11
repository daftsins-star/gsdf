---
description: Approve the phase — verify, one commit, advance
argument-hint: "[N]"
effort: low
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Phase: `$ARGUMENTS` (default: current)

<objective>
Close out an iterate session: prove it still builds, commit the accumulated work once, fold the
iteration log into the record, and move to the next phase.
</objective>

<process>

**0. Confirm that's what this is.** Run `.claude/bin/gsdf next` first. If it does not say
`iterate NN`, this is not an approval — say what state the phase is actually in and **stop**.
This command commits and advances a phase; "approved" said about something else entirely must
never be enough to fire it.

**1. Verify — gate, before anything is written.** `gsdf verify N`. It runs `config.json`'s
verify commands, falls back to the phase's own plan `<verify>` blocks if there are none, prints
one line per command with its exit code, and exits:

| exit | meaning | what to do |
|---|---|---|
| 0 | everything ran and passed | carry on |
| 1 | something ran and failed | show the failing output, say **"Not approved — <what broke>. Still in iterate mode."**, stop. Do not commit, do not advance. Fixing it is the next iteration. |
| 2 | `NONE CONFIGURED` — nothing to run | nothing broke, but nothing is proven either. Say so, and ask once whether to approve unverified. Only a yes continues, and the report says `Verified: nothing configured — not verified` |

Copy its output into the report. **Never write a tick for a command you did not see run**: an
unconfigured project and a passing one must not look alike, which is the bug this replaced.
Exit 2 is the case that bug wore as a disguise — treat it as unproven, never as passing.

**2. Guard the parameter ABI — the other gate.** `gsdf params N`. Advisory until
`abi_frozen: true` is set in `config.json` — before a release, churn is what you want. After
one, a removed or reordered parameter id silently repoints every automation lane in every
saved session, and the damage surfaces months later in someone else's project. Non-zero:
**stop**, say which id, and offer the migrate-on-load fix. A deliberate break re-locks with
`gsdf params N --write`.

Both gates run before step 3 on purpose: everything from here down writes files, and failing a
gate afterwards leaves the phase's bookkeeping half-rewritten.

**3. Fold the log in.** `gsdf iter list N`, then append those lines under the `## Iterations`
heading of **every** `NN-MM-SUMMARY.md` in the phase. If a summary has no such heading (older
GSD summaries don't), add it at the end.

**4. Promote decisions.** Every logged line beginning `DECISION:` becomes
`gsdf state note "<the line without the prefix>"`. These outlive the phase — that's the point.

**5. Collate the findings — `NN-FINDINGS.md`.** `gsdf findings N` prints what was captured
as it happened: iteration lines prefixed `FINDING:`, and `## Findings` sections from plan
summaries. Judged by whoever was there — collate, do not re-read the phase and guess.

Write each as a `##` section per `gsdf-templates/FINDINGS.template.md`, with `cluster:`,
`symptoms:` and optional `see:`. Write `symptoms:` in the words someone uses *before* knowing
the cause; that is what makes a note findable next time. Add something unlogged only if the
phase truly taught it — if that keeps happening, log `FINDING:` during the work instead.

**Zero findings is a normal answer.** Padding with project history is worse than an empty
file: it puts noise where signal is trusted. If living-brain is installed its Stop hook
promotes the file on its own.

**6. Advance.**

```bash
.claude/bin/gsdf phase advance N    # stamps NN approved and flips its ROADMAP marker
                                    # ALWAYS pass N — without it, advance acts on whatever
                                    # phase is current, which is no longer this one
.claude/bin/gsdf state set status idle
.claude/bin/gsdf state position "Phase NN approved, <k> iterations. Next: phase <NN+1>."
```

**7. Commit — once, last.** Everything above writes files, so committing before them would
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

`k` is `gsdf iter count N`, read before step 6. This is the one commit for the whole iterate
session, and it must leave the tree clean — verify with `git status --porcelain` after.

**8. Report — five lines, no more.**

```
Approved phase NN — <k> iterations, commit <hash>.
Verified: <paste gsdf verify's own summary line — never a tick you typed yourself>
Findings: <n> collated (or "none — nothing reusable")
Next phase: <NN+1> <slug>
Run: `/gsdf:discuss <NN+1>` or `/gsdf:plan <NN+1>`.
```

</process>

<success_criteria>
- Nothing was approved that doesn't build.
- What the phase taught outlived it, or was explicitly reported as nothing.
- Exactly one commit (or none, if the tree was already clean).
- `gsdf next` now names the following phase.
- No UAT file, no verification report, no subagent. None of those exist here.
</success_criteria>
