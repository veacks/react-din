# DelayNode

## Purpose
Expose a simple delay effect in the visual graph editor.

## Props / Handles
- Data fields: `delayTime`, `feedback`, `label`.
- Handles: audio `in` and `out`, plus delay parameter controls.

## Defaults
- Added from the store with `delayTime 0.3`, `feedback 0.4`, and label `Delay`.

## Integration Notes
- Keep parameter labels, defaults, and code generation props synchronized.
- Route it between a source chain and `OutputNode`.

## Failure Modes
- Engine feedback wiring drift can make the UI lie about the audible result.
- Invalid parameter ranges can cause unstable repeats or silence.

## Example
```tsx
// Connect Oscillator -> Delay -> Output and tune delay time from the node UI.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
