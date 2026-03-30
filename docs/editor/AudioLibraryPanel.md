# Audio Library Panel

## Purpose
Provide a shared, graph-agnostic audio-file manager for editor sampler and convolver workflows.

## Behavior
- The panel is intended to live inside the bottom runtime drawer in the shell refactor.
- The current implementation still appears inside the main editor workspace until that split lands.
- It is collapsed by default and can be expanded from its header toggle.
- It supports multi-file audio uploads (`audio/*`) by file picker and drag-and-drop, search (`Search library files`), preview playback, and forced deletion with confirmation.
- Assets render as file-style tiles with centered play control and muted metadata (`size · duration`).

## Integration Notes
- Assets are stored in a global browser cache and referenced in graph nodes by stable IDs (`sampleId`, `impulseId`).
- Deleting an asset removes cache metadata and clears all sampler/convolver references across all loaded graphs.
- The node-level searchable dropdowns and this panel read from the same asset inventory.
- The runtime drawer should reuse the same inventory so library, runtime, and diagnostics stay aligned.
- Upload validation accepts likely audio files only and rejects files not playable by the current browser (`canPlayType`), with a cross-browser hint favoring MP3/WAV/M4A/AAC.

## Limitations
- V1 supports local file upload only; no remote URL ingestion.
- Preview uses browser media playback and is best-effort if autoplay restrictions or decode issues occur.
