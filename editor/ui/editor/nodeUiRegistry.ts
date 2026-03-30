import type { AudioNodeData, InputNodeData, UiTokensNodeData } from './store';
import { getNodeCatalogEntry, type EditorNodeType } from './nodeCatalog';
export type NodeHandleRole = 'audio' | 'modulation' | 'trigger' | 'data' | 'sidechain' | 'utility';

export type NodeInspectorField =
    | {
        kind: 'text';
        key: string;
        label: string;
        description?: string;
        placeholder?: string;
        handleId?: string;
    }
    | {
        kind: 'number';
        key: string;
        label: string;
        description?: string;
        min?: number;
        max?: number;
        step?: number;
        handleId?: string;
    }
    | {
        kind: 'range';
        key: string;
        label: string;
        description?: string;
        min: number;
        max: number;
        step?: number;
        handleId?: string;
        displayValue?: (value: number) => string;
    }
    | {
        kind: 'checkbox';
        key: string;
        label: string;
        description?: string;
        handleId?: string;
    }
    | {
        kind: 'select';
        key: string;
        label: string;
        description?: string;
        options: Array<{ label: string; value: string }>;
        handleId?: string;
    }
    | {
        kind: 'params';
        key: 'params';
        label: string;
        description?: string;
    };

export interface NodeInspectorSection {
    id: string;
    title: string;
    description?: string;
    fields: NodeInspectorField[];
}

export interface NodeUiSchema {
    type: EditorNodeType;
    label: string;
    handleRoles: Record<string, NodeHandleRole>;
    inlineControls: string[];
    sections: NodeInspectorSection[];
}

export interface PrimitiveFieldEntry {
    key: string;
    value: string | number | boolean | null | undefined;
}

const numberField = (
    key: string,
    label: string,
    options: Omit<Extract<NodeInspectorField, { kind: 'number' }>, 'kind' | 'key' | 'label'> = {}
): Extract<NodeInspectorField, { kind: 'number' }> => ({
    kind: 'number',
    key,
    label,
    ...options,
});

const rangeField = (
    key: string,
    label: string,
    options: Omit<Extract<NodeInspectorField, { kind: 'range' }>, 'kind' | 'key' | 'label'> = {}
): Extract<NodeInspectorField, { kind: 'range' }> => ({
    kind: 'range',
    key,
    label,
    ...options,
});

const textField = (
    key: string,
    label: string,
    options: Omit<Extract<NodeInspectorField, { kind: 'text' }>, 'kind' | 'key' | 'label'> = {}
): Extract<NodeInspectorField, { kind: 'text' }> => ({
    kind: 'text',
    key,
    label,
    ...options,
});

const checkboxField = (
    key: string,
    label: string,
    options: Omit<Extract<NodeInspectorField, { kind: 'checkbox' }>, 'kind' | 'key' | 'label'> = {}
): Extract<NodeInspectorField, { kind: 'checkbox' }> => ({
    kind: 'checkbox',
    key,
    label,
    ...options,
});

const selectField = (
    key: string,
    label: string,
    options: Array<{ label: string; value: string }>,
    extra: Omit<Extract<NodeInspectorField, { kind: 'select' }>, 'kind' | 'key' | 'label' | 'options'> = {}
): Extract<NodeInspectorField, { kind: 'select' }> => ({
    kind: 'select',
    key,
    label,
    options,
    ...extra,
});

const paramsField = (label: string, description?: string): Extract<NodeInspectorField, { kind: 'params' }> => ({
    kind: 'params',
    key: 'params',
    label,
    description,
});

const nodeSchema = (
    type: EditorNodeType,
    schema: Omit<NodeUiSchema, 'type' | 'label'>
): NodeUiSchema => ({
    type,
    label: getNodeCatalogEntry(type).label,
    ...schema,
});

