# MixerNode

## Purpose
Combine multiple audio inputs into one routed output.

## Props / Handles
- Data fields: `label`.
- Handles: fixed audio inputs `in1`, `in2`, `in3` and one audio `out`.

## Defaults
- Added from the store with three fixed inputs and label `Mixer`.

## Integration Notes
- Keep the fixed three-input contract synchronized across UI rendering, store defaults, and engine wiring.
- Use when multiple sources need a shared downstream chain.

## Failure Modes
- Treating the mixer as dynamically sizable without matching handle changes breaks connections.
- Missing code generation updates can drop mixer branches in exported code.

## Example
```tsx
// Route two sources into Mixer and then connect Mixer -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
