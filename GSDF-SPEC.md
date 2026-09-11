# GSDF — Get Shit Done Fast — Build Specification (final)

> Hand this file to Claude Code in an empty directory and say:
> **"Read GSDF-SPEC.md fully, then build it. Follow it exactly. Do not add features that are not
> in this file. Ask me only when the spec is ambiguous."**

---

## 0. Goal

**Name:** GSDF — *Get Shit Done Fast*. Command prefix `/gsdf:`, CLI `gsdf`, agents `gsdf-*`.
The prefix never collides with `/gsd:` (original) or `/gsd-*` (gsd-core), so all three can be
installed side by side for comparison.

**What it is:** a Claude Code workflow that keeps GSD's quality guarantees — fresh-context
subagents, atomic commits, durable state, plans verified before execution — at the speed of the
original `get-shit-done` v1.x, plus one thing neither has: a fast, inline **iterate mode** after
execution where the user reviews the output, asks for changes conversationally, and says
"approved" when done.

**The ideal loop:**

```
/gsdf:discuss N   →   /gsdf:plan N   →   /gsdf:execute N   →   [iterate: talk, fix, tweak]   →   "approved"
   optional            1 subagent        1 subagent/plan          0 subagents, inline           commit + log
```

**Speed target:** discuss → approved for a 2-plan phase in roughly half the wall-clock time of
gsd-core on the same project. Token target: main-session context stays under ~40% through a full
phase including iteration.

**Hard requirement — drop-in on existing projects:** GSDF reads and writes the exact `.planning/`
layout that both the original get-shit-done and gsd-core use. Installing GSDF into a project that
is mid-phase under either GSD must let the user run `/gsdf:progress --next` and continue as if
nothing changed. No migration step, no renamed files, no deleted files. See §4a.

**Primary stack:** C++ audio plugins with JUCE (CMake) and a webview-based UI (HTML/CSS/JS).
Defaults are tuned for this; nothing is hard-coded to it.

**Non-goals — do not build:** multi-runtime support, npm publishing, plugin marketplace,
cross-AI review, workstreams, workspaces, spikes, sketches, forensics, profile-user, UI-review
pillars, security gates, broken-windows ledger, package-legitimacy gate, ADR ingest, tracker
integration, codebase-intel SQLite graph, PostToolUse hooks, namespace routers, `pause-work` /
`resume-work`, separate researcher / plan-checker / verifier agents, `autonomous` mode, `manager`.
If it isn't in §4 it does not exist.

---

## 1. Source material — clone, study, delete

```bash
mkdir -p /tmp/gsd-src && cd /tmp/gsd-src
git clone --depth 1 https://github.com/ludicrypt/get-shit-done.git original   # pre-split snapshot of gsd-build/get-shit-done
git clone --depth 1 -b next https://github.com/open-gsd/gsd-core.git core      # community continuation
```

If a clone fails, say so and stop. Do not substitute from memory.

**Study in `original/`:** `agents/gsd-planner.md`, `agents/gsd-executor.md`,
`agents/gsd-plan-checker.md`, `agents/gsd-verifier.md`, `commands/gsd/discuss-phase.md`,
`plan-phase.md`, `execute-phase.md`, `new-project.md`, `quick.md`, `progress.md`,
`get-shit-done/workflows/`, `get-shit-done/templates/`, `GSD-STYLE.md`.

**Study in `core/`:** how STATE.md and CONTEXT.md are written/read across sessions; the
plan-checker's "fits a fresh context window" and requirement-coverage checks; `effort:`
frontmatter; wave scheduling in execute-phase; `<fails_when>` on verify commands; the discuss
workflow's gray-area detection and option presentation; any agent prompt sentences that are
clearly sharper than the original's.

Copy **wording**, never machinery. Both are MIT — keep `NOTICE.md` crediting both. When done,
`rm -rf /tmp/gsd-src`. Nothing is vendored as-is.

---

## 2. Design principles — these decide every ambiguity

1. **Spawn budget per phase = 1 planner + 1 executor per plan. Nothing else.** Every spawn is a
   cold-start prefill. This is where speed comes from.
2. **The orchestrator (command file) is thin.** It coordinates, calls `gsdf`, writes state.
   It never researches, never writes production code, never verifies code — *except in iterate
   mode, where it edits inline by design*.
3. **State lives in the CLI, not in prompts.** `gsdf` answers "where am I, what's next, what
   plans exist" deterministically. Agents call it instead of reading five markdown files.
4. **PLAN.md is self-contained.** The executor needs PLAN.md plus the files it names. Nothing
   inherited. Executor agent definition stays under 60 lines.
5. **Verification is folded in.** Planner self-checks its plan. Executor runs `<verify>` before
   each commit. Human review happens in iterate mode. No separate agents for any of it.
6. **Discuss is optional, plan is not.**
7. **Coarse phases.** 3–6 per milestone.
8. **Fast paths ask nothing.** `quick`, `plan --auto`, `execute` never call `AskUserQuestion`.
   They state assumptions in artifacts.
9. **Iterate mode is inline and cheap.** No plan files, no spawns, no ceremony per change. The
   only bookkeeping is one appended line per accepted change.
10. **Keep what prevents repeating work. Drop what duplicates work.**

---

## 3. Repository layout

