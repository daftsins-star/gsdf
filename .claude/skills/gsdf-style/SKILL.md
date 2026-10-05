---
name: gsdf-style
description: The GSDF Style Guide by Daftsins — the default look for any UI whose project names no other style. Plugins (JUCE + React WebView audio plugins) get alive:medium's refined black-and-bone instrument panel in alive:drums' colours and masthead — bar sliders, pips, cell rows, a list, a Screen and hover hints on every control, one accent, an optional audio-reactive signature piece; apps (Electron, desktop or web) get the translucent glass look. Use whenever designing, mocking up, building, restyling or reviewing a UI in a GSDF project, when `gsdf cfg ui_style` is `gsdf`, or when the user asks for "the GSDF style", "the house style", "the Alive look" or "the glass look".
---

# GSDF Style Guide by Daftsins

Two looks, one rule: **the files in `assets/` are the spec — copy them, don't reinterpret them.**
The prose explains how to use the code; where the two disagree, the code wins.

## Pick the half

| Building | Read | Target picture | Before showing the user |
|---|---|---|---|
| An audio plugin GUI (VST3/AU/CLAP, JUCE + WebView) | `plugin.md` | `assets/plugin/reference-mockup.png` | `checklist-plugin.md` |
| An app — Electron, desktop, web tool, anything that isn't a plugin | `app.md` | `assets/app/reference-mockup.png` | `checklist-app.md` |

Look at the target picture first, then read the guide, then copy the assets it names.
A project that names its own style (PROJECT.md, a `UI-STYLE-GUIDE.md`, the user) overrides this
skill entirely — don't blend the two.

## What both halves share

The user's taste, which both guides encode as rules:
- **Small, but not cramped.** The smallest window that fits the content; grow only when it needs to. When things don't fit, add a tab before shrinking type.
- **Icons on actions.** Icons on buttons, toggles, tabs and utilities; icon buttons wherever a word isn't needed. Plain words for labels.
- **Tabs for breadth.** Many features become tabs or tab-like pages, never one sprawling panel.
- **The UI explains itself.** (Plugins) every control announces what it does in a hint slot while you point at it.

## Mockups

A mockup phase delivers 2–3 **real variants** (layout, density, where the signature piece sits),
each a self-contained HTML file in `.planning/design/`, built from this skill's assets so the
chosen one carries straight into the build. A recolour is not a variant.

## The signature piece (plugins)

Always **ask** during discuss — never add one unasked, never skip the question. It is one
audio-reactive element — a picture that reacts to the sound, a visualizer, an animated shape —
drawn with `components/SignaturePiece` in the grunge treatment: posterized to a few flat colours
from the palette, pixel-crunched, gently wobbling. `plugin.md` §8 has the variants and the rules
that keep it fitting the rest of the panel.

## Done means

You screenshotted your own UI at the shipped size, ran the matching checklist against it, fixed
every failure, and only then showed the user — already rebuilt (`gsdf rebuild`).
