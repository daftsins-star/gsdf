---
phase: NN
---
# Findings — Phase NN

Durable knowledge this phase produced, pre-judged and ready to become vault notes.
`lb-promote.py <this file>` writes each `##` section straight into the knowledge
vault, skipping living-brain's Inbox — the judgement of what matters happened here,
when the lesson was learned, instead of being re-derived from a summary later.

**What belongs here.** Something that will be true on a different project. The
misconception that let a bug survive review, not the bug. A tool's behaviour that
contradicted a reasonable expectation. A guard that turned out to prove nothing.

**What does not.** The fix itself — that is `NN-MM-SUMMARY.md`. What changed and why
— that is `NN-ITERATIONS.md`. Project history, dates, phase counts, renames — nothing.

**None is a normal answer.** Most phases yield one or two findings. A phase that
taught nothing reusable should say so and ship an empty file, or no file at all.
Padding this with project history is the exact failure the format exists to avoid.

**Field reference.** `cluster:` is the vault subfolder — Lessons (default), JUCE, DSP,
Realtime, Practice, Craft, Domains, Formats; anything else creates that folder.
`symptoms:` are the words used BEFORE the cause was known — the field that makes a note
findable next time, most often skipped, most often regretted. `see:` takes wikilinks, and a
link to a note that does not exist yet is fine: it marks something worth writing.

Each `##` heading becomes one note, titled as the note will be titled — a claim, not
a topic. "A Mirrored Constant Fails Silently In Both Directions", not "Constants".

## <The lesson, stated as a claim>

cluster: Lessons
symptoms: ["how someone describes this before they know the cause", "another phrasing"]
see: [[An Existing Note]], [[Another]]

What the lesson is. Why it matters and when it bites. Enough detail that it is
actionable without this project's context, and honest about what was actually
measured versus what was inferred.

