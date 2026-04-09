import type { PatchAudioMetadata, PatchPosition, PatchSlot, SlotType } from '../types';

export const PATCH_DOCUMENT_VERSION = 1 as const;
export const PATCH_INPUT_HANDLE_PREFIX = 'param:';

export interface GraphNodeLike {
    id: string;
    position?: PatchPosition;
    data: {
        type: string;
        label?: string;
        [key: string]: unknown;
    };
}

export interface GraphConnectionLike {
    id?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
}

export interface GraphDocumentLike {
    id?: string;
    name?: string;
    nodes: readonly GraphNodeLike[];
    edges?: readonly GraphConnectionLike[];
    connections?: readonly GraphConnectionLike[];
    createdAt?: number;
    updatedAt?: number;
    order?: number;
}

export interface PatchToGraphOptions {
    graphId?: string;
    createdAt?: number;
    updatedAt?: number;
    order?: number;
}

export function createGraphId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `graph_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function asNumber(value: unknown, fallback: number): number {
    return Number.isFinite(value) ? Number(value) : fallback;
}

export function asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

export function deepClone<T>(value: T): T {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as T;
}

export function fileNameFromPath(path: string): string {
    const candidate = path.trim().split(/[\\/]/).pop() ?? '';
    return candidate || '';
}

export function ensurePathPrefix(basePath: string, fallbackDir: string, fallbackName: string): string {
    const trimmed = basePath.trim();
    if (trimmed) return trimmed;
    return `${fallbackDir}/${fallbackName}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeSlotType(value: unknown, fallback: SlotType = 'audio'): SlotType {
    if (value === 'audio' || value === 'midi') return value;
    return fallback;
}

export function normalizePatchSlot(slot: unknown, fallbackId: string, fallbackLabel: string): PatchSlot {
    const data = isRecord(slot) ? deepClone(slot) : {};

    return {
        id: asString(data.id).trim() || fallbackId,
        label: asString(data.label).trim() || fallbackLabel,
        type: normalizeSlotType(data.type),
    } satisfies PatchSlot;
}

export function normalizePatchSlotList(value: unknown, direction: 'input' | 'output'): PatchSlot[] {
    if (!Array.isArray(value)) return [];

    const implicitId = direction === 'input' ? 'in' : 'out';
    const fallbackPrefix = direction === 'input' ? 'input' : 'output';
    const fallbackLabelPrefix = direction === 'input' ? 'Input' : 'Output';

    return value.flatMap((slot, index) => {
        const normalized = normalizePatchSlot(slot, `${fallbackPrefix}-${index + 1}`, `${fallbackLabelPrefix} ${index + 1}`);
        if (normalized.id === implicitId && normalized.type === 'audio') return [];
        return [normalized];
    });
}

export function normalizePatchAudioSlot(slot: unknown, direction: 'input' | 'output'): PatchSlot {
    const data = isRecord(slot) ? deepClone(slot) : {};

    return {
        id: direction === 'input' ? 'in' : 'out',
        label: asString(data.label).trim() || (direction === 'input' ? 'Audio In' : 'Audio Out'),
        type: 'audio',
    };
}

export function normalizePatchAudioMetadata(value: unknown): PatchAudioMetadata {
    const data = isRecord(value) ? value : {};
    return {
        input: normalizePatchAudioSlot(data.input, 'input'),
        output: normalizePatchAudioSlot(data.output, 'output'),
    };
}
