# DistortionNode

## Purpose
Apply drive-based distortion with blend and tone shaping in the editor graph.

## Props / Handles
- Data fields: `distortionType`, `drive`, `level`, `mix`, `tone`, `label`.
- Handles: audio input `in`, audio output `out`, parameter targets `drive`, `level`, `mix`, `tone`.

## Defaults
- Added with `distortionType soft`, `drive 0.5`, `level 0.5`, `mix 0.5`, `tone 4000`, and label `Distortion`.

## Integration Notes
- `distortionType` maps to curve presets and must stay aligned with engine and codegen mappings.
- Parameter sliders switch to connected-value mode when a control edge is present.

## Failure Modes
- Wrong preset mapping changes sound character between runtime and generated code.
- Missing wet/dry synchronization can produce level jumps.

## Example
```tsx
// NoiseBurst -> Distortion -> Filter -> Output.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
