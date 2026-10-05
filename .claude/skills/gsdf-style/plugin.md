# GSDF Style Guide by Daftsins — plugins

The default look for an audio-plugin GUI (JUCE + React WebView) whose project names no other style. Derived from the code of two shipped plugins, alive:medium and alive:drums. The code in `assets/plugin/` is the spec; this page says how to use it. Look at `assets/plugin/reference-mockup.png` first — that is the target.

## 1. Identity

A small black instrument panel printed in one bone ink. Pixel type for names and numbers, mono type for everything else, everything UPPERCASE. 1px hairlines split the panel into zones; nothing is rounded, nothing casts a shadow, nothing has a gradient. Hierarchy comes from four fixed steps of the bone ink, not from size or weight. Each plugin claims exactly one accent colour, and the accent only ever means "on / selected / now" — it is a ground or a mark, never text. Small pixel icons sit beside nearly every label. Test equipment with a screen-printed faceplate: dense, quiet, exact.

## 2. Files to copy, and where

| From `assets/plugin/` | To `ui/src/` | Notes |
|---|---|---|
| `tokens.css` | `index.css` | :root tokens + @font-face. Change only `--color-accent`. |
| `base.css` | top of `App.css` | resets, stage/canvas, shared type, `.btn`, `.select`, `.zone` |
| `fonts/*.woff2`, `fonts/OFL.txt` | `assets/fonts/` | OFL-1.1; ship `OFL.txt`, list them in third-party notices |
| `components/*` | `components/` | each `.tsx` imports its own `.css` |
| `icons/*` | `icons/` | `pixel-icons.ts` + `Icon.tsx` |

`main.tsx` must `import './index.css'` **before** `import App from './App'`. Without it tokens and fonts are never bundled and the UI silently falls back to system fonts — it still builds, so nothing warns you. Fonts are bundled, never fetched: a plugin runs offline.

Components are bridge-agnostic: continuous controls take a normalised `value` (0..1) plus `onBegin / onChange / onEnd`. Wire them to the JUCE bridge as `beginGesture / setParam / endGesture`. `onChange` already fires at most once per animation frame; if the bridge still floods, pass `commitOnly` (one `setParam` on release, as alive:drums does). Always repaint from the host value when not dragging, so automation is visible.

## 3. Tokens and colour

Read `tokens.css`; it is commented line by line. The system:

- **Three primitives**: `--color-bg #000000`, `--color-bone #ded3bc`, `--color-accent`. Nothing else is a colour.
- **The bone ladder**, pre-composited on black so declared contrast = rendered contrast: `--ink-text` (1.0), `--ink-dim` (0.65), `--ink-rule` (0.40, hairlines only), `--ink-hair` (0.16, wells/tracks/hover wash only). Rule and hair are never text. Never use `opacity` on text or a text ancestor — pick a step.
- **Roles**: `--ink-live` = the accent. `--ink-on-accent` and `--ink-on-bone` = black. Text on an accent or bone fill is always black, never white.
- **Two kinds of "selected"**: an option chosen among siblings (segment cell) is a **bone** ground; a state that is on or live (toggle, tab, bypass, armed, brand chip, peak) is an **accent** ground.
- Component CSS uses `var(--…)` only; a raw hex outside `tokens.css` is a bug.

**Accent list** — pick one per plugin, never two. All carry black text at ≥ 5:1 and read as distinct from bone.

| Name | Hex | Black on it | vs bone | Note |
|---|---|---|---|---|
| Orange | `#f08a24` | 8.4:1 | 1.7:1 | alive:drums. Default in tokens.css |
| Olive | `#7a8761` | 5.5:1 | 2.6:1 | alive:medium. Quiet; best for subtle tools |
| Vermilion | `#e2553a` | 5.6:1 | 2.5:1 | loud; avoid on anything that also shows clipping |
| Teal | `#3fa394` | 6.9:1 | 2.1:1 | cool, technical |
| Sky | `#7ea7d8` | 8.4:1 | 1.7:1 | soft; good for reverbs/space |
| Rose | `#d67f93` | 7.3:1 | 1.9:1 | warm, characterful |
| Lilac | `#9f8bd0` | 7.1:1 | 2.0:1 | dreamy, modulation |
| Mint | `#6fc29a` | 9.9:1 | 1.4:1 | bright; keep fills small |

Rejected: yellows (merge with bone), acid green, pure red (reads as error), white.

## 4. Type

