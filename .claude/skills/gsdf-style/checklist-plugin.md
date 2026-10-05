# Plugin UI checklist — GSDF Style Guide by Daftsins

Run this against your OWN screenshots (design size, device scale 2 — one plain, one with a hint showing) and the source, before showing the user. Every line is pass/fail. Any fail: fix, re-shoot, re-run. Report the result as `checklist: N/N pass` and name anything you deliberately waived and why.

## A. Source checks (run the commands)

From `ui/src/`:

- [ ] **No raw colour outside tokens.** `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' --include='*.css' . | grep -v 'index.css:'` prints nothing.
- [ ] **No raw colour in TSX styles.** `grep -rnE "(color|background|fill|stroke)[\"']?\s*[:=]\s*[\"']#" --include='*.tsx' .` prints nothing (canvas luminance greys inside `signature-core.ts` are the one exception).
- [ ] **Exactly one accent.** `grep -n 'color-accent' index.css` shows one definition; no other saturated hex in `index.css`.
- [ ] **No opacity on text.** `grep -rn 'opacity' --include='*.css' .` hits only non-text fills (an activity cell, an indicator fade), never a label/value or its ancestor.
- [ ] **No grain or texture.** `grep -rniE 'grain|noise|speck|feTurbulence' --include='*.css' --include='*.tsx' --include='*.ts' . ../index.html` hits nothing but a signature piece's own boil.
- [ ] **No rounded corners / shadows / gradients / blur.** `grep -rnE 'border-radius:\s*[1-9]|box-shadow:\s*[^n]|gradient\(|blur\(' --include='*.css' .` hits only `inset 0 0 0 1px` focus marks.
- [ ] **Type scale only.** `grep -rnE 'font-size:\s*[0-9]' --include='*.css' .` prints nothing.
- [ ] **Fonts bundled.** `ls assets/fonts/` lists the woff2 files and `OFL.txt`; no `http` in CSS.
- [ ] **index.css loads first** in `main.tsx`.
- [ ] **Icons are ours.** No icon library import; no unicode arrows/symbols used as icons in JSX (`↻ ⚄ ✕ ▶ ▾ ★` etc.).
- [ ] **No knobs unless asked.** `grep -rn "Knob" --include='*.tsx' . | grep -v 'components/Knob.tsx'` prints nothing — or the user asked for knobs by name (say where).
- [ ] **Every control has a hint.** Each `BarSlider` has `hint=`, each `Segment` option / `List` item / `CellRow` cell / `Toggle` carries a `hint`, custom controls spread `useHint(...)`; a `HintSlot` (inside `Screen`, or `variant="line"`) exists exactly once.
- [ ] **Stepped controls step.** Every parameter with discrete values (choice, int, levels) uses `steps` / `Pips` / `Segment`; one wheel notch moves one step (try it in C).
- [ ] **Canvas size matches native.** `CANVAS_W/H` = `--panel-w/h` = the editor's base size.

## B. Screenshot checks (look at the PNGs)

**Ground and ink**
- [ ] Ground is flat black — no grain, dots or specks; no area is a grey panel fill (filled buttons, pips and the selected row are the only raised greys).
- [ ] Labels dim, values and names bone; black on accent and bone fills. No white.
- [ ] Accent only as grounds/marks (brand block, LOADED badge, pressed button/toggle, lit cell, selected row code, dragging fill) and as text only for the "now" names (selected row, Screen caption, hint title).
- [ ] Chosen segment cells are bone ground with black text.

**Masthead**
- [ ] The accent brand block touches the panel's top and left edges and fills the full masthead height — not an inset chip. Name in black mono.
- [ ] PRESETS ▾ is the first item right after the brand block (or the slot is empty because the plugin has no presets).
- [ ] Header buttons are outlined 1px-rule rectangles, equal height, spaced-out caps, gaps between them.

**Type**
- [ ] Body text is 12px Space Mono, calm and readable; nothing below 9px except the version.
- [ ] UPPERCASE everywhere except the version and meaningful case (chord names, numerals, units).
- [ ] No text clipped, overlapping or ellipsised except a long preset/list name.

**Layout and window**
- [ ] The window is the smallest that fits without crowding (or an existing plugin's own size) and scale 1 at the design size.
- [ ] Columns split by single 1px hairlines; each starts with a 28px section head; no boxes nested in boxes (the Screen is the one frame).
- [ ] Rows breathe like alive:medium (24–28px controls, 12px between key/value rows); no zone has a large dead region (> ~25%) and nothing is cramped.

**Controls**
- [ ] Continuous parameters are bar sliders: dim label column, 10px bar, bone fill, value right; bipolar ones fill from a centre hairline.
- [ ] No dotted tick-ring knobs (unless asked for).
- [ ] Step meters are flat pips; cell rows show codes, with disabled ones struck through.
- [ ] Icons on buttons, toggles, tabs, utilities — not in front of slider labels or key/value keys; crisp 10/20px pixel glyphs.

**Hints** (the hint screenshot)
- [ ] Hovering a control shows `TITLE · VALUE` in the accent and one sentence in bone, over the Screen's bottom edge (or in the status line); the sentence says what it does to the sound.
- [ ] Hovering an option (segment cell / list row) describes that option; a list row may preview.

**Signature piece** (only if the user asked for one)
- [ ] It exists because the user chose it; 4 flat inks, pixelated, boiling; it reacts to audio.

## C. Behaviour spot-checks (in the running UI)

- [ ] Drag a bar: press jumps, Shift fine, double-click resets, value updates live, fill turns accent, the hint stays up with the value.
- [ ] Wheel over a stepped control: one notch = one step; a trackpad swipe moves a few steps, not all of them.
- [ ] Automate a parameter from the host (or mock bridge): the control follows.
- [ ] Resize the editor: the panel scales as one piece, text stays sharp, nothing reflows.
- [ ] Open the editor: no white (or texture) flash before the page paints.
- [ ] Hide the editor: meters, activity and the signature piece stop drawing.
