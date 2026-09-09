# Requirements: Sampler

## v1 (must have)

- REQ-01: A folder of WAVs can be dropped on the plugin and is mapped across the keyboard.
- REQ-02: Playback streams from disk with a preloaded head buffer.
- REQ-03: Voices are allocated with a fixed pool; no allocation on the audio thread.
- REQ-04: Transport-synced looping with sample-accurate loop points.
- REQ-05: A crossfade of configurable length smooths the loop join.

## v2 (later)

- REQ-06: Round-robin and velocity layers by filename convention.

## Out of scope

- Time-stretching, pitch detection, built-in effects.
