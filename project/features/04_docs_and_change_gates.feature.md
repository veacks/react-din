# 04 Docs And Change Gates

## Feature

Enforce documentation language and source-to-doc-test change gates for every mapped item.

### F04-S01 Documentation stays in English

**Given** contributor-facing docs are updated
**When** validation runs
**Then** markdown docs stay in English and component/node docs keep the required sections

### F04-S02 Mapped source changes update docs and tests

**Given** a mapped source file changes
**When** validation runs
**Then** the mapped documentation file and at least one mapped test file changed in the same diff

### F04-S03 New nodes and public components update all required touch points

**Given** a contributor adds a new public component or playground node
**When** validation runs
**Then** registration files, docs, tests, and the coverage manifest are all updated

### F04-S04 Patch schema stays aligned with the public patch contract

**Given** a contributor changes the public patch JSON structure
**When** validation runs
**Then** `schemas/patch.schema.json` is updated in the same change and the published schema export remains valid
