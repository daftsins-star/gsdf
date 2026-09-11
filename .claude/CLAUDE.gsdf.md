## GSDF

Planning state lives in `.planning/` — the same layout get-shit-done and gsd-core use.
Read it with the CLI, not by opening files: `gsdf` on PATH, or `.claude/bin/gsdf` if PATH
has none. Prefer PATH — a project-local copy can be older. `gsdf --version` prints which.
`gsdf next` / `state` / `phase list` / `context N` / `tryit N` answer where things stand;
they never write. The filesystem is the source of truth — STATE.md and ROADMAP.md are for
humans and are read tolerantly.

After `/gsdf:execute`, the session is in **iterate mode**: edit files directly, no plans and
no subagents, run the smallest verify from `config.json` that proves the change, and log each
accepted change with `gsdf iter log N "<want> → <did> [files]"`. Rules the user states
("always…", "from now on…") get logged with a `DECISION:` prefix. No commits during iterate.

**"approved" ends it** — that runs `/gsdf:approve`: verify, one commit
`feat(NN): approve phase NN — <k> iterations`, then advance. Per-task commits during execute
are `type(NN-MM): task name`.

**At approve, write `NN-FINDINGS.md`** in the phase dir for anything durable the phase taught,
then `lb-promote.py <that file>` if it is installed. Judge at write time: you knew when you
logged the iteration whether it was a reusable lesson or a one-off fix, and that judgement is
free now and expensive later. A finding is true on a different project — the misconception that
let a bug survive review, not the bug. Project history is never one. Each `##` section is one
note with `cluster:`, `symptoms:` and optional `see:`; write `symptoms:` in the words used
*before* the cause was known. Most phases yield one or two. **None is a normal answer.**
