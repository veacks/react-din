# Design System

## Purpose

Capture the Phase 3A layout, typography, spacing, elevation, and reusable component rules for launcher and workspace surfaces.

## Responsibilities

- Use a 4 px spacing grid.
- Define `DensityMode = compact | comfortable` for shell-scale variants.
- Keep radius, elevation, and typography scales consistent across panels.
- Treat shell layout variants, action pills, list rows, and node-base cards as reusable primitives rather than one-off screen art.
- Prefer readable, high-density desktop surfaces over decorative chrome.

## Integration Notes

- Figma board `217:2` is the canonical Phase 3A design-system reference for shell and launcher primitives.
- The shell, launcher, and node surfaces should share the same spacing and elevation vocabulary.
- Motion should stay short and interruptible.
- Typography should distinguish technical labels from workspace labels without adding noise.
- Focus, selected, hover, disabled, and success states should follow one shared state vocabulary across action pills, list rows, rail items, and drawer controls.

## Failure Modes

- Ad hoc spacing values make the shell feel inconsistent.
- If density modes are only visual experiments, compact and comfortable variants drift out of sync.
- If action pills or list rows are documented only inside one screen, other Phase 3A surfaces will duplicate them with inconsistent rules.
- Too many elevation layers reduce clarity in a dense canvas UI.

## Example

- Spacing scale: `4 / 8 / 12 / 16 / 20 / 24 / 32`.
- Radius scale: `10 / 14 / 18`.
- Typography scale: `11 / 12 / 13 / 14 / 16 / 20 / 24`.
- Action-pill severity: `info / success / warning / danger`.
- List-row states: `idle / selected / hover / focus`.
- Node-base families: `source / effect / output`.

## Test Coverage

- Panel headers and surfaces use the same spacing rhythm.
- Action pills, list rows, and node-base cards stay coherent across theme and density variants.
- Focus rings remain visible in both light and dark themes.
