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
has(){ case "$2" in *"$3"*) ok "$1";; *) bad "$1" "expected to contain: $3";; esac; }

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
is "effort: low on the cheap commands" "$(grep -l '^effort: low' $C/*.md | xargs -n1 basename | sort | tr '\n' ' ')" "approve.md help.md pause.md progress.md resume.md "

echo "== size budgets =="
lt "gsdf-executor.md lines" "$(wc -l < $A/gsdf-executor.md | tr -d ' ')" 60
lt "gsdf-planner.md lines"  "$(wc -l < $A/gsdf-planner.md | tr -d ' ')" 120
for f in $C/*.md; do lt "$(basename $f) lines" "$(wc -l < $f | tr -d ' ')" 120; done
is "command count" "$(ls $C/*.md | wc -l | tr -d ' ')" "11"
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

echo "== parallel executors must not share a git index =="
is "executor commits with --only" "$(grep -c 'git commit --only' $A/gsdf-executor.md)" "2"
is "executor never uses git add -A" "$(grep -cE '^\s*git add -A' $A/gsdf-executor.md)" "0"
is "executor uses intent-to-add" "$(grep -c 'git add -N' $A/gsdf-executor.md)" "2"
is "executor retries on index.lock" "$(grep -ci 'index.lock' $A/gsdf-executor.md)" "1"

echo "== approve is guarded against a stray \"approved\" =="
has "approve checks gsdf next first" "$(cat $C/approve.md)" "If it does not say"
has "approve stops when not iterating" "$(cat $C/approve.md)" "**stop**"

echo "== every destructive command guards against firing on a guess =="
for f in approve execute plan quick; do
  has "$f checks state before acting" "$(cat $C/$f.md)" "**stop**"
done
has "approve refuses build output" "$(cat $C/approve.md)" "node_modules|dist|target"
has "execute checks wave conflicts" "$(cat $C/execute.md)" "gsdf conflicts N"

echo "== planning artifacts get versioned, safely =="
for f in plan new-project discuss; do
  has "$f commits its artifacts" "$(cat $C/$f.md)" "commit_docs"
  has "$f uses --only not add -A" "$(cat $C/$f.md)" "git commit --only"
done

echo "== the README does not drift from the code =="
CLI=$(wc -l < bin/gsdf | tr -d ' ')
DOC=$(grep -oE '~[0-9]+ lines of stdlib Python' README.md | grep -oE '[0-9]+')
[ "$DOC" -ge $((CLI - 30)) ] && [ "$DOC" -le $((CLI + 30)) ] && ok "README CLI line count is current ($DOC vs $CLI)" \
  || bad "README CLI line count" "says ~$DOC, actual $CLI"
for s in $(bin/gsdf help | tail -1 | sed 's/Subcommands: //'); do
  case "$s" in init|adopt|state|plans|quick) ;; *)
    has "README documents 'gsdf $s'" "$(cat README.md)" "gsdf $s" ;;
  esac
done

echo "== execute must not fabricate an iteration to create the log =="
is "execute uses iter start" "$(grep -c 'gsdf iter start' $C/execute.md)" "1"
is "execute does not log a placeholder" "$(grep -c 'iter log N \"phase executed\"' $C/execute.md)" "0"

echo "== CLI version skew is diagnosable and PATH wins =="
has "gsdf reports its version and path" "$(bin/gsdf --version)" "gsdf 1."
has "CLAUDE block prefers PATH over a project-local copy" "$(cat .claude/CLAUDE.gsdf.md)" "Prefer PATH"
has "install.sh refreshes a stale project CLI" "$(cat install.sh)" "refreshed a stale project-local CLI"

echo "== approve passes an explicit phase to advance =="
has "approve calls phase advance N" "$(cat $C/approve.md)" "phase advance N"
is "approve no longer double-stamps via iter approve" "$(grep -c 'iter approve' $C/approve.md)" "0"

echo "== discuss never presents its options as the only choices =="
has "discuss says options are a starting point" "$(cat $C/discuss.md)" "never a menu"
has "discuss makes the typed answer obvious" "$(cat $C/discuss.md)" "must make that obvious"

echo "== a blocked phase is never routed to iterate =="
has "progress handles blocked" "$(cat $C/progress.md)" "blocked NN"
has "progress refuses to iterate a blocked phase" "$(cat $C/progress.md)" "Never route a blocked phase"
has "plan allows re-planning a blocked phase" "$(cat $C/plan.md)" "exception is a **blocked** phase"

echo "== approve commits last, so its own bookkeeping is in the commit =="
python3 - <<'PY'
import re, sys
t = open(".claude/commands/gsdf/approve.md").read()
order = re.findall(r"^\*\*(\d)\. ([^.*]+)", t, re.M)
nums = [int(n) for n, _ in order]
labels = {int(n): l.strip().lower() for n, l in order}
commit = next((n for n, l in labels.items() if l.startswith("commit")), None)
advance = next((n for n, l in labels.items() if l.startswith("advance")), None)
fold = next((n for n, l in labels.items() if l.startswith("fold")), None)
ok = nums == sorted(nums) and commit and advance and fold and commit > advance and commit > fold
print("PASS" if ok else "FAIL commit=%s advance=%s fold=%s order=%s" % (commit, advance, fold, nums))
PY
R=$(python3 - <<'PY'
import re
t = open(".claude/commands/gsdf/approve.md").read()
order = re.findall(r"^\*\*(\d)\. ([^.*]+)", t, re.M)
labels = {int(n): l.strip().lower() for n, l in order}
c = next((n for n,l in labels.items() if l.startswith("commit")), 0)
a = next((n for n,l in labels.items() if l.startswith("advance")), 0)
f = next((n for n,l in labels.items() if l.startswith("fold")), 0)
print("yes" if c and a and f and c > a and c > f else "no")
PY
)
is "commit step comes after fold and advance" "$R" "yes"
has "approve requires a clean tree afterwards" "$(cat $C/approve.md)" "must leave the tree clean"

echo "== closing a milestone archives its roadmap too =="
has "progress moves ROADMAP into the archive" "$(cat $C/progress.md)" "git mv .planning/ROADMAP.md"
has "progress explains why" "$(cat $C/progress.md)" "re-plan a phase that shipped"

echo "== plan gates its output with commands, not prose =="
has "plan runs gsdf lint" "$(cat $C/plan.md)" "gsdf lint N"
has "plan runs gsdf conflicts" "$(cat $C/plan.md)" "gsdf conflicts N"
has "plan feeds the failure back to the planner" "$(cat $C/plan.md)" "re-spawn instruction"
has "README documents 'gsdf lint'" "$(cat README.md)" "gsdf lint"

echo "== /gsdf:help does not drift from the commands it describes =="
diff <(grep -oE "/gsdf:[a-z-]+" $C/help.md | sed 's|/gsdf:||' | sort -u) \
     <(ls $C/*.md | xargs -n1 basename | sed 's/.md//' | sort -u) >/dev/null \
  && ok "help lists exactly the commands that exist" || bad "help command list" "drifted from $C/"
# every command help claims takes 0 spawns must actually take 0
for c in discuss iterate approve progress help pause resume; do
  grep -qE "^  /gsdf:$c.*0 spawns" $C/help.md || continue
  is "help's '0 spawns' claim for $c" "$(grep -icE 'spawn[^.]{0,40}(gsdf-planner|gsdf-executor)' $C/$c.md)" "0"
done
# new-project and plan each have one spawn site; quick has two conditional sites
# (executor, or planner with --plan-first) but fires exactly one. What matters is that
# each states a one-spawn budget in its success criteria.
for c in new-project plan quick; do
  grep -qE "^  /gsdf:$c.*1 spawn" $C/help.md || continue
  has "$c states a one-subagent budget" "$(cat $C/$c.md)" "one subagent"
done
# internal doc links must resolve
for f in $(grep -ohE '\]\(([A-Za-z0-9_.-]+\.md)\)' *.md | sed 's/](\(.*\))/\1/' | sort -u); do
  is "doc link resolves: $f" "$([ -f "$f" ] && echo yes)" "yes"
done

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
# a thorough discuss must not be able to blow the budget (CONTEXT.md is capped, not verbatim)
cd "$ROOT"; BOMB="$(mktemp -d)"; cp -R tests/fixtures/native-execute "$BOMB/b"
python3 -c "
lines=['# Phase 1 Context: Drive','']
for i in range(1,9):
    lines += ['## Gray area %d' % i, '']
    lines += ['- Decision %d.%d: a concrete value with a sentence of reasoning behind it.' % (i,j) for j in range(1,16)]
    lines += ['']
open('$BOMB/b/.planning/phases/01-drive/01-CONTEXT.md','w').write(chr(10).join(lines))"
cd "$BOMB/b"; TB=$(( $("$ROOT/bin/gsdf" context 1 | wc -w | tr -d ' ') * 13 / 10 ))
lt "gsdf context with a 145-line CONTEXT.md" "$TB" 2500
has "truncation is announced" "$("$ROOT/bin/gsdf" context 1)" "truncated at 120 lines"
cd "$ROOT"; rm -rf "$BOMB"
# write commands are on the budget too: iter log now takes a git snapshot on every call
LATD="$(mktemp -d)"; cp -R tests/fixtures/native-iterate "$LATD/w"; cd "$LATD/w"
git init -q . && git config user.email t@t && git config user.name t && git add -A && git commit -qm b
SW=$(python3 -c "
import subprocess,time
t=time.time()
for i in range(10): subprocess.run(['$ROOT/bin/gsdf','iter','log','1','change %d'%i],capture_output=True)
print(int((time.time()-t)*100))")
lt "gsdf iter log ms/call (incl. snapshot)" "$SW" 100
cd "$ROOT"; rm -rf "$LATD"
cd "$ROOT"

echo
echo "passed: $PASS   failed: $FAIL"
[ "$FAIL" -eq 0 ]