```
gsdf/
├── GSDF-SPEC.md              # this file
├── README.md                 # install, the 11 commands, the loop diagram, benchmark
├── NOTICE.md                 # MIT attribution: get-shit-done (TÂCHES) and gsd-core (open-gsd)
├── LICENSE                   # MIT
├── install.sh                # copies .claude/ tree into a target project (§9)
├── bin/
│   └── gsdf                  # Python 3, stdlib only, <300 lines, <100 ms per call
├── .claude/
│   ├── commands/gsdf/        # → invoked as /gsdf:<name>
│   │   ├── new-project.md
│   │   ├── discuss.md
│   │   ├── plan.md
│   │   ├── execute.md
│   │   ├── iterate.md
│   │   ├── approve.md
│   │   ├── quick.md
│   │   ├── progress.md
│   │   ├── pause.md
│   │   ├── resume.md
│   │   └── help.md
│   ├── agents/
│   │   ├── gsdf-planner.md
│   │   └── gsdf-executor.md
│   ├── skills/gsdf-templates/
│   │   ├── SKILL.md
│   │   ├── PROJECT.template.md
│   │   ├── ROADMAP.template.md
│   │   ├── STATE.template.md
│   │   ├── CONTEXT.template.md
│   │   ├── PLAN.template.md
│   │   ├── SUMMARY.template.md
│   │   ├── ITERATIONS.template.md
│   │   └── FINDINGS.template.md
│   ├── CLAUDE.gsdf.md        # block install.sh appends to the target's CLAUDE.md (§9)
│   └── settings.json         # permissions allow-list (§9)
└── tests/
    ├── test_cli.sh
    └── fixtures/             # fake .planning/ trees covering every gsdf next state
```

**11 commands, 2 agents, 1 template skill, 1 CLI.** Do not add more. The two session-boundary
commands (`pause`, `resume`) exist because a session ends mid-phase and `gsdf next` recovers the
position but never the reasoning; that is the only gap a command was ever added for. Anything
else still does not get one.

Templates produce files using the **GSD-native names** (`NN-MM-PLAN.md`, `NN-CONTEXT.md`, …, §4a).
The template filenames above are just the template names.

Claude Code namespacing: a file at `.claude/commands/gsdf/plan.md` is invoked as `/gsdf:plan`.
Verify this against the installed Claude Code version (`claude --help`, or the docs at
https://docs.claude.com/en/docs/claude-code) before finalizing — if the separator differs, adapt
the docs and install.sh, not the layout.

---

## 4. Feature matrix

| Feature | From | Status | Notes |
|---|---|---|---|
| `.planning/` state dir | original | KEEP, byte-compatible | Same layout and filenames as both GSDs. §4a. |
| STATE.md cross-session memory | core | KEEP | Written only via `gsdf state`. |
| Discuss with gray areas + options | both | KEEP | Claude proposes options per gray area; user picks or writes own. Inline, no spawn. |
| CONTEXT.md | both | KEEP, optional | Planner uses it if present. |
| Fresh-context subagents | both | KEEP | Planner + executor only. |
| XML `<task>` plans | original | KEEP | §6. |
| `<fails_when>` per verify | core | KEEP | Verify without a failure condition isn't a test. |
| Plan-fits-context + coverage check | core | KEEP, inlined | Planner self-check step. |
| Wave-parallel execution | both | KEEP, simplified | `depends_on` in PLAN frontmatter; `gsdf waves N` computes waves. |
| Atomic commit per task | original | KEEP | `type(NN-MM): name`. |
| SUMMARY.md | both | KEEP | Adds `## Try it` (§6) so the user can see the result immediately. |
| **Iterate mode** | new | ADD | §7. Replaces `verify-work` / UAT and replaces "use quick for small fixes". |
| **Approve** | new | ADD | §7. Single commit, log folded into SUMMARY + STATE, phase advances. Runs `gsdf verify`; collates `gsdf findings` into `NN-FINDINGS.md`. |
| `gsdf verify N` | new | ADD | Runs config verify commands, else the phase's plan `<verify>` blocks. Exit 0 pass, 1 fail, 2 nothing configured — so an unverified phase can never be reported as a passing one. |
| `gsdf findings N` | new | ADD | Collects `FINDING:` iteration lines and `## Findings` summary sections. Judgement happens when the lesson is learned; this only gathers. |
| `quick` | both | KEEP | For work outside the current phase. One spawn, no questions. |
| `progress --next` | both | KEEP | `effort: low`. Restores context after `/clear`. |
| `effort:` frontmatter | core | KEEP | `low` on progress/help/approve. Never `max`. |
| Model inherit | core | KEEP as default | No `model:` on agents. |
| Research | original | KEEP, inlined, conditional | Planner reads code always; web research only when the phase introduces a dependency not already in the repo. `--research` forces, `--skip-research` blocks. |
| map-codebase | original | FOLD into new-project | Inline scan; no spawn. |
| complete/new-milestone | both | FOLD into progress | Offered when `gsdf next` = `milestone-done`. |
| Model profiles (quality/balanced/budget) | original | DROP | Inherit is faster and simpler. |
| Everything in §0 non-goals | — | DROP | |

---

## 4a. Compatibility with existing GSD projects — non-negotiable

The user has projects mid-flight under the original GSD and under gsd-core. GSDF must pick them up
with zero friction. These rules override anything else in this spec if they conflict.

### The filesystem is the source of truth, not STATE.md

Both GSDs changed their STATE.md and ROADMAP.md formats between versions. GSDF therefore never
*depends* on parsing them. `gsdf next`, `gsdf phase current`, `gsdf plans`, `gsdf waves` are
computed entirely from which files exist under `.planning/phases/`. STATE.md and ROADMAP.md are
written for humans and for the next session's context, read tolerantly, and never trusted for
control flow.

### Exact layout GSDF reads and writes

```
.planning/
├── PROJECT.md  REQUIREMENTS.md  ROADMAP.md  STATE.md  config.json
├── research/            # original GSD: left untouched
├── codebase/            # original GSD map-codebase output: left untouched, READ by gsdf context (conventions.md, stack.md)
├── todos/               # left untouched
├── continue-here.md     # pause handoff, GSD-compatible: READ by gsdf context; written by /gsdf:pause, not the CLI
├── milestones/          # archived phases: left untouched; gsdf progress writes here on milestone-done
├── quick/NNN-slug/      # PLAN.md + SUMMARY.md (unprefixed, as both GSDs do). Numbering continues from the highest existing NNN.
└── phases/NN-slug/      # 2-digit or 3-digit NN — accept both, never renumber
    ├── NN-CONTEXT.md        # discuss output (both GSDs). gsdf discuss writes this name.
    ├── NN-DISCUSSION-LOG.md # gsd-core only: left untouched, not read
    ├── NN-RESEARCH.md       # both GSDs: READ by planner if present; gsdf planner writes it only when it did web research
    ├── NN-MM-PLAN.md        # both GSDs. gsdf writes this name.
    ├── NN-MM-SUMMARY.md     # both GSDs. gsdf writes this name.
    ├── NN-VERIFICATION.md   # original GSD verify-work output. Presence = phase was verified. Never written by gsdf.
    ├── NN-UAT.md            # both GSDs UAT. Presence with a pass marker = phase approved. Never written by gsdf.
    ├── NN-ITERATIONS.md     # gsdf only. New.
    └── NN-FINDINGS.md       # gsdf only. New. Written at approve when the phase taught something
                             # reusable; absent when it did not, which is normal. Each ## section
                             # is one knowledge-vault note, carrying cluster/symptoms/see. Consumed
                             # by living-brain, whose Stop hook writes the notes directly
                             # and skips the review Inbox. Optional: the file is the artefact.
```

Everything not in this list that already exists in `.planning/` is ignored and preserved. GSDF
never renames, moves, or deletes a file it didn't create.

### `gsdf next` on a pre-existing project

Phase status is derived per directory, first match wins:
1. `NN-ITERATIONS.md` with `status: approved` → **complete**
2. `NN-UAT.md` exists and contains a pass marker (any of: `status: passed`, `Status: PASS`,
   `## Result: pass`, all checkboxes ticked — be generous) → **complete**
3. `NN-VERIFICATION.md` exists and contains `passed`/`PASS` → **complete** (original GSD verified
   phases that never had UAT)
4. every `NN-MM-PLAN.md` has a matching `NN-MM-SUMMARY.md` → **executed → iterate**
5. some PLANs lack SUMMARYs → **execute**
6. no PLANs → **plan**

Current phase = the lowest-numbered phase that is not complete. Phases listed in ROADMAP.md but
with no directory yet are treated as "plan" when reached; `gsdf phase dir N` creates the directory
using the slug from ROADMAP.md (tolerant regex over `## Phase N:`, `### Phase N —`, `- [ ] Phase N:`
etc.; if no slug can be found, use `phase-N`).

So: a project that was executed under gsd-core but never verified lands in **iterate mode** — the
user reviews and says approved. A project that was verified under original GSD is simply past that
phase. Both are correct outcomes.

### Reading old artifacts

- Old PLAN.md files may lack `estimated_tokens`, `depends_on`, `<fails_when>`, `## Try it`, and
  may contain tags GSDF doesn't define (`<automated>`, `<read_first>`, gsd-core's `<tracer>`, etc.).
  The executor treats unknown tags as prose and runs them. Missing `depends_on` → `[]` (serial by
  plan number if any plan lacks it — never assume parallel safety). Missing `<fails_when>` →
  "exit code != 0". Missing `## Try it` → orchestrator prints the `## Delivered` block instead.
