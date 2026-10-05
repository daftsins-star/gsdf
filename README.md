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

Or let it run: with **auto mode** you answer a few plain-language questions, pick one of a few
UI mockups, and GSDF builds every remaining phase on its own, rebuilds and installs the result,
and hands you one finished thing to try.

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

### Staying current

A global install sets Claude Code's status line to GSDF's — it shows the model, the phase and
its state, the folder you are in, and how full the context is — and adds a session-start check
that puts `⬆ /gsdf:update` at the front when a newer release exists. `/gsdf:update` installs it.
A status line you set up yourself is left alone; GSD's is replaced (the old one is kept in
`~/.claude/gsdf-statusline.previous.json`).

```bash
gsdf update --check   # compare this install against GitHub, write nothing
gsdf update           # reinstall from the newest release if it is ahead
gsdf update --main    # track the unreleased tip of main instead
```

It follows **release tags** when the repo has any, so a version number means something: a
release bumps `VERSION`, and an update lands on a release rather than on whatever is mid-work
on `main`. With no tags published it tracks `main` and says so.

It compares two things, because the version string alone is not enough: `VERSION`, which moves
on a release, and the commit recorded in the install receipt, which moves whenever the tracked
ref does. Either being ahead offers an update; neither is acted on under `--check`. It reinstalls
the way you installed — global or project — by running that release's own `install.sh`, so a new
command file or template arrives with the CLI rather than after it.

It refuses to run inside a GSDF checkout that has uncommitted changes or commits not on `main`,
because installing GitHub's copy there would quietly discard the build you are developing. Use
`./install.sh --global` to install that tree, or `gsdf update --force` to take GitHub's anyway.
`GSDF_REPO` and `GSDF_BRANCH` point it at a fork.

## The fourteen commands

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
| `/gsdf:pause [N]` | Write a handoff and stop — resume in a fresh session | 0 |
| `/gsdf:resume [N]` | Restore a paused session from its handoff | 0 |
| `/gsdf:auto ["<request>"]` | Build on its own: the rest of the roadmap, a big change, or new phases | 1 per phase + 1 per plan |
| `/gsdf:cfg [<setting> <value>]` | See or change how GSDF behaves in this project | 0 |
| `/gsdf:update` | Install the newest release — the status line shows `⬆ /gsdf:update` when there is one | 0 |
| `/gsdf:help` | The loop and the commands | 0 |

`discuss` is optional. `plan` is not — `auto` just runs it for you.

## Iterate mode

This is the part worth explaining. After `/gsdf:execute`, GSDF prints how to *see* what it built
— the target to build, the URL to open, the knob to move — plus the list of things no command can
judge. Then it waits.

You say "knob's too small". It edits the file, runs the smallest verify that proves the change,
**rebuilds and installs** (`gsdf rebuild` — you are never handed a "run this first"), tells you in
one line what to try, and logs:

```
- 14:05 — Knob too small at 100% zoom → min 44px, scales with parent [ui/src/knob.css]
```

No plan file, no subagent, no commit. Say something that sounds like a rule — *"from now on all
the knobs…"* — and it's logged as a `DECISION:` and promoted to STATE.md when you approve, so it
outlives the phase. Say **approved** and it verifies, makes exactly one commit, folds the log
into the summaries, and moves to the next phase.

## What a phase teaches outlives it

A lesson is cheapest to judge at the moment you learn it, and most expensive to reconstruct
afterwards from a record written for another purpose. So findings are captured as they happen —
`gsdf iter log N "FINDING: …"` during iterate, a `## Findings` line in a summary during execute —
and approve only **collates** them into `NN-FINDINGS.md`:

```markdown
## A Mirrored Constant Fails Silently In Both Directions
cluster: Lessons
symptoms: ["I changed the limit but the UI still clamps at the old value"]
see: [[Never Re-Type A Derived Constant]]

The runtime kept the old value and a test asserting the same literal stayed green,
certifying a bound nothing enforced.
```

`symptoms:` are the words you'd use *before* knowing the cause — that is what makes it findable
next time. `gsdf context` then hands the next phase's planner those titles for free, so knowledge
moves forward deterministically rather than by anyone remembering to look.

**Zero findings is a normal answer.** Most phases teach nothing reusable, and padding the file
with project history is worse than leaving it empty.

