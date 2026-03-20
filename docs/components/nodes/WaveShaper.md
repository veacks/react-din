# WaveShaper

## Purpose
Apply custom waveshaping curves to child audio.

## Props / Handles
- Key props: `curve`, `oversample`, `bypass`, `nodeRef`.
- Accepts a `Float32Array` shaping curve or `null` for passthrough.

## Defaults
- `curve` defaults to `null`.
- `oversample` defaults to `none`.

## Integration Notes
- Use for custom distortion or non-linear shaping stages.
- Align curve changes with listening tests when tone is user-facing.

## Failure Modes
- Invalid curves can flatten the signal or clip aggressively.
- Missing provider context leaves the node inactive.

## Example
```tsx
<WaveShaper curve={new Float32Array([-1, 0, 1])}>
  <Osc autoStart />
</WaveShaper>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
