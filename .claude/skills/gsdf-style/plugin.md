# GSDF Style Guide by Daftsins — plugins

The default look for an audio-plugin GUI (JUCE + React WebView) whose project names no other style. It is **alive:medium's layout, refinement and hints in alive:drums' colours and masthead**. The code in `assets/plugin/` is the spec; this page says how to use it. Look at `assets/plugin/reference-mockup.png` first — that is the target.

## 1. Identity

A small, flat black instrument panel printed in one bone ink, with one accent. Calm, readable 12px mono type, everything UPPERCASE. 1px hairlines split the panel into columns; nothing is rounded, nothing casts a shadow, nothing has a gradient, the ground has no texture. Hierarchy comes from two inks — labels dim, the things they label bone — and from air: rows are generous, sections breathe. Controls are flat: bars, pips, joined cells, filled blocks. The panel **explains itself**: every control announces what it does in the hint slot while you point at it.

## 2. Files to copy, and where

| From `assets/plugin/` | To `ui/src/` | Notes |
|---|---|---|
| `tokens.css` | `index.css` | :root tokens + @font-face. Change only `--color-accent` (and the panel size). |
| `base.css` | top of `App.css` | resets, canvas, `.zone`, `.sec-hd`, `.lbl/.val/.cap`, `.btn`, `.select` |
| `fonts/*.woff2`, `fonts/OFL.txt` | `assets/fonts/` | OFL-1.1; ship `OFL.txt`, list them in third-party notices |
| `components/*` | `components/` | each `.tsx` imports its own `.css`; `hint-core.ts` + `Hint.tsx` are one unit |
| `icons/*` | `icons/` | `pixel-icons.ts`, `Icon.tsx`, `MusicText.tsx` |

`main.tsx` must `import './index.css'` **before** `import App from './App'`, or tokens and fonts are never bundled and the UI silently falls back to system fonts. Fonts are bundled, never fetched: a plugin runs offline.

Components are bridge-agnostic: continuous controls take a normalised `value` (0..1) plus `onBegin / onChange / onEnd`; wire them to `beginGesture / setParam / endGesture`. `onChange` fires at most once per frame; if the bridge still floods, pass `commitOnly`. Repaint from the host value when not dragging, so automation shows.

## 3. Colour

Read `tokens.css`; it is commented line by line.

- **Three primitives**: `--color-bg #000000`, `--color-bone #ded3bc`, `--color-accent`. Nothing else is a colour. The ground is **flat black — no grain, noise, specks or texture**.
- **The bone ladder**, pre-composited on black: `--ink-text` (1.0), `--ink-dim` (0.65), `--ink-rule` (0.40, hairlines and struck/disabled labels only), `--ink-raised` (0.26, filled buttons, unlit pips/cells, the selected row), `--ink-hair` (0.16, slider wells, hover wash). Never `opacity` on text — pick a step.
- **Accent = "on / selected / now"**: the brand block, a pressed toggle or header button, the LOADED badge, a lit cell, a dragging fill. As **text** only for the *name of the thing that is now*: the selected list row's name, the Screen's caption, the hint title (`.now`). Never for labels, values or sentences. Text on accent or bone is black.
- **Two kinds of selected**: a choice among siblings (segment cell) is a **bone** ground; an on/live state is an **accent** ground.
- A raw hex outside `tokens.css` is a bug.

**Accent list** — one per plugin. All carry black text at ≥ 5:1 and read as distinct from bone.

| Name | Hex | Note |
|---|---|---|
| Orange | `#f08a24` | alive:drums. The default |
| Olive | `#7a8761` | alive:medium. Quiet |
| Vermilion | `#e2553a` | loud; not on anything that shows clipping |
| Teal | `#3fa394` | cool, technical |
| Sky | `#7ea7d8` | reverbs, space |
| Rose | `#d67f93` | warm, characterful |
| Lilac | `#9f8bd0` | dreamy, modulation |
| Mint | `#6fc29a` | bright; keep fills small |

Rejected: yellows (merge with bone), acid green, pure red (reads as error), white.

## 4. Type

- `--font-body` **Space Mono** for everything: names, labels, values, buttons, hints, the brand block.
- `--font-display` **Silkscreen** (pixel) only for an optional big read-out (`BigReadout`) or a numeral that wants it. Never sentences, never the masthead.
- Scale (px): nano 8 · micro 9 · xs 10 · sm 11 · **md 12** · base 13 · lg 18 · xl 26 · 2xl 38. The canvas base is md 12, `--track-body` 0.04em, line-height 1. Labels and names md; values beside bars sm; hint body xs at line-height 1.35; codes under cells micro with `--track-caps`. Masthead buttons xs with `--track-caps` (0.16em) — spaced out.
- One `--text-xl` number per screen at most. Units glue onto values (`+3.0DB`, `35%`).
- **Case that carries meaning stays as written** — chord names (Cm7 ≠ CM7), roman numerals (i ≠ I), units like dB/Hz/ms: no `text-transform` on those. Neither face has ♭ ♯ ♮: render music text through `icons/MusicText.tsx`.

