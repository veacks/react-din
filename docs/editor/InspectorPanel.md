# Inspector Panel

## Purpose

Document the right-side panel that exposes the selected node's details and technical output.

## Responsibilities

- Default to `Inspect` when a node is selected.
- Expose `Code` as a secondary view for generated output.
- Keep advanced parameters out of the canvas when possible.
- Support empty states when nothing is selected.

## Integration Notes

- The inspector should be driven by selected-node state from the editor store.
- Inline node controls should stay compact and defer advanced settings to this panel.
- Code output must stay in sync with the active graph and selected project name.

## Failure Modes

- If `Inspect` and `Code` are implicit, users can miss the distinction between editing and code review.
- If the panel collapses without an obvious restore affordance, selected-node work becomes harder to recover.

## Example

- Select an `Osc` node to inspect frequency and modulation details.
- Switch to `Code` to review the generated graph component.

## Test Coverage

- Selected node details render.
- The empty state falls back to code output when nothing is selected.
- The code view stays readable and updates with graph changes.
