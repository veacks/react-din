# Contributor Flow

1. Pick the runtime layer that owns the behavior: `din-core`, `@din/vanilla`, `@din/react`, or `@din/editor`.
2. Implement shared audio behavior in the lowest viable layer before touching React or editor bindings.
3. Update the relevant bindings or editor integration touch points after the shared runtime is aligned.
4. Update the mapped documentation page under `docs/components/**`, `docs/playground-nodes/**`, or the package architecture docs.
5. Update at least one mapped automated test file and keep the relevant BDD scenario IDs current.
6. If the item is new, register it everywhere required and add it to `project/COVERAGE_MANIFEST.json`.
7. Run `validate:docs`, `validate:patch-schema`, `validate:coverage`, and the relevant automated tests before review.
