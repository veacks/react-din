import { create } from 'zustand';
import {
    type Edge,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
} from '@xyflow/react';
import { audioEngine } from './AudioEngine';
import { normalizeGraphName } from './graphUtils';

// ============================================================================
// Audio Node Data Types
// ============================================================================

export interface OscNodeData {
    type: 'osc';
    frequency: number;
    detune: number;
    waveform: OscillatorType;
    label: string;
}

export interface GainNodeData {
    type: 'gain';
    gain: number;
    label: string;
}

export interface FilterNodeData {
    type: 'filter';
    filterType: BiquadFilterType;
    frequency: number;
    detune: number;
    q: number;
    gain: number; // For peaking, lowshelf, highshelf
    label: string;
}

export interface OutputNodeData {
    type: 'output';
    playing: boolean;
    masterGain: number;
    label: string;
}

export interface NoiseNodeData {
    type: 'noise';
    noiseType: 'white' | 'pink' | 'brown';
    label: string;
}

export interface DelayNodeData {
    type: 'delay';
    delayTime: number;
    feedback: number;
    label: string;
}

export interface ReverbNodeData {
    type: 'reverb';
    decay: number;
    mix: number;
    label: string;
}

export interface StereoPannerNodeData {
    type: 'panner';
    pan: number;
    label: string;
}

export interface MixerNodeData {
    type: 'mixer';
    inputs: number;
    label: string;
}

export interface InputParam {
    id: string; // Unique ID for keying
    name: string;
    type: 'float'; // Extensible for later
    defaultValue: number;
    value: number; // Current value
    min: number;
    max: number;
    label?: string; // Optional display label
}

export interface InputNodeData {
    type: 'input';
    transportEnabled: boolean;
    bpm: number;
    params: InputParam[];
    label: string;
}

export interface NoteNodeData {
    type: 'note';
    note: string;
    octave: number;
    frequency: number;
    language: 'en' | 'fr';
    label: string;
}

export interface LFONodeData {
    type: 'lfo';
    rate: number;       // Hz (0.1 - 20)
    depth: number;      // 0 - 1
    waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
    label: string;
    [key: string]: unknown;
}

export interface ADSRNodeData {
    type: 'adsr';
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    label: string;
    [key: string]: unknown;
}

export interface StepSequencerNodeData {
    type: 'stepSequencer';
    steps: number;
    pattern: number[]; // Velocities (0-1)
    activeSteps: boolean[]; // On/Off toggles
    label: string;
    [key: string]: unknown;
}

export interface NoteEvent {
    pitch: number;      // MIDI note number (0-127)
    step: number;       // Start step (0-based)
    duration: number;   // Duration in steps
    velocity: number;   // 0-1
}

export interface PianoRollNodeData {
    type: 'pianoRoll';
    steps: number;      // 16, 32, 64
    octaves: number;    // 2-4 octaves
    baseNote: number;   // Base MIDI note (e.g., 48 for C3)
    notes: NoteEvent[];
    label: string;
    [key: string]: unknown;
}

export interface TransportNodeData {
    type: 'transport';
    bpm: number;
    playing: boolean;
    label: string;
}

export interface VoiceNodeData {
    type: 'voice';
    /** Portamento time in seconds */
    portamento: number;
    label: string;
    [key: string]: unknown;
}

export interface SamplerNodeData {
    type: 'sampler';
    src: string;           // URL of the sample
    loop: boolean;         // Whether to loop
    playbackRate: number;  // Playback speed (1 = normal)
    detune: number;        // Detune in cents
    loaded: boolean;       // Whether the sample is loaded
    sampleId?: string;     // Cache ID for stored audio
    fileName?: string;     // Original file name
    label: string;
    [key: string]: unknown;
}

export type AudioNodeData = (
    | OscNodeData
    | GainNodeData
    | FilterNodeData
    | OutputNodeData
    | NoiseNodeData
    | DelayNodeData
    | ReverbNodeData
    | StereoPannerNodeData
    | MixerNodeData
    | InputNodeData
    | NoteNodeData
    | LFONodeData
    | TransportNodeData
    | StepSequencerNodeData
    | PianoRollNodeData
    | ADSRNodeData
    | VoiceNodeData
    | SamplerNodeData
) & Record<string, unknown>;

