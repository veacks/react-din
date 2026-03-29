# ChorusNode

## Purpose
Add modulated delay color to short UI sounds and synth layers.

## Props / Handles
- Data fields: `rate`, `depth`, `feedback`, `delay`, `mix`, `stereo`, `label`.
- Handles: audio input `in`, audio output `out`, parameter targets `rate`, `depth`, `feedback`, `delay`, `mix`.

## Defaults
- Added with `rate 1.5`, `depth 3.5`, `feedback 0.2`, `delay 20`, `mix 0.5`, `stereo true`, and label `Chorus`.

## Integration Notes
- Keep milliseconds-based depth and delay conversions consistent with the engine.
- Connected handles must hide sliders and show the live connected value.

## Failure Modes
- Delay unit mismatches can produce very different modulation behavior.
- Missing stereo handling can collapse width unexpectedly.

## Example
```tsx
// Sampler -> Chorus -> Output.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
