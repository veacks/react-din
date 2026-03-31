# 41 Gain Node

## Feature

Define the Gain node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F41-S01 Gain node is discoverable and placeable from the Effects catalog

**User Story** As a contributor, I want to place the Gain node from the Effects catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the Effects node catalog in the DIN Editor
**When** they search for or browse to the Gain node and place it on the canvas
**Then** the Gain node appears with the expected label, category identity, and default selection behavior

### F41-S02 Gain node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Gain node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Gain node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F41-S03 Gain node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Gain node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Gain node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Gain node remains coherent across the store, runtime, and generated output contracts
