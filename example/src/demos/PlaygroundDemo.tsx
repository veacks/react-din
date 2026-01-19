import { useState, useMemo, useCallback, type FC } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    type NodeTypes,
    type Node,
    type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './playground/playground.css';
import Inspector from './playground/Inspector';

import { useAudioGraphStore, type AudioNodeData } from './playground/store';
import {
    OscNode,
    GainNode,
    FilterNode,
    OutputNode,
    NoiseNode,
    DelayNode,
    ReverbNode,
    StereoPannerNode,
    MixerNode,
    InputNode,
    NoteNode,
    TransportNode,
    StepSequencerNode,
    PianoRollNode,
    LFONode,
    ADSRNode,
    VoiceNode,
} from './playground/nodes';
import { generateCode } from './playground/CodeGenerator';

// Node types mapping - all available nodes
const nodeTypes: NodeTypes = {
    oscNode: OscNode as NodeTypes[string],
    gainNode: GainNode as NodeTypes[string],
    filterNode: FilterNode as NodeTypes[string],
    outputNode: OutputNode as NodeTypes[string],
    noiseNode: NoiseNode as NodeTypes[string],
    delayNode: DelayNode as NodeTypes[string],
    reverbNode: ReverbNode as NodeTypes[string],
    pannerNode: StereoPannerNode as NodeTypes[string],
    mixerNode: MixerNode as NodeTypes[string],
    inputNode: InputNode as NodeTypes[string],
    noteNode: NoteNode as NodeTypes[string],
    transportNode: TransportNode as NodeTypes[string],
    stepSequencerNode: StepSequencerNode as NodeTypes[string],
    pianoRollNode: PianoRollNode as NodeTypes[string],
    lfoNode: LFONode as NodeTypes[string],
    adsrNode: ADSRNode as NodeTypes[string],
    voiceNode: VoiceNode as NodeTypes[string],
};

// Node palette categories
const nodeCategories = [
    {
        name: 'Sources',
        nodes: [
            { type: 'input', label: 'Input', icon: '⏱️', color: '#dddddd' },
            { type: 'transport', label: 'Transport', icon: '⏯️', color: '#dddddd' },
            { type: 'stepSequencer', label: 'Step Sequencer', icon: '🎹', color: '#dddddd' },
            { type: 'pianoRoll', label: 'Piano Roll', icon: '🎼', color: '#44ccff' },
            { type: 'lfo', label: 'LFO', icon: '🌀', color: '#aa44ff' },
            { type: 'voice', label: 'Voice', icon: '🗣️', color: '#ff4466' },
            { type: 'adsr', label: 'ADSR', icon: '📈', color: '#dddddd' },
            { type: 'note', label: 'Note', icon: '🎵', color: '#ffcc00' },
            { type: 'osc', label: 'Oscillator', icon: '◐', color: '#ff8844' },
            { type: 'noise', label: 'Noise', icon: '〰️', color: '#888888' },
        ],
    },
    {
        name: 'Effects',
        nodes: [
            { type: 'gain', label: 'Gain', icon: '◧', color: '#44cc44' },
            { type: 'filter', label: 'Filter', icon: '◇', color: '#aa44ff' },
            { type: 'delay', label: 'Delay', icon: '⏱️', color: '#4488ff' },
            { type: 'reverb', label: 'Reverb', icon: '🏛️', color: '#8844ff' },
            { type: 'panner', label: 'Pan', icon: '↔️', color: '#44ffff' },
        ],
    },
    {
        name: 'Routing',
        nodes: [
            { type: 'mixer', label: 'Mixer', icon: '⊕', color: '#ffaa44' },
            { type: 'output', label: 'Output', icon: '🔊', color: '#ff4466' },
        ],
    },
];

