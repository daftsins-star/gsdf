---
description: Where the project is, and run the next step
argument-hint: "[--next]"
effort: low
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Arguments: `$ARGUMENTS`

<objective>
Restore position and route. This is the command to run after `/clear`, or after a week away.
</objective>

<process>

**1. Report.** Run all three and show them:

```bash
.claude/bin/gsdf state
.claude/bin/gsdf phase list
.claude/bin/gsdf next
```

If `gsdf next` says `new-project`, stop and say: "No `.planning/` here — run `/gsdf:new-project`."

Do not read STATE.md, ROADMAP.md or any SUMMARY yourself. The CLI is the state interface;
reading those files directly is how a session's context gets eaten before any work starts.

**2. Route.** Without `--next`, print the one command that comes next and stop:

| `gsdf next` | Say |
|---|---|
| `plan NN` | ``Next: `/gsdf:discuss NN` (optional) then `/gsdf:plan NN`.`` |
| `execute NN` | ``Next: `/gsdf:execute NN`.`` |
| `iterate NN` | ``Phase NN is executed and waiting on you. `/gsdf:iterate NN`.`` |
| `blocked NN` | Name the blocked plan and its task from `gsdf plans NN`, then: ``Phase NN is blocked — plan NN-MM stopped. A blocked plan usually means the plan was wrong: `/gsdf:plan NN` to re-plan it.`` Never route a blocked phase into iterate mode. |
| `milestone-done` | ``Every phase is complete. Run `/gsdf:progress --next` to close the milestone.`` |

**3. With `--next`, run it** — invoke the matching command's behaviour directly, in this session.

For `milestone-done`, close it out inline — **this command spawns nothing**:
1. Ask (one `AskUserQuestion`) whether to close the milestone now.
2. `git tag` the milestone name from STATE.md frontmatter, if the tree is clean.
3. `mkdir -p .planning/milestones/<milestone>` and `git mv .planning/phases/* .planning/milestones/<milestone>/`.
   Move, never delete. Everything under `.planning/` that GSDF didn't create stays where it is.
4. Ask what the next milestone is for (goal, must-haves, out-of-scope — at most 4 questions),
   append the answers to PROJECT.md, then
   `gsdf state set milestone <next>` and `gsdf state set phase 01`.
5. Say: ``Milestone <prev> archived. Next: `/gsdf:new-project` to roadmap <next>.`` That command
   owns roadmap generation — it sees the empty `phases/` and picks up from your answers.

</process>

<success_criteria>
- The user knows where they are without having read a file themselves.
- Exactly one next command was named.
- Zero subagents spawned, unless a milestone was closed and a new roadmap was needed.
</success_criteria>
