# Patch

## Purpose
Render a nested patch document from inline or asset-backed source data, while keeping the patch source resolution and recursion checks in the public runtime surface.

## Props / Handles
- `patchInline`: preferred patch source when both inline and asset data are present.
- `patchAsset`: asset path for loading `.patch.json` or `.din` patch documents.
- `patchName`: optional display label for the resolved nested patch source.
- `includeProvider`: wraps the nested patch in `AudioProvider` and `TransportProvider` when needed.
- `assetRoot`: prepends a base path before resolving `patchAsset`.
- `midi`: explicit note/CC and output bindings passed through to the nested renderer.
- `children`: optional descendants preserved inside the component tree for generated code composition.

## Defaults
- `patchInline`: preferred when present.
- `includeProvider`: `false`
- `assetRoot`: unset, so `patchAsset` is used as-is.

## Integration Notes
- `Patch` resolves inline documents synchronously and caches repeated inline loads by object identity.
- Asset-backed sources are cached by resolved asset path.
- Recursive patch references are rejected explicitly before rendering continues.
- Use `PatchOutput` to mark named output wrappers in generated code or higher-level composition.

## Failure Modes
- Missing or invalid patch sources throw during resolution.
- Recursive patch references throw with an explicit error.
- Asset fetch failures and invalid patch JSON surface as runtime errors.

## Example
```tsx
import { Patch, type PatchDocument } from '@open-din/react';

const nestedPatch = {
  version: 1,
  name: 'Nested Patch',
  nodes: [],
  connections: [],
  interface: {
    inputs: [],
    events: [],
    midiInputs: [],
    midiOutputs: [],
  },
} satisfies PatchDocument;

function App() {
  return <Patch patchInline={nestedPatch} patchName="Nested Patch" />;
}
```

## Test Coverage
- Automated: `tests/library/patch.spec.tsx`
- Scenarios: `F01-S05`, `F04-S03`
