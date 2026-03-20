# LFONode

## Purpose
Generate low-frequency modulation for connected playground parameters.

## Props / Handles
- Data fields: `rate`, `depth`, `waveform`, `label`.
- Handles: modulation output.

## Defaults
- Added from the store with `rate 1`, `depth 500`, `waveform "sine"`, and label `LFO`.

## Integration Notes
- Keep modulation-handle naming and depth semantics aligned with engine and generated code.
- Common targets are filter cutoff, gain, and oscillator pitch.

## Failure Modes
- Unit mismatches for `depth` make modulation feel wrong even when wiring looks correct.
- Missing output registration breaks downstream control routing.

## Example
```tsx
// Connect LFO -> Filter frequency for cyclic cutoff modulation.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
