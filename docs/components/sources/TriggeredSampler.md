# TriggeredSampler

## Purpose
Play a `Sampler` source from trigger events (`useTrigger`) while supporting optional gate-style activation with the `active` prop.

## Props / Handles
- Props: `children`, `src`, `autoStart`, `active`, `loop`, `playbackRate`, `detune`, `offset`, `duration`.
- Trigger input: consumes events from the nearest `TriggerContext`.
- Audio output: forwards to the current `AudioOutProvider` output node.

## Defaults
- `autoStart`: `false`
- `loop`: `false`
- `playbackRate`: `1`
- `detune`: `0`
- `offset`: `0`

## Integration Notes
- Wrap it inside `EventTrigger` for UI-token driven one-shots.
- Use `active` for voice/ADSR-driven gate workflows where trigger context is not the primary control path.
- Keep `duration` aligned with the trigger event when using non-loop playback.

## Failure Modes
- If `src` fails to load or decode, no audio is emitted.
- If audio is locked (`isUnlocked === false`), trigger events are ignored until unlock.
- Combining `loop` with short trigger windows can create abrupt stop/restart behavior.

## Example
```tsx
<EventTrigger token={successToken} cooldownMs={120} trackId="success">
  <TriggeredSampler src="/samples/ui_success.wav" />
</EventTrigger>
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
