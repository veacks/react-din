import type { EditorNodeType } from './nodeCatalog';

export type NodeColorFamily =
    | 'source'
    | 'control'
    | 'routing'
    | 'spectral'
    | 'spatial'
    | 'dynamics'
    | 'analysis'
    | 'midi'
    | 'utility';

export type FlowColorKind = 'audio' | 'control' | 'trigger' | 'invalid' | 'compatible' | 'hover';

export interface NodeColorTokens {
    family: NodeColorFamily;
    headerToken: string;
    headerTextToken: string;
    borderToken: string;
    chipToken: string;
    minimapToken: string;
    handleGlowToken: string;
    header: string;
    headerText: string;
    border: string;
    chip: string;
    minimap: string;
    handleGlow: string;
}

export interface FlowEdgeStyle {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
}

type ColorScope = Document | Element | null | undefined;

interface TokenColor {
    token: string;
    fallback: string;
}

export const NODE_FAMILY_BY_TYPE: Record<EditorNodeType, NodeColorFamily> = {
    input: 'control',
    uiTokens: 'utility',
    eventTrigger: 'source',
    transport: 'source',
    stepSequencer: 'source',
    pianoRoll: 'source',
    lfo: 'control',
    constantSource: 'source',
    mediaStream: 'source',
    voice: 'source',
    adsr: 'control',
    note: 'source',
    osc: 'source',
    noise: 'source',
    noiseBurst: 'source',
    sampler: 'source',
    midiNote: 'midi',
    midiCC: 'midi',
    midiNoteOutput: 'midi',
    midiCCOutput: 'midi',
    midiSync: 'midi',
    gain: 'control',
    filter: 'spectral',
    compressor: 'dynamics',
    delay: 'spectral',
    reverb: 'spectral',
    phaser: 'spectral',
    flanger: 'spectral',
    tremolo: 'spectral',
    eq3: 'spectral',
    distortion: 'spectral',
    chorus: 'spectral',
    waveShaper: 'spectral',
    convolver: 'spectral',
    analyzer: 'analysis',
    panner: 'spatial',
    panner3d: 'spatial',
    mixer: 'routing',
    auxSend: 'routing',
    auxReturn: 'routing',
    matrixMixer: 'routing',
    output: 'routing',
    math: 'control',
    compare: 'control',
    mix: 'control',
    clamp: 'control',
    switch: 'control',
};

const NODE_FAMILY_TOKENS: Record<NodeColorFamily, Omit<NodeColorTokens, 'family' | 'header' | 'headerText' | 'border' | 'chip' | 'minimap' | 'handleGlow'>> = {
    source: {
        headerToken: '--node-family-source-header',
        headerTextToken: '--node-family-source-header-text',
        borderToken: '--node-family-source-border',
        chipToken: '--node-family-source-chip',
        minimapToken: '--node-family-source-minimap',
        handleGlowToken: '--node-family-source-handle-glow',
    },
    control: {
        headerToken: '--node-family-control-header',
        headerTextToken: '--node-family-control-header-text',
        borderToken: '--node-family-control-border',
        chipToken: '--node-family-control-chip',
        minimapToken: '--node-family-control-minimap',
        handleGlowToken: '--node-family-control-handle-glow',
    },
    routing: {
        headerToken: '--node-family-routing-header',
        headerTextToken: '--node-family-routing-header-text',
        borderToken: '--node-family-routing-border',
        chipToken: '--node-family-routing-chip',
        minimapToken: '--node-family-routing-minimap',
        handleGlowToken: '--node-family-routing-handle-glow',
    },
    spectral: {
        headerToken: '--node-family-spectral-header',
        headerTextToken: '--node-family-spectral-header-text',
        borderToken: '--node-family-spectral-border',
        chipToken: '--node-family-spectral-chip',
        minimapToken: '--node-family-spectral-minimap',
        handleGlowToken: '--node-family-spectral-handle-glow',
    },
    spatial: {
        headerToken: '--node-family-spatial-header',
        headerTextToken: '--node-family-spatial-header-text',
        borderToken: '--node-family-spatial-border',
        chipToken: '--node-family-spatial-chip',
        minimapToken: '--node-family-spatial-minimap',
        handleGlowToken: '--node-family-spatial-handle-glow',
    },
    dynamics: {
        headerToken: '--node-family-dynamics-header',
        headerTextToken: '--node-family-dynamics-header-text',
        borderToken: '--node-family-dynamics-border',
        chipToken: '--node-family-dynamics-chip',
        minimapToken: '--node-family-dynamics-minimap',
        handleGlowToken: '--node-family-dynamics-handle-glow',
    },
    analysis: {
        headerToken: '--node-family-analysis-header',
        headerTextToken: '--node-family-analysis-header-text',
        borderToken: '--node-family-analysis-border',
        chipToken: '--node-family-analysis-chip',
        minimapToken: '--node-family-analysis-minimap',
        handleGlowToken: '--node-family-analysis-handle-glow',
    },
    midi: {
        headerToken: '--node-family-midi-header',
        headerTextToken: '--node-family-midi-header-text',
        borderToken: '--node-family-midi-border',
        chipToken: '--node-family-midi-chip',
        minimapToken: '--node-family-midi-minimap',
        handleGlowToken: '--node-family-midi-handle-glow',
    },
    utility: {
        headerToken: '--node-family-utility-header',
        headerTextToken: '--node-family-utility-header-text',
        borderToken: '--node-family-utility-border',
        chipToken: '--node-family-utility-chip',
        minimapToken: '--node-family-utility-minimap',
        handleGlowToken: '--node-family-utility-handle-glow',
    },
};

