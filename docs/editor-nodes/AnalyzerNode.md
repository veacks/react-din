# AnalyzerNode

## Purpose
Monitor RMS/peak and spectrum data inline while tuning UI feedback graphs.

## Props / Handles
- Data fields: `fftSize`, `smoothingTimeConstant`, `updateRate`, `autoUpdate`, `label`.
- Handles: audio input `in`, audio output `out`.

## Defaults
- Added with `fftSize 2048`, `smoothingTimeConstant 0.8`, `updateRate 60`, `autoUpdate true`, and label `Analyzer`.

## Integration Notes
- Place before `Output` for end-of-chain monitoring.
- Keep pass-through routing and analysis configuration synchronized.

## Failure Modes
- Invalid FFT sizes can throw runtime errors.
- Missing pass-through routing can break the audible path.

## Example
```tsx
// ... -> Analyzer -> Output.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
