# StereoPannerNode

## Purpose
Control left-right balance in the playground graph.

## Props / Handles
- Data fields: `pan`, `label`.
- Handles: audio `in`, audio `out`, and pan control input.

## Defaults
- Added from the store with `pan 0` and label `Pan`.

## Integration Notes
- Keep the node type label `panner` aligned across store, engine, and code generation.
- Use for simple stereo placement after sources or effects.

## Failure Modes
- Mismatched type names can break node registration or generated code.
- Pan automation can silently fail if the control handle ID changes.

## Example
```tsx
// Connect Gain -> Pan -> Output to place a source in the stereo field.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
