# GSDF Style Guide by Daftsins — Apps

The default look for any desktop or web **app** (not audio plugins) whose project names no other style.

## Identity

A dark, transparent glass app. The desktop shows through one window-wide sheet of frosted, faintly blue-black glass. Panes sit edge to edge on it with 1px white hairlines between them: no gaps, no rounded panes, no shadows inside the window. Only the media/canvas area is solid black. Text is small Geist. One cyan accent marks what is on, selected or primary. Every control has an icon. The app is dense, quiet and precise, and buttons press in.

Reference: `assets/app/reference-mockup.png` (rendered from `reference-mockup.html`). **Look at it before building anything.**

## Files to copy

| From `assets/app/` | To your app | Notes |
|---|---|---|
| `tokens.css` | `src/styles/tokens.css` | Every colour, size, radius and duration. Load it first. |
| `glass.css` | `src/styles/glass.css` | Fonts, base, window sheet, surfaces, scrollbars. Keep the `fonts/` folder next to it, or fix the three `url()`s. |
| `components/components.css` | `src/styles/components.css` | Every control. |
| `fonts/*.woff2` + `OFL.txt` | `src/styles/fonts/` | Geist, Geist Mono, Silkscreen. All OFL 1.1, so ship `OFL.txt`. |
| `components/*.tsx` | `src/ui/` | React + Radix (`npm i radix-ui @phosphor-icons/react`). Optional: they only render the CSS classes. |
| `electron-window.ts` | `src/main/` | Electron only. |
| `icons/phosphor-sprite.svg` | inline in `index.html` | For pages without React (256 symbols, `#ph-NAME`, `#ph-fill-NAME`, `#ph-bold-NAME`). |

Load order: `tokens.css` → `glass.css` → `components.css` → your own CSS. Your own CSS uses tokens only.

With Tailwind, map tokens in `@theme` or write `bg-[var(--fill-3)]`. Never use Tailwind's palette or opacity modifiers.

## Tokens (the ones you will reach for)

- **Ink:** `--ink #F2F4F8` for primary text, `--ink-2 #C5CAD6` for secondary text and resting icons, `--muted #8C93A3` for labels and hints, `--faint #5E6474` for section labels and disabled.
- **Accent:** `--accent #29ADFF`, `--accent-hi` for hover, `--accent-ink` for text on accent, `--accent-soft` (15%) for "on" washes, `--accent-line` for selected borders. To re-brand, change only these.
- **Fills over glass:** white only. Use `--fill-0` .04 for fields at rest, `--fill-1` .045 for cards and tiles, `--fill-2` .06 for pills, `--fill-3` .08 for hover, and `--fill-4` .12 for selected, the switch track and the slider track. Sunken areas use `--well`, black .25.
- **Lines:** `--hair` .10 for every separator and resting border, `--hair-2` .16 for hover and raised borders, `--rim` .28 for the inner top highlight.
- **Status:** `--rec #FF004D`, `--ok #00E436`, `--warn #FFA300`.

## Type

- Geist for UI. Geist Mono for **every number, readout, timecode, path, size and shortcut** (use `tabular-nums`). Silkscreen only for section labels: 9px, uppercase, tracking .08em, `--muted`, with a hairline running to the pane edge (`.gs-section`).
- Sizes: 9 (pix label), 10.5 (hints), 11 (secondary, tooltips, sub-tabs), 11.5 (control labels), **12 (base)**, 12.5 (list rows, search), 13 (titles), 17 (dialog title, the largest text anywhere).
- Weights: 400, and 600 for titles, card names and the primary button. Nothing bolder, nothing above 17px.

## Glass recipe

**Window (Electron/macOS).** `vibrancy: 'hud'`, `visualEffectState: 'active'`, `backgroundColor: '#00000000'`, `titleBarStyle: 'hiddenInset'`, `trafficLightPosition: {x:16, y:17}`. `html`, `body` and `#root` stay transparent. The root carries a 4% wash, `rgba(13,15,22,.04)`. `hud` is the most translucent dark material; `under-window` and `sidebar` read as opaque grey, so don't use them.

**Layers, clearest first:**

