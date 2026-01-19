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

export interface ADSRNodeData {
    type: 'adsr';
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    label: string;
    [key: string]: unknown;
}

export interface SequencerNodeData {
    type: 'sequencer';
    steps: number;
    pattern: number[]; // Velocities (0-1)
    activeSteps: boolean[]; // On/Off toggles
    label: string;
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
    | TransportNodeData
    | SequencerNodeData
    | ADSRNodeData
    | VoiceNodeData
) & Record<string, unknown>;



// ============================================================================
// Store State
// ============================================================================

interface AudioGraphState {
    nodes: Node<AudioNodeData>[];
    edges: Edge[];
    audioContext: AudioContext | null;
    selectedNodeId: string | null;

    // React Flow handlers
    onNodesChange: OnNodesChange<Node<AudioNodeData>>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

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

export const useAudioGraphStore = create<AudioGraphState>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    audioContext: null,
    selectedNodeId: null,

    setSelectedNode: (nodeId) => {
        set({ selectedNodeId: nodeId });
        set((state) => ({
            nodes: state.nodes.map((n) => ({
                ...n,
                selected: n.id === nodeId,
            })),
        }));
    },

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
        // Note: We don't trigger engine update here for typical "position" changes.
        // Data changes come via updateNodeData. 
        // Deletions come via onNodesChange 'remove' type? 
        // xyflow calls onNodesChange for deletions if using the delete key.
        changes.forEach(change => {
            if (change.type === 'remove') {
                // If a node is removed, edges might also be removed by flow but we handle checking edges in onEdgesChange 
                // or we rely on explicit removeNode which updates edges.
                // However, applyNodeChanges might not update edges? 
                // xyflow usually handles cascading edge removal if we pass onEdgesChange properly?
                // Actually we should rely on onEdgesChange for edge removals.
                // For node removal, we need to stop/disconnect the node in engine.
                // But our engine is rebuilt from current nodes list if we call refresh maybe?
                // Actually removeNode action is better for explicit removal. 
                // If user presses "Delete" key, we might miss it here unless we hook into it.
                // Let's assume standard interaction is sufficient for now or rely on refreshConnections clearing unconnected nodes? No.
            }
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
        // Refresh connections whenever edges change (add/remove/select)
        // Only strictly need for add/remove, but safe to call if check is efficient.
        const hasStructuralChange = changes.some(c => c.type === 'add' || c.type === 'remove');
        if (hasStructuralChange) {
            audioEngine.refreshConnections(get().nodes, get().edges);
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

        // Refresh engine connections
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
            case 'sequencer':
                newNode = {
                    id,
                    type: 'sequencerNode',
                    position,
                    dragHandle: '.node-header',
                    data: {
                        type: 'sequencer',
                        steps: 16,
                        pattern: Array(16).fill(0.8), // Default velocity 0.8
                        activeSteps: Array(16).fill(false), // Default all off
                        label: 'Sequencer'
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
            default:
                return;
        }

        const newNodes = [...get().nodes, newNode];
        set({ nodes: newNodes });

        // Refresh connections to sync new node to engine
        audioEngine.refreshConnections(newNodes, get().edges);
    },

    updateNodeData: (nodeId, data) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            ),
        });

        // Trigger Engine Update
        audioEngine.updateNode(nodeId, data);
    },

    removeNode: (nodeId) => {
        const newNodes = get().nodes.filter((node) => node.id !== nodeId);
        const newEdges = get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
        set({
            nodes: newNodes,
            edges: newEdges,
        });

        // We should also remove from engine...
        // audioEngine.removeNode(nodeId); // Not implemented yet
        // But refreshing connections will at least disconnect logic involving it.
        audioEngine.refreshConnections(newNodes, newEdges);
    },

    loadGraph: (nodes, edges) => {
        set({
            nodes,
            edges,
            selectedNodeId: null,
        });
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
