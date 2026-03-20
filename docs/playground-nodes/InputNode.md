# InputNode

## Purpose
Expose named numeric parameters that can drive data or control edges in the graph.

## Props / Handles
- Data fields: `params`, `label`.
- Handles: one source handle per configured parameter, keyed as `param:<param.id>` for stable persistence and code generation.

## Defaults
- Added from the store with an empty `params` array and label `Params`.

## Integration Notes
- Keep parameter serialization, inspector editing, handle IDs, and code generation aligned.
- Use to drive note, math, clamp, switch, or audio-parameter targets.

## Failure Modes
- Legacy `param_<index>` edges must be migrated or downstream links break after reload.
- Stale parameter names break generated prop identifiers.
- Invalid min/max/value ranges make inspector sliders misleading.

## Example
```tsx
// Add Params, create a "cutoff" parameter, then connect it to Filter frequency.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S02`, `F04-S02`
