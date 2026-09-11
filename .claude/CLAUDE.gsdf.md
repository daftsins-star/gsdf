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

**At approve, write `NN-FINDINGS.md`** for what the phase taught — captured during the
work as `gsdf iter log N "FINDING: …"`, collated by `gsdf findings N`. See `approve.md`.
