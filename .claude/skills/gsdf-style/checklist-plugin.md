# Plugin UI checklist — GSDF Style Guide by Daftsins

Run this against your OWN screenshot (620×410, device scale 2 → a 1240×820 PNG) and the source, before showing the user. Every line is pass/fail. Any fail: fix, re-shoot, re-run. Report the result as `checklist: N/N pass` and name anything you deliberately waived and why.

## A. Source checks (run the commands)

From `ui/src/`:

- [ ] **No raw colour outside tokens.** `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' --include='*.css' . | grep -v 'index.css:'` prints nothing.
- [ ] **No raw colour in TSX styles.** `grep -rnE "(color|background|fill|stroke)[\"']?\s*[:=]\s*[\"']#" --include='*.tsx' .` prints nothing (canvas luminance greys inside `signature-core.ts` are the one exception).
- [ ] **Exactly one accent.** `grep -n 'color-accent' index.css` shows one definition; no other saturated hex exists in `index.css`.
- [ ] **No opacity on text.** `grep -rn 'opacity' --include='*.css' .` hits only non-text elements (an indicator fade, the grain canvas), never a label/value or its ancestor.
- [ ] **No rounded corners / shadows / gradients / blur.** `grep -rnE 'border-radius:\s*[1-9]|box-shadow:\s*[^n]|gradient\(|blur\(' --include='*.css' .` hits only `box-shadow: inset 0 0 0 Npx` frame marks, if any.
- [ ] **Type scale only.** `grep -rnE 'font-size:\s*[0-9]' --include='*.css' .` prints nothing (every size is a `var(--text-*)`).
- [ ] **Fonts bundled.** `ls assets/fonts/` lists the three woff2 files and `OFL.txt`; `grep -rn 'fonts.googleapis\|http' --include='*.css' .` prints nothing.
- [ ] **index.css loads first.** `main.tsx` imports `./index.css` on a line before `./App`.
- [ ] **Icons are ours.** No icon-font / icon-library import (`grep -rnE "lucide|heroicons|fontawesome|material-symbols|react-icons" .` prints nothing); no unicode arrows/symbols used as icons in JSX (`↻ ⚄ ✕ ▶ ★` etc.).
- [ ] **Canvas size matches native.** `CANVAS_W/H` in `PluginCanvas.tsx` equal the editor's `kWidth/kHeight`.

## B. Screenshot checks (look at the PNG)

**Ground and ink**
- [ ] Ground is black with faint grain; no panel, card, or area is a grey fill.
- [ ] All text is bone, dim bone, or black-on-fill. No accent-coloured text anywhere. No white.
- [ ] The accent appears only as grounds/marks: brand chip, pressed toggles, selected tab, dragging/peak marks, (optionally) the signature piece. No second hue except inside a signature piece's ramp.
- [ ] Chosen segment cells are bone ground with black text; on/live states are accent ground with black text.

**Type**
- [ ] Silkscreen is really rendering: the brand chip and knob values show square pixel letterforms (a fallback looks like smooth Space Mono). If unsure, check `document.fonts.check('10px Silkscreen')` in the page.
- [ ] Everything is UPPERCASE except the version string.
- [ ] At most one large (26px) number on the screen.
- [ ] No text is clipped, overlapping, or ellipsised except a long preset name.

**Layout and size**
- [ ] Window is 620×410 (or within 560–720 wide at ~3:2), scale 1 at the design size.
- [ ] Rows: 22px masthead with the accent brand chip at the left edge; 22px status strip at the bottom; 18px tab row if tabs exist.
- [ ] Body is 2–3 zones split by single 1px hairlines; no boxes nested in boxes.
- [ ] No zone has a large empty region (> ~25% of its height) — fill it, merge zones, or shrink.
- [ ] Controls are on the scales: knobs 26/34/44, buttons 15/18/22px tall, bars 9px.

**Tabs**
- [ ] If the plugin has more than one feature group (or the controls wouldn't fit), a `TabBar` is present; the window was not enlarged instead.
- [ ] Each tab has an icon + one word; the selected tab is an accent ground; masthead and status stay outside the tabs.

**Icons**
- [ ] Every tab, toggle, knob label, bar-slider label, and read-out label has a pixel icon (allowed exceptions: a segment of plain values like `1/4 1/8`).
- [ ] Icons are crisp 10px (or 20px) pixel glyphs, same weight as each other; none blurry, stroked, or from another style.
- [ ] Icon-only buttons are only the standard utilities, each with a `title`.

**Controls and states**
- [ ] Knobs: lit ticks bone, unlit ticks faint; value centred inside in Silkscreen; label + icon below.
- [ ] Hairline borders are `--ink-rule` at rest (visibly dimmer than text).
- [ ] Meters are segmented, bone, with an accent peak; dB values beside them as text.

**Signature piece** (only if the user asked for one)
- [ ] It exists because the user chose it; it is the only crunched/posterized element.
- [ ] It uses exactly 4 flat inks from the palette (bone ramp or accent ramp), visibly pixelated, sits in a hairline frame, labels outside it.
- [ ] It moves (boil) in the live UI; it reacts to audio level (check with signal playing, or a fake level in the mock bridge).

## C. Behaviour spot-checks (in the running UI)

- [ ] Drag a knob: vertical, Shift fine, double-click resets, value text updates live, ticks turn accent while dragging.
- [ ] Automate a parameter from the host (or mock bridge): the control follows.
- [ ] Resize the editor: the panel scales as one piece, text stays sharp at 1×/2×, nothing reflows.
- [ ] Hide the editor: meters and the signature piece stop drawing (CPU drops).
