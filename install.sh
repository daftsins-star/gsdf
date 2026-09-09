#!/usr/bin/env bash
# install.sh [target-dir]   — install GSDF into one project
# install.sh --global       — install into ~/.claude so /gsdf:* works in every project
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"

GLOBAL=0
[ "${1:-}" = "--global" ] && { GLOBAL=1; shift; }
TARGET="$(cd "${1:-.}" && pwd)"
if [ "$GLOBAL" = 1 ]; then DEST="$HOME/.claude"; else DEST="$TARGET/.claude"; fi

# A user-level command shadows a project-level one of the same name, so a stale global
# install would silently win over this one.
if [ "$GLOBAL" = 0 ] && [ -d "$HOME/.claude/commands/gsdf" ]; then
  echo "WARNING: GSDF is already installed globally in ~/.claude/."
  echo "         User-level commands shadow project-level ones, so /gsdf:* will run the"
  echo "         GLOBAL copy, not this one. Re-run './install.sh --global' to update that"
  echo "         instead, or remove ~/.claude/commands/gsdf to use per-project installs."
  echo "         Those commands call 'gsdf' on PATH, so the global CLI is what actually runs."
  echo
fi

# Refresh a project-local CLI so it can never be older than the global one.
if [ "$GLOBAL" = 1 ] && [ -x "$TARGET/.claude/bin/gsdf" ] \
   && ! cmp -s "$SRC/bin/gsdf" "$TARGET/.claude/bin/gsdf"; then
  cp "$SRC/bin/gsdf" "$TARGET/.claude/bin/gsdf"; chmod +x "$TARGET/.claude/bin/gsdf"
  echo "  refreshed a stale project-local CLI at $TARGET/.claude/bin/gsdf"
fi

echo "Installing GSDF → $DEST"
mkdir -p "$DEST/commands/gsdf" "$DEST/agents" "$DEST/skills" "$DEST/bin"
cp "$SRC"/.claude/commands/gsdf/*.md "$DEST/commands/gsdf/"
cp "$SRC"/.claude/agents/gsdf-*.md   "$DEST/agents/"
rm -rf "$DEST/skills/gsdf-templates"
cp -R "$SRC/.claude/skills/gsdf-templates" "$DEST/skills/"
cp "$SRC/bin/gsdf" "$DEST/bin/gsdf"
chmod +x "$DEST/bin/gsdf"

# A global install has no project-relative .claude/bin/gsdf, so rewrite the CLI path in the
# installed copies rather than relying on every agent noticing a fallback sentence.
if [ "$GLOBAL" = 1 ]; then
  for f in "$DEST/commands/gsdf"/*.md "$DEST/agents"/gsdf-*.md; do
    perl -pi -e 's{`\.claude/bin/gsdf` \(or `gsdf` on PATH if that file is absent\)}{`gsdf` (on PATH)}g;
                 s{`\.claude/bin/gsdf` \(or `gsdf` on PATH\)}{`gsdf` (on PATH)}g;
                 s{\.claude/bin/gsdf}{gsdf}g' "$f"
  done
  echo "  commands rewritten to call gsdf on PATH"
fi

# --- CLI on PATH (global install only) ---
ONPATH=""
if [ "$GLOBAL" = 1 ]; then
  for d in "$HOME/.local/bin" /usr/local/bin "$HOME/bin"; do
    case ":$PATH:" in *":$d:"*)
      mkdir -p "$d" 2>/dev/null || continue
      ln -sf "$DEST/bin/gsdf" "$d/gsdf" 2>/dev/null && { ONPATH="$d/gsdf"; break; } ;;
    esac
  done
fi

# --- CLAUDE.md block, between markers, replaced if already present ---
CM="$([ "$GLOBAL" = 1 ] && echo "$HOME/CLAUDE.md.unused" || echo "$TARGET/CLAUDE.md")"
[ "$GLOBAL" = 1 ] && CM="$HOME/.claude/CLAUDE.md"
BLOCK="$SRC/.claude/CLAUDE.gsdf.md"
python3 - "$CM" "$BLOCK" "$GLOBAL" <<'PY'
import sys, pathlib
cm, block, glob = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]).read_text(), sys.argv[3] == "1"
if glob:
    block = block.replace("`.claude/bin/gsdf` (or `gsdf` on PATH)", "`gsdf` on PATH (or `.claude/bin/gsdf` in a project that has one)")
new = "<!-- gsdf:start -->\n" + block.strip() + "\n<!-- gsdf:end -->\n"
t = cm.read_text() if cm.exists() else ""
if "<!-- gsdf:start -->" in t and "<!-- gsdf:end -->" in t:
    a, b = t.index("<!-- gsdf:start -->"), t.index("<!-- gsdf:end -->") + len("<!-- gsdf:end -->\n")
    t = t[:a] + new + t[b:]
else:
    t = (t.rstrip("\n") + "\n\n" if t.strip() else "") + new
cm.parent.mkdir(parents=True, exist_ok=True)
cm.write_text(t)
print("  CLAUDE.md block written to " + str(cm))
PY

# --- merge the permissions allow-list, never clobbering existing entries ---
python3 - "$DEST/settings.json" "$SRC/.claude/settings.json" <<'PY'
import sys, json, pathlib
dst, src = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
try: cur = json.loads(dst.read_text())
except Exception: cur = {}
add = json.loads(src.read_text())["permissions"]["allow"]
allow = cur.setdefault("permissions", {}).setdefault("allow", [])
new = [a for a in add if a not in allow]
allow.extend(new)
dst.write_text(json.dumps(cur, indent=2) + "\n")
print("  settings.json: %d permission(s) added, %d already present" % (len(new), len(add) - len(new)))
PY

# --- adopt an existing .planning/ ---
if [ "$GLOBAL" = 0 ] && [ -d "$TARGET/.planning" ]; then
  echo; echo "Existing .planning/ found — adopting:"; (cd "$TARGET" && "$DEST/bin/gsdf" adopt)
fi

echo
if [ "$GLOBAL" = 1 ]; then
  if [ -n "$ONPATH" ]; then echo "CLI on PATH: $ONPATH"
  else echo "NOTE: could not put gsdf on your PATH. Add this to your shell profile:"
       echo "      export PATH=\"\$HOME/.claude/bin:\$PATH\""; fi
  echo "Installed globally — /gsdf:* is available in every project."
else
  echo "Installed into $TARGET."
fi
echo "Restart Claude Code, then run /gsdf:help."
echo
echo "NOTE: Claude Code ignores permissions.allow in an untrusted workspace. The first time"
echo "      you open this project interactively, accept the trust dialog — otherwise every"
echo "      gsdf call prompts. Or run: claude --dangerously-skip-permissions"
