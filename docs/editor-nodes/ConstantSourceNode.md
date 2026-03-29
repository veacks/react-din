# ConstantSourceNode

## Purpose
Provide a constant control signal for modulation targets.

## Props / Handles
- Data fields: `offset`, `label`.
- Handles: source `out` and parameter target `offset`.

## Defaults
- Added with `offset 1` and label `Constant Source`.

## Integration Notes
- Constant output should auto-start in the engine so control links are immediately active.
- Connected `offset` handle uses connected-value mode for deterministic modulation chains.

## Failure Modes
- Not starting the source keeps downstream modulation at zero.
- Missing stable handle IDs can break persisted graphs.

## Example
```tsx
// ConstantSource(out) -> Gain(gain).
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S02`, `F04-S02`