const MATH_OPERATION_OPTIONS = [
    { label: 'Add', value: 'add' },
    { label: 'Subtract', value: 'subtract' },
    { label: 'Multiply', value: 'multiply' },
    { label: 'Divide', value: 'divide' },
    { label: 'Multiply + Add', value: 'multiplyAdd' },
    { label: 'Power', value: 'power' },
    { label: 'Logarithm', value: 'logarithm' },
    { label: 'Sqrt', value: 'sqrt' },
    { label: 'Inv. Sqrt', value: 'invSqrt' },
    { label: 'Abs', value: 'abs' },
    { label: 'Exp', value: 'exp' },
    { label: 'Min', value: 'min' },
    { label: 'Max', value: 'max' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Sign', value: 'sign' },
    { label: 'Compare', value: 'compare' },
    { label: 'Smooth Min', value: 'smoothMin' },
    { label: 'Smooth Max', value: 'smoothMax' },
    { label: 'Round', value: 'round' },
    { label: 'Floor', value: 'floor' },
    { label: 'Ceil', value: 'ceil' },
    { label: 'Truncate', value: 'truncate' },
    { label: 'Fraction', value: 'fraction' },
    { label: 'Modulo', value: 'truncModulo' },
    { label: 'Wrap', value: 'wrap' },
    { label: 'Snap', value: 'snap' },
    { label: 'Ping Pong', value: 'pingPong' },
    { label: 'Sine', value: 'sin' },
    { label: 'Cosine', value: 'cos' },
    { label: 'Tangent', value: 'tan' },
    { label: 'Arc Sine', value: 'asin' },
    { label: 'Arc Cosine', value: 'acos' },
    { label: 'Arc Tangent', value: 'atan' },
    { label: 'Arc Tangent 2', value: 'atan2' },
    { label: 'Hyperbolic Sine', value: 'sinh' },
    { label: 'Hyperbolic Cosine', value: 'cosh' },
    { label: 'Hyperbolic Tangent', value: 'tanh' },
];

const COMPARE_OPERATION_OPTIONS = [
    { label: 'Compare', value: 'compare' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Min', value: 'min' },
    { label: 'Max', value: 'max' },
    { label: 'Sign', value: 'sign' },
];

const FILTER_TYPE_OPTIONS = [
    'lowpass',
    'highpass',
    'bandpass',
    'lowshelf',
    'highshelf',
    'peaking',
    'notch',
    'allpass',
].map((value) => ({ label: value, value }));

const WAVEFORM_OPTIONS = [
    { label: 'Sine', value: 'sine' },
    { label: 'Square', value: 'square' },
    { label: 'Sawtooth', value: 'sawtooth' },
    { label: 'Triangle', value: 'triangle' },
];

const NOISE_TYPE_OPTIONS = [
    { label: 'White', value: 'white' },
    { label: 'Pink', value: 'pink' },
    { label: 'Brown', value: 'brown' },
];

const MATH_SECTION = nodeSchema('math', {
    handleRoles: {
        out: 'data',
        a: 'data',
        b: 'data',
        c: 'data',
    },
    inlineControls: ['operation', 'a', 'b', 'c'],
    sections: [
        {
            id: 'operation',
            title: 'Operation',
            fields: [
                selectField('operation', 'Operation', MATH_OPERATION_OPTIONS),
                numberField('a', 'A', { handleId: 'a' }),
                numberField('b', 'B', { handleId: 'b' }),
                numberField('c', 'C', { handleId: 'c' }),
            ],
        },
    ],
});

const COMPARE_SECTION = nodeSchema('compare', {
    handleRoles: {
        out: 'data',
        a: 'data',
        b: 'data',
    },
    inlineControls: ['operation', 'a', 'b'],
    sections: [
        {
            id: 'operation',
            title: 'Comparison',
            fields: [
                selectField('operation', 'Operation', COMPARE_OPERATION_OPTIONS),
                numberField('a', 'A', { handleId: 'a' }),
                numberField('b', 'B', { handleId: 'b' }),
            ],
        },
    ],
});

const MIX_SECTION = nodeSchema('mix', {
    handleRoles: {
        out: 'data',
        a: 'data',
        b: 'data',
        t: 'data',
    },
    inlineControls: ['a', 'b', 't', 'clamp'],
    sections: [
        {
            id: 'blend',
            title: 'Blend',
            fields: [
                numberField('a', 'A', { handleId: 'a' }),
                numberField('b', 'B', { handleId: 'b' }),
                rangeField('t', 'Mix', { min: 0, max: 1, step: 0.01, handleId: 't' }),
                checkboxField('clamp', 'Clamp'),
            ],
        },
    ],
});

const CLAMP_SECTION = nodeSchema('clamp', {
    handleRoles: {
        out: 'data',
        value: 'data',
        min: 'data',
        max: 'data',
    },
    inlineControls: ['value', 'min', 'max', 'mode'],
    sections: [
        {
            id: 'bounds',
            title: 'Bounds',
            fields: [
                numberField('value', 'Value', { handleId: 'value' }),
                numberField('min', 'Min', { handleId: 'min' }),
                numberField('max', 'Max', { handleId: 'max' }),
                selectField('mode', 'Mode', [
                    { label: 'Clamp', value: 'clamp' },
                    { label: 'Wrap', value: 'wrap' },
                    { label: 'Ping Pong', value: 'pingPong' },
                ]),
            ],
        },
    ],
});

const SWITCH_SECTION = nodeSchema('switch', {
    handleRoles: {
        out: 'data',
        index: 'data',
    },
    inlineControls: ['inputs', 'selectedIndex'],
    sections: [
        {
            id: 'routing',
            title: 'Routing',
            fields: [
                numberField('inputs', 'Inputs', { min: 1, max: 8, step: 1 }),
                numberField('selectedIndex', 'Selected Index', { min: 0, max: 7, step: 1, handleId: 'index' }),
            ],
        },
    ],
});

const NODE_UI_SCHEMAS: Partial<Record<AudioNodeData['type'], NodeUiSchema>> = {
    transport: nodeSchema('transport', {
        handleRoles: { out: 'utility' },
        inlineControls: ['playing', 'bpm'],
        sections: [
            {
                id: 'transport',
                title: 'Transport',
                fields: [
                    checkboxField('playing', 'Playing'),
                    numberField('bpm', 'BPM', { min: 40, max: 240, step: 1 }),
                    numberField('beatsPerBar', 'Beats / Bar', { min: 1, max: 16, step: 1 }),
                    numberField('beatUnit', 'Beat Unit', { min: 1, max: 16, step: 1 }),
                    numberField('stepsPerBeat', 'Steps / Beat', { min: 1, max: 16, step: 1 }),
                    numberField('barsPerPhrase', 'Bars / Phrase', { min: 1, max: 16, step: 1 }),
                    rangeField('swing', 'Swing', { min: 0, max: 1, step: 0.01, displayValue: (value) => value.toFixed(2) }),
                ],
            },
        ],
    }),
    input: nodeSchema('input', {
        handleRoles: {},
        inlineControls: ['params'],
        sections: [
            {
                id: 'params',
                title: 'Params',
                fields: [paramsField('Params', 'Input parameters are exposed as dedicated handles.')],
            },
        ],
    }),
    uiTokens: nodeSchema('uiTokens', {
        handleRoles: {},
        inlineControls: ['params'],
        sections: [
            {
                id: 'tokens',
                title: 'Tokens',
                fields: [paramsField('Tokens', 'UI tokens are editable numeric sources for product-level styling and feedback.')],
            },
        ],
    }),
    osc: nodeSchema('osc', {
        handleRoles: { out: 'audio', frequency: 'modulation', detune: 'modulation' },
        inlineControls: ['frequency', 'detune', 'waveform'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [
                    rangeField('frequency', 'Frequency', { min: 0, max: 20000, step: 0.01, handleId: 'frequency' }),
                    rangeField('detune', 'Detune', { min: -1200, max: 1200, step: 0.01, handleId: 'detune' }),
                    selectField('waveform', 'Waveform', WAVEFORM_OPTIONS),
                ],
            },
        ],
    }),
    gain: nodeSchema('gain', {
        handleRoles: { in: 'audio', out: 'audio', gain: 'modulation' },
        inlineControls: ['gain'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [rangeField('gain', 'Gain', { min: 0, max: 1, step: 0.01, handleId: 'gain' })],
            },
        ],
    }),
    filter: nodeSchema('filter', {
        handleRoles: {
            in: 'audio',
            out: 'audio',
            frequency: 'modulation',
            detune: 'modulation',
            q: 'modulation',
            gain: 'modulation',
        },
        inlineControls: ['filterType', 'frequency', 'detune', 'q', 'gain'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [
                    selectField('filterType', 'Filter Type', FILTER_TYPE_OPTIONS),
                    rangeField('frequency', 'Frequency', { min: 20, max: 20000, step: 0.01, handleId: 'frequency' }),
                    rangeField('detune', 'Detune', { min: -1200, max: 1200, step: 0.01, handleId: 'detune' }),
                    rangeField('q', 'Q', { min: 0.1, max: 20, step: 0.01, handleId: 'q' }),
                    rangeField('gain', 'Gain', { min: -40, max: 40, step: 0.01, handleId: 'gain' }),
                ],
            },
        ],
    }),
    delay: nodeSchema('delay', {
        handleRoles: { in: 'audio', out: 'audio', delayTime: 'modulation', feedback: 'modulation' },
        inlineControls: ['delayTime', 'feedback'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [
                    rangeField('delayTime', 'Delay Time', { min: 0, max: 2, step: 0.01, handleId: 'delayTime' }),
                    rangeField('feedback', 'Feedback', { min: 0, max: 0.95, step: 0.01, handleId: 'feedback' }),
                ],
            },
        ],
    }),
    reverb: nodeSchema('reverb', {
        handleRoles: { in: 'audio', out: 'audio', mix: 'modulation' },
        inlineControls: ['decay', 'mix'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [
                    rangeField('decay', 'Decay', { min: 0.1, max: 12, step: 0.01, handleId: 'decay' }),
                    rangeField('mix', 'Mix', { min: 0, max: 1, step: 0.01, handleId: 'mix' }),
                ],
            },
        ],
    }),
    output: nodeSchema('output', {
        handleRoles: { in: 'audio', masterGain: 'modulation' },
        inlineControls: ['playing', 'masterGain'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [
                    checkboxField('playing', 'Playing'),
                    rangeField('masterGain', 'Master Gain', { min: 0, max: 1, step: 0.01, handleId: 'masterGain' }),
                ],
            },
        ],
    }),
    constantSource: nodeSchema('constantSource', {
        handleRoles: { out: 'data', offset: 'data' },
        inlineControls: ['offset'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [rangeField('offset', 'Offset', { min: -1, max: 1, step: 0.01, handleId: 'offset' })],
            },
        ],
    }),
    panner: nodeSchema('panner', {
        handleRoles: { in: 'audio', out: 'audio', pan: 'modulation' },
        inlineControls: ['pan'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [rangeField('pan', 'Pan', { min: -1, max: 1, step: 0.01, handleId: 'pan' })],
            },
        ],
    }),
    lfo: nodeSchema('lfo', {
        handleRoles: { out: 'modulation', rate: 'modulation', depth: 'modulation' },
        inlineControls: ['rate', 'depth', 'waveform'],
        sections: [
            {
                id: 'essentials',
                title: 'Essentials',
                fields: [
                    rangeField('rate', 'Rate', { min: 0.01, max: 20, step: 0.01, handleId: 'rate' }),
                    rangeField('depth', 'Depth', { min: 0, max: 1, step: 0.01, handleId: 'depth' }),
                    selectField('waveform', 'Waveform', WAVEFORM_OPTIONS),
                ],
            },
        ],
    }),
    noise: nodeSchema('noise', {
        handleRoles: { out: 'audio' },
        inlineControls: ['noiseType'],
        sections: [
            {
                id: 'source',
                title: 'Source',
                fields: [selectField('noiseType', 'Noise Type', NOISE_TYPE_OPTIONS)],
            },
        ],
    }),
    noiseBurst: nodeSchema('noiseBurst', {
        handleRoles: { out: 'audio', trigger: 'trigger', duration: 'modulation', gain: 'modulation', attack: 'modulation', release: 'modulation' },
        inlineControls: ['noiseType', 'duration', 'gain'],
        sections: [
            {
                id: 'burst',
                title: 'Burst',
                fields: [
                    selectField('noiseType', 'Noise Type', NOISE_TYPE_OPTIONS),
                    rangeField('duration', 'Duration', { min: 0.005, max: 4, step: 0.001, handleId: 'duration' }),
                    rangeField('gain', 'Gain', { min: 0, max: 1, step: 0.01, handleId: 'gain' }),
                    rangeField('attack', 'Attack', { min: 0, max: 1, step: 0.001, handleId: 'attack' }),
                    rangeField('release', 'Release', { min: 0, max: 2, step: 0.001, handleId: 'release' }),
                ],
            },
        ],
    }),
    adsr: nodeSchema('adsr', {
        handleRoles: {
            gate: 'trigger',
            envelope: 'modulation',
            attack: 'modulation',
            decay: 'modulation',
            sustain: 'modulation',
            release: 'modulation',
        },
        inlineControls: ['attack', 'decay', 'sustain', 'release'],
        sections: [
            {
                id: 'envelope',
                title: 'Envelope',
                fields: [
                    rangeField('attack', 'Attack', { min: 0, max: 5, step: 0.001, handleId: 'attack' }),
                    rangeField('decay', 'Decay', { min: 0, max: 5, step: 0.001, handleId: 'decay' }),
                    rangeField('sustain', 'Sustain', { min: 0, max: 1, step: 0.01, handleId: 'sustain' }),
                    rangeField('release', 'Release', { min: 0, max: 5, step: 0.001, handleId: 'release' }),
                ],
            },
        ],
    }),
    voice: nodeSchema('voice', {
        handleRoles: { trigger: 'trigger', note: 'modulation', gate: 'trigger', velocity: 'modulation' },
        inlineControls: ['portamento'],
        sections: [
            {
                id: 'performance',
                title: 'Performance',
                fields: [rangeField('portamento', 'Portamento', { min: 0, max: 1, step: 0.001, handleId: 'portamento' })],
            },
        ],
    }),
    sampler: nodeSchema('sampler', {
        handleRoles: { out: 'audio', trigger: 'trigger', playbackRate: 'modulation', detune: 'modulation' },
        inlineControls: ['src', 'loop', 'playbackRate', 'detune'],
        sections: [
            {
                id: 'source',
                title: 'Source',
                fields: [
                    textField('src', 'Source', { placeholder: 'Asset URL or object URL' }),
                    checkboxField('loop', 'Loop'),
                    rangeField('playbackRate', 'Playback Rate', { min: 0.1, max: 4, step: 0.01, handleId: 'playbackRate' }),
                    rangeField('detune', 'Detune', { min: -2400, max: 2400, step: 0.01, handleId: 'detune' }),
                ],
            },
        ],
    }),
    compressor: nodeSchema('compressor', {
        handleRoles: { in: 'audio', out: 'audio', sidechainIn: 'sidechain', threshold: 'modulation', knee: 'modulation', ratio: 'modulation', attack: 'modulation', release: 'modulation', sidechainStrength: 'modulation' },
        inlineControls: ['threshold', 'ratio', 'attack'],
        sections: [
            {
                id: 'dynamics',
                title: 'Dynamics',
                fields: [
                    rangeField('threshold', 'Threshold', { min: -60, max: 0, step: 0.1, handleId: 'threshold' }),
                    rangeField('knee', 'Knee', { min: 0, max: 40, step: 0.1, handleId: 'knee' }),
                    rangeField('ratio', 'Ratio', { min: 1, max: 20, step: 0.1, handleId: 'ratio' }),
                    rangeField('attack', 'Attack', { min: 0, max: 1, step: 0.001, handleId: 'attack' }),
                    rangeField('release', 'Release', { min: 0, max: 1, step: 0.001, handleId: 'release' }),
                ],
            },
        ],
    }),
    math: MATH_SECTION,
    compare: COMPARE_SECTION,
    mix: MIX_SECTION,
    clamp: CLAMP_SECTION,
    switch: SWITCH_SECTION,
};

