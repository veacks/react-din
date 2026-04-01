# OscNode

## Purpose
Expose oscillator waveform, frequency, and detune controls in the editor canvas.

## Props / Handles
- Data fields: `waveform`, `frequency`, `detune`, `label`.
- Handles: audio `out`, parameter inputs for `frequency` and `detune`.

## Defaults
- Added from the store with `waveform "sine"`, `frequency 440`, `detune 0`, and label `Oscillator`.

## Integration Notes
- Every numeric parameter exposes a dedicated target pin and uses connected-value mode when wired.
- Keep `OscNode` aligned with `nodes/index.ts`, the palette in `Editor`, store defaults, `AudioEngine`, and `CodeGenerator`.
- Keep the module export contract stable for both direct imports and the node registry (`default` export plus named `OscNode` export).
- Use it with `NoteNode`, `LFONode`, or `VoiceNode` control outputs.

## Failure Modes
- Missing live routing updates can leave connected pins visually updated but sonically stale.
- Missing registry or code generation updates cause stale UI or invalid generated code.
- Broken control handles make pitch automation look connected while doing nothing.

## Example
```tsx
// Add Oscillator, connect Note -> frequency, then connect Oscillator -> Gain.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
