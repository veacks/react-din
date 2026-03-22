# DIN Vanilla Runtime

## Purpose

`@din/vanilla` is the browser-facing runtime layer for DIN. It hosts the shared Web Audio graph builders and the web binding surface that sits between `din-core` and higher-level consumers such as `@din/react` and `@din/editor`.

## Current Responsibilities

- expose shared audio graph builders for composite nodes and effects
- expose browser-safe DSP helpers backed by the current DIN core bridge
- keep Web Audio graph creation logic out of React bindings and editor-specific code where possible

## Integration Notes

- `@din/react` should treat this package as the source of truth for shared browser-side audio graph behavior
- `@din/editor` should reuse these builders instead of maintaining duplicate effect/composite topologies
- `react-din` should not depend on this package directly; it should flow through `@din/react`

## Future Direction

- move the DIN core bridge fully under the vanilla package boundary
- bind generated WASM exports from the Rust `din-core` crates
- keep browser-only capabilities here: `AudioContext`, destination wiring, media capture, MIDI access, analyzers, and asset decoding
