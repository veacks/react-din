# Chorus

## Purpose
Add short modulated delay movement for widening and doubling effects.

## Props / Handles
- Key props: `rate`, `depth`, `feedback`, `delay`, `stereo`, `mix`, `bypass`.
- Wrap sources or submixes that need animated width.

## Defaults
- `rate` defaults to `1.5`.
- `depth` defaults to `3.5`, `feedback` to `0.2`, `delay` to `20`, and `stereo` to `true`.

## Integration Notes
- Use before reverb or after tone-shaping stages depending on the sound target.
- Keep audible movement changes aligned with docs and listening checks.

## Failure Modes
- Excessive depth or feedback can produce detuned or unstable results.
- Missing provider context prevents the effect chain from building.

## Example
```tsx
<Chorus rate={1.5} depth={4}>
  <Osc autoStart />
</Chorus>
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
