# PresetWaveShaper

## Purpose
Provide a simplified `WaveShaper` interface with musical presets (`softClip`, `hardClip`, `saturate`) and a single `amount` control.

## Props / Handles
- Props: `children`, `amount`, `preset`, `oversample`.
- Audio handles: `in` and `out` are inherited from the wrapped `WaveShaper` node.

## Defaults
- `amount`: `0.5`
- `preset`: `softClip`
- `oversample`: `2x`

## Integration Notes
- Use this component when UI-facing graphs need predictable distortion curves without manually authoring a `Float32Array` curve.
- Keep `amount` in the lower range for UI feedback sound design to avoid harsh clipping.
- Preset curve generation now routes through the shared internal `din-core` helper so node previews and library rendering stay aligned.

## Failure Modes
- Very high `amount` with downstream gain can produce hard clipping.
- Selecting an aggressive preset and adding extra distortion stages can over-compress transients.

## Example
```tsx
<PresetWaveShaper amount={0.45} preset="saturate" oversample="2x">
  <Distortion type="soft" drive={0.35}>
    <NoiseBurst type="brown" duration={0.09} />
  </Distortion>
</PresetWaveShaper>
```

## Test Coverage
- Automated: `tests/library/audio-nodes.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
