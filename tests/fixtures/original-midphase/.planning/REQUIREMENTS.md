# Requirements: TestPlug

## v1 (must have)

- REQ-01: Plugin loads in a VST3 host without validation errors.
- REQ-02: A gain parameter exists, range -60..+12 dB, default 0 dB.
- REQ-03: The gain parameter is automatable and reports to the host.
- REQ-04: A webview UI renders a knob bound to the gain parameter.
- REQ-05: A dB readout displays the current gain value.
- REQ-06: A bypass button passes audio through unmodified.

## v2 (later)

- REQ-07: Preset save/load.

## Out of scope

- Oversampling, metering, sidechain input.
