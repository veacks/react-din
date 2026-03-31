# 09 Source Control Actions

## Feature

Describe how the Source Control surface helps contributors generate artifacts, review changes, and finish with a clear commit outcome.

### F09-S01 Source Control prioritizes the next relevant review action

**User Story** As a contributor, I want the Source Control view to surface the next useful action so I do not have to scan multiple competing controls.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Hick's Law`, `Selective Attention`

**Given** generated artifacts or graph changes exist
**When** the contributor opens Source Control
**Then** the changed-file list, review state, and primary action reflect the most relevant next step

### F09-S02 Generate and review actions acknowledge progress without silent waiting

**User Story** As a contributor, I want generate and review actions to acknowledge work immediately so I can trust the system while it prepares outputs.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Doherty Threshold`, `Goal-Gradient Effect`

**Given** the contributor starts a generation or review-preparation action from Source Control
**When** the action starts and later resolves
**Then** the UI gives immediate feedback, visible progress framing, and a clean ready state

### F09-S03 Commit completion lands on a memorable, confidence-building end state

**User Story** As a contributor, I want commit completion to end on a strong confirmation state so I leave the flow confident about what happened next.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Peak-End Rule`, `Von Restorff Effect`

**Given** the contributor completes the commit flow successfully
**When** the final state is displayed
**Then** the result summarizes the outcome, confirms success, and provides a clean next action