export interface GraphDocument {
    id: string;
    name: string;
    nodes: Node<AudioNodeData>[];
    edges: Edge[];
    createdAt: number;
    updatedAt: number;
    order: number;
}

// ============================================================================
// Store State
// ============================================================================

interface AudioGraphState {
    nodes: Node<AudioNodeData>[];
    edges: Edge[];
    graphs: GraphDocument[];
    activeGraphId: string | null;
    isHydrated: boolean;
    audioContext: AudioContext | null;
    selectedNodeId: string | null;

    // React Flow handlers
    onNodesChange: OnNodesChange<Node<AudioNodeData>>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Graph actions
    setGraphs: (graphs: GraphDocument[], activeGraphId?: string | null) => void;
    setActiveGraph: (graphId: string) => void;
    createGraph: (name?: string) => GraphDocument;
    renameGraph: (graphId: string, name: string) => void;
    removeGraph: (graphId: string) => GraphDocument | null;
    setHydrated: (isHydrated: boolean) => void;

    // Custom actions
    addNode: (type: AudioNodeData['type'], position?: { x: number; y: number }) => void;
    updateNodeData: (nodeId: string, data: Partial<AudioNodeData>) => void;
    removeNode: (nodeId: string) => void;
    loadGraph: (nodes: Node<AudioNodeData>[], edges: Edge[]) => void;
    setPlaying: (playing: boolean) => void;
    setSelectedNode: (nodeId: string | null) => void;
    initAudioContext: () => void;
}

let nodeIdCounter = 0;
const getNodeId = () => `node_${++nodeIdCounter}`;

const deepClone = <T>(value: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as T;
};

