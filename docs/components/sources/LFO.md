# LFO

## Purpose
Create low-frequency modulation for parameters such as gain, pitch, or filter cutoff.

## Props / Handles
- Key props: `rate`, `depth`, `waveform`, `phase`, `autoStart`.
- Supports both render-prop usage and hook-based consumption via `useLFO`.

## Defaults
- `rate` defaults to `1`.
- `depth` defaults to `100`, `waveform` to `sine`, and `autoStart` to `true`.

## Integration Notes
- Use directly with render props or share the output with modulatable component props.
- Keep modulation depth units consistent across docs and tests.

## Failure Modes
- If modulation targets do not accept modulatable values, output has no effect.
- Unlock or provider issues prevent live modulation.

## Example
```tsx
<LFO rate={2} depth={200}>
  {(lfo) => <Filter frequency={lfo}><Osc autoStart /></Filter>}
</LFO>
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
