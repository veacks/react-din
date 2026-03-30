# Design System

## Purpose

Capture the shell's layout, typography, spacing, and elevation rules for the editor workspace.

## Responsibilities

- Use a 4 px spacing grid.
- Keep radius, elevation, and typography scales consistent across panels.
- Prefer readable, high-density desktop surfaces over decorative chrome.

## Integration Notes

- The shell and node surfaces should share the same spacing and elevation vocabulary.
- Motion should stay short and interruptible.
- Typography should distinguish technical labels from workspace labels without adding noise.

## Failure Modes

- Ad hoc spacing values make the shell feel inconsistent.
- Too many elevation layers reduce clarity in a dense canvas UI.

## Example

- Spacing scale: `4 / 8 / 12 / 16 / 20 / 24 / 32`.
- Radius scale: `10 / 14 / 18`.
- Typography scale: `11 / 12 / 13 / 14 / 16 / 20 / 24`.

## Test Coverage

- Panel headers and surfaces use the same spacing rhythm.
- Focus rings remain visible in both light and dark themes.
