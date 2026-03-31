# 23 Transport Node

## Feature

Define the Transport node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F23-S01 Transport node is discoverable and placeable from the Sources catalog

**User Story** As a contributor, I want to place the Transport node from the Sources catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the Sources node catalog in the DIN Editor
**When** they search for or browse to the Transport node and place it on the canvas
**Then** the Transport node appears with the expected label, category identity, and default selection behavior

### F23-S02 Transport node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Transport node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Transport node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F23-S03 Transport node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Transport node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Transport node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Transport node remains coherent across the store, runtime, and generated output contracts

### F23-S04 Transport node enforces its singleton placement rule without breaking graph authoring

**User Story** As a contributor, I want the Transport node to enforce its singleton rule clearly so I do not accidentally corrupt the graph while adding required system nodes.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Zeigarnik Effect`

**Given** a graph already contains a Transport node
**When** the contributor attempts to place another Transport node
**Then** the editor prevents invalid duplication and preserves the active graph state with a clear recovery path
