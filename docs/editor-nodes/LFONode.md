# LFONode

## Purpose
Generate low-frequency modulation for connected editor parameters.

## Props / Handles
- Data fields: `rate`, `depth`, `waveform`, `label`.
- Handles: modulation output `out` plus control inputs `rate` and `depth`.

## Defaults
- Added from the store with `rate 1`, `depth 500`, `waveform "sine"`, and label `LFO`.

## Integration Notes
- Every numeric parameter exposes a dedicated target pin and uses connected-value mode when wired.
- Keep modulation-handle naming and depth semantics aligned with engine and generated code.
- Common targets are filter cutoff, gain, and oscillator pitch.

## Failure Modes
- Missing live routing updates can leave connected pins visually updated but sonically stale.
- Unit mismatches for `depth` make modulation feel wrong even when wiring looks correct.
- Missing output registration breaks downstream control routing.

## Example
```tsx
// Connect LFO -> Filter frequency for cyclic cutoff modulation.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