- Old PLAN frontmatter may use `wave:` (both GSDs) instead of `depends_on`. `gsdf waves` honors
  `wave:` when present and `depends_on` is absent.
- Old SUMMARY.md may lack the gsdf sections. `gsdf tryit` prints whatever `## Delivered`,
  `## Accomplishments`, `## What was built` or first section exists.
- Old STATE.md: `gsdf state` prints the first of `## Position`, `## Current Position`,
  `## Current Status`, or the first 15 lines. `gsdf state note/defer` append to `## Decisions` /
  `## Deferred` if present, else to `## Decisions Made` / `## Deferred Items` / whatever heading
  fuzzy-matches, else create the heading at the end. `gsdf state set` writes YAML frontmatter only
  if the file already has frontmatter; otherwise it writes a `<!-- gsdf: key=value -->` comment
  line under the title. `gsdf state position` replaces the matched position section body.
- Old ROADMAP.md: `gsdf phase advance` flips the phase's status marker in whatever format is
  found (`- [ ]` → `- [x]`, `Status: pending` → `Status: complete`, `⏳` → `✅`). If nothing
  matches, append `<!-- gsdf: phase NN complete -->` and move on. Never rewrite the file.
- Old `config.json`: merge — add missing gsdf keys (§5.1) with detected values, keep every existing
  key untouched (both GSDs put `model_profile`, `mode`, `git`, `workflow` etc. there).
- `codebase/conventions.md`, `codebase/stack.md` (original map-codebase) are included in
  `gsdf context` section 1 if present, capped at 40 lines each — they're exactly what the planner
  needs and were expensive to produce.

### CLAUDE.md coexistence

Projects may already have a GSD block in CLAUDE.md. `install.sh` adds the gsdf block after it and
does not touch it. If the user has both `/gsd:*` and `/gsdf:*` installed, they coexist.

### `gsdf adopt` (new CLI subcommand)

Run by `install.sh` when `.planning/` already exists, and by any `/gsdf:*` command on first use:
- merge config.json keys, detect verify commands
- print `gsdf phase list` and `gsdf next`
- nothing else. Idempotent. **Never** writes to phases/.