const FLOW_TOKENS: Record<FlowColorKind, TokenColor> = {
    audio: { token: '--semantic-flow-audio', fallback: 'var(--semantic-flow-audio)' },
    control: { token: '--semantic-flow-control', fallback: 'var(--semantic-flow-control)' },
    trigger: { token: '--semantic-flow-trigger', fallback: 'var(--semantic-flow-trigger)' },
    invalid: { token: '--semantic-flow-invalid', fallback: 'var(--semantic-flow-invalid)' },
    compatible: { token: '--semantic-flow-compatible', fallback: 'var(--semantic-flow-compatible)' },
    hover: { token: '--semantic-flow-hover', fallback: 'var(--semantic-flow-hover)' },
};

function getScopeElement(scope?: ColorScope): Element | null {
    if (typeof Element !== 'undefined' && scope instanceof Element) {
        return scope;
    }

    if (scope && 'documentElement' in scope) {
        return scope.documentElement;
    }

    if (typeof document !== 'undefined') {
        return document.documentElement;
    }

    return null;
}

export function resolveCssColor(token: string, scope?: ColorScope, fallback = ''): string {
    const element = getScopeElement(scope);
    if (!element || typeof getComputedStyle !== 'function') {
        return fallback;
    }

    const resolved = getComputedStyle(element).getPropertyValue(token).trim();
    return resolved || fallback;
}

export function getNodeColorFamily(nodeType: EditorNodeType): NodeColorFamily {
    return NODE_FAMILY_BY_TYPE[nodeType] ?? 'utility';
}

export function getNodeColorTokens(nodeType: EditorNodeType, scope?: ColorScope): NodeColorTokens {
    const family = getNodeColorFamily(nodeType);
    const tokenSet = NODE_FAMILY_TOKENS[family];
    const headerFallback = `var(${tokenSet.headerToken})`;
    const headerTextFallback = `var(${tokenSet.headerTextToken})`;
    const borderFallback = `var(${tokenSet.borderToken})`;
    const chipFallback = `var(${tokenSet.chipToken})`;
    const minimapFallback = `var(${tokenSet.minimapToken})`;
    const handleGlowFallback = `var(${tokenSet.handleGlowToken})`;

    return {
        family,
        ...tokenSet,
        header: resolveCssColor(tokenSet.headerToken, scope, headerFallback),
        headerText: resolveCssColor(tokenSet.headerTextToken, scope, headerTextFallback),
        border: resolveCssColor(tokenSet.borderToken, scope, borderFallback),
        chip: resolveCssColor(tokenSet.chipToken, scope, chipFallback),
        minimap: resolveCssColor(tokenSet.minimapToken, scope, minimapFallback),
        handleGlow: resolveCssColor(tokenSet.handleGlowToken, scope, handleGlowFallback),
    };
}

export function getNodeHeaderColor(nodeType: EditorNodeType, scope?: ColorScope): string {
    return getNodeColorTokens(nodeType, scope).header;
}

export function getNodeBorderColor(nodeType: EditorNodeType, scope?: ColorScope): string {
    return getNodeColorTokens(nodeType, scope).border;
}

export function getMiniMapNodeColor(nodeType: EditorNodeType, scope?: ColorScope): string {
    return getNodeColorTokens(nodeType, scope).minimap;
}

export function getNodeHandleGlowColor(nodeType: EditorNodeType, scope?: ColorScope): string {
    return getNodeColorTokens(nodeType, scope).handleGlow;
}

export function getFlowColor(kind: FlowColorKind, scope?: ColorScope): string {
    const token = FLOW_TOKENS[kind];
    return resolveCssColor(token.token, scope, token.fallback);
}

export function getFlowEdgeStyle(kind: FlowColorKind, scope?: ColorScope): FlowEdgeStyle {
    const stroke = getFlowColor(kind, scope);

    switch (kind) {
        case 'audio':
            return { stroke, strokeWidth: 3 };
        case 'trigger':
            return { stroke, strokeWidth: 2, strokeDasharray: '6,4' };
        case 'control':
            return { stroke, strokeWidth: 2, strokeDasharray: '5,5' };
        case 'invalid':
            return { stroke, strokeWidth: 2, strokeDasharray: '2,4' };
        case 'compatible':
            return { stroke, strokeWidth: 2, strokeDasharray: '4,4' };
        case 'hover':
            return { stroke, strokeWidth: 2 };
        default:
            return { stroke, strokeWidth: 2 };
    }
}