## 5. Layout and window

- **Window: as small as fits.** No fixed size: use the smallest window that holds the plugin without crowding, and grow only when the content needs it. alive:medium and alive:drums are 620×410 (the template's size); a bigger instrument may need ~800×520. An **existing plugin keeps its size**. `PluginCanvas` scales the panel as one piece (aspect-locked, resizable); keep `CANVAS_W/H`, `--panel-w/h` and the editor's base size in step. Nothing inside uses vw/vh.
- **Rows**: masthead 28px · optional tab row 22px · `.body` · optional status strip 22px. alive:medium has no status strip — add one only for meters or when there is no Screen.
- **Body = columns** split by single hairlines (`.zone`). The alive:medium arrangement is the default: a **list** of things to load (~140px) · the **Screen** with the live controls under it (fills) · an **inspector** (~175px) whose action buttons pin to the bottom (`.foot`). Each column starts with a `.sec-hd` (28px: LABEL left, status or `Badge` right). Inner padding 9px; sections separated by `.hr` (12px air either side).
- **Density: Medium, not cramped.** List rows 26px, segments and buttons 24px, key/value rows with 12px gaps, bars 10px. If it doesn't fit, add a tab — don't shrink the type.
- **Tabs** for more than one feature group: `TabBar` (`placement="row"`, 22px), or masthead header buttons that swap a surface (as alive:drums' LIBRARY / SPACE / EDIT).

## 6. Controls

Every control is flat; hover lifts its label to bone; dragging turns its fill accent. No hover transitions.

| Control | File | Use and states |
|---|---|---|
| **Bar slider** | `BarSlider.tsx` | **The** continuous control. `LABEL [10px bar] VALUE`: dim label in a fixed column, `--ink-hair` well, bone fill (bipolar fills from a 1px dim centre hairline that pokes out 2px), value right-aligned. Press jumps, Shift fine, double-click resets, wheel steps. Stack in a `.stack`; set `--bar-lbl/--bar-val` per group. |
| **Pips** | `Pips.tsx` | 5-pip step meter (14×10 blocks). Read-only rating, or with `onChange` a stepped control (press/drag a pip, one wheel notch = one step). |
| Segment | `Segment.tsx` | joined cells, 1px rule gaps; off dim, chosen = bone ground/black. `size="sm"` + `label` for a compact row (`SUPPLY [REG STK TRD FAIL]`). Each option carries its own hint. |
| Toggle | `Segment.tsx` → `Toggle` | filled `.btn`; pressed = accent ground. Icon + word. |
| **Cell row** | `CellRow.tsx` | N cells with 3-letter codes under them — what is running. on = raised cell (a bone fill brightens with live `level`), lit = accent, off = hair cell with the code struck through (disabled; the hint says why). |
| **Key/value** | `KeyValue.tsx` | inspector facts: dim key, bone value (any node — Pips, text). |
| **List** | `List.tsx` | selectable rows: 5px tag · name · marker · code. Selected = raised ground, accent name, code on an accent chip. Up/Down keys; right-click → `onContext`. |
| **Badge** | `Badge.tsx` | LOADED / EMPTY state chip in a section head. |
| **Screen** | `Screen.tsx` | the hero frame: accent caption + bone sub-line, the picture, and the hint overlay. One per panel. |
| Buttons | `.btn`, `IconButton.tsx` | filled `--ink-raised` blocks (24px; 18px `sm`), hover `--ink-rule`; pressed = accent. `bare` icons for masthead utilities. Always a `title` on icon-only. |
| Masthead | `Masthead.tsx` | see below. |
| Meter | `Meter.tsx` | segmented canvas meter, bone with an accent peak; `Readout`, `BigReadout`. |
| Modal | `Modal.tsx` | solid black over the canvas, 1px bone box, the confirm button is the only accent. |
| Canvas | `PluginCanvas.tsx` | stage, scale, HintProvider. |
| Knob | `Knob.tsx` | **opt-in only** — see below. |

**Masthead** (alive:drums): the accent **brand block is flush with the panel's top-left corner** — it touches the top and left edges and fills the masthead's full height (never an inset chip) — with the product name in black Space Mono. **PRESETS ▾ is always the first item after it** (current preset name, ellipsised; the preset menu is `PresetMenu.tsx`). Then the outlined 20px header buttons (`buttons`: surfaces/modes like LIBRARY, SPACE, EDIT — 1px rule box, spaced-out caps, 6px gaps; pressed = accent). Spacer, then `right` (seed, bare utilities), version (dim, lowercase v), menu. A plugin without presets leaves the slot empty — never a dead button.

**Knobs are not in the vocabulary.** The dotted tick-ring `Knob` exists only for a user who asks for knobs by name. Continuous = `BarSlider`; stepped = `Pips`, `Segment` or a stepped `BarSlider` (`steps`).

**Stepped parameters**: pass `steps` (number of positions) to `BarSlider`/`useParamDrag` — the value snaps, `onChange` fires only on a step change, and **one wheel notch = one step** (`useWheelSteps` also tames trackpad bursts).

## 7. Hints — every control announces itself

From alive:medium's deck caption. `PluginCanvas` mounts a `HintProvider`; the `Screen` hosts the slot (`<HintSlot/>`, or `<HintSlot variant="line"/>` in a status strip when there is no Screen).

- Hovering or focusing any control shows **`TITLE · VALUE` + one plain sentence** about what it does *to the sound*, in a black panel sliding over the Screen's bottom edge (title in the accent, sentence in bone). Nothing hovered → no overlay.
- Sliders put their **live value** in the title, and keep the slot through a drag.
- **Choices hint the option under the pointer**, not the control: hovering FAIL says what a failing supply does before the click. A list row can add a **preview** (`HintBars`: what loading it would set). Disabled cells say *why* they are off.
- Wire it with `hint` props (`BarSlider hint="…"`, `Segment` options' `hint`, `List` items' `hint`, `CellRow` cells' `hint`) or `useHint()` on your own element. Write hints like alive:medium's: short, concrete, about the sound, no UI jargon.

## 8. Icons

`icons/pixel-icons.ts` (10×10, 1-bit, ours). Render at 10 or 20px, `crispEdges`, `currentColor`. Draw new ones on the grid (ten strings of ten `#`/`.`); never import an outside set, emoji or unicode arrows.

Use them on **buttons, toggles, tabs and utilities** (icon + word, or icon-only with a `title` for the standard utilities: undo, redo, A/B, random, bypass, menu, settings). **Not** before slider labels, key/value keys or section heads — a clean column of words reads calmer (alive:medium). Icons follow the text colour; never an accent icon on black.

## 9. Signature piece (optional — ask)

During design, ask: "Should this plugin have a signature piece? (a) an image that reacts to the audio, (b) a scope or spectrum in the same crunch, (c) a generative shape, (d) none." Recommend (d) for utilities. Never add one unasked.

`SignaturePiece.tsx` + `signature-core.ts` (Canvas2D): the source drawn tiny (`cell` 2–4), posterized to 4 flat inks (`ramp="bone"` default, `"accent"` when it is the hero), boiled by 3 pre-baked noise maps swapped every 140ms, upscaled pixelated. Variants: `image`, `scope`, `spectrum`, `shape`. It lives **inside the Screen** (borderless) or in its own hairline frame. Only the piece crunches — never text or controls. Images must be ours, public domain, or licensed.

## 10. Motion

Hover/press changes are instant; `--dur-ui` (120ms) only to fade an indicator. No springs, slides, blinking or spinners. Meters 30Hz, cell activity ~12–30Hz, boil ~7fps; all stop when the editor is hidden.

## 11. Don'ts

- No raw hex outside `tokens.css`; no `opacity` on text; no `--ink-rule`/`--ink-hair` for readable text.
- No second accent; accent text only for the "now" name; no white text.
- No grain, noise, specks or texture on the ground.
- No border-radius, shadows, gradients, blur or glows.
- No tick-ring knobs unless the user asked for knobs.
- No inset/floating brand chip; no PRESETS button anywhere but first after the brand.
- No fonts but Space Mono (+ Silkscreen for an optional big number); no CDN; no lowercase labels (version and meaningful case excepted).
- No control without a hint.
- No window bigger than the content needs.

## 12. Starting a new plugin

1. Copy the files in §2; import `index.css` first in `main.tsx`.
2. Ask for the accent (§3; accept their own hex if black-on-it ≥ 4.5:1).
3. Ask about a signature piece (§9).
4. List the controls; decide the columns (list · Screen · inspector, or fewer), the smallest window that fits (§5), and tabs if needed.
5. Compose `PluginCanvas` → `Masthead` → `.body` of `.zone`s → optional `StatusStrip`, from the components only (`reference-mockup.tsx` is a complete composition). Write a hint for every control.
6. Screenshot at the design size, scale 2 (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=2 --virtual-time-budget=3000 --window-size=W,H --screenshot=out.png <url>`), once plain and once with a hint showing; run `checklist-plugin.md`, fix, repeat — then show the user.
