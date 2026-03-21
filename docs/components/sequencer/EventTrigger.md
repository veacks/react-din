# EventTrigger

## Purpose
Bridge UI or app state changes into the `TriggerContext` contract used by trigger-aware components.

## Props / Handles
- Key props: `token`, `mode`, `cooldownMs`, `velocity`, `duration`, `note`, `trackId`, `data`, `children`.
- Emits standard `TriggerEvent` objects consumed by `useTrigger`, `useOnTrigger`, `Sampler`, and `NoiseBurst`.

## Defaults
- `mode` defaults to `change`.
- `cooldownMs` defaults to `0`.
- `velocity` defaults to `1`, `duration` to `0.1`, `note` to `60`, and `trackId` to `event`.

## Integration Notes
- Use `mode="change"` for token-per-event flows and `mode="rising"` for boolean or monotonic counters.
- Place `EventTrigger` around the branch that should react to UI tokens.
- Keep `trackId` explicit when combining several UI event families.

## Failure Modes
- Reusing the same token value will not emit in `change` mode.
- Too high `cooldownMs` can hide expected events.
- A wrapper placed outside the intended branch can trigger unrelated children.

## Example
```tsx
<EventTrigger token={hoverToken} mode="change" cooldownMs={40} trackId="hover">
  <NoiseBurst type="white" duration={0.03} />
</EventTrigger>
```

## Test Coverage
- Automated: `tests/library/transport-sequencer.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
