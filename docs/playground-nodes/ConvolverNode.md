# ConvolverNode

## Purpose
Load and apply impulse responses for UI reverb and spatial coloration.

## Props / Handles
- Data fields: `impulseSrc`, `normalize`, `label`.
- Handles: audio input `in`, audio output `out`.

## Defaults
- Added with empty `impulseSrc`, `normalize true`, and label `Convolver`.

## Integration Notes
- Keep async impulse loading behavior aligned across node UI, engine, and generated `Convolver` props.
- Use with short IR files for low-latency UI feedback sounds.

## Failure Modes
- Missing impulse files keep the node silent or dry.
- Loading race conditions can swap IRs during rapid edits.

## Example
```tsx
// Sampler -> Convolver -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
