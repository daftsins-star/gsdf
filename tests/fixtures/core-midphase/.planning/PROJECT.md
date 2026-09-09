# Sampler

## Vision

A disk-streaming sampler plugin. Loads a folder of WAVs, maps them across the keyboard by
filename convention, and streams from disk so multi-gigabyte libraries load instantly.

**Core value:** dropping a folder on the plugin should be the entire setup step.

## Users

Sound designers with large personal sample libraries who do not want to build an instrument
in Kontakt to audition them.

## Constraints

- Streaming must never allocate or block on the audio thread.
- macOS and Windows, VST3 and AU.
