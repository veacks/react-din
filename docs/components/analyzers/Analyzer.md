# Analyzer

## Purpose
Inspect audio data at a point in the graph and publish FFT, waveform, RMS, and peak information.

## Props / Handles
- Key props: `fftSize`, `smoothingTimeConstant`, `minDecibels`, `maxDecibels`, `onAnalyze`, `updateRate`, `autoUpdate`, `nodeRef`.
- Accepts child audio and forwards analyzed output upstream.

## Defaults
- `fftSize` defaults to `2048`.
- `updateRate` defaults to `60` and `autoUpdate` to `true`.

## Integration Notes
- Use on master or local branches depending on the insight needed.
- Keep analyzer data shape changes aligned with hooks and docs.

## Failure Modes
- Overly aggressive update rates can waste work.
- Without a callback or context, analysis data is not surfaced.

## Example
```tsx
<Analyzer onAnalyze={console.log}>
  <Osc autoStart />
</Analyzer>
```

## Test Coverage
- Automated: `tests/library/analyzers.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
