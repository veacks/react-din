# 08 Inspector Code And Generation

## Feature

Describe how the inspector, code surface, and generation flows react to selection, graph changes, and long-running editor actions inside the Phase 3A workspace.

### F08-S01 Inspector changes follow the current node or graph context

**User Story** As a contributor, I want the inspector to track my current context so I can edit the right thing without second-guessing the active target.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Selective Attention`, `Postel's Law`

**Given** the contributor switches between a selected node and a no-selection graph context
**When** the right pane refreshes
**Then** the editable controls, fallback copy, and next actions match the active context

### F08-S02 Generated code refreshes immediately after graph edits

**User Story** As a contributor, I want generated code to refresh after graph edits so I can trust the code view as a live representation of the current graph.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Doherty Threshold`, `Peak-End Rule`

**Given** the contributor edits graph structure or graph metadata
**When** they inspect the generated code surface
**Then** the code output reflects the latest graph state without requiring a manual recovery step

### F08-S03 Generation flows acknowledge long-running work before completion

**User Story** As a contributor, I want generation flows to acknowledge work immediately so longer-running tasks still feel responsive and trustworthy.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Doherty Threshold`, `Goal-Gradient Effect`, `Peak-End Rule`

**Given** the contributor starts a generate or refresh action from the right panel or its linked review workflow
**When** the operation begins and later completes
**Then** the UI provides immediate acknowledgment, visible progress cues, and a clear completion or handoff state
