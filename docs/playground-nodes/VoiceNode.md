# VoiceNode

## Purpose
Translate trigger streams into note and gate outputs for synth-style graphs.

## Props / Handles
- Data fields: `portamento`, `label`.
- Handles: trigger input plus `note`, `gate`, and `velocity` outputs.

## Defaults
- Added from the store with `portamento 0` and label `Voice`.

## Integration Notes
- Keep note/gate/velocity handle IDs and generated-code output aligned with engine voice behavior.
- Typical downstream targets are `OscNode` frequency and `ADSRNode` trigger.

## Failure Modes
- Gate or note handle drift breaks common synth templates immediately.
- Portamento changes need alignment between UI defaults, engine updates, and preview/export voice wrappers.

## Example
```tsx
// Connect Step Sequencer -> Voice, then Voice note -> Oscillator frequency.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`, `playground/tests/e2e/playground.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
