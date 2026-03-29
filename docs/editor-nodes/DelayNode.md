# DelayNode

## Purpose
Expose a simple delay effect in the visual graph editor.

## Props / Handles
- Data fields: `delayTime`, `feedback`, `label`.
- Handles: audio `in` and `out`, plus parameter targets for `delayTime` and `feedback`.

## Defaults
- Added from the store with `delayTime 0.3`, `feedback 0.4`, and label `Delay`.

## Integration Notes
- Every numeric parameter exposes a dedicated target pin and uses connected-value mode when wired.
- Keep parameter labels, defaults, runtime feedback wiring, and code generation props synchronized.
- Route it between a source chain and `OutputNode`.

## Failure Modes
- Missing live routing updates can leave connected pins visually updated but sonically stale.
- Engine feedback wiring drift can make the UI lie about the audible result.
- Invalid parameter ranges can cause unstable repeats or silence.

## Example
```tsx
// Connect Oscillator -> Delay -> Output and tune delay time from the node UI.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
