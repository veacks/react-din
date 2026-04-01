# 05 DIN Editor Shell And Navigation

## Feature

Describe the cross-platform shell, navigation model, and persistent orientation cues that anchor all DIN Editor work.

### F05-S01 Shell layout keeps activity rail, workspace, inspector, and status bar responsibilities explicit

**User Story** As a DIN Editor operator, I want the shell regions to stay stable so I can navigate the app without re-learning the layout on each screen.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Jakob's Law`, `Selective Attention`

**Given** a contributor reviews the DIN Editor shell in its default desktop state
**When** they move between the activity rail, the left drawer, the primary workspace, the inspector, and the footer status area
**Then** each region keeps a stable responsibility, a stable hierarchy, and clear navigation affordances

### F05-S02 Navigation changes preserve focus and immediate orientation

**User Story** As a graph author, I want navigation changes to preserve my orientation so I do not lose context when switching panels or tabs.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Doherty Threshold`, `Selective Attention`

**Given** a contributor switches between `Explorer`, `Catalog`, `Library`, `Runtime`, and `Inspect`
**When** the active panel or tab changes
**Then** the app acknowledges the change immediately and keeps the new focus target visually explicit

### F05-S03 Footer status remains informative without competing with the active task

**User Story** As a contributor, I want status telemetry to stay visible but quiet so it informs me without stealing focus from the active task.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Selective Attention`, `Von Restorff Effect`

**Given** the editor exposes connection, dirty-state, or audio telemetry in the footer
**When** the user is focused on graph authoring or review work
**Then** the footer remains scannable, non-blocking, and visually subordinate to the main task area
