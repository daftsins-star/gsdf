---
description: The GSDF loop and its 13 commands
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
  /gsdf:pause [N]       Write a handoff and stop. Resume in a fresh session. 0 spawns.
  /gsdf:resume [N]      Restore a paused session from its handoff.           0 spawns.
  /gsdf:auto ["<ask>"]  Build on its own: the rest of the roadmap, or one    1 per phase
                        request — a big change or new phases. Stops only     + 1 per plan.
                        at the mockups or on a failure it can't fix.
  /gsdf:cfg [k v]       How GSDF behaves here: auto, plain language, phase   0 spawns.
                        count, UI first, UI style, rebuild command.
  /gsdf:help            This.

  The CLI, read-only unless it says otherwise:
  gsdf next / state / phase list Where things stand.
  gsdf cfg [<k> <v>]             The settings; with a value, change one.
  gsdf rebuild                   Build and install, so "try it" never means "build it first".
  gsdf verify N                  Run the phase's checks. Exit 2 = nothing configured,
                                 so an unverified phase can't be reported as passing.
  gsdf findings N                What the phase captured as reusable.
  gsdf params [--write]          Parameter ABI guard: removal, reorder, id reuse.
                                 Advisory until `abi_frozen: true` in config.json.
                                 Reads only; --write locks.
  gsdf update [--check]          Compare this install against GitHub's newest release
                                 and reinstall when behind. --check writes nothing.
  gsdf bug "<one line>"          Record a GSDF bug you just hit, then carry on.
  gsdf bugs [--fixed <id>]       Open reports with ids; --fixed retires one.
  gsdf <command> --help          Usage for one command.
  gsdf trace on|off|show         Record a real phase's call sequence and check it
                                 against the process the commands describe.

Iterate mode is where the time goes, and it costs nothing. After execute, just say what you
want changed — "knob's too small", "default should be -6 dB" — and it gets edited inline,
rebuilt, and you're told what to try. Say "approved" when it's right.

Auto mode (`/gsdf:cfg auto on`, asked at new-project): you answer a few questions and pick a
mockup; GSDF builds every other phase on its own and hands over one finished thing to try.

UI with no named style uses the GSDF Style Guide by Daftsins (the `gsdf-style` skill).

State lives in .planning/ and is read with `.claude/bin/gsdf` (or `gsdf` on PATH).
GSDF reads and writes the same .planning/ layout as get-shit-done and gsd-core.
```