[Living Brain](https://github.com/daftsins-star/LivingBrain) turns these into linked Obsidian
notes automatically if you want that; GSDF does not require it, and the file is the artefact
either way.

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

Handoffs cross tools in both directions. `/gsdf:pause` writes the same `continue-here.md` both
upstreams use — `<phase dir>/.continue-here.md`, or `.planning/continue-here.md` when no phase is
open — so a session paused by GSDF resumes under `/gsd:resume-work`, and one paused by either
upstream resumes under `/gsdf:resume`. `gsdf context N` feeds whichever exists to the next
planner, and `/gsdf:resume` deletes it once restored so it can't go stale in someone's context.

So a phase gsd-core executed but never UAT'd lands you in iterate mode, ready to review. A phase
the original GSD verified is simply behind you. Both are the right answer.

## Auto mode

`/gsdf:new-project` asks two things before anything else: should GSDF work on its own, and
should it talk to you in plain words (no technical questions — it decides those). Then:

1. A short roadmap — at most `phases_per_milestone` phases (4), and when the project has a
   screen, phase 1 is **2–3 UI mockups** to choose from.
2. You pick which phases you want a say in; those are discussed up front, in one sitting.
3. GSDF builds the mockups and **stops** — the only planned stop. Pick one, iterate on it,
   say *approved*.
4. Every remaining phase is planned, executed, verified and approved on its own, one commit
   each. A check that fails gets two fix attempts before it becomes a stop.
5. `gsdf rebuild`, then one handoff: what to try, what needs your eyes and ears.

From iterate mode, `/gsdf:auto "<request>"` does the same for one request: a batch of
corrections done in place, or new capability added as new phases and built. It works with
`auto` off too — typing it is the go-ahead.

### Settings

```
$ gsdf cfg
auto                  on       work on its own: discuss up front, stop only at the mockups, build the rest
plain_language        on       talk to the user as a non-programmer; never ask technical questions
phases_per_milestone  4        how many phases a roadmap aims for
ui_first              on       a project with a UI starts with a mockup phase
ui_style              gsdf     UI look when the project names none (gsdf = GSDF Style Guide by Daftsins)
research              auto     when the planner searches the web
commit_docs           on       commit .planning/ files as they are written
rebuild               set      rebuilds AND installs the product; runs before every 'try it'
```

`/gsdf:cfg` walks through them; `gsdf cfg <setting> <value>` sets one and refuses a bad value.
`rebuild` is detected: for a JUCE + WebView plugin it builds the UI bundle, then the plugin, and
JUCE's `COPY_PLUGIN_AFTER_BUILD` installs it — `gsdf rebuild` warns when that flag is missing.

## The GSDF Style Guide by Daftsins

UI work in a project that names no style follows the `gsdf-style` skill, installed with GSDF:

- **Plugins** — black ground, bone ink, one accent per plugin, pixel display type over a mono
  body; small windows, lots of icons, tabs when there are many features. An optional
  **signature piece** — a picture or visualizer that reacts to the sound, posterized, pixelated
  and gently wobbling — is offered during discuss.
- **Apps** — translucent glass panels over the desktop.

Each half ships copy-verbatim tokens, component code, a reference mockup with its screenshot,
and a checklist Claude runs against its own screenshot before showing you anything.

## The CLI

`gsdf` is ~1620 lines of stdlib Python that answers *where am I* deterministically, so agents
don't burn context reading five markdown files to find out. (Lines, not words, is the honest
unit here: `bin/gsdf` is never loaded into a context window, so what the number claims is how
much code you have to trust — not what it costs you to run.)

