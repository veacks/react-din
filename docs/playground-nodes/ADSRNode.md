# ADSRNode

## Purpose
Provide an envelope control node in the playground for trigger-driven modulation.

## Props / Handles
- Data fields: `attack`, `decay`, `sustain`, `release`, `label`.
- Handles: trigger input `gate`, per-parameter control inputs (`attack`, `decay`, `sustain`, `release`), and modulation output `envelope`.

## Defaults
- Added from the store with `attack 0.1`, `decay 0.2`, `sustain 0.5`, `release 0.5`, and label `ADSR`.

## Integration Notes
- Every numeric parameter exposes a dedicated target pin and uses connected-value mode when wired.
- Keep trigger semantics aligned with `VoiceNode`, `StepSequencerNode`, and engine scheduling.
- Use the output to drive gain or filter parameters.

## Failure Modes
- Missing live routing updates can leave connected pins visually updated but sonically stale.
- Envelope timing drift can make the node feel correct visually but wrong audibly.
- Missing output-handle consistency breaks modulation routing and generated code.

## Example
```tsx
// Connect Voice gate -> ADSR -> Gain gain for a simple envelope path.
```

## Test Coverage
- Automated: `playground/tests/unit/nodes-ui.spec.tsx`, `playground/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S03`, `F04-S02`
