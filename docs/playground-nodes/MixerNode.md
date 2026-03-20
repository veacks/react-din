# MixerNode

## Purpose
Combine multiple audio inputs into one routed output.

## Props / Handles
- Data fields: `inputs`, `label`.
- Handles: multiple audio inputs and one audio `out`.

## Defaults
- Added from the store with `inputs 3` and label `Mixer`.

## Integration Notes
- Keep input-count semantics synchronized across UI rendering, store defaults, and engine wiring.
- Use when multiple sources need a shared downstream chain.

## Failure Modes
- Changing the number of inputs without matching handle updates breaks connections.
- Missing code generation updates can drop mixer branches in exported code.

## Example
```tsx
// Route two sources into Mixer and then connect Mixer -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
