# Using GSDF to work on GSDF

GSDF can plan and execute its own changes. It is worth doing — every bug in the list below was
found by running GSDF rather than reading it — but self-hosting has one trap that no other
project has, and you need to know it before you start.

## The trap: you are editing the tool that is running

`/gsdf:*` commands are loaded from `~/.claude/commands/gsdf/` (global install), **not** from this
repo. Editing `.claude/commands/gsdf/plan.md` here changes nothing in your session until you
reinstall. Worse, a user-level command *shadows* a project-level one, so a project install of
GSDF inside the GSDF repo will be silently ignored.

So the loop is:

```bash
# edit .claude/commands/gsdf/*.md, .claude/agents/*.md, or bin/gsdf
bash tests/test_cli.sh && bash tests/test_conformance.sh   # must be green first
./install.sh --global                                       # NOW the change is live
gsdf --version                                              # confirms which binary is running
```

**Forgetting the reinstall is the single most likely way to waste an hour here.** You will change
a command, watch the old behaviour, and conclude the change didn't work. `gsdf --version` prints
the resolved path — check it when something behaves like the version you just replaced.

The same applies to agents: `gsdf-planner.md` and `gsdf-executor.md` are read at *spawn* time, so
a subagent already running has the old definition. Finish the run, reinstall, then re-run.

### `gsdf update` is for users, not for you

`./install.sh --global` is the loop above. `gsdf update` does something different: it installs
**GitHub's** copy over your global install, which here means discarding the build you are
developing. It refuses to do that from a checkout with uncommitted changes or commits not on
`main`, and names both ways out — but the refusal is a guard, not a workflow. While working in
this repo, reinstall; never update.

It also reads and writes its receipt at the install it acts on (`~/.claude/bin/gsdf-install.json`),
not next to `bin/gsdf` — so running `./bin/gsdf update` from this checkout leaves no untracked
file behind, and the install it actually replaced is the one whose receipt gets stamped.

## Bootstrapping GSDF's own `.planning/`

This repo ships without one, deliberately — the tests must not depend on it.

```bash
cd /path/to/gsdf
gsdf init "GSDF"
```

Then set `config.json` to GSDF's real verify commands. There is no build step; the tests are
the whole gate:

```json
{
  "verify": {
    "build": "bash tests/test_cli.sh",
    "test":  "bash tests/test_conformance.sh",
    "ui":    "bash tests/test_cli.sh && bash tests/test_conformance.sh"
  },
  "phases_per_milestone": 4,
  "research": "auto"
}
```

Both suites run in seconds, so an executor can afford to run them on every task. That is the
point: a phase that breaks a budget or a behaviour fails at the task that broke it, not three
tasks later.

## What a phase looks like here

Good GSDF phases are behavioural, not structural. "Add a `gsdf doctor` subcommand that reports
version skew and stale installs" is a phase. "Refactor the CLI" is not — there is no observable
outcome to put in `## Try it`, and the executor has nothing to verify against.

Every plan touching `bin/gsdf` should carry a task that adds a test to `tests/test_cli.sh`, and
every plan touching a command or agent should add one to `tests/test_conformance.sh`. Write that
into the plan's `<action>`, because the executor will not infer it.

Watch the budgets — `test_conformance.sh` enforces them and will fail the task that breaks one:

| | Limit |
|---|---|
| `gsdf-executor.md` | 60 lines |
| `gsdf-planner.md` | 120 lines |
| any command | 120 lines |
| all 11 descriptions | 550 characters total |
| `gsdf context N` | 2,500 tokens |
| any `gsdf` call | 100 ms |

The description budget is the one that bites: it is loaded on every turn of every session, so
adding a clause to a `description:` line costs you forever. Eleven descriptions currently total
498 characters — 52 left before the budget bites.

## Testing a change end to end

Unit tests will not catch the bugs that matter. The ones that did the damage — `approve` marking
the wrong phase complete, a blocked plan counting as finished, `approve` committing before it
finished writing — were all found by running the real loop and looking at git.

Scratch projects to run against:

```bash
tests/fixtures/original-midphase/   # a real original-GSD tree, mid-phase
tests/fixtures/core-midphase/       # a real gsd-core tree, executed but never UAT'd
```

Copy one into a scratch git repo, `install.sh` it, and drive it headlessly:

```bash
cd /tmp/scratch && claude -p "/gsdf:progress" --dangerously-skip-permissions < /dev/null
```

`< /dev/null` matters — without it the CLI waits for stdin and warns.

**Check git, not the narration.** After any run:

```bash
git log --format="%h %ad %s" --date=format:"%H:%M:%S"   # interleaving proves concurrency
git show --stat <sha>                                   # each commit must hold only its task's files
git status --porcelain                                  # approve must leave this empty
```

To exercise parallel execution you have to force it — the planner prefers one plan, correctly, so
a natural phase usually will not test it. Hand-write two plans with `depends_on: []` that touch
genuinely disjoint files, and confirm `gsdf conflicts N` exits 0 before running.

To exercise the blocked path, give a task a dependency that cannot exist and forbid substituting
it. The executor should refuse to improvise, write `status: blocked`, make no task commit, and
the orchestrator should halt the wave without entering iterate mode.

## Iterating on GSDF in iterate mode

This is where self-hosting is genuinely pleasant. After `/gsdf:execute`, you are in iterate mode
and can say "the lint message is too terse" and have it changed, verified and logged in under a
minute with no subagent. Two things to remember:

- **Reinstall before judging a command change.** Iterate mode edits this repo; your session is
  still running the installed copy.
- **`gsdf iter log` snapshots the tree** to `refs/gsdf/iter/NN/` on every logged change, so a bad
  edit is recoverable: `git for-each-ref refs/gsdf/` then `git stash apply <ref>`.

## Things that are deliberately the way they are

Do not "fix" these without a reason that survives the argument:

- **The CLI is over the 300-line target** (~440). The overage is spec §4a format tolerance —
  reading old UAT/VERIFICATION markers, `wave:` frontmatter, fuzzy STATE headings, three ROADMAP
  marker formats. §4a overrides the line budget; the constraint's real purpose (speed) is met at
  ~25 ms per call.
- **Executors commit with `git add -N` + `git commit --only`.** Never `git add -A`. Two executors
  share one git index; a bare commit sweeps up a peer's staged files. Proven: 61/61 concurrent
  commits clean, versus 2/60 with a naive commit.
- **Iterate mode makes no commits.** That is the user's choice, and the snapshots cover the risk.
- **`approve` commits last**, after folding the log in and advancing, so its own bookkeeping is
  inside its own commit.
- **Every `.planning/` write takes an flock.** An orchestrator fires independent Bash calls in
  parallel; six concurrent `state defer` calls landed three of six lines before this. The lock
  lives in the system temp dir keyed by path, so nothing is added to the repo.
- **`phase advance` takes an explicit N.** Defaulting to `current()` made approve mark the *next*
  phase complete, because the phase being approved was already complete by then.
