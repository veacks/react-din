# 59 Aux Return Node

## Feature

Define the Aux Return node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F59-S01 Aux Return node is discoverable and placeable from the Routing catalog

**User Story** As a contributor, I want to place the Aux Return node from the Routing catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the Routing node catalog in the DIN Editor
**When** they search for or browse to the Aux Return node and place it on the canvas
**Then** the Aux Return node appears with the expected label, category identity, and default selection behavior

### F59-S02 Aux Return node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Aux Return node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Aux Return node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F59-S03 Aux Return node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Aux Return node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Aux Return node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Aux Return node remains coherent across the store, runtime, and generated output contracts
