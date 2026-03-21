# WaveShaperNode

## Purpose
Apply preset-based waveshaping with a single `amount` control for fast sound design.

## Props / Handles
- Data fields: `amount`, `preset`, `oversample`, `label`.
- Handles: audio input `in`, audio output `out`, parameter target `amount`.

## Defaults
- Added with `amount 0.5`, `preset softClip`, `oversample 2x`, and label `WaveShaper`.

## Integration Notes
- Preset-to-curve generation must stay synchronized between engine, preview, and code export helpers.
- `amount` handle uses connected-value mode when patched.

## Failure Modes
- Inconsistent curve formulas cause audible drift between runtime and generated code.
- Oversample mismatch can change aliasing behavior.

## Example
```tsx
// Distortion -> WaveShaper -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
