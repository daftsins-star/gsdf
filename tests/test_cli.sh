#!/usr/bin/env bash
# tests/test_cli.sh — every gsdf subcommand against tests/fixtures/. No network, no build.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GSDF="$ROOT/bin/gsdf"
FIX="$ROOT/tests/fixtures"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); printf '  ok   %s\n' "$1"; }
bad()  { FAIL=$((FAIL+1)); printf '  FAIL %s\n       want: %s\n       got:  %s\n' "$1" "$2" "$3"; }
is()   { [ "$2" = "$3" ] && ok "$1" || bad "$1" "$3" "$2"; }          # is <name> <got> <want>
has()  { case "$2" in *"$3"*) ok "$1";; *) bad "$1" "contains: $3" "$(printf '%s' "$2" | head -3)";; esac; }
hasnt(){ case "$2" in *"$3"*) bad "$1" "must NOT contain: $3" "found it";; *) ok "$1";; esac; }
sandbox() { rm -rf "$WORK/s"; cp -R "$FIX/$1" "$WORK/s"; cd "$WORK/s"; }

echo "== 1. gsdf next covers every state (spec 5.3) =="
cd "$FIX/empty";                is "next: no .planning"      "$("$GSDF" next)" "new-project"
cd "$FIX/native-plan";          is "next: plan"              "$("$GSDF" next)" "plan 01"
cd "$FIX/native-execute";       is "next: execute"           "$("$GSDF" next)" "execute 01"
cd "$FIX/native-iterate";       is "next: iterate"           "$("$GSDF" next)" "iterate 01"
cd "$FIX/native-milestone-done";is "next: milestone-done"    "$("$GSDF" next)" "milestone-done"

echo "== 1b. degenerate trees never report a finished milestone =="
E="$WORK/degen"; rm -rf "$E"; mkdir -p "$E/.planning"; cd "$E"
is "empty .planning is not milestone-done" "$("$GSDF" next)" "new-project"
printf '# Roadmap\n\nProse with no parseable phase headings.\n' > .planning/ROADMAP.md
is "unparseable roadmap is not milestone-done" "$("$GSDF" next)" "new-project"
rm -rf "$E"; mkdir -p "$E/.planning/phases/01-thing"; cd "$E"
printf -- '---\nphase: 01\nplan: 01\n---\n# p\n' > .planning/phases/01-thing/01-01-PLAN.md
is "phases with no ROADMAP still work" "$("$GSDF" next)" "execute 01"
rm -rf "$E"; mkdir -p "$E/.planning/phases/02-alpha" "$E/.planning/phases/02-beta"; cd "$E"
has "duplicate phase number warns" "$("$GSDF" phase list 2>&1)" "claimed by both 02-alpha and 02-beta"
has "duplicate resolves deterministically" "$("$GSDF" phase list 2>/dev/null)" "| 02 | alpha |"

echo "== 1c. a blocked plan is not a finished one =="
sandbox native-execute
# give 01-02 a summary that reports blocked, as a stopped executor writes
printf -- '---\nphase: 01\nplan: 02\nstatus: blocked\ncommits: []\n---\n# Summary\n## Delivered\nnothing\n' \
  > .planning/phases/01-drive/01-02-SUMMARY.md
