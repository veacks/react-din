# ADSR

## Purpose
Apply an attack-decay-sustain-release envelope to child audio.

## Props / Handles
- Key props: `trigger`, `velocity`, `duration`, `attack`, `decay`, `sustain`, `release`, `attackCurve`, `releaseCurve`, `bypass`, `nodeRef`.
- Wrap oscillators or sources that need note-like articulation.

## Defaults
- Defaults come from `DEFAULT_ADSR`: `attack 0.01`, `decay 0.1`, `sustain 0.7`, `release 0.3`.
- `trigger` defaults to `false`.

## Integration Notes
- Use with `Track`, `Voice`, or manual UI triggers.
- Keep release scheduling changes aligned with transport and trigger tests.

## Failure Modes
- Rapid trigger changes can expose scheduling mistakes.
- Without context or trigger input, the envelope stays closed.

## Example
```tsx
<ADSR trigger attack={0.01} release={0.2}>
  <Osc autoStart />
</ADSR>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S02`, `F04-S02`
