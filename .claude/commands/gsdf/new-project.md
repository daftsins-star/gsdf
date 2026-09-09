---
description: Scaffold .planning/ — brief, requirements, roadmap
argument-hint: "[--auto @file.md]"
allowed-tools: [Bash, Read, Write, Glob, Grep, Task, AskUserQuestion]
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

**3. Ask, at most 6 questions**, each through `AskUserQuestion` with 2–4 concrete options:
goal, users, must-haves, constraints, out-of-scope, plus anything the scan left genuinely
unclear. Options should be real alternatives, not "yes / no / maybe".

With `--auto @file.md`: read the file, extract all six, **ask nothing**. State what you inferred
in PROJECT.md rather than checking it.

**4. Write it.**

```bash
.claude/bin/gsdf init "<Project Name>"      # PROJECT.md, ROADMAP.md, STATE.md, config.json
```

Then fill PROJECT.md from the answers, and put the scan findings under `## Existing codebase`.
Check `config.json`: `gsdf init` detects the CMake project name, the UI directory and its npm
scripts, and whether `pluginval` is on PATH. Anything still a `<placeholder>` — ask now, in the
same batch as step 3 if you can.

**5. Spawn one `gsdf-planner`** in mode `roadmap`. It writes REQUIREMENTS.md and ROADMAP.md.

**6. Present the roadmap** — phase names, goals, REQ coverage — and ask **one** question:
accept, or say what to change. On a change, re-spawn the planner once with the correction.

Then: `Next: /gsdf:discuss 1` (optional) `or /gsdf:plan 1`.

</process>

<success_criteria>
- Exactly one subagent (two if the roadmap was revised once).
- Six questions maximum, zero with `--auto`.
- Every v1 REQ id appears in exactly one phase, and every phase has a `**Type**:`.
- An existing `.planning/` was adopted, never overwritten.
</success_criteria>
