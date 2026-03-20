# Delay

## Purpose
Delay audio in time with a declarative `DelayNode`.

## Props / Handles
- Key props: `delayTime`, `maxDelayTime`, `bypass`, `nodeRef`.
- Accepts audio children and forwards delayed output upstream.

## Defaults
- `delayTime` defaults to `0`.
- `maxDelayTime` defaults to `1`.

## Integration Notes
- Use in serial chains after sources or filters.
- Pair with gain feedback paths or higher-level effects when needed.

## Failure Modes
- `maxDelayTime` is fixed at node creation and requires recreation for larger values.
- Missing provider context prevents node creation.

## Example
```tsx
<Delay delayTime={0.25}>
  <Osc autoStart />
</Delay>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
