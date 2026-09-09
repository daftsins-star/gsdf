# TestPlug

## Vision

A minimal JUCE gain plugin with a webview UI. One gain knob, a dB readout, and a bypass
button. Built to prove the shared DSP core + webview UI pattern end to end before any
of the real sinemill plugins adopt it.

**Core value:** the UI can be opened and iterated on in a browser, with no DAW in the loop.

## Users

Me, plus two beta testers who run Ableton Live 12 and Logic Pro on Apple Silicon.

## Constraints

- macOS first, Windows second. VST3 and AU.
- No third-party DSP libraries.

## Key Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-08-14 | Webview UI over native JUCE components | Iteration speed |
