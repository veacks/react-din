# ReverbNode

## Purpose
Expose reverb decay and mix controls inside the playground.

## Props / Handles
- Data fields: `decay`, `mix`, `label`.
- Handles: audio `in`, audio `out`, and control inputs `decay` and `mix`.

## Defaults
- Added from the store with `decay 2`, `mix 0.5`, and label `Reverb`.

## Integration Notes
- Every numeric parameter exposes a dedicated target pin and uses connected-value mode when wired.
- Keep engine impulse generation, wet/dry routing, and mix updates aligned with the UI contract.
- Use after sources or filters for ambience.

## Failure Modes
- Missing live routing updates can leave connected pins visually updated but sonically stale.
- Broken internal routing can make the node visually connected but acoustically silent.
- Mix defaults drifting from generated code create confusing exported graphs.
- Long decay values can swamp dry signals unexpectedly.

## Example
```tsx
// Connect Noise -> Reverb -> Output for a simple ambience graph.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
