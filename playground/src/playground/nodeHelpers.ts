import type { Edge, Node } from '@xyflow/react';
import type {
    AudioNodeData,
    InputNodeData,
    InputParam,
    TransportNodeData,
} from './store';

export const INPUT_PARAM_HANDLE_PREFIX = 'param:';

export interface GraphConnectionLike {
    source?: string | null;
    sourceHandle?: string | null;
    target?: string | null;
    targetHandle?: string | null;
}

const AUDIO_NODE_TYPES = new Set<AudioNodeData['type']>([
    'osc',
    'gain',
    'filter',
    'delay',
    'reverb',
    'panner',
    'mixer',
    'noise',
    'sampler',
    'output',
]);

const DATA_NODE_TYPES = new Set<AudioNodeData['type']>([
    'math',
    'compare',
    'mix',
    'clamp',
    'switch',
]);

const TRANSPORT_TARGET_TYPES = new Set<AudioNodeData['type']>([
    'stepSequencer',
    'pianoRoll',
]);

const TRIGGER_SOURCE_TYPES = new Set<AudioNodeData['type']>([
    'stepSequencer',
    'pianoRoll',
]);

const MODULATION_TARGET_HANDLES = new Set([
    'frequency',
    'detune',
    'gain',
    'q',
    'delayTime',
    'feedback',
    'mix',
    'pan',
    'masterGain',
    'rate',
    'depth',
    'value',
    'min',
    'max',
    'a',
    'b',
    'c',
    't',
    'index',
]);

export function isAudioNodeType(type: AudioNodeData['type']): boolean {
    return AUDIO_NODE_TYPES.has(type);
}

export function isDataNodeType(type: AudioNodeData['type']): boolean {
    return DATA_NODE_TYPES.has(type);
}

export function createInputParamId(nodeId: string, index: number): string {
    return `${nodeId}-param-${index + 1}`;
}

export function ensureInputParam(param: Partial<InputParam>, nodeId: string, index: number): InputParam {
    const fallbackName = param.name?.trim() || param.label?.trim() || `Param ${index + 1}`;
    const defaultValue = Number.isFinite(param.defaultValue) ? Number(param.defaultValue) : Number(param.value ?? 0);
    const value = Number.isFinite(param.value) ? Number(param.value) : defaultValue;
    const min = Number.isFinite(param.min) ? Number(param.min) : 0;
    const max = Number.isFinite(param.max) ? Number(param.max) : 1;

    return {
        id: param.id?.trim() || createInputParamId(nodeId, index),
        name: fallbackName,
        type: 'float',
        defaultValue,
        value,
        min,
        max,
        label: param.label?.trim() || fallbackName,
    };
}

export function normalizeInputNodeData(nodeId: string, data: InputNodeData): InputNodeData {
    return {
        type: 'input',
        params: Array.isArray(data.params)
            ? data.params.map((param, index) => ensureInputParam(param, nodeId, index))
            : [],
        label: data.label?.trim() || 'Params',
    };
}

export function getInputParamHandleId(param: Pick<InputParam, 'id'> | string): string {
    const id = typeof param === 'string' ? param : param.id;
    return `${INPUT_PARAM_HANDLE_PREFIX}${id}`;
}

export function getInputParamHandleIdByIndex(params: InputParam[], index: number): string | null {
    const param = params[index];
    return param ? getInputParamHandleId(param) : null;
}

export function resolveInputParamByHandle(
    params: InputParam[] | undefined,
    handle: string | null | undefined
): { param: InputParam; index: number } | null {
    if (!params?.length || !handle) return null;

    if (handle.startsWith(INPUT_PARAM_HANDLE_PREFIX)) {
        const id = handle.slice(INPUT_PARAM_HANDLE_PREFIX.length);
        const index = params.findIndex((param) => param.id === id);
        if (index >= 0) {
            return { param: params[index], index };
        }
    }

    const legacyMatch = /^param_(\d+)$/.exec(handle);
    if (legacyMatch) {
        const index = Number(legacyMatch[1]);
        const param = params[index];
        if (param) {
            return { param, index };
        }
    }

    return null;
}

export function migrateLegacyInputHandle(
    params: InputParam[] | undefined,
    handle: string | null | undefined
): string | null | undefined {
    const resolved = resolveInputParamByHandle(params, handle);
    return resolved ? getInputParamHandleId(resolved.param) : handle;
}

