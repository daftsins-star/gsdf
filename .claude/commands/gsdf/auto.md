---
description: Build on its own — the rest of the roadmap, or one request
argument-hint: "[\"<request>\"]"
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Task, Agent, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Arguments: `$ARGUMENTS`

<objective>
Do the work without stopping to ask, and hand the user one finished, rebuilt, installed thing to
try. The user typing this command is the go-ahead for everything below; it does not need
`gsdf cfg auto` to be on. The normal commands still do the work — this one strings them together
and removes the pauses between them.
</objective>

<process>

**With a request** (`/gsdf:auto "add a preset browser"`), first decide in one sentence which kind
it is, and say which:

- **A correction or extension of the phase in iterate mode** — do all of it now, under
  `iterate.md`'s rules: edit inline, log each change with `gsdf iter log`, ask nothing that has
  an obvious reading. Then `gsdf rebuild`, then the handoff below. Stay in iterate mode.
- **New capability.** If a phase is in iterate mode, approve it first by following `approve.md`
  — asking for new work is the user moving on. Then spawn one `gsdf-planner` in mode `extend`
  with the request verbatim. It appends the phase(s) to the roadmap. Print each new phase in one
  line, ask nothing, and run the loop.

**With no request:** if a phase is in iterate mode, the user is saying "carry on" — approve it by
following `approve.md`, then run the loop.

**The loop.** Repeat `gsdf next` and act on what it says:

| `gsdf next` | do |
|---|---|
| `plan NN` | spawn one `gsdf-planner` in mode `phase`, as `plan.md` does, minus its question. `gsdf lint N` must pass; if not, re-spawn once with the lint output; failing twice is a stop. |
| `execute NN` | `execute.md` steps 1–3: waves, one executor per plan, a blocked plan is a stop. |
| — then, a **mockup phase** (`**Mockups**: yes` in its roadmap entry) | **This is the one planned stop.** Open the mockups for the user (`execute.md` steps 4–6), say "Pick one and tell me what to change. Say **approved** and I'll build the rest on my own." End the turn. |
| — then, **another phase is still to come** | `gsdf verify N`. On a failure, read its output, fix inline, run it again — twice at most; still failing is a stop. On a pass, follow `approve.md` steps 1–7 with no questions (exit 2, nothing configured, carries on and the handoff says "not verified"); the commit is `feat(NN): approve phase NN — built on its own`. One line: "Phase NN built and checked — <goal>." Loop. |
| — then, **the last phase** | verify with the same fix rule, then `execute.md` step 4's bookkeeping, then the handoff. Do not approve it — that is the user's call after trying it. |
| `milestone-done` | the handoff, if this run built anything. |
| `new-project` | stop: "Start with `/gsdf:new-project`." |

**Stops.** Only the mockups, a check that two fixes did not cure, a blocked plan, and the gates
inside `approve.md` (build output about to be committed, a parameter ABI break). At a stop: what
happened in one sentence, the choices, and the phase stays in iterate mode so nothing is lost.

**Context.** Several phases run in this one session, so never read SUMMARY files — `gsdf tryit`
exists for that. After any approved phase the loop is safe to resume from scratch: `/clear`, then
`/gsdf:auto` again picks up from `gsdf next`.

**The handoff.** `gsdf rebuild` first — the user never gets a "run this first" step. If it
fails, that is a stop, not a handoff. Then, built from `gsdf tryit` for every phase this run touched:

```
Built <phases>. Rebuilt and installed — <where to find it: the DAW, the app, the URL>.
What to try:
- <one action and what should happen, per thing that changed>
Needs your eyes/ears:
- <the Needs-human-check items, merged>
Tell me what to change, or say **approved**.
```

Then you are in iterate mode, under `iterate.md`.

</process>

<success_criteria>
- No question asked during the loop; the only planned stop is the mockups.
- Every phase before the last was verified and approved with one commit each.
- The handoff came after a successful `gsdf rebuild`, never before it.
- One planner per phase, one executor per plan — the same budget as running them by hand.
</success_criteria>
