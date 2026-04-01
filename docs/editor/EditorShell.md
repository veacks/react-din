# Editor Shell

## Purpose

Describe the desktop-first shell for the DIN Editor: a persistent workspace with clear regions for navigation, editing, inspection, runtime feedback, and command execution.

## Responsibilities

- Keep the shell readable during long editing sessions.
- Separate navigation, canvas work, inspection, runtime feedback, and footer telemetry into stable regions.
- Preserve keyboard access and visible focus across all regions.
- Support panel collapse, expansion, and resize without losing the current graph state.

## Layout

- Title bar for window context and graph identity.
- Top bar for project-level actions, command access, and theme toggle.
- Activity rail for left-drawer context and runtime/inspect shortcuts.
- Left drawer for exactly one context at a time: `Graph Explorer`, `Catalog`, or `Audio Library`.
- Center canvas for graph tabs, viewport controls, React Flow authoring, and the bottom runtime drawer.
- Right inspector for `Inspect` and `Code`, with graph defaults shown when nothing is selected.
- Footer status for quiet git, MCP, and audio telemetry.

## Integration Notes

- The shell should remain composition-only and receive state from the editor store or a dedicated layout hook.
- Command discovery belongs in the shell, but actions should remain backed by existing editor operations.
- The wireframe only defines layout ownership and hierarchy; visual theme choices remain owned by the existing editor theme.
- The shell must not change patch serialization, handle ids, or live audio routing.

## Failure Modes

- Collapsed panels can hide important actions if a restore path is missing.
- Mixing library browsing into the runtime drawer duplicates ownership and makes navigation harder to predict.
- Overloading the top bar makes the workspace harder to scan.
- Non-persistent drawer heights or panel widths create avoidable friction in dense projects.

## Example

```tsx
<EditorShell
  rail={<ActivityRail />}
  leftPanel={<CatalogExplorerPanel />}
  canvas={<Canvas />}
  rightPanel={<InspectorPane />}
  bottomDrawer={<BottomDrawer />}
/>
```

## Test Coverage

- Shell regions render with stable test ids and labels.
- The left drawer restores `explorer`, `catalog`, and migrated `library` state correctly.
- The bottom drawer exposes `Runtime` and `Diagnostics` only.
- The inspector shows graph defaults when nothing is selected.
