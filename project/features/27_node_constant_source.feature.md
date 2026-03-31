# 27 Constant Source Node

## Feature

Define the Constant Source node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F27-S01 Constant Source node is discoverable and placeable from the Sources catalog

**User Story** As a contributor, I want to place the Constant Source node from the Sources catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the Sources node catalog in the DIN Editor
**When** they search for or browse to the Constant Source node and place it on the canvas
**Then** the Constant Source node appears with the expected label, category identity, and default selection behavior

### F27-S02 Constant Source node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Constant Source node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Constant Source node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F27-S03 Constant Source node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Constant Source node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Constant Source node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Constant Source node remains coherent across the store, runtime, and generated output contracts
