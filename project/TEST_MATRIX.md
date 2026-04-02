| Scenario ID | Feature | Scenario | Layer | Runner | Status | UX Laws | Linear Issue |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `F01-S01` | Public Library Components | Core provider change stays documented and tested | integration | `vitest` + RTL | baseline | - | - |
| `F01-S02` | Public Library Components | Public audio node components stay aligned | integration | `vitest` + RTL | baseline | - | - |
| `F01-S03` | Public Library Components | Transport, analyzer, source, and effect surfaces stay aligned | integration | `vitest` + RTL | baseline | - | - |
| `F01-S04` | Public Library Components | MIDI surfaces stay aligned | integration | `vitest` + RTL | planned | - | - |
| `F01-S05` | Public Library Components | Patch import and runtime surfaces stay aligned | integration | `vitest` + RTL | planned | - | - |
| `F02-S01` | Editor Nodes | Source, effect, and routing nodes stay aligned | integration | `vitest` | baseline | - | - |
| `F02-S02` | Editor Nodes | Data and control nodes keep their contracts | integration | `vitest` | baseline | - | - |
| `F02-S03` | Editor Nodes | Timing and voice nodes remain integration-safe | integration | `vitest` | baseline | - | - |
| `F02-S04` | Editor Nodes | MIDI nodes stay aligned | integration | `vitest` | planned | - | - |
| `F03-S01` | Editor Integration | Voice synth graphs run across transport, sequencing, voice, envelope, and output | e2e | `playwright` | baseline | - | - |
| `F03-S02` | Editor Integration | Saved graphs reload safely | e2e | `playwright` | baseline | - | - |
| `F03-S03` | Editor Integration | Generated React code matches mixed audio and data graphs | integration | `vitest` | baseline | - | - |
| `F03-S04` | Editor Integration | Browser audio smoke remains available | manual-smoke | browser | planned | - | - |
| `F03-S05` | Editor Integration | New modulation effects stay coherent from node UI to runtime | integration | `vitest` | baseline | - | - |
| `F03-S06` | Editor Integration | Advanced routing and sidechain remain stable during rewiring | integration | `vitest` | baseline | - | - |
| `F03-S07` | Editor Integration | MIDI note, CC, and clock flows stay coherent across node UI, runtime, and generated code | integration | `vitest` | planned | - | - |
| `F03-S08` | Editor Integration | Patch export and round-trip import stay coherent | integration | `vitest` | planned | - | - |
| `F04-S01` | Docs And Change Gates | Documentation stays in English | unit | `node` validation scripts | baseline | - | - |
| `F04-S02` | Docs And Change Gates | Mapped source changes update docs and tests | unit | `node` validation scripts | baseline | - | - |
| `F04-S03` | Docs And Change Gates | New nodes and public components update all required touch points | unit | `node` validation scripts | baseline | - | - |
| `F04-S04` | Docs And Change Gates | Patch schema stays aligned with the public patch contract | unit | `node` validation scripts | baseline | - | - |
| `F05-S01` | DIN Editor Shell And Navigation | Shell layout keeps rail, canvas, inspector, and status responsibilities explicit | e2e | `playwright` | planned | `Jakob's Law`, `Selective Attention` | VEA-88 |
| `F05-S02` | DIN Editor Shell And Navigation | Navigation changes preserve focus and immediate orientation | e2e | `playwright` | planned | `Doherty Threshold`, `Selective Attention` | VEA-91 |
| `F05-S03` | DIN Editor Shell And Navigation | Footer status remains informative without competing with the active task | e2e | `playwright` | planned | `Selective Attention`, `Von Restorff Effect` | VEA-139 |
| `F06-S01` | Graph Explorer And Graph Lifecycle | Graph Explorer exposes empty, single-graph, and multi-graph browsing states without competing with launcher entry flows | e2e | `playwright` | planned | `Hick's Law`, `Selective Attention` | VEA-93 |
| `F06-S02` | Graph Explorer And Graph Lifecycle | Graph creation and renaming stay immediate and resilient | e2e | `playwright` | planned | `Doherty Threshold`, `Peak-End Rule` | VEA-95 |
| `F06-S03` | Graph Explorer And Graph Lifecycle | Graph tabs preserve context while switching between working surfaces | e2e | `playwright` | planned | `Zeigarnik Effect`, `Selective Attention` | VEA-97 |
| `F07-S01` | Workspace Canvas Actions | Node placement from the canvas flow stays discoverable and direct | e2e | `playwright` | planned | `Hick's Law`, `Fitts's Law` | VEA-99 |
| `F07-S02` | Workspace Canvas Actions | Compatible handle connection and assist flows stay visible while dragging | e2e | `playwright` | planned | `Selective Attention`, `Fitts's Law` | VEA-140 |
| `F07-S03` | Workspace Canvas Actions | Canvas selection preserves one dominant focus target at a time | e2e | `playwright` | planned | `Selective Attention`, `Hick's Law` | VEA-142 |
| `F08-S01` | Inspector Code And Generation | Inspector changes follow the current node or graph context | e2e | `playwright` | planned | `Selective Attention`, `Postel's Law` | VEA-145 |
| `F08-S02` | Inspector Code And Generation | Generated code refreshes immediately after graph edits | e2e | `playwright` | planned | `Doherty Threshold`, `Peak-End Rule` | VEA-147 |
| `F08-S03` | Inspector Code And Generation | Generation flows acknowledge long-running work before completion | e2e | `playwright` | planned | `Doherty Threshold`, `Goal-Gradient Effect`, `Peak-End Rule` | VEA-148 |
| `F09-S01` | Source Control Actions | Source Control prioritizes the next relevant review action | e2e | `playwright` | planned | `Hick's Law`, `Selective Attention` | VEA-149 |
| `F09-S02` | Source Control Actions | Generate and review actions acknowledge progress without silent waiting | e2e | `playwright` | planned | `Doherty Threshold`, `Goal-Gradient Effect` | VEA-151 |
| `F09-S03` | Source Control Actions | Commit controls keep message, changed-file context, and primary action explicit before write | e2e | `playwright` | planned | `Hick's Law`, `Selective Attention` | - |
| `F09-S04` | Source Control Actions | Commit completion lands on a memorable, confidence-building end state | e2e | `playwright` | planned | `Peak-End Rule`, `Von Restorff Effect` | VEA-153 |
| `F10-S01` | Asset Library Actions | Asset search and filtering reduce the visible decision set | e2e | `playwright` | planned | `Hick's Law`, `Selective Attention` | VEA-156 |
| `F10-S02` | Asset Library Actions | Asset preview and relink flows recover from imperfect input gracefully | e2e | `playwright` | planned | `Postel's Law`, `Doherty Threshold` | VEA-158 |
| `F10-S03` | Asset Library Actions | Missing asset repair ends on a clear and satisfying recovery state | e2e | `playwright` | planned | `Peak-End Rule`, `Von Restorff Effect` | VEA-160 |
| `F11-S01` | Editor System Actions | Undo and redo preserve graph intent without corrupting the active session | e2e | `playwright` | planned | `Zeigarnik Effect`, `Peak-End Rule` | VEA-161 |
| `F11-S02` | Editor System Actions | Save and reload flows restore durable graph state while sanitizing transient runtime state | e2e | `playwright` | planned | `Doherty Threshold`, `Zeigarnik Effect` | VEA-163 |
| `F11-S03` | Editor System Actions | Interrupted work remains visible and resumable until it is completed | e2e | `playwright` | planned | `Zeigarnik Effect`, `Goal-Gradient Effect` | VEA-164 |
| `F12-S01` | Launcher Entry Flows | Recent work, search, and open actions preserve immediate orientation | e2e | `playwright` | planned | `Jakob's Law`, `Selective Attention` | - |
| `F12-S02` | Launcher Entry Flows | Templates, import, and recover stay first-class entry actions | e2e | `playwright` | planned | `Hick's Law`, `Postel's Law` | - |
| `F12-S03` | Launcher Entry Flows | Interrupted-work resume stays visible at product entry | e2e | `playwright` | planned | `Zeigarnik Effect`, `Goal-Gradient Effect` | - |
| `F20-S01` | Params Node | Params node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-166 |
| `F20-S02` | Params Node | Params node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-168 |
| `F20-S03` | Params Node | Params node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-171 |
| `F21-S01` | UI Tokens Node | UI Tokens node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-172 |
| `F21-S02` | UI Tokens Node | UI Tokens node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-174 |
| `F21-S03` | UI Tokens Node | UI Tokens node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-176 |
| `F22-S01` | Event Trigger Node | Event Trigger node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-178 |
| `F22-S02` | Event Trigger Node | Event Trigger node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-180 |
| `F22-S03` | Event Trigger Node | Event Trigger node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-182 |
| `F23-S01` | Transport Node | Transport node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-184 |
| `F23-S02` | Transport Node | Transport node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-185 |
| `F23-S03` | Transport Node | Transport node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-187 |
| `F23-S04` | Transport Node | Transport node enforces its singleton placement rule without breaking graph authoring | integration | `vitest` | planned | `Postel's Law`, `Zeigarnik Effect` | VEA-186 |
| `F24-S01` | Step Sequencer Node | Step Sequencer node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-188 |
| `F24-S02` | Step Sequencer Node | Step Sequencer node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-189 |
| `F24-S03` | Step Sequencer Node | Step Sequencer node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-190 |
| `F25-S01` | Piano Roll Node | Piano Roll node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-191 |
| `F25-S02` | Piano Roll Node | Piano Roll node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-192 |
| `F25-S03` | Piano Roll Node | Piano Roll node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-193 |
| `F26-S01` | LFO Node | LFO node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-194 |
| `F26-S02` | LFO Node | LFO node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-195 |
| `F26-S03` | LFO Node | LFO node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-196 |
| `F27-S01` | Constant Source Node | Constant Source node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-197 |
| `F27-S02` | Constant Source Node | Constant Source node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-198 |
| `F27-S03` | Constant Source Node | Constant Source node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-199 |
| `F28-S01` | Media Stream Node | Media Stream node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-202 |
| `F28-S02` | Media Stream Node | Media Stream node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-205 |
| `F28-S03` | Media Stream Node | Media Stream node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-206 |
| `F29-S01` | Voice Node | Voice node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-208 |
| `F29-S02` | Voice Node | Voice node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-210 |
| `F29-S03` | Voice Node | Voice node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-214 |
| `F30-S01` | ADSR Node | ADSR node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-212 |
| `F30-S02` | ADSR Node | ADSR node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-216 |
| `F30-S03` | ADSR Node | ADSR node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-218 |
| `F31-S01` | Note Node | Note node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-220 |
| `F31-S02` | Note Node | Note node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-223 |
| `F31-S03` | Note Node | Note node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-225 |
| `F32-S01` | Oscillator Node | Oscillator node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-226 |
| `F32-S02` | Oscillator Node | Oscillator node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-227 |
| `F32-S03` | Oscillator Node | Oscillator node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-230 |
| `F33-S01` | Noise Node | Noise node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-233 |
| `F33-S02` | Noise Node | Noise node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-235 |
| `F33-S03` | Noise Node | Noise node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-238 |
| `F34-S01` | Noise Burst Node | Noise Burst node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-240 |
| `F34-S02` | Noise Burst Node | Noise Burst node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-242 |
| `F34-S03` | Noise Burst Node | Noise Burst node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-244 |
| `F35-S01` | Sampler Node | Sampler node is discoverable and placeable from the Sources catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-92 |
| `F35-S02` | Sampler Node | Sampler node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-94 |
| `F35-S03` | Sampler Node | Sampler node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-98 |
| `F36-S01` | Midi In Node | Midi In node is discoverable and placeable from the MIDI catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-80 |
| `F36-S02` | Midi In Node | Midi In node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-81 |
| `F36-S03` | Midi In Node | Midi In node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-82 |
| `F37-S01` | Knob / CC In Node | Knob / CC In node is discoverable and placeable from the MIDI catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-83 |
| `F37-S02` | Knob / CC In Node | Knob / CC In node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-101 |
| `F37-S03` | Knob / CC In Node | Knob / CC In node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-102 |
| `F38-S01` | Note Out Node | Note Out node is discoverable and placeable from the MIDI catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-104 |
| `F38-S02` | Note Out Node | Note Out node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-200 |
| `F38-S03` | Note Out Node | Note Out node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-201 |
| `F39-S01` | CC Out Node | CC Out node is discoverable and placeable from the MIDI catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-203 |
| `F39-S02` | CC Out Node | CC Out node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-204 |
| `F39-S03` | CC Out Node | CC Out node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-207 |
| `F40-S01` | Sync Node | Sync node is discoverable and placeable from the MIDI catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-209 |
| `F40-S02` | Sync Node | Sync node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-211 |
| `F40-S03` | Sync Node | Sync node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-213 |
| `F40-S04` | Sync Node | Sync node enforces its singleton placement rule without breaking graph authoring | integration | `vitest` | planned | `Postel's Law`, `Zeigarnik Effect` | VEA-215 |
| `F41-S01` | Gain Node | Gain node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-217 |
| `F41-S02` | Gain Node | Gain node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-219 |
| `F41-S03` | Gain Node | Gain node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-243 |
| `F42-S01` | Filter Node | Filter node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-221 |
| `F42-S02` | Filter Node | Filter node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-222 |
| `F42-S03` | Filter Node | Filter node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-224 |
| `F43-S01` | Compressor Node | Compressor node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-228 |
| `F43-S02` | Compressor Node | Compressor node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-229 |
| `F43-S03` | Compressor Node | Compressor node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-231 |
| `F44-S01` | Delay Node | Delay node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-232 |
| `F44-S02` | Delay Node | Delay node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-234 |
| `F44-S03` | Delay Node | Delay node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-236 |
| `F45-S01` | Reverb Node | Reverb node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-237 |
| `F45-S02` | Reverb Node | Reverb node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-239 |
| `F45-S03` | Reverb Node | Reverb node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-241 |
| `F46-S01` | Phaser Node | Phaser node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-135 |
| `F46-S02` | Phaser Node | Phaser node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-136 |
| `F46-S03` | Phaser Node | Phaser node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-137 |
| `F47-S01` | Flanger Node | Flanger node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-138 |
| `F47-S02` | Flanger Node | Flanger node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-141 |
| `F47-S03` | Flanger Node | Flanger node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-143 |
| `F48-S01` | Tremolo Node | Tremolo node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-144 |
| `F48-S02` | Tremolo Node | Tremolo node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-146 |
| `F48-S03` | Tremolo Node | Tremolo node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-150 |
| `F49-S01` | EQ3 Node | EQ3 node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-152 |
| `F49-S02` | EQ3 Node | EQ3 node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-154 |
| `F49-S03` | EQ3 Node | EQ3 node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-155 |
| `F50-S01` | Distortion Node | Distortion node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-157 |
| `F50-S02` | Distortion Node | Distortion node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-162 |
| `F50-S03` | Distortion Node | Distortion node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-159 |
| `F51-S01` | Chorus Node | Chorus node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-96 |
| `F51-S02` | Chorus Node | Chorus node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-84 |
| `F51-S03` | Chorus Node | Chorus node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-165 |
| `F52-S01` | WaveShaper Node | WaveShaper node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-85 |
| `F52-S02` | WaveShaper Node | WaveShaper node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-86 |
| `F52-S03` | WaveShaper Node | WaveShaper node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-87 |
| `F53-S01` | Convolver Node | Convolver node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-90 |
| `F53-S02` | Convolver Node | Convolver node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-89 |
| `F53-S03` | Convolver Node | Convolver node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-167 |
| `F54-S01` | Analyzer Node | Analyzer node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-100 |
| `F54-S02` | Analyzer Node | Analyzer node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-103 |
| `F54-S03` | Analyzer Node | Analyzer node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-105 |
| `F55-S01` | Pan Node | Pan node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-106 |
| `F55-S02` | Pan Node | Pan node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-107 |
| `F55-S03` | Pan Node | Pan node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-108 |
| `F56-S01` | Panner 3D Node | Panner 3D node is discoverable and placeable from the Effects catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-109 |
| `F56-S02` | Panner 3D Node | Panner 3D node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-110 |
| `F56-S03` | Panner 3D Node | Panner 3D node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-111 |
| `F57-S01` | Mixer Node | Mixer node is discoverable and placeable from the Routing catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-112 |
| `F57-S02` | Mixer Node | Mixer node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-113 |
| `F57-S03` | Mixer Node | Mixer node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-114 |
| `F58-S01` | Aux Send Node | Aux Send node is discoverable and placeable from the Routing catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-115 |
| `F58-S02` | Aux Send Node | Aux Send node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-116 |
| `F58-S03` | Aux Send Node | Aux Send node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-118 |
| `F59-S01` | Aux Return Node | Aux Return node is discoverable and placeable from the Routing catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-117 |
| `F59-S02` | Aux Return Node | Aux Return node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-119 |
| `F59-S03` | Aux Return Node | Aux Return node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-120 |
| `F60-S01` | Matrix Mixer Node | Matrix Mixer node is discoverable and placeable from the Routing catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-121 |
| `F60-S02` | Matrix Mixer Node | Matrix Mixer node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-122 |
| `F60-S03` | Matrix Mixer Node | Matrix Mixer node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-123 |
| `F61-S01` | Output Node | Output node is discoverable and placeable from the Routing catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-124 |
| `F61-S02` | Output Node | Output node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-125 |
| `F61-S03` | Output Node | Output node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-127 |
| `F61-S04` | Output Node | Output node enforces its singleton placement rule without breaking graph authoring | integration | `vitest` | planned | `Postel's Law`, `Zeigarnik Effect` | VEA-126 |
| `F62-S01` | Math Node | Math node is discoverable and placeable from the Math catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-129 |
| `F62-S02` | Math Node | Math node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-128 |
| `F62-S03` | Math Node | Math node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-130 |
| `F63-S01` | Compare Node | Compare node is discoverable and placeable from the Math catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-131 |
| `F63-S02` | Compare Node | Compare node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-132 |
| `F63-S03` | Compare Node | Compare node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-133 |
| `F64-S01` | Mix Node | Mix node is discoverable and placeable from the Math catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-134 |
| `F64-S02` | Mix Node | Mix node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-169 |
| `F64-S03` | Mix Node | Mix node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-170 |
| `F65-S01` | Clamp Node | Clamp node is discoverable and placeable from the Math catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-173 |
| `F65-S02` | Clamp Node | Clamp node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-179 |
| `F65-S03` | Clamp Node | Clamp node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-175 |
| `F66-S01` | Switch Node | Switch node is discoverable and placeable from the Math catalog | integration | `vitest` | planned | `Postel's Law`, `Fitts's Law` | VEA-177 |
| `F66-S02` | Switch Node | Switch node exposes its contract handles and editable settings | integration | `vitest` | planned | `Selective Attention` | VEA-181 |
| `F66-S03` | Switch Node | Switch node stays coherent through graph, runtime, and code generation | integration | `vitest` | planned | `Doherty Threshold` | VEA-183 |
