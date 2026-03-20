# ConstantSource

## Purpose
Emit a constant control value inside the audio graph.

## Props / Handles
- Key props: `offset`, `autoStart`, `active`, `nodeRef`.
- Useful for control-rate style modulation or fixed parameter driving.

## Defaults
- `offset` defaults to `1`.
- `autoStart` defaults to `false`.

## Integration Notes
- Feed control inputs that accept audio-rate or constant modulation.
- Keep scheduling assumptions aligned with LFO and node control docs.

## Failure Modes
- If never started, the source produces no control output.
- Missing provider context prevents node creation.

## Example
```tsx
<ConstantSource offset={0.5} autoStart />
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
