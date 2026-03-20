# Repository Rules

## Documentation Language

- Keep repository documentation in English.
- Scope: `README.md`, `docs/**/*.md`, `project/**/*.md`, contributor-facing markdown, and public JSDoc on exported components.
- Exception: intentional API examples may use domain-specific values such as French solfege note names when they demonstrate supported inputs.

## Documentation Contract

- Every file under `docs/components/**` and `docs/playground-nodes/**` must include these headings:
  - `## Purpose`
  - `## Props / Handles`
  - `## Defaults`
  - `## Integration Notes`
  - `## Failure Modes`
  - `## Example`
  - `## Test Coverage`

## Coverage Governance

- `project/COVERAGE_MANIFEST.json` is the source of truth for in-scope public components and playground nodes.
- Every mapped item must keep its `source`, `docs`, `tests`, and `scenarios` entries current.
- A change to a mapped source file is incomplete until the mapped documentation file and at least one mapped test file change in the same branch.

## Component And Node Rules

- A new public component is incomplete until it updates exports, docs, tests, and `project/COVERAGE_MANIFEST.json`.
- A new playground node is incomplete until it updates:
  - `playground/src/playground/nodes/index.ts`
  - `playground/src/PlaygroundDemo.tsx`
  - `playground/src/playground/store.ts`
  - `playground/src/playground/AudioEngine.ts`
  - `playground/src/playground/CodeGenerator.tsx`
  - docs, tests, and `project/COVERAGE_MANIFEST.json`

## Required Checks

- Run `npm run validate:docs`.
- Run `npm run validate:coverage`.
- Run `npm run test:library`.
- Run `npm run test:playground`.
- Run `npm run validate:changes` before merging source changes that touch mapped components or nodes.