```bash
gsdf next                # plan 03 | execute 02 | iterate 02 | milestone-done | new-project
gsdf phase list          # table: phase, slug, status, plans, done, iterations
gsdf context 2           # exactly what the planner is given — ~631 tokens, not 15k
gsdf tryit 2             # what to try, and what needs a human eye
gsdf cfg [<k> [<v>]]     # this project's settings; with a value, sets one (validated)
gsdf rebuild             # build and install; one line on success, the tail on failure
gsdf iter log 2 "..."    # one line per accepted change
gsdf waves 2             # [["01"], ["02"]]
gsdf conflicts 2         # exits 1 if two plans in one wave write the same file
gsdf verify 2            # runs the phase's verify commands; exits non-zero on failure,
                         #   2 and "NONE CONFIGURED" when there is nothing to run.
                         #   Runs plugin_validate only if the phase touched non-UI
                         #   source — a host validator after a CSS change is ceremony
gsdf findings 2          # what the phase captured as reusable, for approve to collate
gsdf params [--write]    # parameter ABI guard: removal, reorder and id reuse all fail.
                         #   Advisory until abi_frozen: true — before a release you want churn.
                         #   Reads only; --write locks. Resolves named-constant ids, skips
                         #   vendored JUCE, and refuses to lock ids built at runtime —
                         #   set params_cmd in config.json to a command that prints them
gsdf lint 2              # exits 1 if a plan is not executable, naming the plan and why.
                         #   Also catches the two failures that are silent otherwise: a
                         #   phase with no plans at all, and a circular depends_on — which
                         #   waves() would emit as one parallel wave, the opposite of
                         #   what those plans declared — and a Try-it that tells the
                         #   user to build something
gsdf update              # check GitHub, reinstall if it is ahead (--check to look only;
                         #   --bg checks in the background, once an hour at most)
gsdf statusline          # the status line: ⬆ /gsdf:update │ model │ phase 02 iterate · auto │ folder ███░░ 34%
gsdf bug "<one line>"    # record a GSDF bug you just hit, from any project
gsdf bugs                # open reports, each with a stable #id
gsdf bugs --fixed <id> "<commit>"   # retire one, stamped with what fixed it
gsdf trace on|off|show   # record a real phase's call sequence, then check it
```

Every read subcommand is pure — the test suite asserts `git status` is clean after all of them.

### Bugs found while using it

GSDF's own bugs surface while you are using GSDF on real work, in another project, mid-task —
the worst moment to stop and write a report. So recording costs almost nothing:

```bash
gsdf bug "lint passed a phase whose plans had empty requirements"   # ~12 tokens
gsdf bugs           # grouped, deduped, counted, each with a stable #id
gsdf bugs --fixed a1b2 "e4e3e0b"   # after fixing one: archives it with what fixed it
gsdf --version      # also says how many reports are open
```

**Crashes record themselves.** A crash is never correct behaviour, so the CLI logs it with no
agent involved and no tokens spent — the exception, the function and line that raised, the
command that caused it, the version, and the directory:

```
#5c1e [3x] crash  TypeError: 'int' object is not subscriptable
      cmd_params:526  |  gsdf params 1  |  v1.2.0  |  2026-09-11 23:51
```

The log is one JSON line per event at `~/.claude/gsdf-bugs.jsonl` (`GSDF_BUGLOG` overrides) —
global, because the bug is hit in your project and fixed in this one. Appends are locked, so
parallel agents can't tear it, and a corrupt line is skipped rather than fatal.

The only recurring cost is one sentence in the always-loaded `CLAUDE.md` block telling the agent
to call `gsdf bug` instead of investigating: **~36 tokens per turn**. Delete that sentence and
crash capture still works — you just lose the bugs that don't crash, which is most of them.

**Recording is only half of it; someone has to read the log.** `gsdf bugs --count` prints one
line, or nothing when the log is empty — wire it to SessionStart in the GSDF repo's
`.claude/settings.local.json` (see SELF-HOSTING.md) and opening the repo says what is waiting.
GSDF itself still ships zero hooks. Fixed reports
are retired one at a time with `--fixed`, so the open list never mixes in finished work.

### Checking it against a real phase

Reading the command markdown cannot tell you whether the commands *behave* — an agent that skips
approve's verify gate raises nothing, produces no error, and looks exactly like one that didn't.
Only a real phase settles that, so record one:

```bash
gsdf trace on      # in the project you're about to work in
# /gsdf:plan N → /gsdf:execute N → iterate → approved
gsdf trace show    # the call sequence, with exit codes, checked against the documented process
gsdf trace off
```

`show` prints every `gsdf` call the run made and then checks invariants the markdown promises but
nothing else enforces:

```
  MISS approve ran its verify gate
       a phase was advanced without gsdf verify -- approve.md step 1 was skipped
  ok   execute handed off with tryit
```

A sentinel file switches it on, not an environment variable: every agent Bash call is a fresh
shell, so an exported variable would not survive between them. Off by default, and off costs one
`stat` per call.

