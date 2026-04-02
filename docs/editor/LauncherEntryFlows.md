# Launcher Entry Flows

## Purpose

Document the Phase 3A launcher entry information architecture for project pickup, starter flows, import, recovery, and resumable work.

## Responsibilities

- Own the launcher-level `LauncherSection = recent | templates | import | recover` vocabulary.
- Keep recent-work rows, search, open actions, and dedicated-window entry points readable and immediate.
- Surface templates and import as first-class entry destinations rather than hiding them inside the in-editor explorer.
- Show resumable work through a resume card and right-column next-action summary without forcing contributors to reconstruct context.

## Integration Notes

- Preserve the current launcher capabilities that already exist in the repo: create project, search projects, open project, dedicated project windows, and legacy workspace recovery.
- Template browsing at launcher level complements, but does not replace, graph-scoped templates inside the workspace explorer.
- Launcher import owns project-entry import and recovery choices; the in-workspace audio library still owns asset-level import, preview, relink, and repair.
- Interrupted-work summaries should align with `F11-S03` so the same unfinished task can be surfaced in both launcher and workspace contexts.

## Failure Modes

- If `Templates`, `Import`, or `Recover` remain secondary actions, Phase 3A entry flows collapse back into the old launcher model.
- If resumable work is only visible after opening a project, contributors lose the main benefit of the Phase 3A entry design.
- If launcher templates and workspace templates have overlapping ownership, contributors have to guess where a starter flow begins.

## Example

- Open `Recent` to search and reopen a project from the launcher.
- Switch to `Templates` to start from a prebuilt graph direction before entering the workspace.
- Use `Import` or `Recover` to bring existing work into a dedicated project without first opening the editor shell.
- Resume an interrupted repair task directly from the launcher card that summarizes the unfinished step.

## Test Coverage

- Recent-work rows and project search lead to the expected open action.
- `Templates`, `Import`, and `Recover` each expose one clear primary action.
- Interrupted work stays visible at launcher entry until the contributor resolves it.