const createGraphId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `graph_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const stopOutputNodes = (nodes: Node<AudioNodeData>[]) =>
    nodes.map((node) => {
        if (node.data.type !== 'output') return node;
        return {
            ...node,
            data: {
                ...node.data,
                playing: false,
            } as OutputNodeData,
        };
    });

const syncNodeIdCounter = (nodes: Node<AudioNodeData>[]) => {
    let maxId = 0;

    nodes.forEach((node) => {
        const match = /^node_(\d+)$/.exec(node.id);
        if (!match) return;
        const value = Number(match[1]);
        if (Number.isFinite(value)) {
            maxId = Math.max(maxId, value);
        }
    });

    if (maxId > nodeIdCounter) {
        nodeIdCounter = maxId;
    }
};

// Initial nodes - Horizontal layout
const initialNodes: Node<AudioNodeData>[] = [
    {
        id: 'osc_1',
        type: 'oscNode',
        position: { x: 50, y: 150 },
        dragHandle: '.node-header',
        data: { type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' } as AudioNodeData,
    },
    {
        id: 'gain_1',
        type: 'gainNode',
        position: { x: 300, y: 150 },
        dragHandle: '.node-header',
        data: { type: 'gain', gain: 0.5, label: 'Gain' } as AudioNodeData,
    },
    {
        id: 'output_1',
        type: 'outputNode',
        position: { x: 520, y: 150 },
        dragHandle: '.node-header',
        data: { type: 'output', playing: false, masterGain: 0.5, label: 'Output' } as AudioNodeData,
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'osc_1', target: 'gain_1', sourceHandle: 'out', targetHandle: 'in' },
    { id: 'e2-3', source: 'gain_1', target: 'output_1', sourceHandle: 'out', targetHandle: 'in' },
];

const initialGraph: GraphDocument = {
    id: createGraphId(),
    name: 'Graph 1',
    nodes: deepClone(initialNodes),
    edges: deepClone(initialEdges),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    order: 0,
};

export const useAudioGraphStore = create<AudioGraphState>((set, get) => ({
    nodes: initialGraph.nodes,
    edges: initialGraph.edges,
    graphs: [initialGraph],
    activeGraphId: initialGraph.id,
    isHydrated: false,
    audioContext: null,
    selectedNodeId: null,

    setHydrated: (isHydrated) => set({ isHydrated }),

    setGraphs: (graphs, activeGraphId) => {
        const now = Date.now();
        const normalizedGraphs = (graphs.length ? graphs : get().graphs).map((graph, index) => ({
            ...graph,
            name: normalizeGraphName(graph.name),
            createdAt: graph.createdAt ?? now,
            updatedAt: graph.updatedAt ?? now,
            order: graph.order ?? index,
        }));

        const orderedGraphs = [...normalizedGraphs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const fallbackGraph = orderedGraphs[0];
        if (!fallbackGraph) return;

        const resolvedActiveId = activeGraphId && orderedGraphs.some((graph) => graph.id === activeGraphId)
            ? activeGraphId
            : fallbackGraph.id;
        const activeGraph = orderedGraphs.find((graph) => graph.id === resolvedActiveId) ?? fallbackGraph;

        audioEngine.stop();
        syncNodeIdCounter(activeGraph.nodes);

        set({
            graphs: orderedGraphs,
            activeGraphId: activeGraph.id,
            nodes: activeGraph.nodes,
            edges: activeGraph.edges,
            selectedNodeId: null,
        });

        audioEngine.refreshConnections(activeGraph.nodes, activeGraph.edges);
    },

    setActiveGraph: (graphId) => {
        const state = get();
        if (state.activeGraphId === graphId) return;

        const targetGraph = state.graphs.find((graph) => graph.id === graphId);
        if (!targetGraph) return;

        const stoppedNodes = stopOutputNodes(state.nodes);
        const updatedGraphs = state.graphs.map((graph) => {
            if (graph.id !== state.activeGraphId) return graph;
            return {
                ...graph,
                nodes: stoppedNodes,
                updatedAt: Date.now(),
            };
        });

        audioEngine.stop();
        syncNodeIdCounter(targetGraph.nodes);

        set({
            graphs: updatedGraphs,
            activeGraphId: graphId,
            nodes: targetGraph.nodes,
            edges: targetGraph.edges,
            selectedNodeId: null,
        });

        audioEngine.refreshConnections(targetGraph.nodes, targetGraph.edges);
    },
    createGraph: (name) => {
        const state = get();
        const nextIndex = state.graphs.length + 1;
        const graphName = normalizeGraphName(name ?? `Graph ${nextIndex}`);
        const now = Date.now();
        const order = state.graphs.reduce((max, graph) => Math.max(max, graph.order ?? 0), -1) + 1;

        const graph: GraphDocument = {
            id: createGraphId(),
            name: graphName,
            nodes: deepClone(initialNodes),
            edges: deepClone(initialEdges),
            createdAt: now,
            updatedAt: now,
            order,
        };

        const stoppedNodes = stopOutputNodes(state.nodes);
        const updatedGraphs = state.graphs.map((existing) =>
            existing.id === state.activeGraphId
                ? { ...existing, nodes: stoppedNodes, updatedAt: now }
                : existing
        );

        syncNodeIdCounter(graph.nodes);
        audioEngine.stop();

        set({
            graphs: [...updatedGraphs, graph],
            activeGraphId: graph.id,
            nodes: graph.nodes,
            edges: graph.edges,
            selectedNodeId: null,
        });

        audioEngine.refreshConnections(graph.nodes, graph.edges);
        return graph;
    },

    renameGraph: (graphId, name) => {
        const nextName = normalizeGraphName(name);
        set((state) => ({
            graphs: state.graphs.map((graph) =>
                graph.id === graphId
                    ? { ...graph, name: nextName, updatedAt: Date.now() }
                    : graph
            ),
        }));
    },

    removeGraph: (graphId) => {
        const state = get();
        const targetGraph = state.graphs.find((graph) => graph.id === graphId);
        if (!targetGraph) return null;

        const remaining = state.graphs.filter((graph) => graph.id !== graphId);

        if (remaining.length === 0) {
            const now = Date.now();
            const fallbackGraph: GraphDocument = {
                id: createGraphId(),
                name: normalizeGraphName('Graph 1'),
                nodes: deepClone(initialNodes),
                edges: deepClone(initialEdges),
                createdAt: now,
                updatedAt: now,
                order: 0,
            };

            syncNodeIdCounter(fallbackGraph.nodes);
            audioEngine.stop();

            set({
                graphs: [fallbackGraph],
                activeGraphId: fallbackGraph.id,
                nodes: fallbackGraph.nodes,
                edges: fallbackGraph.edges,
                selectedNodeId: null,
            });

            audioEngine.refreshConnections(fallbackGraph.nodes, fallbackGraph.edges);
            return targetGraph;
        }

        if (state.activeGraphId === graphId) {
            const ordered = [...remaining].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const nextGraph = ordered[0] ?? remaining[0];

            audioEngine.stop();
            syncNodeIdCounter(nextGraph.nodes);

            set({
                graphs: remaining,
                activeGraphId: nextGraph.id,
                nodes: nextGraph.nodes,
                edges: nextGraph.edges,
                selectedNodeId: null,
            });

            audioEngine.refreshConnections(nextGraph.nodes, nextGraph.edges);
        } else {
            set({ graphs: remaining });
        }

        return targetGraph;
    },

    setSelectedNode: (nodeId) => {
        set((state) => {
            const nodes = state.nodes.map((node) => ({
                ...node,
                selected: node.id === nodeId,
            }));

            const graphs = state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, nodes, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs;

            return {
                selectedNodeId: nodeId,
                nodes,
                graphs,
            };
        });
    },

    onNodesChange: (changes) => {
        const nextNodes = applyNodeChanges(changes, get().nodes);

        set((state) => {
            const graphs = state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, nodes: nextNodes, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs;

            return { nodes: nextNodes, graphs };
        });

        changes.forEach(change => {
            if (change.type === 'remove') {
                // Deletions handled in onEdgesChange/removeNode
            }
        });
    },

    onEdgesChange: (changes) => {
        const nextEdges = applyEdgeChanges(changes, get().edges);

        set((state) => {
            const graphs = state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, edges: nextEdges, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs;

            return { edges: nextEdges, graphs };
        });

        const hasStructuralChange = changes.some(c => c.type === 'add' || c.type === 'remove');
        if (hasStructuralChange) {
            audioEngine.refreshConnections(get().nodes, nextEdges);
        }
    },

    onConnect: (connection) => {
        const isAudioConnection =
            connection.sourceHandle === 'out' &&
            (connection.targetHandle === 'in' || connection.targetHandle?.startsWith('in'));

        const edgeStyle = isAudioConnection
            ? { stroke: '#44cc44', strokeWidth: 3 } // Green for audio
            : { stroke: '#4488ff', strokeWidth: 2, strokeDasharray: '5,5' }; // Blue dashed for control

        const newEdges = addEdge({ ...connection, style: edgeStyle, animated: !isAudioConnection }, get().edges);
        set({ edges: newEdges });

        set((state) => {
            const graphs = state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, edges: newEdges, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs;

            return { graphs };
        });

        audioEngine.refreshConnections(get().nodes, newEdges);
    },

    addNode: (type, position = { x: 300, y: 200 }) => {
        const id = getNodeId();
        let newNode: Node<AudioNodeData>;

        switch (type) {
            case 'osc':
                newNode = {
                    id,
                    type: 'oscNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' } as AudioNodeData,
                };
                break;
            case 'gain':
                newNode = {
                    id,
                    type: 'gainNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'gain', gain: 0.5, label: 'Gain' } as AudioNodeData,
                };
                break;
            case 'filter':
                newNode = {
                    id,
                    type: 'filterNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'filter',
                        filterType: 'lowpass',
                        frequency: 1000,
                        detune: 0,
                        q: 1,
                        gain: 0,
                        label: 'Filter'
                    } as AudioNodeData,
                };
                break;
            case 'output':
                newNode = {
                    id,
                    type: 'outputNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'output', playing: false, masterGain: 0.5, label: 'Output' } as AudioNodeData,
                };
                break;
            case 'noise':
                newNode = {
                    id,
                    type: 'noiseNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'noise', noiseType: 'white', label: 'Noise' } as AudioNodeData,
                };
                break;
            case 'delay':
                newNode = {
                    id,
                    type: 'delayNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'delay', delayTime: 0.3, feedback: 0.4, label: 'Delay' } as AudioNodeData,
                };
                break;
            case 'reverb':
                newNode = {
                    id,
                    type: 'reverbNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'reverb', decay: 2, mix: 0.5, label: 'Reverb' } as AudioNodeData,
                };
                break;
            case 'panner':
                newNode = {
                    id,
                    type: 'pannerNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'panner', pan: 0, label: 'Pan' } as AudioNodeData,
                };
                break;
            case 'mixer':
                newNode = {
                    id,
                    type: 'mixerNode',
                    position,
                    dragHandle: '.node-header',
                    data: { type: 'mixer', inputs: 3, label: 'Mixer' } as AudioNodeData,
                };
                break;
            case 'input':
                newNode = {
                    id,
                    type: 'inputNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'input',
                        transportEnabled: true,
                        bpm: 120,
                        params: [],
                        label: 'Input'
                    } as AudioNodeData,
                };
                break;
            case 'note':
                newNode = {
                    id,
                    type: 'noteNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'note',
                        note: 'C',
                        octave: 4,
                        frequency: 261.6,
                        language: 'en',
                        label: 'Note'
                    } as AudioNodeData,
                };
                break;
            case 'stepSequencer':
                newNode = {
                    id,
                    type: 'stepSequencerNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'stepSequencer',
                        steps: 16,
                        pattern: Array(16).fill(0.8), // Default velocity 0.8
                        activeSteps: Array(16).fill(false), // Default all off
                        label: 'Step Sequencer'
                    } as AudioNodeData,
                };
                break;

            case 'pianoRoll':
                newNode = {
                    id,
                    type: 'pianoRollNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'pianoRoll',
                        steps: 16,
                        octaves: 2,
                        baseNote: 48, // C3
                        notes: [],
                        label: 'Piano Roll'
                    } as AudioNodeData,
                };
                break;

            case 'lfo':
                newNode = {
                    id,
                    type: 'lfoNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'lfo',
                        rate: 1,
                        depth: 500,
                        waveform: 'sine',
                        label: 'LFO'
                    } as AudioNodeData,
                };
                break;

            case 'adsr':
                newNode = {
                    id,
                    type: 'adsrNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'adsr',
                        attack: 0.1,
                        decay: 0.2,
                        sustain: 0.5,
                        release: 0.5,
                        label: 'ADSR'
                    } as AudioNodeData,
                };
                break;

            case 'transport':
                newNode = {
                    id,
                    type: 'transportNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'transport',
                        bpm: 120,
                        playing: false,
                        beatsPerBar: 4,
                        beatUnit: 4,
                        stepsPerBeat: 4,
                        barsPerPhrase: 4,
                        swing: 0,
                        label: 'Transport'
                    } as AudioNodeData,
                };
                break;

            case 'voice':
                newNode = {
                    id,
                    type: 'voiceNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'voice',
                        portamento: 0,
                        label: 'Voice'
                    } as AudioNodeData,
                };
                break;

            case 'sampler':
                newNode = {
                    id,
                    type: 'samplerNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'sampler',
                        src: '',
                        loop: false,
                        playbackRate: 1,
                        detune: 0,
                        loaded: false,
                        label: 'Sampler'
                    } as AudioNodeData,
                };
                break;
            default:
                return;
        }

        const newNodes = [...get().nodes, newNode];

        set((state) => ({
            nodes: newNodes,
            graphs: state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, nodes: newNodes, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs,
        }));

        audioEngine.refreshConnections(newNodes, get().edges);
    },

    updateNodeData: (nodeId, data) => {
        const nextNodes = get().nodes.map((node) =>
            node.id === nodeId
                ? { ...node, data: { ...node.data, ...data } }
                : node
        );

        set((state) => ({
            nodes: nextNodes,
            graphs: state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, nodes: nextNodes, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs,
        }));

        audioEngine.updateNode(nodeId, data);
    },

    removeNode: (nodeId) => {
        const newNodes = get().nodes.filter((node) => node.id !== nodeId);
        const newEdges = get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

        set((state) => ({
            nodes: newNodes,
            edges: newEdges,
            graphs: state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, nodes: newNodes, edges: newEdges, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs,
        }));

        audioEngine.refreshConnections(newNodes, newEdges);
    },

    loadGraph: (nodes, edges) => {
        syncNodeIdCounter(nodes);
        audioEngine.stop();

        set((state) => ({
            nodes,
            edges,
            selectedNodeId: null,
            graphs: state.activeGraphId
                ? state.graphs.map((graph) =>
                    graph.id === state.activeGraphId
                        ? { ...graph, nodes, edges, updatedAt: Date.now() }
                        : graph
                )
                : state.graphs,
        }));

        audioEngine.refreshConnections(nodes, edges);
    },

    setPlaying: (playing) => {
        const outputNode = get().nodes.find((n) => (n.data as AudioNodeData).type === 'output');
        if (outputNode) {
            get().updateNodeData(outputNode.id, { playing });
        }
    },

    initAudioContext: () => {
        if (!get().audioContext) {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            set({ audioContext: ctx });
        }
    },
}));