- `--font-display` **Silkscreen** (pixel face): the brand chip, knob values, big read-outs, slot/section numerals. Never sentences.
- `--font-body` **Space Mono**: every label, button, tab, value row, hint. 700 only where two labels must separate.
- Scale (px): nano 8 · micro 9 · xs 10 · sm 11 · base 13 · lg 18 · xl 26 · 2xl 38. No other sizes. The canvas base is xs/10px, uppercase, `--track-body` 0.04em, line-height 1.
- Labels/buttons/tabs: micro 9px, `--track-caps` 0.16em, `--ink-dim` (labels) or `--ink-text` (buttons). Values: xs 10px `--ink-text`, tabular. Hints: nano 8px `--ink-dim`.
- One `--text-xl` number per screen at most (`BigReadout`). Units go after values in `.lbl` style, never in the display face.

## 5. Layout, window, density, tabs

- **Window**: design at **620 × 410** (alive:medium and alive:drums both ship this). Acceptable range for a new plugin 560–720 wide at the same ~3:2; if it doesn't fit, add a tab, don't grow the window. Native editor: aspect-locked, resizable 0.5×–2.5× (310×205 … 1550×1025). `PluginCanvas` scales the whole panel as one piece; nothing inside reflows, and nothing inside uses vw/vh.
- **Rows**: masthead 22px · optional tab row 18px · body · status strip 22px. Fixed heights (`--row-*`).
- **Body**: 2–3 vertical `.zone`s split by one `--ink-rule` hairline. Zone padding 6/9px, internal gap 4px. Inside a zone, sections are a `.sec-hd` (label left, hint right) and separated by `.hr`. Typical columns: 170–190 / fill / 170–180.
- **Density**: tight. Control heights 15 / 18 / 22px, gaps from the 2-4-6-9-12-16-22 scale. No empty card padding; empty space in a zone means the content belongs in fewer zones or the window is too big.
- **Grain**: the ground carries a fixed 1-bit speckle (`paintGrain`, density 0.055). Leave it on.
- **Tabs**: when a plugin has more than one feature group — or the controls don't fit 620×410 at these sizes — use `TabBar`, never a bigger window. `placement="row"` (18px row, 3–6 tabs, icon + word, hairline-separated, selected = accent ground, optional right-hand status) is the default (pass `tabs` to `PluginCanvas` to add the row); `placement="mast"` (15px hairline buttons in the masthead) for 2–4 modes/surfaces. Masthead, status strip and any global I/O stay outside the tabs. Keep the selected tab in plugin state.

## 6. Controls

Every control: hairline (`--ink-rule`) at rest, `--ink-text` border on hover, accent while live. No transitions on hover.

| Control | File | States |
|---|---|---|
| Knob | `Knob.tsx` | 270° ring of 2×2 ticks; lit `--ink-text`, unlit `--ink-hair` (hover `--ink-rule`); dragging lights accent. Value in Silkscreen inside, label + icon under. Sizes 26 / 34 / 44 only; one row of 44s for the main controls, 34s for the rest. Bipolar fills from top-centre. |
| Bar slider | `BarSlider.tsx` | `LABEL [9px bar] VALUE`. Well `--ink-hair` (hover `--ink-rule`), fill bone, accent while dragging; bipolar gets a 1px `--ink-dim` zero tick. Press jumps, Shift = fine. Prefer it in dense side columns. |
| Shared drag | `useParamDrag.ts` | knob vertical (160px = full range), bar horizontal; Shift ×0.1; double-click = default; wheel = 1% step. |
| Segment | `Segment.tsx` | joined cells, 1px rule gaps; off `--ink-dim`, chosen = bone ground/black text. 2–8 options; more is a `.select`. |
| Toggle | `Segment.tsx` → `Toggle` | `.btn`; pressed = accent ground, black icon + text. Always icon + word. |
| Icon button | `IconButton.tsx` | 15px (sm) or 18px (md) square; `pressed` = accent ground; `bare` = no box, `--ink-dim` → `--ink-text` (masthead utilities). Always a `title`. |
| Masthead | `Masthead.tsx` | brand chip (accent ground, Silkscreen, black, full row height; `MAKER:PRODUCT` or `PRODUCT`), preset button (list icon + name + caret), mode buttons, spacer, bare utilities (undo, redo, A/B, randomise), bypass as a pressed-able power IconButton, version (nano, lowercase v), menu. |
| Tab bar | `TabBar.tsx` | see §5. |
| Meter | `Meter.tsx` | Canvas, 3px segments / 1px gaps, 9px thick; lit bone, unlit hair, peak-hold accent (1s), over-0dB latch accent until clicked. 30Hz, paused when hidden. dB value as HTML `.val` beside it. |
| Read-outs | `Meter.tsx` → `Readout`, `BigReadout` | label/value rows with icon; one big Silkscreen number per screen. |
| Status strip | `StatusStrip.tsx` | 22px bottom row: IN meter · message (nano, dim) · OUT meter. |
| Modal | `Modal.tsx` | solid black over the canvas (no veil), 280px box, 1px bone border, Silkscreen title, the confirm button is the only accent. Render inside the canvas. |
| Canvas | `PluginCanvas.tsx` | stage, scale, grain. |

