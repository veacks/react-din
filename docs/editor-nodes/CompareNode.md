# CompareNode

## Purpose
Compare two values and emit a boolean-like result for downstream control logic.

## Props / Handles
- Data fields: `operation`, `a`, `b`, `label`.
- Handles: inputs `a` and `b`, plus one result output.

## Defaults
- Added from the store with `operation "gt"`, `a 0`, `b 0`, and label `Compare`.

## Integration Notes
- Keep compare-operation names aligned with the data helper module and code generation.
- Use downstream of parameter sources, note data, or math outputs.

## Failure Modes
- Operation-name drift breaks generated code and persisted graphs.
- Treating compare results as audio instead of control data produces confusing graphs.

## Example
```tsx
// Compare two Params outputs and use the result to drive a Switch selection.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S02`, `F04-S02`