is "blocked phase is not iterate" "$("$GSDF" next)" "blocked 01"
has "phase list shows blocked" "$("$GSDF" phase list)" "| 01 | drive | blocked |"
has "phase current shows blocked" "$("$GSDF" phase current)" "blocked"
# a partial summary is equally not done
sed -i.bak 's/^status: blocked/status: partial/' .planning/phases/01-drive/01-02-SUMMARY.md && rm -f .planning/phases/01-drive/*.bak
is "partial phase is not iterate either" "$("$GSDF" next)" "blocked 01"
# and a clean summary still reaches iterate
sed -i.bak 's/^status: partial/status: complete/' .planning/phases/01-drive/01-02-SUMMARY.md && rm -f .planning/phases/01-drive/*.bak
is "complete summaries reach iterate" "$("$GSDF" next)" "iterate 01"

echo "== 2. spec 4a: pre-existing GSD projects =="
cd "$FIX/original-midphase"
is "original: next"             "$("$GSDF" next)"            "execute 02"
is "original: waves honor wave:" "$("$GSDF" waves 02)"       '[["01"], ["02"]]'
is "original: phase current"    "$("$GSDF" phase current)"   "02 gain-stage execute"
has "original: 01 complete via VERIFICATION" "$("$GSDF" phase list)" "| 01 | foundation | complete |"
has "original: context has codebase conventions" "$("$GSDF" context 02)" "Parameter IDs are lowercase snake_case"
has "original: tryit falls back to Accomplishments" "$("$GSDF" tryit 02)" "ParamIDs::gain"
cd "$FIX/core-midphase"
is "core: next"                 "$("$GSDF" next)"            "iterate 02"
is "core: 01 complete via UAT"  "$("$GSDF" phase current)"   "02 transport iterate"
has "core: context includes continue-here.md" "$("$GSDF" context 02)" "never went through UAT"
hasnt "core: DISCUSSION-LOG not read" "$("$GSDF" context 02)" "Gray area: crossfade shape"

echo "== 3. reads never write (spec 4a, 5) =="
for f in original-midphase core-midphase native-iterate; do
  sandbox "$f"; git init -q . && git add -A && git commit -qm base
  "$GSDF" next >/dev/null; "$GSDF" phase list >/dev/null; "$GSDF" phase current >/dev/null
  "$GSDF" plans 02 >/dev/null 2>&1; "$GSDF" waves 02 >/dev/null 2>&1
  "$GSDF" context 02 >/dev/null 2>&1; "$GSDF" tryit 02 >/dev/null 2>&1; "$GSDF" state >/dev/null
  is "reads are pure: $f" "$(git status --porcelain)" ""
done

echo "== 4. adopt is idempotent and never touches phases/ =="
for f in original-midphase core-midphase; do
  sandbox "$f"; "$GSDF" adopt >/dev/null
  cp -R .planning "$WORK/after1"; "$GSDF" adopt >/dev/null
  is "adopt idempotent: $f" "$(diff -r "$WORK/after1" .planning)" ""
  rm -rf "$WORK/after1"
done
sandbox original-midphase; git init -q . && git add -A && git commit -qm base
"$GSDF" adopt >/dev/null
is "adopt writes only config.json" "$(git status --porcelain)" " M .planning/config.json"
has "adopt detected nothing to invent" "$(cat .planning/config.json)" '"commit_docs": true'

echo "== 4b. adopt never destroys a config it cannot parse =="
sandbox original-midphase
printf '{ "model_profile": "quality", broken' > .planning/config.json
"$GSDF" adopt >/dev/null 2>&1; is "adopt refuses invalid config.json" "$?" "1"
has "and says why" "$("$GSDF" adopt 2>&1)" "refusing to overwrite it"
is "the file is untouched" "$(cat .planning/config.json)" '{ "model_profile": "quality", broken'
is "reads still tolerate it" "$("$GSDF" next)" "execute 02"
# malformed trees must never crash, only exit 0 or 1
sandbox original-midphase
printf -- '---\ndepends_on: [not-closed\nestimated_tokens: abc\n---\n' > .planning/phases/02-gain-stage/02-03-PLAN.md
for sub in "plans 2" "waves 2" "conflicts 2" "context 2" "tryit 2" "phase list" "next"; do
  "$GSDF" $sub >/dev/null 2>&1; rc=$?
  [ $rc -le 1 ] && ok "malformed plan: gsdf $sub exits $rc" || bad "gsdf $sub" "crashed rc=$rc"
done

echo "== 5. waves =="
cd "$FIX/native-execute";  is "waves: depends_on topo" "$("$GSDF" waves 01)" '[["01"], ["02"]]'
sandbox native-execute
printf -- '---\nphase: 01\nplan: 03\n---\n# Plan 01-03\n' > .planning/phases/01-drive/01-03-PLAN.md
is "waves: any plan lacking depends_on -> serial" "$("$GSDF" waves 01)" '[["01"], ["02"], ["03"]]'
sandbox native-iterate
sed -i.bak 's/^depends_on: \["01"\]/depends_on: []/' .planning/phases/01-drive/01-02-PLAN.md && rm -f .planning/phases/01-drive/*.bak
is "waves: independent plans run parallel" "$("$GSDF" waves 01)" '[["01", "02"]]'

echo "== 5b. same-wave file conflicts are detectable, not just asserted =="
cd "$FIX/native-execute"; is "no conflict in a serial phase" "$("$GSDF" conflicts 1)" "no same-wave file conflicts in phase 01"
sandbox native-execute
# make 01-02 parallel with 01-01 AND have it write a file 01-01 already writes
sed -i.bak 's/^depends_on: \["01"\]/depends_on: []/' .planning/phases/01-drive/01-02-PLAN.md
sed -i.bak 's|<files>Source/dsp/Shaper.h</files>|<files>Source/ParamIDs.h</files>|' .planning/phases/01-drive/01-02-PLAN.md
rm -f .planning/phases/01-drive/*.bak
is "same wave now" "$("$GSDF" waves 1)" '[["01", "02"]]'
"$GSDF" conflicts 1 >/dev/null 2>&1; is "conflict exits non-zero" "$?" "1"
has "conflict names the file" "$("$GSDF" conflicts 1)" "both write Source/ParamIDs.h"

echo "== 5c. requirements are extracted as blocks, not lines =="
cd "$FIX/native-execute"
CTX="$("$GSDF" context 1)"
has "wrapped requirement keeps its continuation" "$CTX" "automatable parameter and displayed as a whole percentage"
has "second requirement complete too" "$CTX" "keeps its alias floor below -80 dBFS"
hasnt "out-of-scope bullet mentioning a REQ id is excluded" "$CTX" "not a loudness normaliser"
hasnt "unrelated requirement excluded" "$CTX" "REQ-04"

echo "== 5d. gsdf lint is the plan gate, as a command not a prose instruction =="
cd "$FIX/native-execute"
is "a good phase passes" "$("$GSDF" lint 1)" "phase 01: 2 plan(s) pass all gates"
sandbox native-execute
P=.planning/phases/01-drive/01-02-PLAN.md
sed -i.bak 's|^ *<fails_when>.*$||' $P && rm -f .planning/phases/01-drive/*.bak
"$GSDF" lint 1 >/dev/null 2>&1; is "missing fails_when exits non-zero" "$?" "1"
has "and says which plan and why" "$("$GSDF" lint 1 2>&1)" "not an acceptance test"
sandbox native-execute
sed -i.bak 's/^estimated_tokens: 52000/estimated_tokens: 250000/' $P && rm -f .planning/phases/01-drive/*.bak
has "oversized plan is caught" "$("$GSDF" lint 1 2>&1)" "exceeds the 120000 executor budget"
sandbox native-execute
sed -i.bak 's/^requirements: .*/requirements: []/' $P && rm -f .planning/phases/01-drive/*.bak
has "empty requirements is caught" "$("$GSDF" lint 1 2>&1)" "requirements is empty"
sandbox native-execute
python3 - "$PWD/$P" <<'PY'
import re,sys,pathlib
p=pathlib.Path(sys.argv[1]); t=p.read_text()
p.write_text(re.sub(r"^## Try it.*", "", t, flags=re.S|re.M))
PY
has "missing Try it is caught" "$("$GSDF" lint 1 2>&1)" "the user cannot see the result"

