# OutputNode

## Purpose
Own playback start/stop and master gain for the current playground graph.

## Props / Handles
- Data fields: `playing`, `masterGain`, `label`.
- Handles: audio `in`.

## Defaults
- Added from the store with `playing false`, `masterGain 0.5`, and label `Output`.

## Integration Notes
- `OutputNode` must remain aligned with store playback state and `audioEngine.start/stop`.
- Integration coverage should keep graph persistence resetting `playing` to `false`.

## Failure Modes
- Persisting transient playback state can reload graphs in a broken state.
- Starting output without a valid graph can create confusing no-audio behavior.

## Example
```tsx
// Connect Gain -> Output and use the play button to start the current graph.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`, `playground/tests/e2e/playground.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