### Test fixtures required

`tests/fixtures/` must contain, in addition to the gsdf-native states:
- `original-midphase/` — a `.planning/` copied from a real original-GSD project: phase 01 with
  `01-VERIFICATION.md` (passed), phase 02 with `02-CONTEXT.md`, `02-01-PLAN.md` (with `wave: 1`,
  no `<fails_when>`), `02-01-SUMMARY.md`, `02-02-PLAN.md` (`wave: 2`), no summary; original-style
  STATE.md with `## Current Position`; original-style ROADMAP.md with checkboxes; `codebase/`.
  Expected: `gsdf next` → `execute 02`, `gsdf waves 02` → `[["01"],["02"]]`.
- `core-midphase/` — a `.planning/` from gsd-core: phase 01 with `01-UAT.md` passed, phase 02
  all plans have summaries, no UAT, `continue-here.md` present, `02-DISCUSSION-LOG.md` present.
  Expected: `gsdf next` → `iterate 02`, `gsdf context 02` includes continue-here.md.
- Both fixtures: `gsdf adopt` twice produces identical trees (idempotent), and `git diff` after
  running `gsdf next`/`list`/`context`/`tryit` is empty (reads never write).

Build these fixtures by hand from the templates in `/tmp/gsd-src/original/get-shit-done/templates/`
and gsd-core's templates so the formats are real, not guessed.

---

## 5. The CLI — `bin/gsdf`

Python 3, stdlib only. Every subcommand < 100 ms on the fixture tree. Output plain text or JSON;
markdown tables only for `phase list`. Exit non-zero with a one-line error on bad state.
All read subcommands are pure: they never write. All state is derived from the filesystem (§4a).

```
gsdf init <name>                     # scaffold .planning/ from templates; refuses if .planning/ exists
gsdf adopt                           # existing .planning/ from any GSD: merge config, report state (§4a)
gsdf state                           # print frontmatter + "## Position" only
gsdf state set <key> <value>         # frontmatter field
gsdf state note <text>               # append dated line under "## Decisions"
gsdf state defer <text>              # append under "## Deferred"
gsdf state position <text>           # rewrite "## Position"
gsdf next                            # one of: new-project | plan | execute | iterate | milestone-done, plus phase number
gsdf phase current                   # "NN slug status"
gsdf phase list                      # table: NN, slug, status, plans, done, iterations
gsdf phase dir <N>                   # absolute path
gsdf phase advance                   # mark current complete, set next as current
gsdf plans <N>                       # JSON [{id, file, depends_on, has_summary, status}]
gsdf waves <N>                       # JSON [[ids wave 1], [ids wave 2], ...]
gsdf context <N>                     # what the planner receives (§5.2)
gsdf tryit <N>                       # concatenated "## Try it" + "## Needs human check" from all SUMMARYs in phase
gsdf iter log <N> "<text>"           # append an accepted change to NN-ITERATIONS.md (§7)
gsdf iter list <N>                   # print NN-ITERATIONS.md entries
gsdf iter count <N>                  # integer
gsdf quick new <slug>                # create .planning/quick/NNN-slug/, print path
gsdf quick list
gsdf lint <N>                        # plan gates; exit 1 naming the plan and the problem. Zero plans,
                                     #   a self-dependency and a circular depends_on all fail
gsdf conflicts <N>                   # exit 1 if two plans in one wave write the same file
gsdf verify <N>                      # run config verify, else plan <verify>; exit 0 pass / 1 fail / 2 nothing configured
gsdf findings <N>                    # FINDING: iteration lines + "## Findings" summary sections
gsdf params <N> [--write]            # parameter ABI guard; --write re-locks (§5.5)
gsdf update [--check] [--force] [--main]  # compare against GitHub, reinstall when behind (§5.6)
```

Flags are never positional: the phase is taken from the first argument that is not a `-` flag,
so `gsdf params --write` means the current phase rather than a phase called `--write`. An
unrecognised flag is an error — `gsdf context --phase 2` must not quietly print the current
phase and look like it worked.

`waves` breaks a dependency deadlock by emitting the survivors as one layer, so a cycle would
otherwise become a *parallel* wave. `lint` is where that is caught, because `/gsdf:plan` can
still act on it there.

### 5.6 `gsdf update`

Needs no `.planning/` — it is install state, not project state.

It tracks the newest **release tag** (`git ls-remote --tags`, no clone and no API token) and
falls back to the branch only when the remote has none, saying so when it does. That is what
makes `VERSION` mean anything: a release bumps it, and an update moves between releases rather
than onto whatever is mid-work. `--main` opts back into branch tracking. The conformance suite
enforces the other half — a tagged HEAD whose `VERSION` disagrees with its tag is a failure, as
is a `VERSION` behind the newest tag, because a release that forgets the bump ships to every
existing install as "already up to date".

Compares two signals against `GSDF_REPO`/`GSDF_BRANCH` (default `daftsins-star/gsdf`):

- `VERSION` in the remote `bin/gsdf`, fetched raw. Moves on a release.
- the commit in `<install>/bin/gsdf-install.json`, against `git ls-remote`. Moves whenever
  `main` does, which for an untagged repo is far more often.

Either being ahead offers an update. `--check` reports and writes nothing. An update clones the
ref shallowly, re-reads `VERSION` from the clone and aborts if it disagrees with what was
advertised, then runs that release's own `install.sh` with the same scope as the current install
— so a new command file or template arrives with the CLI, not after it.

The updater writes the receipt itself rather than trusting the `install.sh` it just downloaded:
that installer comes from the release being installed, so a release that drops the receipt would
otherwise leave a stale one and mis-report from then on.

