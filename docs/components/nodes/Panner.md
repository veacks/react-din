# Panner

## Purpose
Position audio in three-dimensional space.

## Props / Handles
- Key props: `positionX`, `positionY`, `positionZ`, `orientationX`, `orientationY`, `orientationZ`, `panningModel`, `distanceModel`, `refDistance`, `maxDistance`, `rolloffFactor`, `cone*`.
- Wrap sources or submixes that need spatial placement.

## Defaults
- Position defaults to the origin.
- `panningModel` defaults to `equalpower` and `distanceModel` to `inverse`.

## Integration Notes
- Use with moving scene state or static spatial placements.
- Keep browser-specific smoke checks for true 3D audio behavior.

## Failure Modes
- Unsupported browser audio features reduce spatial fidelity.
- Extreme distance settings can make audio effectively silent.

## Example
```tsx
<Panner positionX={2} positionZ={-4}>
  <Sampler src="/samples/ambience.wav" loop autoStart />
</Panner>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
