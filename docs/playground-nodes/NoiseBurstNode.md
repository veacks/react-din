# NoiseBurstNode

## Purpose
Trigger one-shot white, pink, or brown noise bursts from event and sequencer triggers.

## Props / Handles
- Data fields: `noiseType`, `duration`, `gain`, `attack`, `release`, `label`.
- Handles: trigger target `trigger`, audio output `out`, parameter targets `duration`, `gain`, `attack`, `release`.

## Defaults
- Added with `noiseType white`, `duration 0.1`, `gain 1`, `attack 0.001`, `release 0.05`, and label `Noise Burst`.

## Integration Notes
- Trigger connections are supported from `stepSequencer`, `pianoRoll`, and `eventTrigger`.
- Envelope times must stay real-time editable while playback is running.

## Failure Modes
- Burst length mismatches can make short UI feedback sounds smear.
- Trigger routing drift can make the node appear connected but silent.

## Example
```tsx
// EventTrigger -> NoiseBurst -> Filter -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
