# Color System

## Purpose

Define the editor's semantic color model for Phase 3A shell surfaces, launcher surfaces, node families, flow states, and diagnostics.

## Responsibilities

- Separate primitive, semantic, component, and node-family tokens.
- Keep one semantic mapping for `StatusSeverity = info | success | warning | danger`.
- Keep shell colors distinct from signal colors.
- Preserve accessible contrast in both light and dark themes.

## Integration Notes

- Use semantic tokens in components instead of raw hex values.
- Phase 3A foundations should keep light and dark variants aligned through semantic tokens such as `surface-base`, `surface-panel`, `surface-elevated`, `surface-overlay`, `text-default`, `text-muted`, `text-subtle`, and `text-inverse`.
- Reserve node-family colors for family identity and flow colors for audio/control/trigger states.
- Map action-pill severities and review states through `state-info`, `state-success`, `state-warning`, and `state-danger`.
- Keep one focus color that reads consistently across surfaces.

## Failure Modes

- Raw hex values in components make theme changes brittle.
- Mixing product accent colors with system state colors confuses selection and error feedback.
- If launcher and workspace use different semantic token names for the same state, cross-surface status becomes harder to scan.

## Example

- `surface-panel`, `text-default`, `flow-audio`, `state-danger`, `node-family-source`, `state-success`.

## Test Coverage

- Theme tokens can be reused across shell and node surfaces.
- Severity colors remain distinguishable in action pills, footer states, and review messaging.
- Contrast-sensitive states remain distinguishable in light and dark modes.
