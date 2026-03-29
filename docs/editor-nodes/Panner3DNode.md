# Panner3DNode

## Purpose
Position feedback sounds in 3D space using the public `Panner` component contract.

## Props / Handles
- Data fields: `positionX`, `positionY`, `positionZ`, `refDistance`, `maxDistance`, `rolloffFactor`, `panningModel`, `distanceModel`, `label`.
- Handles: audio input `in`, audio output `out`, parameter targets `positionX`, `positionY`, `positionZ`, `refDistance`, `maxDistance`, `rolloffFactor`.

## Defaults
- Added with center position, `refDistance 1`, `maxDistance 10000`, `rolloffFactor 1`, `panningModel equalpower`, `distanceModel inverse`, and label `Panner 3D`.

## Integration Notes
- Parameter handles must remain stable for modulation and saved graphs.
- Keep model strings and units synchronized with Web Audio `PannerNode` settings.

## Failure Modes
- Distance model mismatch can produce abrupt volume loss.
- Position controls not updating in real time break spatial tuning workflows.

## Example
```tsx
// Convolver -> Panner3D -> Output.
```

## Test Coverage
- Automated: `editor/tests/unit/nodes-ui.spec.tsx`, `editor/tests/unit/store-and-codegen.spec.ts`
- Scenarios: `F02-S01`, `F04-S02`
