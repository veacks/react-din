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
    SequencerNode,
    ADSRNode,
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
    sequencerNode: SequencerNode as NodeTypes[string],
    adsrNode: ADSRNode as NodeTypes[string],
};

// Node palette categories
const nodeCategories = [
    {
        name: 'Sources',
        nodes: [
            { type: 'input', label: 'Input', icon: '⏱️', color: '#dddddd' },
            { type: 'transport', label: 'Transport', icon: '⏯️', color: '#dddddd' },
            { type: 'sequencer', label: 'Sequencer', icon: '🎹', color: '#dddddd' },
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
