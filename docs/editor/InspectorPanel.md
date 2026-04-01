# Inspector Panel

## Purpose

Document the right-side panel that exposes the selected node's details and technical output.

## Responsibilities

- Default to `Inspect` when a node is selected.
- Expose `Code` as a secondary view for generated output.
- Keep advanced parameters out of the canvas when possible.
- Support a graph-defaults empty state when nothing is selected.

## Integration Notes

- The inspector should be driven by selected-node state from the editor store.
- Inline node controls should stay compact and defer advanced settings to this panel.
- Graph defaults should expose graph name and graph-level metadata without forcing a node selection.
- Code output must stay in sync with the active graph and selected project name.

## Failure Modes

- If `Inspect` and `Code` are implicit, users can miss the distinction between editing and code review.
- If the empty state only shows generated code, graph-level editing becomes harder to discover.
- If the panel collapses without an obvious restore affordance, selected-node work becomes harder to recover.

## Example

- Select an `Osc` node to inspect frequency and modulation details.
- Leave the canvas selection empty to edit graph name and transport defaults.
- Switch to `Code` to review the generated graph component.

## Test Coverage

- Selected node details render.
- The empty state shows graph defaults when nothing is selected.
- The code view stays readable and updates with graph changes.
