# Phase 3A UI Transition

## Summary

- Figma board `217:2` is the canonical desktop UI spec for the launcher, workspace shell, review flow, and publish-success handoff.
- This document tracks the spec-transition backlog only. It does not authorize runtime, schema, or public API changes.
- Older editor wireframes remain fallback references only when Phase 3A does not restate a behavior.

## Canonical Vocabulary

- `LauncherSection = recent | templates | import | recover`
- `RailMode = explorer | catalog | library | runtime | review`
- `SourceControlPhase = idle | generating | ready | committing | success`
- `StatusSeverity = info | success | warning | danger`
- `DensityMode = compact | comfortable`

## To Merge

- Preserve the current shell ownership model: activity rail, single browse drawer, graph canvas, inspector `Inspect/Code`, bottom `Runtime/Diagnostics`, and quiet footer telemetry.
- Preserve command palette, connection assist, auto-arrange, minimap and viewport controls, graph-defaults empty state, live code refresh, asset preview and repair, undo/redo, save/reload, and patch import/export entry points.
- Preserve project-launcher behaviors already implemented in the repo: create project, search projects, open project, dedicated-window opening, and legacy workspace recovery.
- Preserve graph lifecycle behaviors in the workspace shell: graph inventory, templates, graph rename, graph tabs, active-graph continuity, and fallback selection.

## To Implement

- Launcher entry IA from Phase 3A: `Recent`, `Templates`, `Import`, and `Recover`, including recent-work rows, resume card, and right-column next-action summary.
- Persisted interrupted-work surfacing for `F11-S03` so resumable tasks appear in both launcher and workspace contexts.
- Source Control and Review as a real rail mode and surface with changed-file summary, generate step, commit controls, progress states, ready states, and success handoff.
- Publish and commit-success framing in the top bar and review flow, with the footer remaining informational instead of becoming the main confirmation surface.
- Missing Phase 3A primitives in repo docs: severity action pills, selected list rows, density variants, focus and disabled states, and full light/dark foundations coverage.
- Templates and import as first-class launcher destinations rather than secondary editor-only entry points.

## Parallel Workstreams

### Agent A — Foundations And Components

- Update the canonical terminology, foundations, and reusable primitives.
- Own `DesignSystem`, `ColorSystem`, and shared state naming.
- Make action pills, list rows, node-base cards, density variants, and semantic tokens canonical.

### Agent B — Launcher Specs

- Own launcher entry documentation and feature coverage.
- Rework entry flows around `Recent`, `Templates`, `Import`, and `Recover`.
- Specify resume-card behavior and how launcher entry preserves create/open/search/recover behavior already present in the repo.

### Agent C — Workspace Shell Specs

- Own shell, browse drawer, canvas, inspector, runtime drawer, and command-surface specs.
- Rebase current workspace docs onto Phase 3A while carrying forward command palette, connection assist, graph defaults, live code, asset repair, and graph lifecycle behavior.
- Keep browse, runtime, inspector, and footer ownership distinct.

### Agent D — Source Control And Publish Specs

- Own review, generate, commit, and success-phase specs.
- Expand source control from a planned backlog item into a first-class workspace surface.
- Define explicit git handoff states without moving those responsibilities into the footer or inspector.

### Agent E — Integration Editor

- Update the docs index, feature matrix, and transition summary after the other streams land.
- Remove duplicated terminology and overlapping ownership.
- Verify that launcher, shell, source control, runtime drawer, inspector, and footer each have one owning doc and one owning scenario family.
