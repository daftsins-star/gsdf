---
description: Update GSDF to the newest release
effort: low
allowed-tools: [Bash]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Arguments: `$ARGUMENTS`

<objective>
Install the newest GSDF release, the way it was installed before. This is what the status line's
`⬆ /gsdf:update` points at. No questions — typing the command is the go-ahead.
</objective>

<process>

Run `gsdf update` (pass `--main` or `--force` only if the user typed them). It compares this
install with GitHub's newest release, and when it is behind it reinstalls from that release.

Report in two lines at most:
- **Updated** — "GSDF <old> → <new>. Restart Claude Code to load the new commands." Then name
  anything new from the release in one line if `gsdf update` printed it.
- **Already current** — "GSDF <version> is the newest release."
- **Refused** (a GSDF checkout with local work) or **failed** (no network) — say why in one line,
  in plain words, and what would fix it. Never pass `--force` on your own.

</process>

<success_criteria>
- One `gsdf update` call, zero subagents, zero questions.
- The user knows whether to restart, and nothing else.
</success_criteria>