echo "== 6. state read/write tolerance =="
sandbox original-midphase
has "state prints old Current Position" "$("$GSDF" state)" "Phase: 2 of 4 (Gain stage)"
"$GSDF" state note "Bypass is a real bool parameter"
has "note lands under old ### Decisions" "$(sed -n '/### Decisions/,/### Pending/p' .planning/STATE.md)" "Bypass is a real bool parameter"
"$GSDF" state defer "crossfade clamp undecided"
has "defer creates missing heading" "$(cat .planning/STATE.md)" "## Deferred"
"$GSDF" state set status executing
has "set without frontmatter -> comment" "$(cat .planning/STATE.md)" "<!-- gsdf: status=executing -->"
"$GSDF" state position "Phase 02 — executing plan 02-02."
has "position rewrites body" "$("$GSDF" state)" "Phase 02 — executing plan 02-02."
hasnt "position replaced old body" "$("$GSDF" state)" "Phase: 2 of 4"
sandbox core-midphase
"$GSDF" state set status iterating
has "set with frontmatter -> yaml" "$(head -4 .planning/STATE.md)" "status: iterating"
hasnt "frontmatter not duplicated" "$(grep -c '^status:' .planning/STATE.md)" "2"

echo "== 7. iterate log =="
sandbox native-iterate
is "iter count starts at 0" "$("$GSDF" iter count 01)" "0"
"$GSDF" iter start 01 >/dev/null
is "iter start creates the log with no entries" "$("$GSDF" iter count 01)" "0"
has "iter start wrote frontmatter" "$(cat .planning/phases/01-drive/01-ITERATIONS.md)" "status: open"
"$GSDF" iter log 01 "Knob too small -> min 44px [ui/src/knob.css]"
"$GSDF" iter log 01 "DECISION: all knobs use the same scaling rule"
is "iter count" "$("$GSDF" iter count 01)" "2"
has "iter list" "$("$GSDF" iter list 01)" "DECISION: all knobs"
has "iter file has frontmatter" "$(cat .planning/phases/01-drive/01-ITERATIONS.md)" "status: open"
is "still iterate until approved" "$("$GSDF" next)" "iterate 01"
"$GSDF" iter approve 01 >/dev/null
is "approved -> phase complete" "$("$GSDF" next)" "plan 02"

