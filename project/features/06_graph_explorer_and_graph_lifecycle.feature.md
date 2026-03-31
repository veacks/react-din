# 06 Graph Explorer And Graph Lifecycle

## Feature

Describe how DIN Editor users create, name, browse, switch, and recover graphs through the Graph Explorer and tab model.

### F06-S01 Graph Explorer exposes empty, single-graph, and multi-graph browsing states

**User Story** As a graph author, I want the Graph Explorer to make graph inventory obvious so I can understand project structure at a glance.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Hick's Law`, `Selective Attention`

**Given** a contributor opens a project with zero, one, or many graphs
**When** they inspect the Graph Explorer
**Then** the list, hierarchy cues, and empty-state guidance remain readable and actionable

### F06-S02 Graph creation and renaming stay immediate and resilient

**User Story** As a contributor, I want graph creation and renaming to feel immediate so I can keep authoring momentum while organizing work.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Doherty Threshold`, `Peak-End Rule`

**Given** a contributor creates a new graph or renames the current graph
**When** they commit the graph name change
**Then** the new name appears immediately across the explorer, tabs, and generated outputs

### F06-S03 Graph tabs preserve context while switching between working surfaces

**User Story** As a contributor, I want graph tabs to preserve context so I can move between related graphs without losing my place.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Zeigarnik Effect`, `Selective Attention`

**Given** multiple graphs are open in the editor
**When** the contributor switches tabs or closes one graph
**Then** the active graph, unsaved state, and fallback selection remain coherent
