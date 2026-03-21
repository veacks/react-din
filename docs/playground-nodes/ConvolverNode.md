# ConvolverNode

## Purpose
Load and apply impulse responses for UI reverb and spatial coloration using uploaded audio files.

## Props / Handles
- Data fields: `impulseSrc`, `impulseFileName`, `normalize`, `label`.
- Handles: audio input `in`, audio output `out`.

## Defaults
- Added with empty `impulseSrc`, empty `impulseFileName`, `normalize true`, and label `Convolver`.

## Integration Notes
- Keep async impulse loading behavior aligned across node UI, engine, and generated `Convolver` props.
- File uploads are converted to data URLs and stored in `impulseSrc` so the loaded impulse can be replayed without a manual path field.
- Use with short IR files for low-latency UI feedback sounds.

## Failure Modes
- Missing or invalid uploaded files keep the node silent or dry.
- Loading race conditions can swap IRs during rapid edits.

## Example
```tsx
// Upload `plate.wav` in Convolver, then route:
// Sampler -> Convolver -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
