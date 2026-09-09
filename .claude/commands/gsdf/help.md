---
description: The GSDF loop and its 9 commands
effort: low
allowed-tools: [Bash]
---

Print this, and nothing else.

```
GSDF — Get Shit Done Fast

  /gsdf:discuss N  →  /gsdf:plan N  →  /gsdf:execute N  →  [iterate]  →  "approved"
     optional          1 subagent      1 per plan          inline        commit + advance

  /gsdf:new-project     Scaffold .planning/ — brief, requirements, roadmap.  1 spawn.
  /gsdf:discuss [N]     A few option-based questions. Writes NN-CONTEXT.md.  0 spawns.
  /gsdf:plan [N]        Decompose the phase into plans. --auto skips the ok. 1 spawn.
  /gsdf:execute [N]     Run the plans in waves, commit per task.             1 per plan.
  /gsdf:iterate [N]     Re-enter iterate mode after /clear.                  0 spawns.
  /gsdf:approve [N]     Verify, one commit, advance the phase.               0 spawns.
  /gsdf:quick "<task>"  One-off work outside the current phase.              1 spawn.
  /gsdf:progress        Where am I. --next runs the next step.               0 spawns.
  /gsdf:help            This.

Iterate mode is where the time goes, and it costs nothing. After execute, just say what you
want changed — "knob's too small", "default should be -6 dB" — and it gets edited inline, no
plan, no subagent. Say "approved" when it's right.

State lives in .planning/ and is read with `.claude/bin/gsdf` (or `gsdf` on PATH).
GSDF reads and writes the same .planning/ layout as get-shit-done and gsd-core.
```