It refuses to run inside a GSDF checkout with uncommitted changes or commits not on the branch,
since installing GitHub's copy there discards the build under development. `--force` overrides,
and also allows a deliberate downgrade.

### 5.1 `config.json`

```json
{
  "verify": {
    "build":   "cmake --build build --config Release",
    "test":    "ctest --test-dir build --output-on-failure",
    "ui":      "cd ui && npm test",
    "ui_dev":  "cd ui && npm run dev",
    "plugin_validate": "pluginval --strictness-level 5 --validate build/<Plugin>_artefacts/Release/VST3/<Plugin>.vst3"
  },
  "ui_dir": "ui",
  "standalone_target": "<Plugin>_Standalone",
  "phases_per_milestone": 4,
  "research": "auto"
}
```

`gsdf init` and `gsdf adopt` detect and fill what it can (CMakeLists.txt project name, presence of `ui/`,
`package.json`, `pluginval` on PATH). Unknowns stay as placeholders and `new-project` asks.
Planner reads `verify` to write real `<verify>` commands instead of inventing them.

### 5.2 `gsdf context N` — token budget matters here

Prints, in order, nothing else:
1. `## Project` — PROJECT.md's first section only (vision, ≤ 15 lines).
2. `## Phase N` — this phase's ROADMAP entry (goal + REQ ids).
3. `## Requirements` — only the REQ lines this phase maps to.
4. `## Decisions` — STATE.md decisions block, last 20 lines max.
5. `## Context` — CONTEXT.md verbatim if present.
6. `## Verify commands` — the `verify` block from config.json.
7. `## Previous phase` — the `## Delivered` and `## Iterations` sections of the previous phase's
   SUMMARY.md, if any. Nothing older.

Target: under 2,500 tokens for a typical phase. This replaces the "read PROJECT.md, ROADMAP.md,
STATE.md, REQUIREMENTS.md, CONTEXT.md, all previous SUMMARYs" pattern that both GSDs use.

### 5.3 `gsdf next` logic

No `.planning/` → `new-project`. Otherwise apply the per-phase status rules in §4a to find the
current phase and return `plan` / `execute` / `iterate` for it, or `milestone-done` when every
phase in ROADMAP.md is complete. `discuss`, `quick`, `approve` are never returned.

### 5.4 Tests

`tests/test_cli.sh` runs every subcommand against fixtures for each state in 5.3 and asserts
output. Must be green before any markdown is written.

---

## 6. Artifact schemas

### `NN-MM-PLAN.md`

```markdown
---
phase: 02
plan: 01
depends_on: []
estimated_tokens: 45000       # executor context incl. files read; must be < 120000
requirements: [REQ-03, REQ-05]
---
# Plan 02-01: <title>

## Goal
One paragraph: what exists after this that didn't before.

## Context
Only what the executor needs. ≤ 30 lines. Point to files, don't quote them.

## Tasks

<task id="1">
  <name>Add gain parameter to APVTS</name>
  <files>Source/PluginProcessor.h, Source/PluginProcessor.cpp</files>
  <action>Precise steps. Name the API. Name what NOT to do and why.</action>
  <verify>cmake --build build --config Release && ctest --test-dir build -R Gain</verify>
  <fails_when>build error, or any ctest line reports Failed, or exit code != 0</fails_when>
  <done>Gain param appears in host, range -60..+12 dB, default 0</done>
</task>

## Must-haves
- [ ] One bullet per observable outcome.

## Try it
How the user will see this working after execution. Concrete: the target to build, the file to
open, the URL. For webview UI work: how to open the UI standalone in a browser without a DAW.
```

### `NN-MM-SUMMARY.md`

```markdown
---
phase: 02
plan: 01
status: complete | partial | blocked
commits: [abc123f, def456g]
---
# Summary 02-01

## Delivered
Must-haves mirrored, each ✅/❌ with one line of evidence.

## Verification
| Task | Command | Result |
|---|---|---|

## Try it
Copied from PLAN, corrected to reality (actual paths, actual commands). This is what iterate mode shows the user.

## Needs human check
Things no command can verify: visual, UX, sound. One bullet each. Feeds iterate mode.

## Deviations
"None" or bullets.

## Deferred
Out-of-scope defects found. Orchestrator copies these to STATE.md.

## Iterations
(empty until approve; approve appends the NN-ITERATIONS.md log here)
```

### `NN-ITERATIONS.md` — one per phase, created when iterate mode starts

```markdown
---
phase: 02
status: open | approved
started: 2026-09-09T14:02
approved: 
---
# Iterations — Phase 02

- 14:05 — Slider knob too small at 100% zoom → set min 44px, scaled with parent [ui/src/knob.css]
- 14:11 — Gain default should be -6 dB not 0 → changed APVTS default [Source/PluginProcessor.cpp]
- 14:12 — DECISION: all knobs use the same scaling rule going forward
```

Format of each line: `HH:MM — <what the user wanted> → <what was done> [files]`. Lines beginning
`DECISION:` get copied to STATE.md decisions on approve. Written only through `gsdf iter log`. Lives at `phases/NN-slug/NN-ITERATIONS.md`.

### STATE.md — gsdf-native form (only for projects gsdf created; existing ones keep their format, §4a)

```markdown
---
milestone: v1.0
phase: 02
status: iterating      # planning | executing | iterating | idle
updated: 2026-09-09
---
# State

## Position
Phase 02 (gain-stage) — executed, iterating. 3 changes logged. Next: say "approved" or keep iterating.

## Decisions
- 2026-09-09 — Knob min size 44px, scaled with parent (from phase 02 iteration)

## Blockers

## Deferred
- 02-01: pluginval strictness 10 warns on parameter automation; investigate in phase 04
```

