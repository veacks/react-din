# Sampler

## Purpose
Load and play audio buffers from URLs or pre-decoded buffers.

## Props / Handles
- Key props: `src`, `autoStart`, `active`, `loop`, `loopStart`, `loopEnd`, `playbackRate`, `detune`, `offset`, `duration`, `onLoad`, `onEnded`, `onError`.
- Outputs audio into the current parent bus.

## Defaults
- `autoStart` defaults to `false`.
- `loop` defaults to `false`, `playbackRate` to `1`, and `detune` to `0`.

## Integration Notes
- Use inside `AudioProvider`, optionally inside effects or envelopes.
- Align fetch behavior and caching expectations with docs when changing loading flow.

## Failure Modes
- Failed fetches or decode errors prevent playback.
- Triggering before the buffer loads produces silence.

## Example
```tsx
<Sampler src="/samples/kick.wav" autoStart />
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
