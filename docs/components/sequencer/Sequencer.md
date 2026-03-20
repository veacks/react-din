# Sequencer

## Purpose
Emit step timing for child tracks in a fixed-length loop or one-shot sequence.

## Props / Handles
- Key props: `bpm`, `steps`, `autoStart`, `loop`, `lookAhead`, `scheduleInterval`, `onStep`, `onComplete`, `onStart`, `onStop`.
- Provides sequencer context to descendant `Track` components.

## Defaults
- `bpm` defaults to `120`.
- `steps` defaults to `16`, `loop` to `true`, and `autoStart` to `false`.

## Integration Notes
- Use inside `AudioProvider`.
- Pair with `Track` and trigger-aware sources or synth wrappers.

## Failure Modes
- Timer drift or invalid step counts break predictable triggering.
- Without unlocked context, `autoStart` cannot produce audible results.

## Example
```tsx
<Sequencer bpm={120} steps={16} autoStart>
  <Track id="lead" pattern={[1, 0, 1, 0]} />
</Sequencer>
```

## Test Coverage
- Automated: `tests/library/transport-sequencer.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