// Node palette for adding new nodes
const NodePalette: FC = () => {
    const addNode = useAudioGraphStore((s) => s.addNode);

    const handleDragStart = useCallback((e: React.DragEvent, nodeType: string) => {
        e.dataTransfer.setData('application/reactflow', nodeType);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    return (
        <div className="node-palette">
            {nodeCategories.map((category) => (
                <div key={category.name} className="palette-category">
                    <h4>{category.name}</h4>
                    <div className="palette-nodes">
                        {category.nodes.map((node) => (
                            <div
                                key={node.type}
                                className="palette-node"
                                style={{ borderLeftColor: node.color }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, node.type)}
                                onClick={() => addNode(node.type as AudioNodeData['type'])}
                            >
                                <span className="icon">{node.icon}</span>
                                <span>{node.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Code preview panel
const CodePreview: FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-preview">
            <div className="code-header">
                <h3>📄 Generated Code</h3>
                <button
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>
            <pre className="code-content">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export const PlaygroundDemo: FC = () => {
    const nodes = useAudioGraphStore((s) => s.nodes);
    const edges = useAudioGraphStore((s) => s.edges);
    const onNodesChange = useAudioGraphStore((s) => s.onNodesChange);
    const onEdgesChange = useAudioGraphStore((s) => s.onEdgesChange);
    const onConnect = useAudioGraphStore((s) => s.onConnect);
    const addNode = useAudioGraphStore((s) => s.addNode);

    const setSelectedNode = useAudioGraphStore((s) => s.setSelectedNode);

    // Generate code from current graph
    const generatedCode = useMemo(() => generateCode(nodes, edges), [nodes, edges]);

    // Handle drop from palette
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow') as AudioNodeData['type'];
            if (!type) return;

            const reactFlowBounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
            if (!reactFlowBounds) return;

            const position = {
                x: event.clientX - reactFlowBounds.left - 80,
                y: event.clientY - reactFlowBounds.top - 50,
            };

            addNode(type, position);
        },
        [addNode]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Handle selection
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node.id);
    }, [setSelectedNode]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    return (
        <div className="playground-demo">
            <style>{`
                .playground-demo {
                    display: grid;
                    grid-template-columns: 200px 1fr 300px;
                    height: calc(100vh - 60px);
                    gap: 0;
                    background: #0a0a12;
                }

                /* Left sidebar */
                .sidebar {
                    display: flex;
                    flex-direction: column;
                    background: #12121a;
                    border-right: 1px solid #2a2a3a;
                    overflow: hidden;
                }
                
                /* Right Inspector */
                .inspector-panel {
                    border-left: 1px solid #2a2a3a;
                    background: #16161e;
                    overflow: hidden;
                }

                .node-palette {
                    flex: 0 0 auto;
                    padding: 12px;
                    border-bottom: 1px solid #2a2a3a;
                    overflow-y: auto;
                    max-height: 50%;
                }
                
                /* ... keep existing styles ... */
                
                /* Code preview adjustment */
                .code-preview {
                   display: flex;
                   flex-direction: column;
                   flex: 1;
                   min-height: 0;
                }
                
                /* Existing styles... I'll assume they persist or need to be re-added if I'm replacing the whole layout.
                   Wait, I am doing a partial replace of the logic + render. 
                   Ideally I should just inject the Inspector. 
                   But I need to change grid-template-columns. */

                .palette-category {
                    margin-bottom: 16px;
                }

                .palette-category h4 {
                    margin: 0 0 8px 0;
                    font-size: 10px;
                    text-transform: uppercase;
                    color: #555;
                    letter-spacing: 1px;
                }

                .palette-nodes {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .palette-node {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 10px;
                    background: #1e1e2e;
                    border-radius: 4px;
                    border-left: 3px solid #888;
                    cursor: grab;
                    transition: all 0.2s;
                    color: #c0c0c0;
                    font-size: 11px;
                    flex: 1 1 45%;
                    min-width: 90px;
                }

                .palette-node:hover {
                    background: #2a2a3a;
                    transform: translateY(-1px);
                }

                .palette-node .icon {
                    font-size: 12px;
                }

                /* Code preview */
                .code-preview {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 0;
                }

                .code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 12px;
                    background: #1a1a22;
                    border-bottom: 1px solid #2a2a3a;
                }

                .code-header h3 {
                    margin: 0;
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #555;
                    letter-spacing: 1px;
                }

                .copy-btn {
                    padding: 4px 8px;
                    background: #2a2a3a;
                    border: none;
                    border-radius: 3px;
                    color: #888;
                    cursor: pointer;
                    font-size: 10px;
                    transition: all 0.2s;
                }

                .copy-btn:hover { background: #3a3a4a; color: #fff; }
                .copy-btn.copied { background: #22aa44; color: #fff; }

                .code-content {
                    flex: 1;
                    margin: 0;
                    padding: 10px 12px;
                    overflow: auto;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 10px;
                    line-height: 1.4;
                    color: #a0a0b0;
                    background: #0e0e16;
                }

                .code-content code {
                    white-space: pre;
                }

                /* ReactFlow canvas */
                .canvas-container {
                    position: relative;
                    background: #0a0a12;
                }

                .react-flow {
                    background: #0a0a12;
                }

                .react-flow__background {
                    background: #0a0a12;
                }

                .react-flow__edge-path {
                    stroke: #4488ff;
                    stroke-width: 2;
                }

                .react-flow__edge-path:hover {
                    stroke: #66aaff;
                }

                /* Audio nodes styling */
                .audio-node {
                    background: #1a1a24;
                    border: 1px solid #2a2a3a;
                    border-radius: 6px;
                    min-width: 140px;
                    font-family: system-ui, sans-serif;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .audio-node.selected {
                    border-color: #4488ff;
                    box-shadow: 0 0 0 2px rgba(68,136,255,0.3);
                }

                .node-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 5px 5px 0 0;
                    font-weight: 600;
                    font-size: 11px;
                    color: #fff;
                    cursor: grab;
                }
                
                .node-header:active {
                    cursor: grabbing;
                }

                .osc-node .node-header { background: #ff8844; }
                .gain-node .node-header { background: #44cc44; }
                .filter-node .node-header { background: #aa44ff; }
                .output-node .node-header { background: #ff4466; }
                .noise-node .node-header { background: #666666; }
                .delay-node .node-header { background: #4488ff; }
                .reverb-node .node-header { background: #8844ff; }
                .panner-node .node-header { background: #44cccc; }
                .mixer-node .node-header { background: #ffaa44; }
                .input-node .node-header { background: #555555; }

                .node-icon { font-size: 12px; }
                .node-title { flex: 1; }

                .node-content {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .node-control {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .node-control label {
                    font-size: 9px;
                    text-transform: uppercase;
                    color: #555;
                    letter-spacing: 0.5px;
                }

                .node-control input[type="range"] {
                    width: 100%;
                    height: 3px;
                    border-radius: 2px;
                    background: #2a2a3a;
                    outline: none;
                    -webkit-appearance: none;
                }

                .node-control input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #4488ff;
                    cursor: pointer;
                }

                .node-control select {
                    padding: 3px 6px;
                    background: #2a2a3a;
                    border: none;
                    border-radius: 3px;
                    color: #e0e0e0;
                    font-size: 10px;
                    cursor: pointer;
                }

                .node-control .value {
                    font-size: 10px;
                    color: #4488ff;
                    text-align: right;
                }

                .play-button {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .play-button.play {
                    background: linear-gradient(135deg, #22cc66, #22aa55);
                    color: white;
                }

                .play-button.stop {
                    background: linear-gradient(135deg, #ff4466, #dd3355);
                    color: white;
                }

                .output-node.playing {
                    animation: pulse 1s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 4px 20px rgba(255,68,102,0.4); }
                }

                /* Handles - vertical layout */
                .handle {
                    width: 10px !important;
                    height: 10px !important;
                    border-radius: 50% !important;
                    background: #2a2a3a !important;
                    border: 2px solid #4488ff !important;
                }

                .handle:hover {
                    background: #4488ff !important;
                }
                
                .handle-audio {
                   background: #00ff41 !important;
                   border-color: #00ff41 !important;
                }

                /* MiniMap */
                .react-flow__minimap {
                    background: #1a1a24;
                    border-radius: 6px;
                }

                /* Controls */
                .react-flow__controls {
                    border-radius: 6px;
                    overflow: hidden;
                }

                .react-flow__controls-button {
                    background: #1a1a24;
                    border-bottom: 1px solid #2a2a3a;
                }

                .react-flow__controls-button:hover {
                    background: #2a2a3a;
                }

                .react-flow__controls-button svg {
                    fill: #888;
                }
            `}</style>

            <div className="sidebar">
                <NodePalette />

                <div className="templates-section" style={{ borderTop: '1px solid #2a2a3a', padding: '12px', flex: '0 0 auto' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '10px', textTransform: 'uppercase', color: '#555', letterSpacing: '1px' }}>Templates</h4>
                    <button
                        onClick={() => {
                            const nodes: Node<AudioNodeData>[] = [
                                { id: 'transport', type: 'transportNode', dragHandle: '.node-header', position: { x: 50, y: 50 }, data: { type: 'transport', bpm: 120, playing: false, label: 'Transport' } as any },
                                { id: 'sequencer', type: 'stepSequencerNode', dragHandle: '.node-header', position: { x: 50, y: 200 }, data: { type: 'stepSequencer', steps: 16, pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], activeSteps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], label: 'Step Sequencer' } as any },
                                { id: 'voice', type: 'voiceNode', dragHandle: '.node-header', position: { x: 300, y: 200 }, data: { type: 'voice', portamento: 0, label: 'Voice' } as any },
                                { id: 'osc', type: 'oscNode', dragHandle: '.node-header', position: { x: 550, y: 150 }, data: { type: 'osc', frequency: 0, waveform: 'sawtooth', detune: 0, label: 'Oscillator' } as any },
                                { id: 'adsr', type: 'adsrNode', dragHandle: '.node-header', position: { x: 550, y: 300 }, data: { type: 'adsr', attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5, label: 'ADSR' } as any },
                                { id: 'gain', type: 'gainNode', dragHandle: '.node-header', position: { x: 800, y: 200 }, data: { type: 'gain', gain: 0, label: 'VCA' } as any },
                                { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 1000, y: 200 }, data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' } as any }
                            ];
                            const edges = [
                                // Transport -> Sequencer
                                { id: 'e_t_s', source: 'transport', target: 'sequencer', style: { stroke: '#4488ff', strokeDasharray: '5,5' }, animated: true },
                                // Sequencer -> Voice (Trigger)
                                { id: 'e_s_v', source: 'sequencer', target: 'voice', targetHandle: 'trigger', style: { stroke: '#ff4466' }, animated: true },
                                // Voice (Note) -> Osc (Freq)
                                { id: 'e_v_osc', source: 'voice', sourceHandle: 'note', target: 'osc', targetHandle: 'frequency', style: { stroke: '#ff8844' }, animated: true },
                                // Voice (Gate) -> ADSR (simulated connection for visual, logic handled by engine loop if connected)
                                { id: 'e_v_adsr', source: 'voice', sourceHandle: 'gate', target: 'adsr', style: { stroke: '#44cc44' }, animated: true },
                                // Osc -> Gain
                                { id: 'e_osc_gain', source: 'osc', target: 'gain', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false },
                                // ADSR -> Gain (Mod)
                                { id: 'e_adsr_gain', source: 'adsr', target: 'gain', targetHandle: 'gain', style: { stroke: '#4488ff' }, animated: true },
                                // Gain -> Output
                                { id: 'e_gain_out', source: 'gain', target: 'output', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false }
                            ];

                            useAudioGraphStore.getState().loadGraph(nodes, edges);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px',
                            background: '#1e1e2e',
                            border: '1px solid #2a2a3a',
                            borderRadius: '4px',
                            color: '#c0c0c0',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        <span style={{ fontSize: '14px' }}>🎹</span>
                        <span>Voice Synth</span>
                    </button>

                    <button
                        onClick={() => {
                            const nodes: Node<AudioNodeData>[] = [
                                { id: 'transport', type: 'transportNode', dragHandle: '.node-header', position: { x: 50, y: 50 }, data: { type: 'transport', bpm: 120, playing: false, label: 'Transport' } as any },
                                { id: 'sequencer', type: 'stepSequencerNode', dragHandle: '.node-header', position: { x: 50, y: 200 }, data: { type: 'stepSequencer', steps: 16, pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], activeSteps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], label: 'Kick Seq' } as any },
                                { id: 'noise', type: 'noiseNode', dragHandle: '.node-header', position: { x: 300, y: 200 }, data: { type: 'noise', noiseType: 'white', label: 'Noise' } as any },
                                { id: 'adsr', type: 'adsrNode', dragHandle: '.node-header', position: { x: 500, y: 200 }, data: { type: 'adsr', attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, label: 'Env' } as any },
                                { id: 'gain', type: 'gainNode', dragHandle: '.node-header', position: { x: 700, y: 200 }, data: { type: 'gain', gain: 0, label: 'VCA' } as any },
                                { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 900, y: 200 }, data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' } as any }
                            ];
                            const edges = [
                                { id: 'e_t_s', source: 'transport', target: 'sequencer', style: { stroke: '#4488ff', strokeDasharray: '5,5' }, animated: true },
                                // Sequencer -> ADSR (Direct Trigger)
                                { id: 'e_s_adsr', source: 'sequencer', target: 'adsr', style: { stroke: '#ff4466' }, animated: true },
                                // Noise -> Gain
                                { id: 'e_n_g', source: 'noise', target: 'gain', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false },
                                // ADSR -> Gain (Mod)
                                { id: 'e_a_g', source: 'adsr', target: 'gain', targetHandle: 'gain', style: { stroke: '#4488ff' }, animated: true },
                                // Gain -> Out
                                { id: 'e_g_o', source: 'gain', target: 'output', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false }
                            ];
                            useAudioGraphStore.getState().loadGraph(nodes, edges);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px',
                            background: '#1e1e2e',
                            border: '1px solid #2a2a3a',
                            borderRadius: '4px',
                            color: '#c0c0c0',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginTop: '8px'
                        }}
                    >
                        <span style={{ fontSize: '14px' }}>🥁</span>
                        <span>Drum Synth</span>
                    </button>

                    <button
                        onClick={() => {
                            const notes = [
                                { pitch: 60, step: 0, duration: 1, velocity: 0.8 },  // C4
                                { pitch: 64, step: 2, duration: 1, velocity: 0.8 },  // E4
                                { pitch: 67, step: 4, duration: 1, velocity: 0.8 },  // G4
                                { pitch: 72, step: 6, duration: 2, velocity: 1.0 },  // C5
                                { pitch: 60, step: 8, duration: 1, velocity: 0.6 },  // C4
                                { pitch: 62, step: 10, duration: 1, velocity: 0.7 }, // D4
                                { pitch: 64, step: 12, duration: 1, velocity: 0.8 }, // E4
                                { pitch: 67, step: 14, duration: 1, velocity: 0.9 }, // G4
                            ];
                            const nodes: Node<AudioNodeData>[] = [
                                { id: 'transport', type: 'transportNode', dragHandle: '.node-header', position: { x: 50, y: 50 }, data: { type: 'transport', bpm: 100, playing: false, label: 'Transport' } as any },
                                { id: 'pianoroll', type: 'pianoRollNode', dragHandle: '.node-header', position: { x: 50, y: 180 }, data: { type: 'pianoRoll', steps: 16, octaves: 2, baseNote: 48, notes, label: 'Piano Roll' } as any },
                                { id: 'voice', type: 'voiceNode', dragHandle: '.node-header', position: { x: 500, y: 200 }, data: { type: 'voice', portamento: 0.02, label: 'Voice' } as any },
                                { id: 'osc', type: 'oscNode', dragHandle: '.node-header', position: { x: 700, y: 150 }, data: { type: 'osc', frequency: 0, waveform: 'sine', detune: 0, label: 'Oscillator' } as any },
                                { id: 'adsr', type: 'adsrNode', dragHandle: '.node-header', position: { x: 700, y: 300 }, data: { type: 'adsr', attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.3, label: 'ADSR' } as any },
                                { id: 'gain', type: 'gainNode', dragHandle: '.node-header', position: { x: 900, y: 200 }, data: { type: 'gain', gain: 0, label: 'VCA' } as any },
                                { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 1100, y: 200 }, data: { type: 'output', masterGain: 0.4, playing: false, label: 'Output' } as any }
                            ];
                            const edges = [
                                // Transport -> Piano Roll
                                { id: 'e_t_pr', source: 'transport', target: 'pianoroll', style: { stroke: '#4488ff', strokeDasharray: '5,5' }, animated: true },
                                // Piano Roll -> Voice (Trigger)
                                { id: 'e_pr_v', source: 'pianoroll', target: 'voice', targetHandle: 'trigger', style: { stroke: '#ff4466' }, animated: true },
                                // Voice (Note) -> Osc (Freq)
                                { id: 'e_v_osc', source: 'voice', sourceHandle: 'note', target: 'osc', targetHandle: 'frequency', style: { stroke: '#ff8844' }, animated: true },
                                // Voice (Gate) -> ADSR
                                { id: 'e_v_adsr', source: 'voice', sourceHandle: 'gate', target: 'adsr', style: { stroke: '#44cc44' }, animated: true },
                                // Osc -> Gain
                                { id: 'e_osc_gain', source: 'osc', target: 'gain', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false },
                                // ADSR -> Gain (Mod)
                                { id: 'e_adsr_gain', source: 'adsr', target: 'gain', targetHandle: 'gain', style: { stroke: '#4488ff' }, animated: true },
                                // Gain -> Output
                                { id: 'e_gain_out', source: 'gain', target: 'output', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false }
                            ];
                            useAudioGraphStore.getState().loadGraph(nodes, edges);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px',
                            background: '#1e1e2e',
                            border: '1px solid #44ccff',
                            borderRadius: '4px',
                            color: '#44ccff',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginTop: '8px'
                        }}
                    >
                        <span style={{ fontSize: '14px' }}>🎼</span>
                        <span>Piano Roll Synth</span>
                    </button>

                    <button
                        onClick={() => {
                            const nodes: Node<AudioNodeData>[] = [
                                { id: 'transport', type: 'transportNode', dragHandle: '.node-header', position: { x: 50, y: 50 }, data: { type: 'transport', bpm: 140, playing: false, label: 'Transport' } as any },
                                { id: 'sequencer', type: 'stepSequencerNode', dragHandle: '.node-header', position: { x: 50, y: 180 }, data: { type: 'stepSequencer', steps: 16, pattern: [1, 0.6, 0.8, 0.5, 1, 0.4, 0.9, 0.6, 1, 0.5, 0.7, 0.4, 1, 0.6, 0.8, 0.9], activeSteps: [true, true, true, false, true, true, true, false, true, false, true, true, true, true, false, true], label: 'Acid Seq' } as any },
                                { id: 'voice', type: 'voiceNode', dragHandle: '.node-header', position: { x: 350, y: 180 }, data: { type: 'voice', portamento: 0.03, label: 'Voice' } as any },
                                { id: 'osc', type: 'oscNode', dragHandle: '.node-header', position: { x: 550, y: 100 }, data: { type: 'osc', frequency: 0, waveform: 'sawtooth', detune: 0, label: 'VCO' } as any },
                                { id: 'filter', type: 'filterNode', dragHandle: '.node-header', position: { x: 800, y: 150 }, data: { type: 'filter', frequency: 600, q: 15, filterType: 'lowpass', label: 'VCF' } as any },
                                { id: 'lfo', type: 'lfoNode', dragHandle: '.node-header', position: { x: 550, y: 350 }, data: { type: 'lfo', rate: 0.5, depth: 400, waveform: 'sine', label: 'LFO' } as any },
                                { id: 'adsr', type: 'adsrNode', dragHandle: '.node-header', position: { x: 550, y: 220 }, data: { type: 'adsr', attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.1, label: 'Filter Env' } as any },
                                { id: 'vca', type: 'gainNode', dragHandle: '.node-header', position: { x: 1000, y: 150 }, data: { type: 'gain', gain: 0.7, label: 'VCA' } as any },
                                { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 1200, y: 150 }, data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' } as any }
                            ];
                            const edges = [
                                // Transport -> Sequencer
                                { id: 'e_t_s', source: 'transport', target: 'sequencer', style: { stroke: '#4488ff', strokeDasharray: '5,5' }, animated: true },
                                // Sequencer -> Voice (Trigger)
                                { id: 'e_s_v', source: 'sequencer', target: 'voice', targetHandle: 'trigger', style: { stroke: '#ff4466' }, animated: true },
                                // Voice (Note) -> Osc (Freq)
                                { id: 'e_v_osc', source: 'voice', sourceHandle: 'note', target: 'osc', targetHandle: 'frequency', style: { stroke: '#ff8844' }, animated: true },
                                // Voice (Gate) -> ADSR
                                { id: 'e_v_adsr', source: 'voice', sourceHandle: 'gate', target: 'adsr', style: { stroke: '#44cc44' }, animated: true },
                                // Osc -> Filter
                                { id: 'e_osc_filt', source: 'osc', target: 'filter', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false },
                                // ADSR -> Filter (Frequency mod)
                                { id: 'e_adsr_filt', source: 'adsr', target: 'filter', targetHandle: 'frequency', style: { stroke: '#aa44ff' }, animated: true },
                                // LFO -> Filter (Frequency mod - wobble)
                                { id: 'e_lfo_filt', source: 'lfo', sourceHandle: 'out', target: 'filter', targetHandle: 'frequency', style: { stroke: '#ff44aa' }, animated: true },
                                // Filter -> VCA
                                { id: 'e_filt_vca', source: 'filter', target: 'vca', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false },
                                // VCA -> Output
                                { id: 'e_vca_out', source: 'vca', target: 'output', sourceHandle: 'out', targetHandle: 'in', style: { stroke: '#44cc44', strokeWidth: 3 }, animated: false }
                            ];
                            useAudioGraphStore.getState().loadGraph(nodes, edges);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px',
                            background: '#1e1e2e',
                            border: '1px solid #aa44ff',
                            borderRadius: '4px',
                            color: '#aa44ff',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginTop: '8px'
                        }}
                    >
                        <span style={{ fontSize: '14px' }}>🧪</span>
                        <span>Acid Synth</span>
                    </button>
                </div>

                <CodePreview code={generatedCode} />
            </div>

            <div
                className="canvas-container"
                onDrop={onDrop}
                onDragOver={onDragOver}
            >
                <ReactFlow
                    nodes={nodes as unknown as Node[]}
                    edges={edges}
                    onNodesChange={onNodesChange as unknown as OnNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    snapToGrid
                    snapGrid={[15, 15]}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: true,
                    }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3a" />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            switch (node.type) {
                                case 'oscNode': return '#ff8844';
                                case 'gainNode': return '#44cc44';
                                case 'filterNode': return '#aa44ff';
                                case 'outputNode': return '#ff4466';
                                case 'noiseNode': return '#666666';
                                case 'delayNode': return '#4488ff';
                                case 'reverbNode': return '#8844ff';
                                case 'pannerNode': return '#44cccc';
                                case 'mixerNode': return '#ffaa44';
                                default: return '#888';
                            }
                        }}
                        maskColor="rgba(0,0,0,0.8)"
                    />
                </ReactFlow>
            </div>

            <div className="inspector-panel">
                <Inspector />
            </div>
        </div>
    );
};

export default PlaygroundDemo;
