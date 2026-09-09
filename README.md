# GSDF — Get Shit Done Fast

A Claude Code workflow for shipping software in phases. It keeps the guarantees that make
[get-shit-done](https://github.com/ludicrypt/get-shit-done) and
[gsd-core](https://github.com/open-gsd/gsd-core) worth using — fresh-context subagents, atomic
commits, durable state, plans verified before they run — and adds the thing neither has: a fast
**iterate mode** where you review the result, ask for changes in plain language, and say
*approved* when it's right.

```
/gsdf:discuss N  →  /gsdf:plan N  →  /gsdf:execute N  →  [iterate: talk, fix, tweak]  →  "approved"
   optional          1 subagent      1 per plan           0 subagents, inline            commit + advance
```

The design rule is one line: **one planner per phase, one executor per plan, nothing else.**
Every subagent spawn is a cold-start context that has to be paid for before it does any work,
so GSDF spends them where they buy isolation and nowhere else. Iterate mode — where most of the
wall-clock in real work actually goes — spends none at all.

## Install

```bash
git clone https://github.com/daftsins-star/gsdf.git
cd gsdf

./install.sh --global      # /gsdf:* in every project
./install.sh /path/to/repo # or just this one
```

Restart Claude Code and run `/gsdf:help`.

A global install puts the commands, agents and templates in `~/.claude/` and `gsdf` on your
PATH. A project install puts them in that project's `.claude/`, with the CLI at
`.claude/bin/gsdf`. Both append a short block to the relevant `CLAUDE.md` between
`<!-- gsdf:start -->` markers, and merge a permissions allow-list into `settings.json` without
touching entries you already have.

**Installing over an existing GSD project is safe.** If `.planning/` is already there, the
installer runs `gsdf adopt`: it merges the config keys it needs, leaves every other key alone,
reports where the project stands, and writes nothing under `phases/`.

## The nine commands

| | | Spawns |
|---|---|---|
| `/gsdf:new-project` | Scan the repo, ≤6 questions, write the brief and roadmap | 1 |
| `/gsdf:discuss [N]` | Settle the phase's gray areas with option-based questions | 0 |
| `/gsdf:plan [N]` | Decompose the phase into 1–4 self-contained plans | 1 |
| `/gsdf:execute [N]` | Run the plans in dependency waves, commit per task | 1 per plan |
| `/gsdf:iterate [N]` | Re-enter iterate mode after `/clear` | 0 |
| `/gsdf:approve [N]` | Verify, one commit, advance the phase | 0 |
| `/gsdf:quick "<task>"` | One-off work outside the current phase | 1 |
| `/gsdf:progress` | Where am I; `--next` runs the next step | 0 |
| `/gsdf:help` | The loop and the commands | 0 |

`discuss` is optional. `plan` is not.

## Iterate mode

This is the part worth explaining. After `/gsdf:execute`, GSDF prints how to *see* what it built
— the target to build, the URL to open, the knob to move — plus the list of things no command can
judge. Then it waits.

You say "knob's too small". It edits the file, runs the smallest verify that proves the change,
tells you in one line how to see it, and logs:

```
- 14:05 — Knob too small at 100% zoom → min 44px, scales with parent [ui/src/knob.css]
```

No plan file, no subagent, no commit. Say something that sounds like a rule — *"from now on all
the knobs…"* — and it's logged as a `DECISION:` and promoted to STATE.md when you approve, so it
outlives the phase. Say **approved** and it verifies, makes exactly one commit, folds the log
into the summaries, and moves to the next phase.

That's the loop the original GSD had in chat and lost to ceremony, put back on purpose.

## Works on projects you already started

GSDF reads and writes the same `.planning/` layout as both other GSDs. Drop it into a project
mid-phase under either one and `/gsdf:progress --next` continues as if nothing changed. No
migration, no renamed files, nothing deleted.

It manages this by never trusting a format it didn't write. Phase status is derived from **which
files exist** — `NN-ITERATIONS.md` approved, or a passing `NN-UAT.md`, or a passing
`NN-VERIFICATION.md`, or whether every `NN-MM-PLAN.md` has its `NN-MM-SUMMARY.md`. STATE.md and
ROADMAP.md are written for humans, read tolerantly, and never used for control flow. Old plans
without `<fails_when>`, plans using `wave:` instead of `depends_on:`, gsd-core's
`continue-here.md`, the original's `codebase/` scan — all read, none rewritten. When GSDF updates
a file it writes back in whatever format that file already uses.

So a phase gsd-core executed but never UAT'd lands you in iterate mode, ready to review. A phase
the original GSD verified is simply behind you. Both are the right answer.

## The CLI

`gsdf` is ~350 lines of stdlib Python that answers *where am I* deterministically, so agents
don't burn context reading five markdown files to find out.

```bash
gsdf next                # plan 03 | execute 02 | iterate 02 | milestone-done | new-project
gsdf phase list          # table: phase, slug, status, plans, done, iterations
gsdf context 2           # exactly what the planner is given — ~560 tokens, not 15k
gsdf tryit 2             # how to see the work, and what needs a human eye
gsdf iter log 2 "..."    # one line per accepted change
gsdf waves 2             # [["01"], ["02"]]
```

Every read subcommand is pure — the test suite asserts `git status` is clean after all of them.

## Benchmark

Measured on the test fixtures:

| | |
|---|---|
| `gsdf context N` | **26 ms**, ~**560 tokens** (budget: 100 ms, 2,500 tokens) |
| Subagents per 2-plan phase | **3** — one planner, two executors. Iterate and approve add none. |
| Command descriptions, all 9 | **405 characters** total (loaded every turn; budget 550) |
| `gsdf-executor.md` / `gsdf-planner.md` | **50** / **102** lines |

**The end-to-end wall-clock comparison has not been run.** It needs a real interactive session —
`/gsdf:new-project` through `approved` on a scratch project — which can't be produced from a
build script without simulating it, and a simulated number is worse than no number. The
procedure is written out in `GSDF-SPEC.md` §12; run it and the numbers go here.

## Tests

```bash
bash tests/test_cli.sh          # 52 checks — CLI behaviour against 7 fixture projects
bash tests/test_conformance.sh  # 40 checks — the spawn, size and token budgets
```

`tests/fixtures/` holds two `.planning/` trees built by hand from the real templates of both
upstream projects — one mid-phase under the original GSD, one under gsd-core — plus one fixture
per state `gsdf next` can return.

## Credits

Descended from [get-shit-done](https://github.com/ludicrypt/get-shit-done) by Lex Christopherson
and [gsd-core](https://github.com/open-gsd/gsd-core) by Open GSD, both MIT. No code is vendored
from either; the wording, formats and rules that are borrowed are itemised in `NOTICE.md`.

MIT.