echo "== 7b. iterate work is recoverable even though nothing is committed =="
sandbox native-iterate
git init -q . && git config user.email t@t && git config user.name t
git add -A && git commit -qm base
echo "original" > knob.css && git add knob.css && git commit -qm knob
echo "edited to 44px" > knob.css
"$GSDF" iter log 1 "Knob too small -> 44px [knob.css]"
is "a snapshot ref was parked" "$(git for-each-ref refs/gsdf/ | wc -l | tr -d ' ')" "1"
is "snapshot is not a commit on the branch" "$(git log --oneline | wc -l | tr -d ' ')" "2"
git checkout -- knob.css
is "catastrophe: edit is gone" "$(cat knob.css)" "original"
git stash apply "$(git for-each-ref refs/gsdf/ --format='%(refname)' | head -1)" >/dev/null 2>&1
is "recovered from the snapshot" "$(cat knob.css)" "edited to 44px"

echo "== 7c. concurrent writes do not lose updates =="
sandbox native-iterate
for i in 1 2 3 4 5 6 7 8; do "$GSDF" state defer "deferred item $i" & done; wait
is "8 parallel state defer calls all land" "$(grep -c 'deferred item' .planning/STATE.md | tr -d ' ')" "8"
sandbox native-iterate
for i in 1 2 3 4 5 6 7 8; do "$GSDF" state note "decision $i" & done; wait
is "8 parallel state note calls all land" "$(grep -c 'decision ' .planning/STATE.md | tr -d ' ')" "8"
sandbox native-iterate
for i in 1 2 3 4 5 6 7 8; do "$GSDF" iter log 1 "change $i" & done; wait
is "8 parallel iter log calls all land" "$("$GSDF" iter count 1)" "8"
is "no lock file left in the repo" "$(find .planning -name '*.lock' | wc -l | tr -d ' ')" "0"

echo "== 8. phase advance flips markers in the format it finds =="
sandbox original-midphase
"$GSDF" phase advance >/dev/null
has "advance ticks checkbox" "$(cat .planning/ROADMAP.md)" "- [x] **Phase 2: Gain stage**"
is "advance moves next" "$("$GSDF" next)" "plan 03"
sandbox core-midphase
"$GSDF" phase advance >/dev/null
has "advance flips Status: pending" "$(sed -n '/### Phase 2:/,/### Phase 3:/p' .planning/ROADMAP.md)" "**Status**: complete"
is "advance moves next (core)" "$("$GSDF" next)" "plan 03"