| Class | Background | backdrop-filter | Edge | Radius |
|---|---|---|---|---|
| `.gs-pane` docked pane | `rgba(16,18,26,.035)` | `blur(28px) saturate(170%)` | 1px `--hair` between panes, no shadow | 0 |
| `.gs-pane.is-deep` bottom strip | `rgba(10,11,16,.07)` | same | top hair | 0 |
| `.gs-card` group in a pane | white .045 | none | `--hair`; `inset 0 1px 0` white .07 | 12 |
| `.gs-raised` tooltip, dialog | `rgba(28,31,42,.56)` | `blur(30px) saturate(180%)` | `--hair-2`; **lit edge** = `inset 0 1px 0 --rim, inset 0 -1px 0` white .04, `0 18px 50px` black .45 | 7–18 |
| `.gs-float` floating window | `rgba(26,28,38,.9)` | same as raised | lit edge | 16 |
| `.gs-popover` menu, picker | `rgba(14,16,22,.9)` | `blur(48px) saturate(180%)` | lit edge | 12 |
| `.gs-stage` media surround | `#000` | none | none | 0 |

Popovers are near-opaque on purpose: nothing behind them should compete with their rows.

**Dark only.** The `hud` material is dark in both OS appearances. There is no light theme; `color-scheme: dark` is always set.

**Web / Linux / no OS material.** Without vibrancy, a backdrop-filter has nothing to blur and the panes turn flat black. So leave `data-glass` off `<html>`, put `<div class="gs-desk">` first in `body` (a soft multi-colour gradient, `--desk`), and the `.gs-window` sheet becomes `rgba(16,18,26,.56)` with `blur(46px) saturate(185%)`. For a demo or marketing frame, add `.is-framed` to inset the window 14/20px with a 16px radius, a `--hair-2` border and `0 40px 120px black .55`. The Electron snippet sets `?glass=native` for you on macOS and Windows (acrylic).

## Electron window

Use `glassWindowOptions(preload)` from `electron-window.ts` as is: `show:false` until `ready-to-show`, `contextIsolation:true`, `nodeIntegration:false`, min 900×600. For a utility window (launcher, about), use `glassUtilityOptions`: 560×420, not resizable, same material. The title bar is a `.gs-titlebar.gs-drag` with a 56px `.lights` spacer on the left. Every interactive element in it gets `no-drag`, and `glass.css` does that for buttons, inputs and tabs.

## Layout and density

- **One sheet.** Title bar 46px. Below it, a grid of panes: left 272px, centre flexible, right 316px running full height, and an optional bottom strip (~230–290px) spanning left and centre. `AppShell.tsx` builds this. Panes split with hairlines, never gutters.
- **Spacing:** 10px pane padding. Gaps of 2/4/6/8, and 9px between card rows. Heights: button 28, field 30, list row 25, mini 24, segment and number box 22, toolbar and status bar 40, panel header 58.
- **Compact always.** If something feels roomy, halve it.
- **Many features means tabs, not sprawl.** Top-level views of a pane go in a segmented control (`.gs-seg`, 2–4 items, icon + label). Views inside a view go in sub-tab pills (`.gs-subtabs`). A dialog with 5+ sections gets a vertical tab rail (`.gs-vtabs`, 140px). Groups of settings inside a tab are collapsible cards. Never one long scrolling form.
- **Selection inspector:** a 58px `.gs-head` (a 32px accent-soft badge with a filled icon, a 13px semibold title and an 11px mono subline), then tabs, then cards.

## Controls (all in `components.css`; sizes there)

