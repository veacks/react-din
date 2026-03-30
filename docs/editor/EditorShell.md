# Editor Shell

## Purpose

Describe the desktop-first shell for the DIN Editor: a persistent workspace with clear regions for navigation, editing, inspection, runtime feedback, and command execution.

## Responsibilities

- Keep the shell readable during long editing sessions.
- Separate primary canvas work from secondary controls and diagnostics.
- Preserve keyboard access and visible focus across all regions.
- Support panel collapse, expansion, and resize without losing the current graph state.

## Layout

- Activity rail for global modes and fast navigation.
- Left catalog/explorer for graphs, nodes, and templates.
- Center canvas for graph editing.
- Right inspector for node details and generated code.
- Bottom runtime drawer for library, runtime, and diagnostics.

## Integration Notes

- The shell should remain composition-only and receive state from the editor store or a dedicated layout hook.
- Command discovery belongs in the shell, but actions should remain backed by existing editor operations.
- The shell must not change patch serialization, handle ids, or live audio routing.

## Failure Modes

- Collapsed panels can hide important actions if a restore path is missing.
- Overloading the top bar makes the workspace harder to scan.
- Non-persistent drawer heights or panel widths create avoidable friction in dense projects.

## Example

```tsx
<EditorShell
  leftPanel={<CatalogExplorerPanel />}
  centerPanel={<Canvas />}
  rightPanel={<InspectorPane />}
  bottomDrawer={<RuntimeDrawer />}
/>
```

## Test Coverage

- Shell regions render with stable labels.
- Panel toggles and shortcuts remain reachable.
- The shell keeps graph name, node browser, inspector, and runtime surfaces distinct.
