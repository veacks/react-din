# Test Matrix

| Scenario ID | Feature | Scenario | Layer | Runner | Status |
| --- | --- | --- | --- | --- | --- |
| `F01-S01` | Public Library Components | Core provider change stays documented and tested | integration | `vitest` + RTL | baseline |
| `F01-S02` | Public Library Components | Public audio node components stay aligned | integration | `vitest` + RTL | baseline |
| `F01-S03` | Public Library Components | Transport, analyzer, source, and effect surfaces stay aligned | integration | `vitest` + RTL | baseline |
| `F01-S04` | Public Library Components | MIDI surfaces stay aligned | integration | `vitest` + RTL | planned |
| `F01-S05` | Public Library Components | Patch import and runtime surfaces stay aligned | integration | `vitest` + RTL | planned |
| `F02-S01` | Editor Nodes | Source, effect, and routing nodes stay aligned | integration | `vitest` | baseline |
| `F02-S02` | Editor Nodes | Data and control nodes keep their contracts | integration | `vitest` | baseline |
| `F02-S03` | Editor Nodes | Timing and voice nodes remain integration-safe | integration | `vitest` | baseline |
| `F02-S04` | Editor Nodes | MIDI nodes stay aligned | integration | `vitest` | planned |
| `F03-S01` | Editor Integration | Voice synth graphs run across transport, sequencing, voice, envelope, and output | e2e | `playwright` | baseline |
| `F03-S02` | Editor Integration | Saved graphs reload safely | e2e | `playwright` | baseline |
| `F03-S03` | Editor Integration | Generated React code matches mixed audio and data graphs | integration | `vitest` | baseline |
| `F03-S04` | Editor Integration | Browser audio smoke remains available | manual-smoke | browser | planned |
| `F03-S05` | Editor Integration | New modulation effects stay coherent from node UI to runtime | integration | `vitest` | baseline |
| `F03-S06` | Editor Integration | Advanced routing and sidechain remain stable during rewiring | integration | `vitest` | baseline |
| `F03-S07` | Editor Integration | MIDI note, CC, and clock flows stay coherent across node UI, runtime, and generated code | integration | `vitest` | planned |
| `F03-S08` | Editor Integration | Patch export and round-trip import stay coherent | integration | `vitest` | planned |
| `F04-S01` | Docs And Change Gates | Documentation stays in English | unit | `node` validation scripts | baseline |
| `F04-S02` | Docs And Change Gates | Mapped source changes update docs and tests | unit | `node` validation scripts | baseline |
| `F04-S03` | Docs And Change Gates | New nodes and public components update all required touch points | unit | `node` validation scripts | baseline |
| `F04-S04` | Docs And Change Gates | Patch schema stays aligned with the public patch contract | unit | `node` validation scripts | baseline |
