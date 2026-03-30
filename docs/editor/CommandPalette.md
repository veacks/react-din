# Command Palette

## Purpose

Document the command launcher for secondary editor actions and global workspace commands.

## Responsibilities

- Provide a `Cmd/Ctrl+K` entry point.
- Surface graph, view, and utility actions in one searchable list.
- Keep destructive or rarely used actions out of the top bar.

## Integration Notes

- The palette should call existing editor actions instead of duplicating command logic.
- It should respect editable targets so keyboard input fields do not trigger global commands.
- Search and categorization should be fast enough to replace menu hunting.

## Failure Modes

- If the palette is not comprehensive, users still have to hunt through multiple panels.
- If commands do not expose clear labels, the palette becomes harder to learn than the toolbar it replaced.

## Example

- Press `Cmd+K`, search for `Auto Arrange`, and run the command without leaving the canvas.

## Test Coverage

- The palette opens from the keyboard shortcut.
- It can be dismissed with `Escape`.
- Commands stay wired to the same editor operations used by the toolbar.
