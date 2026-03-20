# GainNode

## Purpose
Control audio level in the playground graph.

## Props / Handles
- Data fields: `gain`, `label`.
- Handles: audio `in`, audio `out`, and gain control input.

## Defaults
- Added from the store with `gain 0.5` and label `Gain`.

## Integration Notes
- Keep UI, store defaults, engine updates, and code generation aligned.
- Use downstream from sources and upstream from `OutputNode`.

## Failure Modes
- Missing control-handle updates can desync slider changes from generated code.
- Gain set incorrectly can hide whether an upstream node is working.

## Example
```tsx
// Add Gain and route Oscillator -> Gain -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
