# GSDF Style Guide by Daftsins — App checklist

Run this on **your own screenshot** before showing the user anything. Put the screenshot next to `assets/app/reference-mockup.png` and look at both. Every line is PASS or FAIL. Fix every FAIL, take a new screenshot and run the list again. Report the result in one line, e.g. "checklist-app: 24/24 pass".

**Taking the screenshot**
- Web: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=1 --screenshot=out.png --window-size=1520,960 file:///abs/path/index.html`, with no `data-glass` (web fallback).
- Electron: capture the real window over a colourful desktop (`screencapture -l <windowid>`, or the app's own capture). A renderer readback cannot see vibrancy.

## Glass (look at the image)

1. **Glass is visible.** Colour from behind the window (desk or desktop) tints the panes, and the panes are not flat black or flat grey.
2. **Panes are one sheet:** edge to edge, separated by 1px hairlines, with no gutters and no rounded corners between panes.
3. **Only the media/canvas surround is opaque** (black). Nothing else is a solid block.
4. **Raised things are lit.** Popovers, menus, tooltips and dialogs show a bright 1px top edge, a soft drop shadow and a `--hair-2` border, and menus are legible over busy content.
5. **No drop shadows inside the window** on panes, cards, rows or buttons; shadows belong only to floating surfaces and knobs.
6. **Dark only.** No white or light-grey panel anywhere.

## Density and structure

7. **Title bar is 46px**, with traffic lights (or a 56px spacer) at the left, a centred title, and the primary action at the far right.
8. **Compact:** buttons 28px, list rows 25px, base text 12px. No control is taller than 32px except panel headers (58px).
9. **Many features means tabs.** Any pane with more than one job has a segmented control or sub-tabs at its top. No pane is one long form.
10. **Settings groups are cards** (12px radius, hair border, inner top highlight) with a 36px header: icon badge, title, switch, chevron.
11. **Section labels** are Silkscreen 9px uppercase in `--muted`, with a hairline running to the edge.
12. **Numbers are mono.** Values, timecodes, sizes, counts and shortcuts are Geist Mono with tabular figures.

## Icons and colour

13. **Icons everywhere:** every button, tab, menu item, list row and card header has a Phosphor glyph. A text-only toolbar is a FAIL.
14. **One icon set, one style:** Phosphor regular at rest and fill when on or selected. No emoji, no other set, no stroke-weight mix.
15. **One accent.** Only `--accent` marks on, selected, focus and primary, and status colours appear only as status.
16. **Exactly one primary (accent-filled) button** per view.
17. **Every icon-only button has a tooltip** (hover one in a live check, or confirm `aria-label` / `data-tip` in code).

## Code (run these, don't eyeball)

18. **No raw colours in components.** This must print nothing, apart from lines commented as media content:
    `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(" src --include=*.css --include=*.tsx --include=*.ts --include=*.html | grep -v tokens.css | grep -v glass.css`
19. **Radii come from the scale:** `var(--r-1..6)`, `--r-pill` or 50%. `grep -rnE "border-radius: ?[0-9]+(px|rem)" src | grep -v -e tokens.css -e glass.css` prints nothing.
20. **Text sizes come from the scale** (9 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 17), and none is above 17px or bolder than 600.
21. **Durations are the three tokens:** `grep -rnE "[0-9]+m?s (ease|cubic|linear)" src | grep -v tokens.css` prints nothing.
22. **Load order** is tokens.css → glass.css → components.css → app CSS, and `fonts/OFL.txt` ships with the fonts.
23. **Electron only:** BrowserWindow has `vibrancy:'hud'`, `visualEffectState:'active'`, `backgroundColor:'#00000000'` and `titleBarStyle:'hiddenInset'`; `html`, `body` and the root are transparent; and `data-glass="native"` is set before first paint.
24. **Reduced motion:** with `prefers-reduced-motion`, transitions are opacity fades only (tokens.css handles this, so check it wasn't overridden).

## Compare with the reference

Side by side with `reference-mockup.png`, the two should look like the same product family: the same glass tint, hairlines, control heights, icon density and accent use. If yours looks heavier, emptier, rounder or more colourful, find the token you departed from and return to it.
