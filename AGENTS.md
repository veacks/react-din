# Repository Rules

## Documentation Language

- Keep repository documentation in English.
- Scope: `README.md`, `docs/**/*.md`, `project/**/*.md`, contributor-facing markdown, and public JSDoc on exported components.
- Exception: intentional API examples may use domain-specific values such as French solfege note names when they demonstrate supported inputs.

## Documentation Contract

- Every file under `docs/components/**` must include these headings:
  - `## Purpose`
  - `## Props / Handles`
  - `## Defaults`
  - `## Integration Notes`
  - `## Failure Modes`
  - `## Example`
  - `## Test Coverage`

## UI Copy Governance

- Keep contributor-facing and user-facing UI text in dedicated copy modules instead of scattering repeated string literals across components.
- A UI change that adds or edits visible copy is incomplete until the relevant copy source changes in the same branch.

## Coverage Governance

- `project/COVERAGE_MANIFEST.json` is the source of truth for in-scope public components in this repository.
- Every mapped item must keep its `source`, `docs`, `tests`, and `scenarios` entries current.
- A change to a mapped source file is incomplete until the mapped documentation file and at least one mapped test file change in the same branch.

## DIN Studio Boundary

- DIN Studio-owned features, editor scenarios, and editor tests live in the sibling `din-studio` repository, not in `react-din`.
- Changes to DIN Studio-owned behavior and product workflows must update the DIN Studio project docs and tests in that repository.

## Patch Schema Governance

- `schemas/patch.schema.json` is the source of truth for the public JSON shape of `PatchDocument`.
- Any change to the patch document structure, public patch interface entries, or serialized patch metadata is incomplete until `schemas/patch.schema.json` is updated in the same branch.
- The published package must keep exporting the schema at `@open-din/react/patch/schema.json`.

## Component Rules

- A new public component is incomplete until it updates exports, docs, tests, and `project/COVERAGE_MANIFEST.json`.

## Required Checks

- Run `npm run validate:docs`.
- Run `npm run validate:patch-schema`.
- Run `npm run validate:coverage`.
- Run `npm run test:library`.
- Run `npm run validate:changes` before merging source changes that touch mapped components.
