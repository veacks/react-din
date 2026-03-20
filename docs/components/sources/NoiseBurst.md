# NoiseBurst

## Purpose
Create short triggered bursts of noise for hats, snares, and transient textures.

## Props / Handles
- Key props: `type`, `duration`, `gain`, `attack`, `release`.
- Consumes trigger events from the parent `Track` context.

## Defaults
- `type` defaults to `white`.
- `duration` defaults to `0.1`, `gain` to `1`, `attack` to `0.001`, and `release` to `0.05`.

## Integration Notes
- Use inside `Track` or any trigger-aware subtree.
- Keep trigger-envelope behavior aligned with sequencer docs and tests.

## Failure Modes
- Without trigger context, no bursts are scheduled.
- Attack and release mistakes can click or truncate the burst.

## Example
```tsx
<Track id="hat" pattern={[1, 0, 1, 0]}>
  <NoiseBurst type="white" duration={0.05} />
</Track>
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
