import type { GraphNodeLike } from './shared';
import { asString, deepClone, ensurePathPrefix, fileNameFromPath, isRecord, normalizePatchAudioMetadata, normalizePatchSlotList } from './shared';

export function resolveSamplerAssetPath(data: Record<string, unknown>): string {
    const assetPath = asString(data.assetPath);
    if (assetPath) return assetPath;

    const src = asString(data.src);
    if (src && !src.startsWith('blob:') && !src.startsWith('data:')) {
        return src;
    }

    const fileName = fileNameFromPath(asString(data.fileName));
    return ensurePathPrefix('', '/samples', fileName || 'sample.wav');
}

export function resolveConvolverAssetPath(data: Record<string, unknown>): string {
    const assetPath = asString(data.assetPath);
    if (assetPath) return assetPath;

    const impulseSrc = asString(data.impulseSrc);
    if (impulseSrc && !impulseSrc.startsWith('blob:') && !impulseSrc.startsWith('data:')) {
        return impulseSrc;
    }

    const fileName = fileNameFromPath(asString(data.impulseFileName));
    return ensurePathPrefix('', '/impulses', fileName || 'impulse.wav');
}

export function resolveMidiPlayerAssetPath(data: Record<string, unknown>): string {
    const assetPath = asString(data.assetPath);
    if (assetPath) return assetPath;

    const fileName = fileNameFromPath(asString(data.midiFileName));
    return ensurePathPrefix('', '/midi', fileName || 'clip.mid');
}

function resolvePatchName(data: Record<string, unknown>): string {
    const explicitName = asString(data.patchName).trim();
    if (explicitName) return explicitName;

    const patchLabel = asString(data.label).trim();
    if (patchLabel && patchLabel.toLowerCase() !== 'patch') return patchLabel;

    const assetName = fileNameFromPath(asString(data.patchAsset));
    if (assetName) {
        const stripped = assetName.replace(/\.patch\.json$/i, '').replace(/\.din$/i, '').trim();
        return stripped || assetName;
    }

    return 'Patch';
}

export function sanitizeNodeData(data: Record<string, unknown>): Record<string, unknown> {
    const next = deepClone(data);
    const inlinePatch = isRecord(data.patchInline) ? data.patchInline : null;

    if (next.type === 'sampler') {
        next.assetPath = resolveSamplerAssetPath(next);
        next.src = '';
        delete next.sampleId;
        delete next.loaded;
    }

    if (next.type === 'convolver') {
        next.assetPath = resolveConvolverAssetPath(next);
        next.impulseSrc = '';
        delete next.impulseId;
    }

    if (next.type === 'midiPlayer') {
        next.assetPath = resolveMidiPlayerAssetPath(next);
        delete next.midiFileId;
        delete next.loaded;
    }

    if (next.type === 'patch') {
        const patchAsset = asString(next.patchAsset).trim();
        if (patchAsset) {
            next.patchAsset = patchAsset;
        } else {
            delete next.patchAsset;
        }

        if (inlinePatch) {
            next.patchInline = inlinePatch;
        } else {
            delete next.patchInline;
        }

        next.patchName = resolvePatchName(next);
        next.inputs = normalizePatchSlotList(next.inputs, 'input');
        next.outputs = normalizePatchSlotList(next.outputs, 'output');
        next.audio = normalizePatchAudioMetadata(next.audio);
        delete next.patchSourceId;
        delete next.patchSourceKind;
        delete next.sourceUpdatedAt;
        delete next.sourceError;
    }

    if (next.type === 'output' || next.type === 'transport') {
        next.playing = false;
    }

    return next;
}

export function hydrateNodeDataForGraph(data: Record<string, unknown>): Record<string, unknown> {
    const next = deepClone(data);
    const inlinePatch = isRecord(data.patchInline) ? data.patchInline : null;

    if (next.type === 'sampler') {
        const assetPath = resolveSamplerAssetPath(next);
        next.assetPath = assetPath;
        next.src = '';
        next.sampleId = '';
        next.fileName = asString(next.fileName) || fileNameFromPath(assetPath) || 'sample.wav';
        next.loaded = false;
    }

    if (next.type === 'convolver') {
        const assetPath = resolveConvolverAssetPath(next);
        next.assetPath = assetPath;
        next.impulseSrc = '';
        next.impulseId = '';
        next.impulseFileName = asString(next.impulseFileName) || fileNameFromPath(assetPath) || 'impulse.wav';
    }

    if (next.type === 'midiPlayer') {
        const assetPath = resolveMidiPlayerAssetPath(next);
        next.assetPath = assetPath;
        next.midiFileId = '';
        next.midiFileName = asString(next.midiFileName) || fileNameFromPath(assetPath) || 'clip.mid';
        next.loaded = false;
    }

    if (next.type === 'patch') {
        if (inlinePatch) {
            next.patchInline = inlinePatch;
        } else {
            delete next.patchInline;
        }
    }

    if (next.type === 'output' || next.type === 'transport') {
        next.playing = false;
    }

    return next;
}

export function normalizePatchNode(node: GraphNodeLike) {
    const type = asString(node.data?.type);
    const position = node.position && Number.isFinite(node.position.x) && Number.isFinite(node.position.y)
        ? { x: Number(node.position.x), y: Number(node.position.y) }
        : undefined;

    return {
        id: node.id,
        type,
        position,
        data: sanitizeNodeData({ ...node.data, type }),
    };
}
