#!/usr/bin/env bash
# tests/test_conformance.sh — the spec section 10 speed and token rules, mechanically.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
C=".claude/commands/gsdf"; A=".claude/agents"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); printf '  ok   %s\n' "$1"; }
bad(){ FAIL=$((FAIL+1)); printf '  FAIL %s\n       %s\n' "$1" "$2"; }
is(){ [ "$2" = "$3" ] && ok "$1 ($2)" || bad "$1" "want $3, got $2"; }
lt(){ [ "$2" -lt "$3" ] && ok "$1 ($2 < $3)" || bad "$1" "want < $3, got $2"; }

echo "== spawn budget: only new-project, plan, execute, quick may spawn =="
SPAWNERS="$(grep -liE 'spawn[^.]{0,40}(gsdf-planner|gsdf-executor)' $C/*.md | xargs -n1 basename | sort | tr '\n' ' ')"
is "commands that spawn" "$SPAWNERS" "execute.md new-project.md plan.md quick.md "
# a spawn is an instruction to spawn, not a prose mention ("no `gsdf-executor` here")
for f in iterate.md approve.md discuss.md progress.md help.md; do
  is "no spawn in $f" "$(grep -icE 'spawn[^.]{0,40}(gsdf-planner|gsdf-executor)' $C/$f)" "0"
done

echo "== model / effort frontmatter =="
is "no model: on agents" "$(grep -c '^model:' $A/gsdf-*.md | grep -v ':0' | wc -l | tr -d ' ')" "0"
is "no effort: max anywhere" "$(grep -rc 'effort: max' $C $A 2>/dev/null | grep -v ':0' | wc -l | tr -d ' ')" "0"
is "effort: low on progress/help/approve" "$(grep -l '^effort: low' $C/*.md | xargs -n1 basename | sort | tr '\n' ' ')" "approve.md help.md progress.md "

echo "== size budgets =="
lt "gsdf-executor.md lines" "$(wc -l < $A/gsdf-executor.md | tr -d ' ')" 60
lt "gsdf-planner.md lines"  "$(wc -l < $A/gsdf-planner.md | tr -d ' ')" 120
for f in $C/*.md; do lt "$(basename $f) lines" "$(wc -l < $f | tr -d ' ')" 120; done
is "command count" "$(ls $C/*.md | wc -l | tr -d ' ')" "9"
is "agent count" "$(ls $A/gsdf-*.md | wc -l | tr -d ' ')" "2"
D=$(python3 -c "
import glob,re
print(sum(len(re.search(r'^description: (.+)$',open(f).read(),re.M).group(1)) for f in glob.glob('$C/*.md')))")
lt "sum of description chars" "$D" 550
LONGEST=$(python3 -c "
import glob,re
print(max(len(re.search(r'^description: (.+)\$',open(f).read(),re.M).group(1)) for f in glob.glob('$C/*.md')))")
lt "longest description" "$LONGEST" 71

echo "== orchestrators go through the CLI, never straight to the files =="
for f in $C/*.md; do
  n=$(grep -nE '^\s*(cat|head|sed|less|Read\()[^|]*\.planning/(STATE|ROADMAP)\.md' $f | wc -l | tr -d ' ')
  is "$(basename $f) does not cat STATE/ROADMAP" "$n" "0"
done
is "no orchestrator reads a SUMMARY file" "$(grep -cE '(cat|head|Read\()[^\n]*SUMMARY\.md' $C/*.md | grep -v ':0' | wc -l | tr -d ' ')" "0"

echo "== GSD-native prefixed artifact names only =="
# the rule is about PATHS: nothing under phases/ may be an unprefixed artifact name
BAD=$(grep -rnoE 'phases/[A-Za-z0-9{}<>_.-]+/(PLAN|SUMMARY|CONTEXT|ITERATIONS)\.md' $C $A .claude/skills 2>/dev/null | wc -l | tr -d ' ')
is "no unprefixed phases/NN-slug/PLAN.md" "$BAD" "0"
GOOD=$(grep -rocE 'NN-MM-(PLAN|SUMMARY)\.md|NN-(CONTEXT|ITERATIONS)\.md' $C $A .claude/skills 2>/dev/null | grep -vc ':0')
[ "$GOOD" -ge 5 ] && ok "prefixed names are used throughout ($GOOD files)" || bad "prefixed names" "only $GOOD files"
is "templates document prefixed names" "$(grep -c 'NN-MM-PLAN.md' .claude/skills/gsdf-templates/SKILL.md)" "1"

echo "== no hooks =="
is "zero hooks in settings.json" "$(python3 -c "import json;print(len(json.load(open('.claude/settings.json')).get('hooks',{})))")" "0"

echo "== CLI speed and context budget =="
cd tests/fixtures/original-midphase
S=$(python3 -c "
import subprocess,time
t=time.time()
for _ in range(20): subprocess.run(['$ROOT/bin/gsdf','context','02'],capture_output=True)
print(int((time.time()-t)*1000/20))")
lt "gsdf context ms/call" "$S" 100
T=$(( $("$ROOT/bin/gsdf" context 02 | wc -w | tr -d ' ') * 13 / 10 ))
lt "gsdf context est. tokens" "$T" 2500
cd "$ROOT"

echo
echo "passed: $PASS   failed: $FAIL"
[ "$FAIL" -eq 0 ]
