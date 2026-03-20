# Filter

## Purpose
Shape the frequency content of child audio with a declarative `BiquadFilterNode`.

## Props / Handles
- Key props: `type`, `frequency`, `frequencyBase`, `Q`, `QBase`, `gain`, `gainBase`, `detune`, `detuneBase`, `bypass`.
- Accepts modulatable values for cutoff, resonance, gain, and detune.

## Defaults
- `type` defaults to `lowpass`.
- `frequency` defaults to `350` and `Q` defaults to `1`.

## Integration Notes
- Place `Filter` around oscillators, samplers, or effects returns.
- LFOs and envelopes can modulate `frequency`, `Q`, `gain`, and `detune`.

## Failure Modes
- Unsupported parameter values can produce muted or unstable filtering.
- Missing provider context leaves the filter inert.

## Example
```tsx
const lfo = useLFO({ rate: 0.5, depth: 24 });

<Filter type="lowpass" frequency={1200} gain={lfo} gainBase={3}>
  <Osc autoStart />
</Filter>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
