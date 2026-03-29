# MixNode

## Purpose
Interpolate between two values using a mix factor.

## Props / Handles
- Data fields: `a`, `b`, `t`, `clamp`, `label`.
- Handles: inputs for `a`, `b`, `t`, plus one result output.

## Defaults
- Added from the store with `a 0`, `b 1`, `t 0.5`, `clamp true`, and label `Mix`.

## Integration Notes
- Keep `t` semantics and optional clamping aligned with the shared helper and generated code.
- Use for crossfading control values before routing to a target parameter.

## Failure Modes
- Clamp behavior drifting from runtime helpers causes subtle exported-code bugs.
- Input-handle mismatches break saved graphs.

## Example
```tsx
// Mix two Params values, then send the result into Gain gain.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S02`, `F04-S02`