export const NODE_UI_REGISTRY = NODE_UI_SCHEMAS;

export function getNodeUiSchema(type: AudioNodeData['type']): NodeUiSchema | null {
    return NODE_UI_REGISTRY[type] ?? null;
}

export function getNodeHandleRole(type: AudioNodeData['type'], handleId: string): NodeHandleRole | null {
    const schema = getNodeUiSchema(type);
    return schema?.handleRoles[handleId] ?? null;
}

export function getNodeInlineControls(type: AudioNodeData['type']): string[] {
    return getNodeUiSchema(type)?.inlineControls ?? [];
}

export function getNodeInspectorSections(type: AudioNodeData['type']): NodeInspectorSection[] {
    return getNodeUiSchema(type)?.sections ?? [];
}

export function getNodeDisplayLabel(type: AudioNodeData['type']): string {
    return getNodeCatalogEntry(type).label;
}

export function getInspectablePrimitiveEntries(
    data: AudioNodeData,
    handledKeys: Iterable<string> = []
): PrimitiveFieldEntry[] {
    const excluded = new Set<string>(['type', 'label']);
    for (const key of handledKeys) {
        excluded.add(key);
    }

    return Object.entries(data)
        .filter(([key, value]) => {
            if (excluded.has(key)) return false;
            if (Array.isArray(value) || (value && typeof value === 'object')) return false;
            return typeof value === 'string'
                || typeof value === 'number'
                || typeof value === 'boolean'
                || value === null
                || value === undefined;
        })
        .map(([key, value]) => ({ key, value }));
}

export function isTokenParamNode(data: AudioNodeData): data is InputNodeData | UiTokensNodeData {
    return data.type === 'input' || data.type === 'uiTokens';
}
