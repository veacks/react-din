# 38 Note Out Node

## Feature

Define the Note Out node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F38-S01 Note Out node is discoverable and placeable from the MIDI catalog

**User Story** As a contributor, I want to place the Note Out node from the MIDI catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the MIDI node catalog in the DIN Editor
**When** they search for or browse to the Note Out node and place it on the canvas
**Then** the Note Out node appears with the expected label, category identity, and default selection behavior

### F38-S02 Note Out node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Note Out node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Note Out node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F38-S03 Note Out node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Note Out node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Note Out node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Note Out node remains coherent across the store, runtime, and generated output contracts