export function normalizeTransportNodeData(data: TransportNodeData): TransportNodeData {
    return {
        type: 'transport',
        bpm: Number.isFinite(data.bpm) ? data.bpm : 120,
        playing: Boolean(data.playing),
        beatsPerBar: Number.isFinite(data.beatsPerBar) ? data.beatsPerBar : 4,
        beatUnit: Number.isFinite(data.beatUnit) ? data.beatUnit : 4,
        stepsPerBeat: Number.isFinite(data.stepsPerBeat) ? data.stepsPerBeat : 4,
        barsPerPhrase: Number.isFinite(data.barsPerPhrase) ? data.barsPerPhrase : 4,
        swing: Number.isFinite(data.swing) ? data.swing : 0,
        label: data.label?.trim() || 'Transport',
    };
}

export function getSingletonNodeTypes(): ReadonlySet<AudioNodeData['type']> {
    return new Set(['transport', 'output']);
}

export function isAudioConnection(
    connection: GraphConnectionLike,
    nodeById: Map<string, Node<AudioNodeData>>
): boolean {
    const sourceNode = connection.source ? nodeById.get(connection.source) : null;
    if (!sourceNode || !isAudioNodeType(sourceNode.data.type)) return false;
    return connection.sourceHandle === 'out'
        && !!connection.target
        && (connection.targetHandle === 'in' || connection.targetHandle?.startsWith('in') === true);
}

export function canConnect(
    connection: GraphConnectionLike,
    nodeById: Map<string, Node<AudioNodeData>>
): boolean {
    if (!connection.source || !connection.target || !connection.targetHandle) return false;
    const sourceNode = nodeById.get(connection.source);
    const targetNode = nodeById.get(connection.target);
    if (!sourceNode || !targetNode) return false;
    if (connection.source === connection.target) return false;

    if (isAudioConnection(connection, nodeById)) {
        return true;
    }

    const { type: sourceType } = sourceNode.data;
    const { type: targetType } = targetNode.data;
    const sourceHandle = connection.sourceHandle ?? '';
    const targetHandle = connection.targetHandle;

    if (sourceType === 'transport') {
        return sourceHandle === 'out'
            && targetHandle === 'transport'
            && TRANSPORT_TARGET_TYPES.has(targetType);
    }

    if (TRIGGER_SOURCE_TYPES.has(sourceType)) {
        return sourceHandle === 'trigger'
            && (
                (targetHandle === 'trigger' && (targetType === 'voice' || targetType === 'sampler'))
                || (targetHandle === 'gate' && targetType === 'adsr')
            );
    }

    if (sourceType === 'voice') {
        if (sourceHandle === 'note') {
            return targetHandle === 'frequency';
        }
        if (sourceHandle === 'gate') {
            return targetHandle === 'gate'
                || targetHandle === 'trigger'
                || targetHandle === 'gain';
        }
        if (sourceHandle === 'velocity') {
            return targetHandle !== 'transport'
                && targetHandle !== 'in'
                && !targetHandle.startsWith('in');
        }
        return false;
    }

    if (sourceType === 'note') {
        return sourceHandle === 'freq' && targetHandle === 'frequency';
    }

    if (sourceType === 'input') {
        return (sourceHandle.startsWith(INPUT_PARAM_HANDLE_PREFIX) || /^param_\d+$/.test(sourceHandle))
            && targetHandle !== 'transport'
            && targetHandle !== 'trigger'
            && targetHandle !== 'gate'
            && targetHandle !== 'in'
            && !targetHandle.startsWith('in');
    }

    if (sourceType === 'lfo') {
        return sourceHandle === 'out' && MODULATION_TARGET_HANDLES.has(targetHandle);
    }

    if (isDataNodeType(sourceType)) {
        return sourceHandle === 'out'
            && targetHandle !== 'transport'
            && targetHandle !== 'trigger'
            && targetHandle !== 'gate'
            && targetHandle !== 'in'
            && !targetHandle.startsWith('in');
    }

    return false;
}

