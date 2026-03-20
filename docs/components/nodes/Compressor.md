# Compressor

## Purpose
Apply dynamic range compression to child audio.

## Props / Handles
- Key props: `threshold`, `knee`, `ratio`, `attack`, `release`, `bypass`, `nodeRef`.
- Wrap any audio subtree that needs level taming.

## Defaults
- Defaults match Web Audio style values: `threshold -24`, `knee 30`, `ratio 12`, `attack 0.003`, `release 0.25`.
- `bypass` defaults to `false`.

## Integration Notes
- Place late in a signal chain before the output bus.
- Combine with analyzer coverage for level checks.

## Failure Modes
- Over-compression can mute transient detail.
- Missing provider context leaves the compressor inactive.

## Example
```tsx
<Compressor ratio={8}>
  <Osc autoStart />
</Compressor>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