## How it compares

Measured, not asserted — both upstreams cloned and counted on the same day, and the context
figure taken from the same real project (a JUCE gain plugin scaffolded by `/gsdf:new-project`):

| | get-shit-done | gsd-core | GSDF |
|---|---|---|---|
| Commands | 29 | 72 | **14** |
| Agents | 12 | 64 | **2** |
| Words of command + agent markdown<sup>†</sup> | 59,114 | 157,383 | **10,327** |
| Description text loaded every turn | 1,880 chars | 5,349 chars | **635 chars** |
| Context handed to the planner | ~3,572 tokens<sup>‡</sup> | ~3,572 tokens<sup>‡</sup> | **631 tokens** |
| Subagents per 2-plan phase | 6–8 | 6–10 | **3** |
| Subagents during review/iteration | 1+ per fix | 1+ per fix | **0** |

<sup>†</sup> Words, not lines, because the cost being compared is context and a line is a bad
proxy for it. GSDF's markdown runs 7.2 words per line against get-shit-done's 3.6, so counting
lines would report a 15× advantage where the honest figure is **5.7×**. Words are exact; at
roughly 1.3 tokens per word that is ~13k tokens against ~77k and ~205k. All three counted the
same way, `commands/**/*.md` + `agents/**/*.md`, on the same day.

<sup>‡</sup> Both read PROJECT.md + ROADMAP.md + STATE.md + REQUIREMENTS.md (+ prior SUMMARYs) to
plan. `gsdf context N` selects the phase's slice of exactly that material. The gap widens as a
project grows: GSDF caps every section, the read-everything pattern accumulates.

The point of the smaller numbers isn't minimalism. It's that a cold subagent spend and a
per-turn description tax are paid before any work happens, and the review loop — where the real
time goes — costs GSDF nothing at all.

What the other two have that GSDF deliberately doesn't: cross-AI review, worktrees, security
gates, UI pillars, codebase intel graphs, debug sessions, workstreams. If you
want those, use gsd-core — it's a bigger system on purpose, and GSDF reads the same `.planning/`
so you can run both.

## Benchmark

A full phase, run end to end on a real JUCE plugin project (`/gsdf:new-project` through
`approved`), headless on an M-series Mac:

| Step | Wall clock | Subagents |
|---|---|---|
| `/gsdf:new-project --auto @spec.md` | 4m 38s | 1 |
| `/gsdf:plan 1 --auto` | 9m 02s (incl. live web research on JUCE) | 1 |
| `/gsdf:execute 1` | 17m 13s (dominated by cloning and compiling JUCE) | 1 per plan |
| `/gsdf:iterate 1` re-entry after `/clear` | 8s | 0 |
| One iteration ("gain default should be -6 dB") | **27s** | **0** |
| One iteration that turned out to be a rule | **36s** | **0** |
| `approved` | 2m 02s | 0 |

The iteration numbers are the point. A change, its verify, and its log entry cost half a minute
and no cold-start context — that is the loop you spend most of your time in.

Measured on the test fixtures:

| | |
|---|---|
| `gsdf context N` | **37 ms**, ~**631 tokens** (budget: 100 ms, 2,500 tokens) |
| Subagents per 2-plan phase | **3** — one planner, two executors. Iterate and approve add none. |
| Command descriptions, all 14 | **635 characters** total (loaded every turn; budget 700) |
| `gsdf-executor.md` / `gsdf-planner.md` | **895** / **1145** words (read at every spawn) |

**The end-to-end wall-clock comparison has not been run.** It needs a real interactive session —
`/gsdf:new-project` through `approved` on a scratch project — which can't be produced from a
build script without simulating it, and a simulated number is worse than no number. The
procedure is written out in `GSDF-SPEC.md` §12; run it and the numbers go here.

## What has actually been run

Every command except the two newest has been executed for real against live projects, not just
unit-tested:

