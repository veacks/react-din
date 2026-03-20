# StepSequencerNode

## Purpose
Trigger step-based patterns from the transport inside the playground.

## Props / Handles
- Data fields: `steps`, `pattern`, `activeSteps`, `label`.
- Handles: transport input and trigger output.

## Defaults
- Added from the store with `steps 16`, `pattern` filled with `0.8`, `activeSteps` filled with `false`, and label `Step Sequencer`.

## Integration Notes
- Keep step array lengths, trigger semantics, and code generation aligned.
- Integration coverage should include transport-driven voice or drum graphs.

## Failure Modes
- Array-length drift can break rendering or trigger timing.
- Current-step feedback can desync from engine timing if subscriptions change.

## Example
```tsx
// Connect Transport -> Step Sequencer -> Voice trigger for a step-driven synth.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`, `playground/tests/e2e/playground.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
