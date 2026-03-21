# SamplerNode

## Purpose
Load and trigger audio files directly from the playground.

## Props / Handles
- Data fields: `src`, `loop`, `playbackRate`, `detune`, `loaded`, `sampleId`, `fileName`, `label`.
- Handles: trigger input `trigger`, control inputs `playbackRate` and `detune`, and audio output `out`.

## Defaults
- Added from the store with empty `src`, `loop false`, `playbackRate 1`, `detune 0`, `loaded false`, and label `Sampler`.

## Integration Notes
- Every numeric parameter exposes a dedicated target pin and uses connected-value mode when wired.
- Keep cache IDs, object URLs, trigger semantics, and generated code semantics aligned across UI, storage, and engine loading.
- Use after a trigger-capable source or with manual playback from the node UI.

## Failure Modes
- Missing live routing updates can leave connected pins visually updated but sonically stale.
- File-cache drift can leave orphaned object URLs or stale `loaded` state.
- Rising-edge retrigger and loop-stop behavior must stay aligned between runtime and preview/export helpers.
- Engine load failures make the node appear configured while staying silent.

## Example
```tsx
// Add Sampler, load a file, then connect Sampler -> Output.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