- **Pill `.gs-btn`:** a 28px button with an icon 14 + label. **Primary `.is-primary`:** accent fill with `--accent-ink` 600 text, **one per view, top right**. Use `.is-ghost` for inline actions; `.is-danger` turns red only on hover.
- **Icon button `.gs-ib`:** 30×28, radius 7. Hover is `--fill-3`. On (`aria-pressed`) is an `--accent-soft` wash + accent colour + the **filled** glyph. `.sm` (24px) sits in card headers. Group tools in `.gs-tools`.
- **Mini `.gs-mini`:** a 24px chip with a mono label, for view toggles. **`.gs-play`:** the one white button, in a transport.
- **Tabs:** `.gs-seg`, a well track with a sliding `--fill-4` thumb (set `--i` and `--n`). `.gs-subtabs` are 22px pills. `.gs-vtabs` is the dialog rail, with selected tabs in accent-soft + `--accent-line`.
- **Fields:** `.gs-search` (30px well, magnifier, `⌘F` chip, accent border on focus) and `.gs-input`. Enter or blur commits; Escape cancels.
- **Slider row:** label 84 | 2px track, 12px white knob | a 52px mono number box you drag to scrub. Double-click the row to reset. **Switch:** 30×18, accent when on.
- **List row `.gs-row`:** 25px. A 21px icon tile that turns accent on hover, the name, and a muted hint on the right. **Tiles:** a 2-column grid of 36px two-line chips that lift 1px on hover.
- **Card `.gs-card`:** a 36px header with a grip, a 20px accent badge, a 12/600 title, a hover-only reset, a switch and a chevron. An off card goes to .55 opacity, desaturated, with its title struck through.
- **Menu `.gs-popover.gs-menu`:** 32px rows with an icon, the label and a mono shortcut. Group labels are small uppercase in `--faint`, separated by hair rules.
- **Tooltip `.gs-raised.gs-tip`:** **every icon-only button has one**, showing the name + shortcut, after a 300ms delay.
- **Dialog `.gs-raised.gs-dialog`:** 440px, radius 18, pinned 64px from the top over a 35% scrim. Footer buttons sit on the right, primary last. **Toast:** bottom centre, one line. **Empty / drop:** `.gs-empty` (dotted).

## Icons

**Phosphor**, and lots of them. Every button, tab, menu item, list row, card and empty state gets one; a text-only control is the exception. Glyphs are filled paths on a 256 grid using `currentColor`. Use **regular at rest and fill when on or selected**; bold only for the 14px icon on a primary button. Sizes: 16 for title bar and toolbars, 14 for pills, tabs and menus, 13 for list tiles and card controls, 12 for card badges, 11 for inline meta. Never mix in another icon set or emoji.

## Motion

There are three durations and one curve: press 100ms, standard 170ms, arrive 240ms, all on `cubic-bezier(.2,.8,.2,1)`.

- Buttons scale to .97 on `:active` (icon buttons to .9, list rows to .98).
- Popovers, menus and tooltips grow in from .96 + fade over 170ms, from their trigger's side.
- Dialogs arrive over 240ms.
- Segmented thumbs slide and chevrons rotate over 170ms.

Under `prefers-reduced-motion`, every transition becomes a 170ms opacity fade; `tokens.css` already does this. Never animate layout on hover.

## Don'ts

- No light theme, and no opaque grey panels. If a pane looks like solid grey, the glass is broken.
- No gutters or radii between docked panes. No drop shadows inside the window, only on floating things.
- No raw hex or rgba in component code: tokens only. Media/photo content is the one exception.
- No second accent colour, and no gradients on controls.
- Text never goes above 17px or bolder than 600.
- No icon-only button without a tooltip, and no text-only toolbar.
- No `under-window` or `sidebar` vibrancy. No `backdrop-filter` with nothing behind it (use the web fallback instead).
- Don't use Tailwind opacity modifiers for colours.

## Starting a new app

1. Copy the files from the table. Add `<html lang="en">` plus `<div class="gs-desk"></div><div class="gs-window">…</div>` (or use `AppShell`).
2. In Electron, use `createGlassWindow(preload, url)` and set `data-glass="native"` from `?glass=` before first paint.
3. Build the title bar first: lights spacer, brand (22px mark + name), tool group, centred project title with a mono-ish meta line, then undo/history icons, a Project pill and the primary action.
4. Lay out the panes, then put tabs at the top of any pane with more than one job.
5. Fill each pane with section labels, rows, tiles and cards from `components.css`, with an icon on everything.
6. Screenshot it (headless Chrome for web; a real window capture for Electron), put it next to `reference-mockup.png`, and run `checklist-app.md`. Fix every failing check before you show the user.
