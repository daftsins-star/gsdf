---
description: See or change how GSDF behaves in this project
argument-hint: "[<setting> <value>]"
effort: low
allowed-tools: [Bash, AskUserQuestion]
---

CLI: `.claude/bin/gsdf` (or `gsdf` on PATH if that file is absent). Arguments: `$ARGUMENTS`

<objective>
Show this project's GSDF settings and change the ones the user wants. Inline, no subagent. The
CLI owns the list of settings and validates every value — never edit `config.json` by hand.
</objective>

<process>

**With a setting and a value** (`/gsdf:cfg auto on`): run `gsdf cfg <setting> <value>`, print its
one line, done.

**With nothing:** run `gsdf cfg` and show its table. Then one `AskUserQuestion`, multiSelect,
"Which do you want to change? (or type it, e.g. `phases 6`)", offering the four that matter most:

| Setting | What the user is choosing |
|---|---|
| `auto` | **On:** after the questions and the mockups, Claude builds every remaining phase on its own and hands over one finished thing to try. **Off:** it stops after every phase for review. |
| `plain_language` | **On:** questions and reports in everyday words, nothing technical asked — Claude decides those. |
| `phases_per_milestone` | How many phases a roadmap aims for. 4 is the default; bigger projects can say more. |
| `ui_first` | **On:** a project with a screen starts with a few UI mockups to choose from. |

Every setting defaults to on — auto included — so a project that never answered, or predates
these settings, runs in the full mode. `ui_style`, `research`, `commit_docs` and `rebuild` exist
too — mention them in one line, change them only if asked.

For each picked setting ask its value (2–4 options, current one marked), then
`gsdf cfg <setting> <value>`. `rebuild` must build **and install** — for a plugin, it ends with
the plugin in the folder the DAW scans.

**Then one line:** what changed, and when it takes effect — `auto` and `ui_first` from the next
`/gsdf:new-project` or `/gsdf:auto`; `plain_language` immediately.

</process>

<success_criteria>
- Every write went through `gsdf cfg`, which refuses a bad value.
- Zero subagents. At most one question per picked setting.
</success_criteria>
