# Catalog Explorer Panel

## Purpose

Document the left drawer shell used to show graph browsing, node browsing, or library browsing one context at a time.

## Responsibilities

- Show the active left-drawer context selected by the activity rail.
- Host `Graph Explorer`, `Catalog`, or `Audio Library` with a stable header and collapse affordance.
- Keep drag-and-drop and click-to-add behaviors obvious when the active context is the node catalog.
- Preserve a single ownership model for left-side browsing surfaces.

## Integration Notes

- The panel should reuse the same node catalog data that powers drag creation on the canvas.
- Templates should load complete starter graphs, not partial fragments.
- Library browsing should reuse the shared asset inventory used by sampler and convolver nodes.
- Source Control and publish work belong to the `review` rail mode, not to this browse drawer.
- The drawer must remain useful even when reopened from the compact activity rail.

## Failure Modes

- Multiple left-side surfaces visible at the same time weaken the wireframe hierarchy.
- A catalog that only works by scrolling is too slow for heavy editor use.
- Search without category context makes discovery harder.
- Duplicate actions between the browser and the top bar create inconsistent workflows.

## Example

- Open `Explorer` to switch graphs or launch a starter template.
- Open `Catalog` to search for `Oscillator`, then drag it onto the graph.
- Open `Library` to browse shared audio assets without leaving the left drawer.

## Test Coverage

- The drawer header follows the active left-drawer view.
- Category labels render for the catalog view.
- Template buttons load the expected starter graphs.
- The library view renders in the same shell without using the bottom drawer.
