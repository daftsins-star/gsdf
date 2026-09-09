# Phase 1 Context: Drive

## Decisions

- Drive is 0..100% on the panel, mapped internally to a 0..24 dB pre-gain with skew 2.0.
- Waveshaper is tanh with antiderivative antialiasing (first-order ADAA), no oversampling.
- Gain compensation is derived from the pre-gain, applied after the shaper, not before.

## Rejected

- 2x oversampling — rejected, ADAA is cheaper for the same aliasing floor at this order.

## Open questions for the planner

- Whether gain compensation is a measured lookup table or a closed-form approximation.
