# TransportNode

## Purpose
Edit global timing and playback settings in the editor graph.

## Props / Handles
- Data fields: `bpm`, `playing`, `beatsPerBar`, `beatUnit`, `stepsPerBeat`, `barsPerPhrase`, `swing`, `label`.
- Handles: `out` clock output consumed by sequencer and piano-roll nodes only.

## Defaults
- Added from the store with `bpm 120`, `playing false`, `beatsPerBar 4`, `beatUnit 4`, `stepsPerBeat 4`, `barsPerPhrase 4`, `swing 0`, and label `Transport`.

## Integration Notes
- Keep transport defaults aligned across the node UI, inspector, engine scheduler, persistence sanitizers, and generated code.
- Integration tests should cover start/stop and connected timing nodes.

## Failure Modes
- Default drift breaks saved graphs and exported code expectations.
- `playing` should reset to `false` on persisted reloads so graphs do not auto-run unexpectedly.
- Engine timing bugs surface quickly in sequencer and voice chains.

## Example
```tsx
// Connect Transport -> Step Sequencer to drive a timed graph.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`, `editor/tests/e2e/editor.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
