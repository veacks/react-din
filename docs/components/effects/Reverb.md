# Reverb

## Purpose
Apply algorithmic or impulse-based reverb to child audio.

## Props / Handles
- Key props: `mix`, `bypass`, `decay`, `preDelay`, `damping`, `impulse`.
- Wrap sources or mixes that need ambience.

## Defaults
- `mix` defaults to `0.5`.
- `decay` defaults to `2`, `preDelay` to `0.01`, and `damping` to `0.5`.

## Integration Notes
- Shared browser-side audio behavior is routed through the workspace vanilla runtime where applicable.
- Use for room, hall, or texture sends directly in the graph tree.
- Align impulse-loading behavior with fetch and decode docs when changed.
- Algorithmic impulse generation now uses the shared internal `din-core` helper so preview/runtime defaults drift less easily.

## Failure Modes
- Failed impulse loads leave only the dry path.
- High mix or long decay can overwhelm the source signal.

## Example
```tsx
<Reverb decay={2} mix={0.3}>
  <Noise autoStart />
</Reverb>
```

## Test Coverage
- Automated: `tests/library/sources-effects.spec.tsx`
- Scenarios: `F01-S03`, `F04-S02`
