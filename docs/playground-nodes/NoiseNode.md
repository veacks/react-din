# NoiseNode

## Purpose
Provide a noise source node on the playground canvas.

## Props / Handles
- Data fields: `noiseType`, `label`.
- Handles: audio `out`.

## Defaults
- Added from the store with `noiseType "white"` and label `Noise`.

## Integration Notes
- Keep noise-type lists aligned across UI controls, store defaults, and engine behavior.
- Route into gain, filters, or envelopes for percussion and textures.

## Failure Modes
- UI options drifting from engine support create invalid selections.
- Without downstream routing, the node appears present but remains inaudible.

## Example
```tsx
// Connect Noise -> Gain -> Output for a quick noise source.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