export function migrateGraphNodes(nodes: Node<AudioNodeData>[]): Node<AudioNodeData>[] {
    const singletonSeen = new Set<AudioNodeData['type']>();

    return nodes.flatMap((node) => {
        if (getSingletonNodeTypes().has(node.data.type)) {
            if (singletonSeen.has(node.data.type)) {
                return [];
            }
            singletonSeen.add(node.data.type);
        }

        if (node.data.type === 'input') {
            return [{
                ...node,
                data: normalizeInputNodeData(node.id, node.data as InputNodeData),
            }];
        }

        if (node.data.type === 'transport') {
            return [{
                ...node,
                data: normalizeTransportNodeData(node.data as TransportNodeData),
            }];
        }

        return [node];
    });
}

export function migrateGraphEdges(
    nodes: Node<AudioNodeData>[],
    edges: Edge[]
): Edge[] {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    return edges.flatMap((edge) => {
        const sourceNode = nodeById.get(edge.source);
        const targetNode = nodeById.get(edge.target);

        let nextEdge = edge;
        const sourceType = sourceNode?.data.type;
        const targetType = targetNode?.data.type;

        if (sourceType && targetType) {
            if (
                sourceType === 'transport'
                && TRANSPORT_TARGET_TYPES.has(targetType)
                && !nextEdge.sourceHandle
                && (!nextEdge.targetHandle || nextEdge.targetHandle === 'transport')
            ) {
                nextEdge = {
                    ...nextEdge,
                    sourceHandle: 'out',
                    targetHandle: nextEdge.targetHandle ?? 'transport',
                };
            }

            if (
                TRIGGER_SOURCE_TYPES.has(sourceType)
                && !nextEdge.sourceHandle
                && (
                    !nextEdge.targetHandle
                    || nextEdge.targetHandle === 'trigger'
                    || nextEdge.targetHandle === 'gate'
                )
                && (
                    targetType === 'voice'
                    || targetType === 'sampler'
                    || targetType === 'adsr'
                )
            ) {
                nextEdge = {
                    ...nextEdge,
                    sourceHandle: 'trigger',
                    targetHandle: nextEdge.targetHandle ?? (targetType === 'adsr' ? 'gate' : 'trigger'),
                };
            }

            if (
                sourceType === 'voice'
                && nextEdge.sourceHandle === 'gate'
                && !nextEdge.targetHandle
                && (targetType === 'adsr' || targetType === 'sampler' || targetType === 'voice')
            ) {
                nextEdge = {
                    ...nextEdge,
                    targetHandle: targetType === 'adsr' ? 'gate' : 'trigger',
                };
            }

            if (
                isAudioNodeType(sourceType)
                && isAudioNodeType(targetType)
                && !nextEdge.sourceHandle
                && (!nextEdge.targetHandle || nextEdge.targetHandle === 'in')
                && targetType !== 'mixer'
            ) {
                nextEdge = {
                    ...nextEdge,
                    sourceHandle: 'out',
                    targetHandle: nextEdge.targetHandle ?? 'in',
                };
            }

            if (
                isAudioNodeType(sourceType)
                && isAudioNodeType(targetType)
                && nextEdge.sourceHandle === 'out'
                && !nextEdge.targetHandle
                && targetType !== 'mixer'
            ) {
                nextEdge = {
                    ...nextEdge,
                    targetHandle: 'in',
                };
            }
        }

        if (sourceNode?.data.type === 'input') {
            const inputData = sourceNode.data as InputNodeData;
            const migratedHandle = migrateLegacyInputHandle(inputData.params, edge.sourceHandle);
            if (migratedHandle !== edge.sourceHandle) {
                nextEdge = { ...nextEdge, sourceHandle: migratedHandle ?? undefined };
            }
        }

        if (targetNode?.data.type === 'note' && nextEdge.targetHandle === 'trigger') {
            return [];
        }

        if (!canConnect(nextEdge, nodeById)) {
            return [];
        }

        return [nextEdge];
    });
}

export function getTransportConnections(
    edges: Edge[],
    nodeById: Map<string, Node<AudioNodeData>>
): Set<string> {
    const connected = new Set<string>();

    edges.forEach((edge) => {
        const sourceNode = nodeById.get(edge.source);
        const targetNode = nodeById.get(edge.target);
        if (
            sourceNode?.data.type === 'transport'
            && targetNode
            && TRANSPORT_TARGET_TYPES.has(targetNode.data.type)
            && edge.sourceHandle === 'out'
            && edge.targetHandle === 'transport'
        ) {
            connected.add(edge.target);
        }
    });

    return connected;
}
