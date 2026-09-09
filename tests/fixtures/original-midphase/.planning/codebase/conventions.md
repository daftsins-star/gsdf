# Conventions

- Parameter IDs are lowercase snake_case string literals in `Source/ParamIDs.h`. Never retyped.
- DSP classes are header-only under `Source/dsp/`, no JUCE dependency, testable standalone.
- `processBlock` allocates nothing; all buffers are sized in `prepareToPlay`.
- Every parameter change goes through APVTS; the editor never holds its own copy of a value.
- JS talks to C++ only through the `window.juce` bridge in `ui/src/bridge.js`.
