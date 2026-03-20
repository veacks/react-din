# Osc

## Purpose
Generate periodic waveforms as a declarative oscillator source.

## Props / Handles
- Key props: `type`, `frequency`, `frequencyBase`, `detune`, `detuneBase`, `autoStart`, `periodicWave`, `nodeRef`.
- Accepts modulatable frequency and detune values.

## Defaults
- `type` defaults to `sine`.
- `frequency` defaults to `440`, `detune` to `0`, and `autoStart` to `false`.

## Integration Notes
- Combine `Osc` with `Gain`, `Filter`, and `ADSR` for a playable voice.
- Use `nodeRef` when external scheduling needs direct oscillator access.

## Failure Modes
- Reusing a single started oscillator instance can throw if lifecycle assumptions break.
- Without unlock or provider context, no sound starts.

## Example
```tsx
<Osc type="sawtooth" frequency={220} autoStart />
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
