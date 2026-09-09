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
E="$WORK/e"; rm -rf "$E"; mkdir -p "$E/.planning"; cd "$E"
is "empty .planning is not milestone-done" "$("$GSDF" next)" "new-project"
printf '# Roadmap\n\nProse with no parseable phase headings.\n' > .planning/ROADMAP.md
is "unparseable roadmap is not milestone-done" "$("$GSDF" next)" "new-project"
rm -rf "$E"; mkdir -p "$E/.planning/phases/01-thing"; cd "$E"
printf -- '---\nphase: 01\nplan: 01\n---\n# p\n' > .planning/phases/01-thing/01-01-PLAN.md
is "phases with no ROADMAP still work" "$("$GSDF" next)" "execute 01"
rm -rf "$E"; mkdir -p "$E/.planning/phases/02-alpha" "$E/.planning/phases/02-beta"; cd "$E"
has "duplicate phase number warns" "$("$GSDF" phase list 2>&1)" "claimed by both 02-alpha and 02-beta"
has "duplicate resolves deterministically" "$("$GSDF" phase list 2>/dev/null)" "| 02 | alpha |"

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

echo "== 8. phase advance flips markers in the format it finds =="
sandbox original-midphase
"$GSDF" phase advance >/dev/null
has "advance ticks checkbox" "$(cat .planning/ROADMAP.md)" "- [x] **Phase 2: Gain stage**"
is "advance moves next" "$("$GSDF" next)" "plan 03"
sandbox core-midphase
"$GSDF" phase advance >/dev/null
has "advance flips Status: pending" "$(sed -n '/### Phase 2:/,/### Phase 3:/p' .planning/ROADMAP.md)" "**Status**: complete"
is "advance moves next (core)" "$("$GSDF" next)" "plan 03"

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
