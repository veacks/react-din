# TransportNode

## Purpose
Edit global timing and playback settings in the playground graph.

## Props / Handles
- Data fields: `bpm`, `playing`, `beatsPerBar`, `beatUnit`, `stepsPerBeat`, `barsPerPhrase`, `swing`, `label`.
- Handles: transport-style outputs consumed by sequencer and piano-roll nodes.

## Defaults
- Added from the store with `bpm 120`, `playing false`, `beatsPerBar 4`, `beatUnit 4`, `stepsPerBeat 4`, `barsPerPhrase 4`, `swing 0`, and label `Transport`.

## Integration Notes
- Keep transport defaults aligned across the node UI, inspector, engine scheduler, and generated code.
- Integration tests should cover start/stop and connected timing nodes.

## Failure Modes
- Default drift breaks saved graphs and exported code expectations.
- Engine timing bugs surface quickly in sequencer and voice chains.

## Example
```tsx
// Connect Transport -> Step Sequencer to drive a timed graph.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`, `playground/tests/e2e/playground.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
