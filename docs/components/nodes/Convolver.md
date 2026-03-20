# Convolver

## Purpose
Apply convolution reverb from an impulse response buffer or URL.

## Props / Handles
- Key props: `impulse`, `normalize`, `onLoad`, `onError`, `bypass`, `nodeRef`.
- Accepts either a decoded `AudioBuffer` or a fetchable impulse path.

## Defaults
- `normalize` defaults to `true`.
- `bypass` defaults to `false`.

## Integration Notes
- Use for impulse-based ambience or cabinet simulation.
- Keep fetch/error handling aligned with docs and tests when loading from URLs.

## Failure Modes
- Failed impulse fetches leave the convolver dry.
- Large impulse buffers can increase memory and startup time.

## Example
```tsx
<Convolver impulse="/impulses/hall.wav">
  <Sampler src="/samples/pad.wav" />
</Convolver>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
