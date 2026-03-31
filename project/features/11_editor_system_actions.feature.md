# 11 Editor System Actions

## Feature

Describe the cross-cutting editor actions that preserve progress, support recovery, and keep interrupted work resumable.

### F11-S01 Undo and redo preserve graph intent without corrupting the active session

**User Story** As a contributor, I want undo and redo to preserve my graph intent so I can explore safely and recover quickly from mistakes.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Zeigarnik Effect`, `Peak-End Rule`

**Given** the contributor performs one or more graph edits
**When** they trigger undo or redo from the keyboard or command surface
**Then** the graph state, selection, and visible outputs move coherently between revisions

### F11-S02 Save and reload flows restore durable graph state while sanitizing transient runtime state

**User Story** As a contributor, I want save and reload to restore my work reliably so I can leave and return without corrupting the session.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Doherty Threshold`, `Zeigarnik Effect`

**Given** the contributor saves a graph and later reloads the editor
**When** the graph document is restored
**Then** durable graph data returns intact while transient playback or session state is normalized

### F11-S03 Interrupted work remains visible and resumable until it is completed

**User Story** As a contributor, I want interrupted work to remain visible until I finish it so I can resume important tasks without reconstructing context.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Zeigarnik Effect`, `Goal-Gradient Effect`

**Given** the contributor leaves an in-progress draft, generation, or repair task unfinished
**When** they return to the editor later
**Then** the editor exposes a resumable entry point and removes that tension only after completion
