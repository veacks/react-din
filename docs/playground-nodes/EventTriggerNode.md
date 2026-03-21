# EventTriggerNode

## Purpose
Emit trigger events from UI token changes to drive event-based feedback graphs.

## Props / Handles
- Data fields: `token`, `mode`, `cooldownMs`, `velocity`, `duration`, `note`, `trackId`, `label`.
- Handles: token target `token` and trigger source `trigger`.

## Defaults
- Added with `token 0`, `mode change`, `cooldownMs 0`, `velocity 1`, `duration 0.1`, `note 60`, `trackId event`, and label `Event Trigger`.

## Integration Notes
- Connect token from `Input` parameters such as `hoverToken`, `successToken`, and `errorToken`.
- Trigger output can target `Sampler.trigger`, `NoiseBurst.trigger`, `Voice.trigger`, and `ADSR.gate`.

## Failure Modes
- Reusing the same token value in `change` mode does not emit.
- Too aggressive cooldown can hide expected UI events.

## Example
```tsx
// Input(hoverToken) -> EventTrigger -> NoiseBurst.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
