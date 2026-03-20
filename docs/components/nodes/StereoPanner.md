# StereoPanner

## Purpose
Pan audio left or right with a lightweight stereo panner.

## Props / Handles
- Key props: `pan`, `bypass`, `nodeRef`.
- Wrap any mono or stereo subtree that needs left-right placement.

## Defaults
- `pan` defaults to `0`.
- `bypass` defaults to `false`.

## Integration Notes
- Use for quick stereo motion without full 3D positioning.
- Pair with LFO-style modulation for movement.

## Failure Modes
- Missing provider context prevents node creation.
- Extreme pan values may hide balance issues in downstream mixes.

## Example
```tsx
<StereoPanner pan={-0.25}>
  <Osc autoStart />
</StereoPanner>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
