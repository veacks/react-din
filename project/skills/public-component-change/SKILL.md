# SKILL: public-component-change

## REPO

`react-din`

## WHEN TO USE

- Public component, hook, or package export changes
- `docs/components/*` or `project/COVERAGE_MANIFEST.json` changes

## STEPS

1. Read `project/ROUTE_CARD.json` and the matching group in `project/PUBLIC_EXPORT_SLICES.json`.
2. Update the exact source module and any public barrel touched by the request.
3. Update docs, tests, and coverage rows together.
4. Escalate only if schema, serialization, persisted IDs, or round-trip compatibility changes.

## VALIDATION

- `npm run lint`
- `npm run typecheck`
- `npm run ci:check`
- `npm run validate:changes`
