# Requirements: Widget

## v1 (must have)

- **REQ-01**: A drive parameter, range 0..100%, default 25%, exposed to the host as an
  automatable parameter and displayed as a whole percentage.
- **REQ-02**: Waveshaping with antiderivative antialiasing, so a 1 kHz sine at full drive
  keeps its alias floor below -80 dBFS.
- **REQ-03**: Output gain compensation so drive does not change perceived loudness; the
  spread across the range stays within 1 LU.
- **REQ-04**: A webview UI with a single knob and a level meter.

## Out of scope

- Oversampling controls, a tone stack, and presets. (The gain compensation in REQ-03 is not
  a loudness normaliser and does not imply one.)
