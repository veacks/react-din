# 62 Math Node

## Feature

Define the Math node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F62-S01 Math node is discoverable and placeable from the Math catalog

**User Story** As a contributor, I want to place the Math node from the Math catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the Math node catalog in the DIN Editor
**When** they search for or browse to the Math node and place it on the canvas
**Then** the Math node appears with the expected label, category identity, and default selection behavior

### F62-S02 Math node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Math node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Math node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F62-S03 Math node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Math node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Math node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Math node remains coherent across the store, runtime, and generated output contracts
