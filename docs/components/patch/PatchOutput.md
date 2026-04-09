# PatchOutput

## Purpose
Provide a transparent public wrapper for named patch outputs in generated React code and patch composition helpers.

## Props / Handles
- `name`: optional output label for the wrapped patch outlet.
- `children`: descendant React nodes rendered unchanged.

## Defaults
- `name`: unset

## Integration Notes
- `PatchOutput` does not create a runtime node by itself.
- Keep it as a structural wrapper around the content that should be exposed as a named output.

## Failure Modes
- None beyond the wrapped children's own runtime behavior.

## Example
```tsx
import { PatchOutput } from '@open-din/react';

function App() {
  return (
    <PatchOutput name="main">
      <div>Nested output content</div>
    </PatchOutput>
  );
}
```

## Test Coverage
- Automated: `tests/library/patch.spec.tsx`
- Scenarios: `F01-S05`, `F04-S03`
