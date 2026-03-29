# MediaStreamNode

## Purpose
Inject microphone audio into editor graphs for live testing.

## Props / Handles
- Data fields: `requestMic`, `label`.
- Handles: audio output `out`.

## Defaults
- Added with `requestMic false` and label `Media Stream`.

## Integration Notes
- Request permissions only when needed.
- Keep cleanup logic aligned so tracks stop when nodes are removed or disabled.

## Failure Modes
- Browser permission denial leaves the node silent.
- Missing stream cleanup can leak active microphone tracks.

## Example
```tsx
// MediaStream -> Filter -> Output.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
