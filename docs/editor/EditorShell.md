# Editor Shell

## Purpose

Describe the Phase 3A desktop shell for the DIN Editor: a persistent workspace with clear regions for navigation, editing, inspection, runtime feedback, review, and command execution.

## Responsibilities

- Keep the shell readable during long editing sessions.
- Separate browse, canvas, inspection, runtime, review, and footer telemetry into stable regions.
- Preserve keyboard access and visible focus across all regions.
- Support panel collapse, expansion, and resize without losing the current graph state.
- Keep publish and commit flows explicit without displacing graph authoring.

## Layout

- Title bar for window context and active graph identity.
- Top bar for lightweight project context, command access, theme toggle, and eventual outcome chips.
- Activity rail for `explorer`, `catalog`, `library`, `runtime`, and `review`.
- Browse drawer for exactly one browse context at a time: `Graph Explorer`, `Catalog`, or `Audio Library`.
- Center canvas for graph tabs, transport controls, viewport controls, React Flow authoring, and the bottom runtime drawer.
- Right inspector for `Inspect` and `Code`, with graph defaults shown when nothing is selected.
- Footer status for quiet git, MCP, and audio telemetry only.

## Integration Notes

- The shell should remain composition-only and receive state from the editor store or a dedicated layout hook.
- Figma board `217:2` is the canonical shell reference; older wireframes are fallback only when Phase 3A does not restate a behavior.
- Command discovery belongs in the shell, but actions should remain backed by existing editor operations.
- Preserve the current command palette, connection assist, auto-arrange, viewport controls, minimap, graph-defaults empty state, asset repair flows, and live code refresh inside the new interpretation.
- Source Control and publish work own the `review` rail mode and must not be folded into the footer, inspector, or bottom drawer.
- The wireframe defines layout ownership, hierarchy, and state framing; visual theme choices remain owned by the existing editor theme.
- The shell must not change patch serialization, handle ids, or live audio routing.

## Failure Modes

- Collapsed panels can hide important actions if a restore path is missing.
- Mixing library browsing into the runtime drawer duplicates ownership and makes navigation harder to predict.
- Treating footer telemetry as the main git surface makes review and publish work harder to discover.
- Overloading the top bar with authoring, review, and telemetry responsibilities makes the workspace harder to scan.
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
- Rail modes keep browse, runtime, and review responsibilities distinct.
- The left drawer restores `explorer`, `catalog`, and migrated `library` state correctly.
- The bottom drawer exposes `Runtime` and `Diagnostics` only.
- The inspector shows graph defaults when nothing is selected.
- Footer telemetry remains informational and does not become the primary publish confirmation surface.