`## Position` is rewritten by every command. Other sections append-only. On a pre-existing project
the equivalent headings from that GSD are used instead (§4a) — never add a second set.

---

## 7. Iterate mode and approve — the core of this system

### Entering

`/gsdf:execute N` ends by:
1. Printing `gsdf tryit N` — build/launch/open instructions and the "Needs human check" list.
2. If `config.ui_dir` exists and the phase touched it, offering to run `verify.ui_dev` in the
   background so the UI is open in the browser.
3. `gsdf state set status iterating`, creating `NN-ITERATIONS.md`, and saying, in one line:
   *"Iterate mode. Tell me what to change. Say **approved** when it's right, or `/gsdf:approve`."*

`/gsdf:iterate [N]` re-enters this state explicitly — used after `/clear` or a new session. It
prints `gsdf tryit N` and `gsdf iter list N` so the full change history is back in context.

### Behaviour while iterating

- The main session edits files **directly**. No plan, no spawn, no quick task. This is the
  behaviour the user had with the original GSD in-chat and is the whole point.
- After each change the orchestrator: runs the smallest relevant verify command from config
  (UI change → `verify.ui`; DSP change → `verify.build`; skip if the change is CSS-only and the
  dev server hot-reloads), tells the user in one line what it did and how to see it, and asks
  nothing unless the request was ambiguous.
- When the user confirms a change is right (or moves on to the next request without objecting —
  treat that as acceptance), call `gsdf iter log N "<line>"`. One line, the format in §6.
- If the user states something that sounds like a rule ("always", "from now on", "all X should"),
  log it with the `DECISION:` prefix.
