# Noise

## Purpose
Generate continuous noise sources for textures, percussion, and modulation-like content.

## Props / Handles
- Key props: `type`, `bufferSize`, `autoStart`, `active`, `nodeRef`.
- Outputs continuous audio into the current parent bus.

## Defaults
- `type` defaults to `white`.
- `bufferSize` defaults to `4096`.

## Integration Notes
- Pair with filters, envelopes, or samplers for drum and ambience patches.
- Keep supported noise-type docs aligned with generator behavior.

## Failure Modes
- Very small buffers can trade CPU for responsiveness.
- Without unlock or provider context, playback never starts.

## Example
```tsx
<Noise type="pink" autoStart />
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
