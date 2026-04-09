# SKILL: patch-schema-change

## REPO

`react-din`

## WHEN TO USE

- `schemas/patch.schema.json` changes
- The public `PatchDocument` shape or published schema export changes

## STEPS

1. Read `project/ROUTE_CARD.json` and the matching section in `project/SCHEMA_SECTION_SLICES.json`.
2. Update `schemas/patch.schema.json` and any exact TS contract files named by that section.
3. Coordinate `din-core` if serialization, persisted IDs, or round-trip behavior changes.
4. Keep docs, tests, and release-surface notes aligned.

## VALIDATION

- `npm run lint`
- `npm run typecheck`
- `npm run ci:check`
