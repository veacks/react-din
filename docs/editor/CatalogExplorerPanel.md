# Catalog Explorer Panel

## Purpose

Document the left-side browser used to find graphs, browse nodes, and launch templates quickly.

## Responsibilities

- Show the active project and its graph list.
- Provide a searchable node catalog with category grouping.
- Surface templates and recent items for faster graph creation.
- Keep drag-and-drop and click-to-add behaviors obvious.

## Integration Notes

- The panel should reuse the same node catalog data that powers drag creation on the canvas.
- Templates should load complete starter graphs, not partial fragments.
- The catalog must remain useful even when the panel is collapsed to a compact rail state.

## Failure Modes

- A catalog that only works by scrolling is too slow for heavy editor use.
- Search without category context makes discovery harder.
- Duplicate actions between the browser and the top bar create inconsistent workflows.

## Example

- Search for `Oscillator`, then click the node tile to add it to the graph.
- Open a template such as `Voice Synth` to populate a complete starter patch.

## Test Coverage

- Category labels render.
- Node tiles are clickable and add nodes.
- Template buttons load the expected starter graphs.
