# Runtime Drawer

## Purpose

Document the bottom drawer that exposes live runtime status and diagnostics beneath the canvas.

## Responsibilities

- Show runtime signals such as MIDI or transport status.
- Surface graph diagnostics without crowding the canvas.
- Support resize and tab switching while preserving state.

## Integration Notes

- The audio library no longer lives in this drawer; library browsing belongs to the left drawer.
- Runtime information must reflect live audio and MIDI state rather than cached snapshots.
- Diagnostics should report graph issues without becoming a blocking modal surface.
- Publish and commit confirmation belong to Source Control and top-bar handoff states, not to the bottom drawer.

## Failure Modes

- Reintroducing the library here would duplicate drawer ownership and compete with the canvas.
- A drawer that cannot be resized is hard to use on wide desktop layouts.

## Example

- Open the `Runtime` tab to review live engine metrics.
- Switch to `Diagnostics` to review graph warnings and missing nodes.

## Test Coverage

- The drawer exposes the expected tabs.
- The `Runtime` and `Diagnostics` tabs are the only bottom-drawer tabs.
- Diagnostics can be shown and hidden without affecting the canvas.
