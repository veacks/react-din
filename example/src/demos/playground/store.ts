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
    name: string;
    value: number;
    min: number;
    max: number;
}

export interface InputNodeData {
    type: 'input';
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

export type AudioNodeData =
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
    | NoteNodeData;

// ============================================================================
// Store State
// ============================================================================

interface AudioGraphState {
    nodes: Node[];
    edges: Edge[];
    audioContext: AudioContext | null;

    // React Flow handlers
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Custom actions
    addNode: (type: AudioNodeData['type'], position?: { x: number; y: number }) => void;
    updateNodeData: (nodeId: string, data: Partial<AudioNodeData>) => void;
    removeNode: (nodeId: string) => void;
    setPlaying: (playing: boolean) => void;
    initAudioContext: () => void;
}

let nodeIdCounter = 0;
const getNodeId = () => `node_${++nodeIdCounter}`;

// Initial nodes - Horizontal layout
const initialNodes: Node[] = [
    {
        id: 'osc_1',
        type: 'oscNode',
        position: { x: 50, y: 150 },
        data: { type: 'osc', frequency: 440, waveform: 'sine', label: 'Oscillator' },
    },
    {
        id: 'gain_1',
        type: 'gainNode',
        position: { x: 300, y: 150 },
        data: { type: 'gain', gain: 0.5, label: 'Gain' },
    },
    {
        id: 'output_1',
        type: 'outputNode',
        position: { x: 520, y: 150 },
        data: { type: 'output', playing: false, masterGain: 0.5, label: 'Output' },
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

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    onConnect: (connection) => {
        const isAudioConnection =
            connection.sourceHandle === 'out' &&
            (connection.targetHandle === 'in' || connection.targetHandle?.startsWith('in'));

        const edgeStyle = isAudioConnection
            ? { stroke: '#44cc44', strokeWidth: 3 } // Green for audio
            : { stroke: '#4488ff', strokeWidth: 2, strokeDasharray: '5,5' }; // Blue dashed for control

        set({
            edges: addEdge({ ...connection, style: edgeStyle, animated: !isAudioConnection }, get().edges),
        });
    },

    addNode: (type, position = { x: 300, y: 200 }) => {
        const id = getNodeId();
        let newNode: Node;

        switch (type) {
            case 'osc':
                newNode = {
                    id,
                    type: 'oscNode',
                    position,
                    data: { type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' },
                };
                break;
            case 'gain':
                newNode = {
                    id,
                    type: 'gainNode',
                    position,
                    data: { type: 'gain', gain: 0.5, label: 'Gain' },
                };
                break;
            case 'filter':
                newNode = {
                    id,
                    type: 'filterNode',
                    position,
                    data: {
                        type: 'filter',
                        filterType: 'lowpass',
                        frequency: 1000,
                        detune: 0,
                        q: 1,
                        gain: 0,
                        label: 'Filter'
                    },
                };
                break;
            case 'output':
                newNode = {
                    id,
                    type: 'outputNode',
                    position,
                    data: { type: 'output', playing: false, masterGain: 0.5, label: 'Output' },
                };
                break;
            case 'noise':
                newNode = {
                    id,
                    type: 'noiseNode',
                    position,
                    data: { type: 'noise', noiseType: 'white', label: 'Noise' },
                };
                break;
            case 'delay':
                newNode = {
                    id,
                    type: 'delayNode',
                    position,
                    data: { type: 'delay', delayTime: 0.3, feedback: 0.4, label: 'Delay' },
                };
                break;
            case 'reverb':
                newNode = {
                    id,
                    type: 'reverbNode',
                    position,
                    data: { type: 'reverb', decay: 2, mix: 0.5, label: 'Reverb' },
                };
                break;
            case 'panner':
                newNode = {
                    id,
                    type: 'pannerNode',
                    position,
                    data: { type: 'panner', pan: 0, label: 'Pan' },
                };
                break;
            case 'mixer':
                newNode = {
                    id,
                    type: 'mixerNode',
                    position,
                    data: { type: 'mixer', inputs: 3, label: 'Mixer' },
                };
                break;
            case 'input':
                newNode = {
                    id,
                    type: 'inputNode',
                    position,
                    data: { type: 'input', bpm: 120, params: [], label: 'Input' },
                };
                break;
            case 'note':
                newNode = {
                    id,
                    type: 'noteNode',
                    position,
                    data: {
                        type: 'note',
                        note: 'C',
                        octave: 4,
                        frequency: 261.6,
                        language: 'en',
                        label: 'Note'
                    },
                };
                break;
            default:
                return;
        }

        set({ nodes: [...get().nodes, newNode] });
    },

    updateNodeData: (nodeId, data) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            ),
        });
    },

    removeNode: (nodeId) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== nodeId),
            edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        });
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
