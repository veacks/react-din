# 07 Workspace Canvas Actions

## Feature

Describe how contributors place, select, connect, and manipulate nodes inside the Phase 3A graph canvas.

### F07-S01 Node placement from the canvas flow stays discoverable and direct

**User Story** As a contributor, I want to place nodes from the canvas flow with minimal friction so I can keep building graphs in context.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Hick's Law`, `Fitts's Law`

**Given** a contributor is working inside the graph canvas
**When** they add a new node from the in-canvas flow, catalog, or assist menu
**Then** the node appears in context with a predictable selection and placement result

### F07-S02 Compatible handle connection and assist flows stay visible while dragging

**User Story** As a contributor, I want compatible connections to reveal themselves during a drag so I can wire graphs confidently without trial and error.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Selective Attention`, `Fitts's Law`

**Given** a contributor starts a drag from a source or target handle
**When** they hover compatible destinations or invoke the assist menu
**Then** the editor highlights valid targets and keeps the next connection choice explicit

### F07-S03 Canvas selection preserves one dominant focus target at a time

**User Story** As a contributor, I want canvas selection to keep one dominant focus target so the inspector and canvas do not compete for attention.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Selective Attention`, `Hick's Law`

**Given** the canvas contains multiple nodes and edges
**When** the contributor selects a node, edge, or empty area
**Then** the active object, fallback state, and contextual panel stay coherent
