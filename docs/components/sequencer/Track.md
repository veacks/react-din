# Track

## Purpose
Map a pattern to trigger events for its child subtree.

## Props / Handles
- Key props: `id`, `pattern`, `steps`, `offset`, `mute`, `solo`, `probability`, `note`, `data`, `onTrigger`.
- Exposes trigger events to `useTrigger` and `useOnTrigger`.

## Defaults
- `pattern` defaults to an empty array.
- `probability` defaults to `1`, `mute` to `false`, and `note` to `60`.

## Integration Notes
- Use only inside `Sequencer`.
- Pair with `Sampler`, `NoiseBurst`, `Voice`, or custom trigger-aware children.

## Failure Modes
- Invalid pattern lengths can produce silent or misleading steps.
- Trigger filtering bugs surface quickly in transport-aligned tests.

## Example
```tsx
<Track id="kick" pattern={[1, 0, 0, 0]}>
  <NoiseBurst />
</Track>
```

## Test Coverage
- Automated: `tests/library/transport-sequencer.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