echo "== 8b. approve's real call sequence must not overshoot =="
sandbox native-iterate
# exactly what /gsdf:approve does: stamp the phase approved, THEN advance
"$GSDF" iter approve 1 >/dev/null
"$GSDF" phase advance 1 >/dev/null
is "advance stops at the phase it was given" "$("$GSDF" next)" "plan 02"
is "the next phase was NOT stamped complete" "$(ls .planning/phases/02-*/02-ITERATIONS.md 2>/dev/null | wc -l | tr -d ' ')" "0"
has "phase 01 is complete" "$("$GSDF" phase list)" "| 01 | drive | complete |"
has "phase 02 still needs planning" "$("$GSDF" phase list)" "| 02 | ui | plan |"
# and without an argument it still advances the current phase
sandbox native-iterate
"$GSDF" phase advance >/dev/null
is "bare advance still works" "$("$GSDF" next)" "plan 02"

echo "== 8c. a closed milestone routes to new-project, not to re-planning =="
sandbox native-milestone-done
is "all phases complete" "$("$GSDF" next)" "milestone-done"
mkdir -p .planning/milestones/v1.0
mv .planning/phases/* .planning/milestones/v1.0/
is "phases archived, roadmap left behind -> stale re-plan" "$("$GSDF" next)" "plan 01"
mv .planning/ROADMAP.md .planning/milestones/v1.0/ROADMAP.md
is "roadmap archived too -> new-project" "$("$GSDF" next)" "new-project"
is "nothing was lost" "$(ls .planning/milestones/v1.0/ | wc -l | tr -d ' ')" "3"

echo "== 9. phase dir creates from ROADMAP slug =="
sandbox native-plan
D="$("$GSDF" phase dir 2)"
has "phase dir 2 created" "$D" "phases/02-ui"
is "phase dir exists" "$([ -d "$D" ] && echo yes)" "yes"

echo "== 10. quick numbering continues =="
sandbox original-midphase
mkdir -p .planning/quick/007-existing-thing
Q="$("$GSDF" quick new 'add a version string')"
has "quick continues from highest NNN" "$Q" "quick/008-add-a-version-string"
has "quick list" "$("$GSDF" quick list)" "008-add-a-version-string"

echo "== 11. context budget (spec 10) =="
cd "$FIX/original-midphase"
W=$("$GSDF" context 02 | wc -w | tr -d ' '); T=$((W * 13 / 10))
[ "$T" -lt 2500 ] && ok "context 02 is $T est. tokens (< 2500)" || bad "context token budget" "<2500" "$T"

echo "== 12. errors are one line, non-zero =="
cd "$FIX/native-plan"
"$GSDF" plans 99 >/dev/null 2>"$WORK/e"; is "unknown phase exits non-zero" "$?" "1"
is "error is one line" "$(wc -l < "$WORK/e" | tr -d ' ')" "1"
cd "$FIX/empty"; "$GSDF" state >/dev/null 2>&1; is "no .planning exits non-zero" "$?" "1"

echo "== 12b. verify and findings =="
cd "$FIX/native-iterate"
# NONE CONFIGURED must be exit 2, distinct from both pass (0) and failure (1):
# an unconfigured project claiming success is the bug this command was built for.
T=$(mktemp -d); mkdir -p "$T/.planning/phases"
printf '{"verify":{}}' > "$T/.planning/config.json"
printf '# Roadmap\n\n### Phase 1: X\n**Goal**: x\n' > "$T/.planning/ROADMAP.md"
cd "$T"; OUT=$("$GSDF" verify 1 2>&1); RC=$?
is "verify with nothing configured exits 2" "$RC" "2"
echo "$OUT" | grep -q "NONE CONFIGURED" && ok "verify says NONE CONFIGURED" || bad "verify wording" "NONE CONFIGURED" "$OUT"

# A passing command must be exit 0, a failing one non-zero — the tick has to
# track reality, which it did not when approve printed it from a template.
python3 - "$T/.planning/config.json" <<'PY'
import json,sys; p=sys.argv[1]; d=json.load(open(p)); d["verify"]={"build":"true"}; json.dump(d,open(p,"w"))
PY
"$GSDF" verify 1 >/dev/null 2>&1; is "verify passes when the command passes" "$?" "0"
python3 - "$T/.planning/config.json" <<'PY'
import json,sys; p=sys.argv[1]; d=json.load(open(p)); d["verify"]={"build":"false"}; json.dump(d,open(p,"w"))
PY
"$GSDF" verify 1 >/dev/null 2>&1; is "verify fails when the command fails" "$?" "1"

# findings must match the real line shape "- HH:MM — FINDING: ...", not "^FINDING:".
mkdir -p "$T/.planning/phases/01-x"
printf -- '- 10:00 — FINDING: a check in prose can be forgotten\n- 10:01 — DECISION: not a finding\n' \
  > "$T/.planning/phases/01-x/01-ITERATIONS.md"
OUT=$("$GSDF" findings 1 2>&1)
echo "$OUT" | grep -q "a check in prose can be forgotten" && ok "findings reads FINDING: after the timestamp" \
  || bad "findings anchor" "matched the line" "$OUT"
echo "$OUT" | grep -q "DECISION" && bad "findings picked up a DECISION" "only FINDING:" "$OUT" \
  || ok "findings ignores DECISION: lines"
# phase_files feeds the relevance gate, so a mangled path means the wrong gate runs.
mkdir -p "$T/.planning/phases/01-x"
printf -- '- 10:02 — did a thing [source/Proc.{h,cpp}, ui/App.tsx]\n' \
  >> "$T/.planning/phases/01-x/01-ITERATIONS.md"
OUT=$(cd "$T" && GSDF_BIN="$GSDF" python3 - <<'PY'
import importlib.util, os
from pathlib import Path
g = importlib.util.module_from_spec(importlib.util.spec_from_loader('g', None))
src = open(os.environ["GSDF_BIN"]).read().split("if __name__")[0]
exec(compile(src, 'g', 'exec'), g.__dict__)
print(" ".join(g.phase_files(Path('.planning'), g.find(Path('.planning'), '1'))))
PY
)
echo "$OUT" | grep -q "source/Proc.h" && echo "$OUT" | grep -q "source/Proc.cpp" \
  && ok "phase_files expands {h,cpp} brace groups" \
  || bad "phase_files brace expansion" "source/Proc.h and .cpp" "$OUT"
rm -rf "$T"

echo "== 12c. parameter ABI guard =="
T=$(mktemp -d); mkdir -p "$T/.planning/phases" "$T/source"
printf '{"verify":{},"abi_frozen":true}' > "$T/.planning/config.json"
printf '# Roadmap\n\n### Phase 1: X\n**Goal**: x\n' > "$T/.planning/ROADMAP.md"
printf 'ParameterID { "gain", 1 }\nParameterID { "mix", 1 }\n' > "$T/source/P.cpp"
cd "$T"; "$GSDF" params 1 >/dev/null 2>&1
# macOS is case-insensitive: "source" and "Source" are one directory but resolve to
# different strings, so a path-keyed de-dup counted every parameter twice.
N=$(python3 -c "import json;print(len(json.load(open('.planning/params.lock'))))")
is "params.lock counts each parameter once" "$N" "2"
"$GSDF" params 1 >/dev/null 2>&1; is "unchanged ABI passes" "$?" "0"
python3 - <<'PY'
import json, pathlib
f = pathlib.Path('.planning/params.lock'); d = json.loads(f.read_text())
d[0], d[1] = d[1], d[0]; f.write_text(json.dumps(d))
PY
"$GSDF" params 1 >/dev/null 2>&1; is "reordered ABI fails" "$?" "1"
python3 - <<'PY'
import json, pathlib
pathlib.Path('.planning/params.lock').write_text(json.dumps(
    [{'id':'gain','version':1},{'id':'mix','version':1},{'id':'gone','version':1}]))
PY
OUT=$("$GSDF" params 1 2>&1 || true)
case "$OUT" in *REMOVED*) ok "removed parameter is reported";;
              *) bad "removed parameter" "REMOVED" "$OUT";; esac
printf '{"verify":{}}' > .planning/config.json
OUT=$("$GSDF" params 1 2>&1 || true)
case "$OUT" in *"not enforced"*) ok "advisory until abi_frozen";;
              *) bad "abi_frozen gate" "advisory" "$OUT";; esac
cd "$ROOT"; rm -rf "$T"

echo "== 12d. flags never get parsed as a phase number =="
T=$(mktemp -d); mkdir -p "$T/.planning/phases" "$T/source"
printf '{"verify":{}}' > "$T/.planning/config.json"
printf '# Roadmap\n\n### Phase 1: X\n**Goal**: x\n' > "$T/.planning/ROADMAP.md"
printf 'ParameterID { "gain", 1 }\n' > "$T/source/P.cpp"
cd "$T"
# cmd_params prints "re-lock with `gsdf params --write`" on failure, so that exact
# command must work. It used to die with "bad phase: --write".
OUT=$("$GSDF" params --write 2>&1); RC=$?
is "params --write needs no phase number" "$RC" "0"
has "params --write wrote the lock" "$OUT" "1 parameter(s)"
cd "$ROOT"; rm -rf "$T"

echo "== 12e. lint fails a phase with no plans =="
T=$(mktemp -d); mkdir -p "$T/.planning/phases/01-x"
printf '# Roadmap\n\n### Phase 1: X\n**Goal**: x\n' > "$T/.planning/ROADMAP.md"
cd "$T"
OUT=$("$GSDF" lint 1 2>&1); RC=$?
is "lint exits 1 when the planner wrote nothing" "$RC" "1"
has "lint says why" "$OUT" "no PLAN.md files"
cd "$ROOT"; rm -rf "$T"

echo "== 12f. gsdf update (offline parts only) =="
OUT=$(GSDF_REPO="https://example.com/not/github" "$GSDF" update --check 2>&1); RC=$?
is "non-GitHub remote exits non-zero" "$RC" "1"
has "non-GitHub remote is one clear line" "$OUT" "not a GitHub URL"
is "that error is one line" "$(printf '%s' "$OUT" | wc -l | tr -d ' ')" "0"
OUT=$(GSDF_BIN="$GSDF" python3 - <<'PY2'
import importlib.util, os
g = importlib.util.module_from_spec(importlib.util.spec_from_loader('g', None))
exec(compile(open(os.environ["GSDF_BIN"]).read().split("if __name__")[0], 'g', 'exec'), g.__dict__)
print("cmp", g.vtuple("1.10.0") > g.vtuple("1.9.0"), g.vtuple("1.0.0") > g.vtuple("1.0.0"))
print("url", g.raw_url("bin/gsdf"))
PY2
)
has "1.10.0 sorts above 1.9.0, not below" "$OUT" "cmp True False"
has "raw url is derived from the .git remote" "$OUT" "raw.githubusercontent.com/daftsins-star/gsdf/main/bin/gsdf"
# update must work with no .planning/ -- it is not project state
cd "$FIX/empty"
OUT=$(GSDF_REPO="https://example.com/not/github" "$GSDF" update --check 2>&1)
hasnt "update does not demand a .planning/" "$OUT" "no .planning/ found"
cd "$ROOT"

echo "== 13. speed (spec 10: < 100 ms per call) =="
cd "$FIX/original-midphase"
S=$(python3 -c "
import subprocess,time
t=time.time()
for _ in range(10): subprocess.run(['$GSDF','context','02'],capture_output=True)
print(int((time.time()-t)*100))")
[ "$S" -lt 100 ] && ok "context avg ${S} ms (< 100 ms)" || bad "per-call speed" "<100ms" "${S}ms"

echo
echo "passed: $PASS   failed: $FAIL"
[ "$FAIL" -eq 0 ]
