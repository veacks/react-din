# Color System

## Purpose

Define the editor's semantic color model for shell surfaces, node families, flow states, and diagnostics.

## Responsibilities

- Separate primitive, semantic, component, and node-family tokens.
- Keep shell colors distinct from signal colors.
- Preserve accessible contrast in both light and dark themes.

## Integration Notes

- Use semantic tokens in components instead of raw hex values.
- Reserve node-family colors for family identity and flow colors for audio/control/trigger states.
- Keep one focus color that reads consistently across surfaces.

## Failure Modes

- Raw hex values in components make theme changes brittle.
- Mixing product accent colors with system state colors confuses selection and error feedback.

## Example

- `surface-panel`, `text-default`, `flow-audio`, `state-danger`, `node-family-source`.

## Test Coverage

- Theme tokens can be reused across shell and node surfaces.
- Contrast-sensitive states remain distinguishable in light and dark modes.