- **No commits during iterate.** Working tree accumulates. (User's choice — single commit on approve.)
- Every 10 logged iterations, print one line: *"10 changes logged. Safe to `/clear` and
  `/gsdf:iterate N` if the session feels slow."* Nothing else changes.
- If the user asks for something that is clearly a new feature rather than a fix to this phase's
  deliverables, say so in one sentence and offer `/gsdf:quick` or "log it as deferred" — do not
  silently expand scope.

### Approve

Triggered by the user saying "approved" / "approve" / "looks good, done" in iterate mode, or by
`/gsdf:approve [N]`. `effort: low`. Steps:
1. Run `verify.build` and `verify.test` once (and `verify.ui` if the phase touched the UI). If
   something fails, say so and stay in iterate mode.
2. `git add -A && git commit -m "feat(NN): approve phase NN — <k> iterations"` (only if the tree
   is dirty).
3. Append `gsdf iter list N` to every SUMMARY.md in the phase under `## Iterations`.
4. Copy `DECISION:` lines to STATE.md via `gsdf state note`.
5. Set `NN-ITERATIONS.md` `status: approved`, `gsdf phase advance`, `gsdf state set status idle`.
6. Print: commit hash, iteration count, next phase name, and the one-liner
   *"Next: `/gsdf:discuss N+1` or `/gsdf:plan N+1`."*

Nothing else. No UAT file, no audit, no verifier spawn.

---

## 8. Commands and agents — behavioural spec

Command files: YAML frontmatter with `description:` (≤ 70 chars — it's loaded on every turn) and
`effort:` where noted. Use `$ARGUMENTS` for the phase number. Each file < 120 lines.

### `/gsdf:new-project [--auto @file.md]`
- If `.planning/` exists: run `gsdf adopt`, print its output, and stop — "this project is already
  set up; continue with `/gsdf:progress --next`". Never re-initialize.
- Inline repo scan: tree (depth 3), CMakeLists.txt, `ui/package.json`, README. Write findings to
  PROJECT.md `## Existing codebase` and fill `config.json`.
- Ask up to 6 questions with options (goal, users, must-haves, constraints, out-of-scope,
  anything unclear from the scan). `--auto` extracts from the file and asks nothing.
- Spawn **one** `gsdf-planner` in mode `roadmap`. Present ROADMAP, one approval question, done.

### `/gsdf:discuss [N]`
- Inline. Read `gsdf context N` (without section 5). Identify 2–4 gray areas relevant to the
  phase type (UI → layout, interaction, states; DSP → parameter ranges, defaults, quality vs CPU;
  infra → format, error handling). For each, ask **one** question via `AskUserQuestion` with 2–4
  concrete options plus the implicit "other — type your own". Max 8 questions total.
- Write `NN-CONTEXT.md` (GSD-native name): decisions made, options rejected and why, open questions the planner should
  decide. `gsdf state note` for anything that sounds durable.

### `/gsdf:plan [N] [--auto] [--research | --skip-research]`
- N defaults to current. Pass `gsdf context N` verbatim to **one** `gsdf-planner` in mode `phase`.
- On return, `gsdf plans N`: confirm files exist, `estimated_tokens < 120000`, every task has
  `<fails_when>`. If not, re-spawn once with "split / fix" instruction. Max one retry.
- Print plan count and `gsdf waves N`. Without `--auto`, one confirmation question.

### `/gsdf:execute [N] [--wave W]`
- `gsdf waves N`. Per wave: one `gsdf-executor` per plan, **all in one message** (parallel).
  Wait. Read each SUMMARY's `status`. If any `blocked`, stop and report.
- After all waves: `gsdf state defer` for every Deferred bullet. Then enter iterate mode (§7).
- Executor return values are the `## Delivered` blocks only — the orchestrator never reads full
  SUMMARYs into context; it uses `gsdf tryit`.

### `/gsdf:iterate [N]`  — §7.
### `/gsdf:approve [N]`  — §7. `effort: low`.

### `/gsdf:quick "<task>" [--plan-first]`
- For work **outside** the current phase. `gsdf quick new <slug>`. Orchestrator writes a
  one-plan PLAN.md inline. One `gsdf-executor` spawn. Executor commits per task as usual. Report
  the Delivered block. Zero questions.
- `--plan-first` spawns the planner instead of writing the plan inline.

### `/gsdf:progress [--next]`
- `effort: low`. Print `gsdf state`, `gsdf phase list`, `gsdf next`. `--next` runs it.
- `milestone-done`: offer to archive `phases/` → `milestones/vX/`, tag, and run the new-project
  questions for the next milestone. Inline.

### `/gsdf:pause [N]`
- `effort: low`. Writes a handoff to `<phase dir>/.continue-here.md`, or `.planning/continue-here.md`
  when there is no phase — the two paths `gsdf context` reads (§5), so it is GSD-compatible both ways.
- Uncommitted-file list is copied from `git status --porcelain`, capped at 50, never rounded to empty.
- Writes through `gsdf state position` and `gsdf state set status paused`. Commits nothing but the
  handoff itself, and skips that too when `commit_docs` is false or `.planning/` is gitignored.
- Zero spawns.

### `/gsdf:resume [N]`
- `effort: low`. Reads the handoff in full (the only file it opens directly — `gsdf context`
  caps it at 40 lines, which can clip the next action), re-measures `git status --porcelain`.
- Routes on `gsdf next`, never on the handoff: same mapping as `/gsdf:progress`, and a blocked
  phase is never routed into iterate mode.
- Consumes the handoff — deletes it once restored, so no later `gsdf context N` carries a stale
  session. Zero spawns, zero code commits.

### `/gsdf:help`
- `effort: low`. One screen: the loop diagram, 11 commands one line each, "say approved".

### Agent `gsdf-planner.md`
Frontmatter: `name: gsdf-planner`, one-line `description`, `tools: Read, Grep, Glob, Bash, Write, WebSearch, WebFetch`. **No `model:`.** < 120 lines.

Mode `roadmap`: input PROJECT.md + config. Output REQUIREMENTS.md (v1 / v2 / out-of-scope with
REQ-NN ids) and ROADMAP.md (`config.phases_per_milestone` phases, each with goal paragraph, REQ
ids, and a `type:` of `ui | dsp | infra | mixed` — discuss and execute use this).

Mode `phase`: input is `gsdf context N` output. In one context:
1. Read the files in scope. If the phase needs a dependency not already in the repo (grep
   CMakeLists / package.json), do focused web research for it; otherwise none. Honor flags.
2. Decompose into 1–4 plans, fewer preferred, each < 120k executor tokens. Two plans in the same
   wave never touch the same file.
3. Write PLAN.md files per §6, using config `verify` commands, every `<verify>` with `<fails_when>`,
   a concrete `## Try it`.
4. **Self-check**: every REQ id covered; no file overlap within a wave; every verify runnable
   from repo root; `estimated_tokens` honest. Fix in place.
5. Return 5 lines: plans, waves, biggest risk, what the user will be able to try.

### Agent `gsdf-executor.md`
Frontmatter: `name: gsdf-executor`, one-line `description`, `tools: Read, Edit, Write, Bash, Grep, Glob`. **No `model:`.** < 60 lines.

Input: absolute path to one PLAN.md. Steps:
1. Read PLAN.md and the files it names. Nothing else unless a task requires it.
2. Per task: implement → run `<verify>` → judge against `<fails_when>` → on pass, `git add`
   named files, `git commit -m "<type>(NN-MM): <task name>"`. On fail, fix and retry ≤ 2; then
   mark blocked in SUMMARY and stop.
3. Check Must-haves. Write SUMMARY.md per §6 with a corrected `## Try it`. Commit as
   `docs(NN-MM): complete plan`.
4. Return the `## Delivered` block only.

Rules in the prompt: never substitute a differently-named package; never touch files outside
`<files>` without listing it in Deviations; never skip a `<verify>`; never ask questions.

---

## 9. Install, CLAUDE.md block, permissions

`install.sh <target-dir>`:
- Copies `.claude/commands/gsdf/`, `.claude/agents/gsdf-*.md`, `.claude/skills/gsdf-templates/`
  into the target's `.claude/`; copies `bin/gsdf` to `.claude/bin/gsdf`, `chmod +x`.
- Appends `CLAUDE.gsdf.md` to the target's `CLAUDE.md` between `<!-- gsdf:start -->` /
  `<!-- gsdf:end -->` markers (replace if present). Content, ~15 lines: where `.planning/` is, that
  `.claude/bin/gsdf` is the state tool, that iterate mode edits inline and logs via `gsdf iter
  log`, that "approved" triggers approve, commit format. This is what lets every agent and the
  main session skip re-reading framework prose — it's loaded once per session automatically.
- If the target has `.planning/`, runs `.claude/bin/gsdf adopt` and prints the result.
- Merges the allow-list below into `.claude/settings.json` (use python3 for JSON merge; never
  overwrite user entries).
- Prints: "Restart Claude Code, run `/gsdf:help`. Recommended: `claude --dangerously-skip-permissions`."

Allow-list:
```json
{ "permissions": { "allow": [
  "Bash(.claude/bin/gsdf:*)",
  "Bash(git add:*)", "Bash(git commit:*)", "Bash(git status:*)", "Bash(git log:*)", "Bash(git diff:*)", "Bash(git tag:*)",
  "Bash(cmake:*)", "Bash(ctest:*)", "Bash(pluginval:*)",
  "Bash(npm test:*)", "Bash(npm run:*)", "Bash(npx:*)"
]}}
```

Commands reference the CLI as `.claude/bin/gsdf` (project-relative). Never `~`.

---

## 10. Speed and token rules — verify each before finishing

- [ ] Spawns per phase = 1 + plans. `grep -c "Agent\|subagent" ` across commands confirms only
      `new-project`, `plan`, `execute`, `quick` spawn anything.
- [ ] No `model:` in agents. No `effort: max` anywhere.
- [ ] Sum of all 9 `description:` lines < 550 characters.
- [ ] `gsdf-executor.md` < 60 lines; `gsdf-planner.md` < 120; each command < 120.
- [ ] `gsdf context N` on the fixture < 2,500 tokens (measure with `wc -w` × 1.3).
- [ ] Orchestrators never read SUMMARY.md, PLAN.md, or STATE.md directly — only via `gsdf`.
- [ ] Executor returns only `## Delivered`; planner returns 5 lines.
- [ ] `quick` = exactly one spawn, zero questions.
- [ ] Iterate mode = zero spawns, zero plan files; one `gsdf iter log` call per accepted change.
- [ ] Zero hooks in settings.json.
- [ ] Every `bin/gsdf` call < 100 ms.
- [ ] Both §4a fixtures pass; `git diff` empty after every read subcommand; `adopt` idempotent.
- [ ] `grep -rn "PLAN.md\|SUMMARY.md\|CONTEXT.md" .claude/` shows only GSD-native prefixed names
      (or the unprefixed quick/ form) — no `phases/NN-slug/PLAN.md` anywhere.

---

## 11. Build order

1. Clone and study (§1). Keep a temporary `NOTES.md` of borrowed prompt passages.
2. Build the two §4a fixtures from the real templates in `/tmp/gsd-src` **first**, then
   `bin/gsdf` + `tests/test_cli.sh` green against all fixtures.
3. Templates (§6), including ITERATIONS.template.md.
4. `gsdf-executor.md`, then `gsdf-planner.md`.
5. Commands in order: `progress`, `help`, `approve`, `iterate`, `quick`, `plan`, `execute`,
   `new-project`, `discuss`.
6. `CLAUDE.gsdf.md`, `install.sh`, `settings.json`, `README.md`, `NOTICE.md`, `LICENSE`.
7. Acceptance test (§12). Fix and re-run until it passes without hand-edits.
8. Delete `NOTES.md`; `rm -rf /tmp/gsd-src`.

Commit after each step, conventional-commit messages.

---

## 12. Acceptance test — actually run it, do not simulate

Scaffold a minimal JUCE-shaped project (no real JUCE build needed — a CMake project with a
`ctest` that passes, plus `ui/` with `package.json` whose `test` and `dev` scripts are trivial):

```bash
mkdir /tmp/gsdf-dogfood && cd /tmp/gsdf-dogfood && git init
# CMakeLists.txt with project(TestPlug), one C++ target, one ctest that passes
# ui/package.json with "test": "echo ok" and "dev": "python3 -m http.server 5173"
# ui/index.html with a single slider
/path/to/gsdf/install.sh .
```

**Step 0 — existing-project test, do this first.** Copy `tests/fixtures/original-midphase/` and
`tests/fixtures/core-midphase/` each into a scratch git repo with a trivial buildable CMake project,
run `install.sh .`, then in Claude Code run `/gsdf:progress`. It must show the right phase and
status with no questions. Run `--next`: on the original fixture it must execute plan 02-02 and
land in iterate mode; on the core fixture it must enter iterate mode on phase 02 with the
continue-here.md content visible. Say "approved" in each; confirm the ROADMAP status marker
flipped in its original format and no pre-existing file was renamed or deleted (`git status`
shows only additions and the expected modifications).

Then the fresh-project loop:

1. `/gsdf:new-project --auto @spec.md` (spec: "gain plugin with a webview UI: one gain knob,
   dB readout, bypass button") → PROJECT.md, REQUIREMENTS.md with REQ ids, ROADMAP.md with ≤ 4
   phases each with `type:`, STATE.md, config.json with detected verify commands. One spawn.
2. `/gsdf:discuss 1` → ≤ 8 questions, each with options; `01-CONTEXT.md` written. Zero spawns.
3. `/gsdf:plan 1 --auto` → PLAN.md files, every task has `<fails_when>`, `## Try it` is
   concrete. One spawn.
4. `/gsdf:execute 1` → executors in parallel if > 1 plan; one commit per task in `git log`;
   ends by printing Try-it and entering iterate mode with `01-ITERATIONS.md` created.
5. In iterate mode, ask for two changes ("make the knob bigger", "default gain -6 dB"). Confirm:
   edits made inline, zero spawns, `gsdf iter list 1` shows two lines, no new commits yet.
6. Say "approved" → verify runs, one commit `feat(01): approve phase 01 — 2 iterations`,
   SUMMARY has `## Iterations`, STATE.md phase is now 02, status idle.
7. `/clear`, then `/gsdf:progress` → correct position from STATE alone; `--next` runs `plan 2`.
8. Run `/gsdf:execute 2`, make one iteration, `/clear`, `/gsdf:iterate 2` → the earlier
   iteration line is shown, and iterating continues.
9. `/gsdf:quick "add a version string to the plugin description"` → one spawn, zero questions,
   one commit, lives in `.planning/quick/001-…/`.
10. `time` steps 3–4. Put the number in README.md under Benchmark. If gsd-core can be installed in
    the same scratch repo, run its plan+execute on phase 1 and record that too; otherwise say so.

---

## 13. Report when done

File tree; line counts of both agents and all eleven commands; the description-character total;
`gsdf context 1` token estimate; benchmark numbers; every deviation from this spec with one
sentence of reason. Then stop.
