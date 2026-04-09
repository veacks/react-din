# AGENTS — react-din

## LOAD ORDER

1. `AGENTS.md`
2. `project/ROUTE_CARD.json`
3. `project/SCHEMA_SECTION_SLICES.json` or `project/PUBLIC_EXPORT_SLICES.json`
4. One matching file in `project/skills/`
5. The exact source file and exact test file

## ROUTE HERE WHEN

- The request changes public components, hooks, exports, docs/components, or `project/COVERAGE_MANIFEST.json`.
- The request changes `schemas/patch.schema.json` or published patch helpers.

## ROUTE AWAY WHEN

- Runtime, compiler, registry, migration, FFI, or WASM -> `din-core`
- Editor, MCP, launcher, shell, or codegen -> `din-studio`
- Workspace routing or automation -> `din-agents`

## ENTRY POINTS

- `project/ROUTE_CARD.json`
- `project/SCHEMA_SECTION_SLICES.json`
- `project/PUBLIC_EXPORT_SLICES.json`
- `project/COVERAGE_MANIFEST.json`

## SKILL MAP

- Public component or export -> `project/skills/public-component-change/SKILL.md`
- Schema or contract change -> `project/skills/patch-schema-change/SKILL.md`
- Coverage/docs sync -> `project/skills/coverage-manifest-update/SKILL.md`
- Release-surface check -> `project/skills/release-surface-check/SKILL.md`

## HARD RULES

- Keep docs, tests, exports, and coverage rows aligned.
- `react-din` owns the public patch schema.
- Use slice manifests before opening `src/index.ts` or broad patch helpers.
- Do not change shared schema or persisted IDs without coordinating `din-core`.

## VALIDATION

- `npm run lint`
- `npm run typecheck`
- `npm run ci:check`
