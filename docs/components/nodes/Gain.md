# Gain

## Purpose
Apply declarative gain control to a subtree of the audio graph.

## Props / Handles
- Key props: `gain`, `gainBase`, `rampTo`, `rampType`, `bypass`, `nodeRef`.
- Accepts audio children and forwards audio to the parent bus.

## Defaults
- `gain` defaults to `1`.
- `bypass` defaults to `false`.

## Integration Notes
- Use inside `AudioProvider`.
- Pair with `Osc`, `Filter`, `ADSR`, or `LFO` for modulation and envelope control.

## Failure Modes
- Without a provider, the node cannot create a live `GainNode`.
- Extreme automation values can flatten expected dynamics.

## Example
```tsx
<Gain gain={0.5}>
  <Osc autoStart />
</Gain>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