| Path | Evidence |
|---|---|
| `new-project` → `plan` → `execute` → iterate → `approved` | Full loop on a real JUCE plugin, from a spec file to an approved phase |
| Parallel execution | Two executors, one wave — commits **interleaved** in the log, and not one mixed the other's files |
| `discuss` | Run interactively; 6 questions, and it caught two genuine conflicts (greyscale bypass on a monochrome palette; a readout choice contradicting its own REQ) |
| Blocked executor | Deliberately impossible dependency — executor refused to substitute, wrote `status: blocked`, made no task commit, orchestrator halted the wave |
| `quick` | One spawn, zero questions, landed in `.planning/quick/001-…/`, left the phase state untouched |
| `progress` on foreign trees | An original-GSD project → `execute 02`; a gsd-core project → `iterate 02`; zero questions, nothing renamed |
| Milestone close | Tag written, phases + roadmap `git mv`'d into `milestones/v1.0/` — git recorded renames, nothing lost |
| Conditional research | Phase introducing JUCE researched and wrote `01-RESEARCH.md`; phase with no new dependency correctly did not |
| `--skip-research` / `--research` | Both honoured: skip wrote no `RESEARCH.md` on a phase with a live dependency; force wrote one on a phase that needed none |
| Concurrent state writes | 8 parallel `gsdf state defer` calls all land (3 of 8 before the fix) |
| Malformed input | 13 corrupt-tree cases — bad frontmatter, binary files, invalid JSON, empty roadmap — exit cleanly, never crash |
| Plan gates | `gsdf lint` catches a missing `<fails_when>`, an oversized plan, empty requirements and a missing `## Try it`; `gsdf conflicts` refused a real wave where two plans both appended to `CMakeLists.txt` |
| Iterate re-entry after `/clear` | Reprinted Try-it and the change log, resumed cleanly |

Fourteen bugs were found this way that the test suite could not have caught, including `approve`
marking the *wrong phase* complete, a blocked plan counting as a finished one, `approve`
committing before it had finished writing its own state, `adopt` destroying a `config.json` it
could not parse, and parallel `gsdf` writes silently losing updates.

## Limitations

- **macOS and Linux.** `install.sh` is bash. The CLI itself is stdlib Python and portable, so a
  Windows install is a matter of copying the four directories and putting `bin/gsdf` on PATH.
- **A global install shadows a project install.** User-level commands win, so a stale
  `~/.claude/commands/gsdf/` beats a fresh project copy. `install.sh` warns when it sees this.
- **Permissions need a trusted workspace.** Claude Code ignores `permissions.allow` until you
  open the project interactively once and accept the trust dialog.
- **`/gsdf:pause`, `/gsdf:resume`, `/gsdf:auto` and `/gsdf:cfg` have not been run live yet.**
  They are covered by the conformance suite, and `gsdf cfg` / `gsdf rebuild` by the CLI tests,
  but none of the four by the live runs above.
- **The plan re-spawn has never fired.** `gsdf lint` and `gsdf conflicts` are proven to *detect*
  every failure they check for, but no planner output has actually failed one, so the branch that
  re-spawns the planner with the failure text is unexercised.
- **~17 conformance checks only assert that the prose says the right thing.** They are regression
  guards against an instruction being edited out, not evidence that an agent complies. Only the
  live runs above are that.

## Tests

```bash
bash tests/test_cli.sh          # 310 checks — CLI behaviour against 7 fixture projects
bash tests/test_conformance.sh  # 175 checks — spawn, size and token budgets; the git protocol
```

`tests/fixtures/` holds two `.planning/` trees built by hand from the real templates of both
upstream projects — one mid-phase under the original GSD, one under gsd-core — plus one fixture
per state `gsdf next` can return.

## Working on GSDF itself

GSDF can plan and execute its own changes, and self-hosting has one trap no other project has:
`/gsdf:*` runs from `~/.claude/`, not from your checkout, so an edit here does nothing until you
run `./install.sh --global`. See **[SELF-HOSTING.md](SELF-HOSTING.md)** for the loop, the budgets
the test suite enforces, how to force a parallel or a blocked run, and which decisions are
deliberate rather than accidental.

## Credits

**GSDF was conceived and designed by [Daftsins](https://github.com/daftsins-star).** The idea —
keep GSD's quality guarantees but stop paying a cold subagent for every small fix, and put the
review loop back in the chat where it belongs.

Descended from [get-shit-done](https://github.com/ludicrypt/get-shit-done) by Lex Christopherson
and [gsd-core](https://github.com/open-gsd/gsd-core) by Open GSD, both MIT. No code is vendored
from either; the wording, formats and rules that are borrowed are itemised in `NOTICE.md`.

MIT.
