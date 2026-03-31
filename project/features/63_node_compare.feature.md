# 63 Compare Node

## Feature

Define the Compare node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F63-S01 Compare node is discoverable and placeable from the Math catalog

**User Story** As a contributor, I want to place the Compare node from the Math catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the Math node catalog in the DIN Editor
**When** they search for or browse to the Compare node and place it on the canvas
**Then** the Compare node appears with the expected label, category identity, and default selection behavior

### F63-S02 Compare node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Compare node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Compare node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F63-S03 Compare node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Compare node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Compare node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Compare node remains coherent across the store, runtime, and generated output contracts
