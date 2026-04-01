# Audio Library Panel

## Purpose
Provide a shared, graph-agnostic audio-file manager for editor sampler and convolver workflows.

## Behavior
- The panel now lives in the left drawer and is opened from the activity rail `Library` mode.
- It shares the drawer shell used by `Graph Explorer` and `Catalog`, so only one left-side context is visible at a time.
- It supports multi-file audio uploads (`audio/*`) by file picker and drag-and-drop, search (`Search library files`), preview playback, and forced deletion with confirmation.
- Assets render as file-style tiles with centered play control and muted metadata (`size · duration`).

## Integration Notes
- Assets are stored in a global browser cache and referenced in graph nodes by stable IDs (`sampleId`, `impulseId`).
- Deleting an asset removes cache metadata and clears all sampler/convolver references across all loaded graphs.
- The node-level searchable dropdowns and this panel read from the same asset inventory.
- The left drawer owns library browsing; the bottom drawer should not reintroduce a second library tab.
- Upload validation accepts likely audio files only and rejects files not playable by the current browser (`canPlayType`), with a cross-browser hint favoring MP3/WAV/M4A/AAC.

## Limitations
- V1 supports local file upload only; no remote URL ingestion.
- Preview uses browser media playback and is best-effort if autoplay restrictions or decode issues occur.
