# Runtime Drawer

## Purpose

Document the bottom drawer that unifies audio assets, runtime state, and diagnostics.

## Responsibilities

- Host the audio library.
- Show runtime signals such as MIDI or transport status.
- Surface graph diagnostics without crowding the canvas.
- Support resize and tab switching while preserving state.

## Integration Notes

- Library state should remain shared with sampler and convolver nodes.
- Runtime information must reflect live audio and MIDI state rather than cached snapshots.
- Diagnostics should report graph issues without becoming a blocking modal surface.

## Failure Modes

- Keeping the library separate from runtime diagnostics leads to duplicated storage and browsing patterns.
- A drawer that cannot be resized is hard to use on wide desktop layouts.

## Example

- Open the `Library` tab to import or preview audio assets.
- Switch to `Diagnostics` to review graph warnings and missing nodes.

## Test Coverage

- The drawer exposes the expected tabs.
- Library search and preview still work.
- Diagnostics can be shown and hidden without affecting the canvas.