Text inputs and selects use `.select` / a 22px field with a rule border; focus = `--ink-text` border, no glow. Canvases never contain text.

## 7. Icons

Icons are ours: `icons/pixel-icons.ts` (54 glyphs, original to this guide, no licence attached). Rules for using and adding:

- **Grid**: 10×10, 1-bit, one cell = one CSS px. Render at 10px (1×) or 20px (2×) only. `shape-rendering: crispEdges`, `fill: currentColor`.
- **Drawing**: 1-cell lines, solid masses with cut-outs (dice, lock), no diagonals thinner than a stair-step, no curves, at least one row or column of air. Add a new icon by drawing ten strings of ten `#`/`.` — `Icon.tsx` turns it into one path. Never pull icons from an outside set (they are stroked, anti-aliased, and off-grid).
- **Use lots of them**: every tab, toggle, knob label, bar-slider label, read-out and utility gets one. Icon + word is the default; icon-only is for well-known utilities (undo, redo, A/B, randomise, bypass, menu, save, load, copy, delete) and always carries a `title`.
- Colour follows the text: dim beside a dim label, black on an accent ground. Never colour an icon accent on black.

## 8. Signature piece (optional — ask)

One crunchy, audio-reactive picture can give a plugin its face. It is **optional**: during design, ask the user — "Should this plugin have a signature piece? (a) an image that reacts to the audio, (b) a visualizer — scope or spectrum — drawn in the same crunch, (c) a generative shape, (d) none." Recommend (d) for utilities. Never add one unasked.

`components/SignaturePiece.tsx` + `signature-core.ts` (Canvas2D, no WebGL), from sineTune's MOUTHPIECE technique re-coloured into this palette:

1. draw the source into a tiny buffer (CSS size ÷ `cell`; cell 2–4, default 3) — the smallness is the pixel crunch;
2. posterize luminance to 4 flat inks — `ramp="bone"` (black/hair/dim/bone, default) or `ramp="accent"` (black/rule/accent/bone, when the piece is the plugin's hero);
3. **boil**: displace by one of 3 pre-baked noise maps, swapped every 140ms (`--boil-ms`). Never regenerate noise per frame;
4. upscale with `image-rendering: pixelated`.

Variants: `source={{kind:'image', image, width, height}}` (cover-fit, zooms ≤10% and brightens with level), `{kind:'scope', getSamples}`, `{kind:'spectrum', getBins}`, `{kind:'shape', seed}`. `getLevel()` returns a smoothed 0..1 level. Fit: one per plugin, in a hairline frame, occupying a zone section (square is safest), labels outside it in a `.sec-hd`. Only the piece crunches: a whole-UI boil/pixelate pass was tried in sineTune and rejected — it destroys legibility. Images must be ours, public domain, or licensed for the product.

## 9. Motion

- Hover/press state changes are instant. `--dur-ui` (120ms) only for fading an indicator in/out.
- No springs, no slides, no blinking (an armed state is a static inverted field), no spinners (loading = a static centred mark).
- Meters/visualizers 30Hz, signature boil ~7fps, its source ≤30fps; all stop when the editor is hidden.

## 10. Don'ts

- No raw hex outside `tokens.css`; no `opacity` on text; no `--ink-rule`/`--ink-hair` text.
- No second accent, no accent text, no white text on a fill.
- No border-radius, shadows, gradients, blur, glass, or outer glows.
- No fonts other than Silkscreen + Space Mono; no CDN; no lowercase labels (version string excepted).
- No sizes off the type, spacing, control or knob scales.
- No icon fonts, emoji, or unicode arrows as icons (they fall back to system fonts) — use `Icon`.
- No window bigger than ~720×480 to fit features — tab instead.
- No crunch/boil on text or controls.

## 11. Starting a new plugin

1. Copy the files in §2. Add the `index.css` import to `main.tsx` before App.
2. Ask the user for the accent (offer §3's list with a recommendation, and accept their own hex if it passes black-on-it ≥ 4.5:1); set `--color-accent`.
3. Ask whether it wants a signature piece (§8), and which variant.
4. List the controls; group them. More than one group, or not fitting 620×410 → plan tabs (§5).
5. Build `PluginCanvas` → `Masthead` → `TabBar` (if any) → zones → `StatusStrip`, using only the components. Put plugin layout (grid columns, zone order) in `App.css` with tokens only — see `reference-mockup.tsx` for a complete composition.
6. Give every control an icon (§7); draw new glyphs on the 10×10 grid as needed.
7. Screenshot at 620×410, device scale 2 (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=2 --virtual-time-budget=3000 --window-size=620,410 --screenshot=out.png <url>`), run `checklist-plugin.md` against it, fix, repeat — then show the user.
