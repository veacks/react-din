# ClampNode

## Purpose
Constrain a value between bounds before routing it downstream.

## Props / Handles
- Data fields: `mode`, `value`, `min`, `max`, `label`.
- Handles: inputs for `value`, `min`, `max`, plus one result output.

## Defaults
- Added from the store with `mode "range"`, `value 0`, `min 0`, `max 1`, and label `Clamp`.

## Integration Notes
- Keep clamp modes and edge-case semantics aligned with the shared helper implementation.
- Use before routing data into sensitive audio parameters.

## Failure Modes
- Mode drift between UI and helper code makes saved graphs unpredictable.
- Invalid bound ordering can surprise users if not documented and tested.

## Example
```tsx
// Clamp a modulation value before connecting it to Filter frequency.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S02`, `F04-S02`
