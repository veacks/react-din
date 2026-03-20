# SwitchNode

## Purpose
Select one value from several inputs and emit the chosen result.

## Props / Handles
- Data fields: `inputs`, `selectedIndex`, `values`, `label`.
- Handles: one input per configured value plus one result output.

## Defaults
- Added from the store with `inputs 3`, `selectedIndex 0`, `values [0, 0, 0]`, and label `Switch`.

## Integration Notes
- Keep input-count behavior aligned across UI rendering, store defaults, and data evaluation.
- Use for simple stateful routing of control values.

## Failure Modes
- Input-count drift can orphan saved edges.
- Selected-index changes must stay synchronized with the stored `values` array.

## Example
```tsx
// Feed three control values into Switch and route the selected output into Gain gain.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S02`, `F04-S02`
