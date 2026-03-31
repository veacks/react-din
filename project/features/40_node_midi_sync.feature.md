# 40 Sync Node

## Feature

Define the Sync node as a stable, testable DIN Editor contract across catalog discovery, editable controls, handle exposure, and graph integration.

### F40-S01 Sync node is discoverable and placeable from the MIDI catalog

**User Story** As a contributor, I want to place the Sync node from the MIDI catalog so I can use it without guessing where it belongs in the editor.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Fitts's Law`

**Given** a contributor opens the MIDI node catalog in the DIN Editor
**When** they search for or browse to the Sync node and place it on the canvas
**Then** the Sync node appears with the expected label, category identity, and default selection behavior

### F40-S02 Sync node exposes its contract handles and editable settings

**User Story** As a contributor, I want the Sync node to expose the right handles and editable settings so I can wire it confidently and understand its contract.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Selective Attention`

**Given** the Sync node is selected in the editor
**When** the contributor inspects the node body, handles, and contextual controls
**Then** the node exposes the expected handles, editable settings, and default state for its contract

### F40-S03 Sync node stays coherent through graph, runtime, and code generation

**User Story** As a contributor, I want the Sync node to stay coherent across the graph model, runtime behavior, and generated code so implementation stays trustworthy.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Doherty Threshold`

**Given** the Sync node participates in a valid DIN Editor graph
**When** the graph is edited, evaluated, or translated into generated code
**Then** the Sync node remains coherent across the store, runtime, and generated output contracts

### F40-S04 Sync node enforces its singleton placement rule without breaking graph authoring

**User Story** As a contributor, I want the Sync node to enforce its singleton rule clearly so I do not accidentally corrupt the graph while adding required system nodes.
**Future Test Layer** `integration` via `vitest`
**UX Laws** `Postel's Law`, `Zeigarnik Effect`

**Given** a graph already contains a Sync node
**When** the contributor attempts to place another Sync node
**Then** the editor prevents invalid duplication and preserves the active graph state with a clear recovery path
