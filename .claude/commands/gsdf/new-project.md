---
description: Scaffold .planning/ — brief, requirements, roadmap
argument-hint: "[--auto @file.md]"
allowed-tools: [Bash, Read, Write, Glob, Grep, Task, Agent, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Arguments: `$ARGUMENTS`

<objective>
Turn an idea (or an existing repo) into PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md and
config.json. One subagent, at most six questions.
</objective>

<process>

**1. Already set up?** If `.planning/` exists:

```bash
.claude/bin/gsdf adopt
```

Print its output and **stop**: "This project is already set up — continue with
`/gsdf:progress --next`." Never re-initialise. That directory may hold months of work from
get-shit-done or gsd-core, and GSDF's job is to pick it up, not replace it.

**Exception — a milestone rollover.** If `.planning/` exists but `.planning/phases/` is empty
(`/gsdf:progress --next` just archived it), don't stop. Skip `gsdf init` at step 4, leave
PROJECT.md's history alone, and go straight to steps 3 and 5 to roadmap the new milestone.

**2. Scan the repo inline** — no subagent, this is five commands:

```bash
ls -d */ 2>/dev/null | head -20
find . -maxdepth 3 -name CMakeLists.txt -not -path '*/build/*' | head
cat CMakeLists.txt 2>/dev/null | head -40
cat ui/package.json 2>/dev/null
head -40 README.md 2>/dev/null
```

What you're after: build system and target names, whether there's a UI directory, how tests run,
what already exists. Nothing more — this is not a code review.

**3. Ask how GSDF should work here** — one `AskUserQuestion` call, two questions, first options
recommended:
- *"Should I work on my own?"* — **Yes (Recommended):** you answer the questions and pick a
  mockup, I build the rest and hand you something finished to try. **No:** I stop after every
  phase for your review.
- *"How should I talk to you?"* — **Plain words (Recommended):** no technical questions; I decide
  those. **Technical:** ask me about the implementation too.

Write them (`gsdf cfg auto on|off`, `gsdf cfg plain_language on|off`) right after step 4's
`gsdf init`. They can be changed any time with `/gsdf:cfg`.

**Then ask, at most 6 questions**, each through `AskUserQuestion` with 2–4 concrete options:
goal, users, must-haves, constraints, out-of-scope, plus anything the scan left genuinely
unclear. Options should be real alternatives, not "yes / no / maybe". With plain words on, ask
about what the user will see, hear and do — never about libraries, formats or architecture.

With `--auto @file.md`: read the file, extract all six, **ask nothing** — the two setup answers
take their recommended values unless the file says otherwise. State what you inferred
in PROJECT.md rather than checking it.

**4. Write it.**

```bash
.claude/bin/gsdf init "<Project Name>"      # PROJECT.md, ROADMAP.md, STATE.md, config.json
```

Then fill PROJECT.md from the answers, and put the scan findings under `## Existing codebase`.
Check `config.json`: `gsdf init` detects the CMake project name, the UI directory and its npm
scripts, and whether `pluginval` is on PATH. Anything still a `<placeholder>` — ask now, in the
same batch as step 3 if you can.

**5. Spawn one `gsdf-planner`** in mode `roadmap`. It writes REQUIREMENTS.md and ROADMAP.md —
at most `phases_per_milestone` phases, and a mockup phase first when the project has a UI.

**6. Present the roadmap** — phase names, goals, REQ coverage — and ask **one** question:
accept, or say what to change. On a change, re-spawn the planner once with the correction.

**Commit the planning artifacts.** Both GSDs version `.planning/` as they go, and a plan that
only exists in the working tree is one `git clean` from gone. Unless `config.commit_docs` is
`false` or `.planning/` is gitignored (`git check-ignore -q .planning`):

```bash
git add -N .planning/ && git commit --only .planning/ -m "docs(planning): initialise project"
```

`--only`, not `git add -A` — an executor may be committing in the same repo.

**7. Choose what to discuss.** One `AskUserQuestion`, multiSelect: *"Which phases do you want a
say in? The rest I'll decide myself."* — one option per phase, by name and goal. Run
`discuss.md` for each one picked, in order, in this session.

Then, with `auto` on: run `/gsdf:auto` — it builds the mockups and stops there for the user to
choose. With `auto` off: `Next: /gsdf:plan 1`.

</process>

<success_criteria>
- Exactly one subagent (two if the roadmap was revised once).
- Two setup questions plus six maximum, zero with `--auto`.
- Every v1 REQ id appears in exactly one phase, and every phase has a `**Type**:`.
- An existing `.planning/` was adopted, never overwritten.
</success_criteria>
