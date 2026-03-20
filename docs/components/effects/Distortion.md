# Distortion

## Purpose
Apply non-linear drive, clipping, or saturation to child audio.

## Props / Handles
- Key props: `type`, `drive`, `level`, `oversample`, `tone`, `mix`, `bypass`.
- Wrap sources or buses that need grit, clipping, or saturation.

## Defaults
- `type` defaults to `soft`.
- `drive` defaults to `0.5`, `level` to `0.5`, `oversample` to `2x`, and `tone` to `4000`.

## Integration Notes
- Use before reverb or after dynamics depending on the target sound.
- Keep algorithm changes documented because presets can change audibly.

## Failure Modes
- High drive can clip aggressively or mask transients.
- Tone and oversample changes can alter perceived brightness.

## Example
```tsx
<Distortion type="soft" drive={0.4}>
  <Osc autoStart />
</Distortion>
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
