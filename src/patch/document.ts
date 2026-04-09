import type { PatchConnection, PatchDocument, PatchNode } from './types';
import { hydrateNodeDataForGraph, normalizePatchNode } from './document/assets';
import { getTransportConnections, isAudioConnectionLike, validateConnection, validateNode } from './document/handles';
import { buildPatchInterface } from './document/interface';
import { normalizePatchConnection } from './document/normalize';
import {
    PATCH_DOCUMENT_VERSION,
    PATCH_INPUT_HANDLE_PREFIX,
    type GraphDocumentLike,
    type PatchToGraphOptions,
    createGraphId,
} from './document/shared';

export {
    PATCH_DOCUMENT_VERSION,
    PATCH_INPUT_HANDLE_PREFIX,
    type GraphConnectionLike,
    type GraphDocumentLike,
    type GraphNodeLike,
    type PatchToGraphOptions,
} from './document/shared';

export { isAudioConnectionLike, getTransportConnections };

export function resolvePatchAssetPath(assetPath: string | undefined, assetRoot?: string): string | undefined {
    if (!assetPath) return undefined;
    if (!assetRoot) return assetPath;
    if (/^(?:[a-z]+:)?\/\//i.test(assetPath) || assetPath.startsWith('blob:') || assetPath.startsWith('data:')) {
        return assetPath;
    }

    const normalizedRoot = assetRoot.endsWith('/') ? assetRoot.slice(0, -1) : assetRoot;
    const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
    return `${normalizedRoot}${normalizedPath}`;
}

export function graphDocumentToPatch(graph: GraphDocumentLike): PatchDocument {
    const rawConnections = graph.connections ?? graph.edges ?? [];
    const nodes = graph.nodes.map((node) => normalizePatchNode(node) as PatchNode);
    const connections = rawConnections.map(normalizePatchConnection);
    const nodeById = new Map(nodes.map((node) => [node.id, node] as const));

    nodes.forEach(validateNode);
    connections.forEach((connection) => validateConnection(connection, nodeById));

    return {
        version: PATCH_DOCUMENT_VERSION,
        name: typeof graph.name === 'string' && graph.name.trim() ? graph.name.trim() : 'Untitled Graph',
        nodes,
        connections,
        interface: buildPatchInterface(nodes),
    };
}

export function migratePatchDocument(patch: PatchDocument): PatchDocument {
    if (!patch || typeof patch !== 'object') {
        throw new Error('Patch document must be an object.');
    }
    if (patch.version !== PATCH_DOCUMENT_VERSION) {
        throw new Error(`Unsupported patch version "${String((patch as { version?: unknown }).version)}".`);
    }

    const nodes = (Array.isArray(patch.nodes) ? patch.nodes : []).map((node) => normalizePatchNode(node as any) as PatchNode);
    const connections = (Array.isArray(patch.connections) ? patch.connections : []).map(normalizePatchConnection);
    const nodeById = new Map(nodes.map((node) => [node.id, node] as const));

    nodes.forEach(validateNode);
    connections.forEach((connection) => validateConnection(connection, nodeById));

    return {
        version: PATCH_DOCUMENT_VERSION,
        name: typeof patch.name === 'string' && patch.name.trim() ? patch.name.trim() : 'Untitled Graph',
        nodes,
        connections,
        interface: buildPatchInterface(nodes),
    };
}

function buildGraphEdgeStyle(
    connection: PatchConnection,
    nodeById: Map<string, PatchNode>
): { animated: boolean; style: Record<string, string | number> } {
    if (isAudioConnectionLike(connection, nodeById)) {
        return {
            animated: false,
            style: { stroke: '#44cc44', strokeWidth: 3 },
        };
    }

    if (connection.targetHandle === 'trigger' || connection.targetHandle === 'gate') {
        return {
            animated: true,
            style: { stroke: '#ff4466', strokeWidth: 2, strokeDasharray: '6,4' },
        };
    }

    return {
        animated: true,
        style: { stroke: '#4488ff', strokeWidth: 2, strokeDasharray: '5,5' },
    };
}

export function patchToGraphDocument(patch: PatchDocument, options: PatchToGraphOptions = {}) {
    const migrated = migratePatchDocument(patch);
    const now = Date.now();
    const graphId = options.graphId ?? createGraphId();
    const createdAt = options.createdAt ?? now;
    const updatedAt = options.updatedAt ?? now;
    const order = options.order ?? 0;
    const nodeById = new Map(migrated.nodes.map((node) => [node.id, node] as const));

    const nodes = migrated.nodes.map((node) => ({
        id: node.id,
        type: `${node.type}Node`,
        position: node.position ? { ...node.position } : { x: 0, y: 0 },
        dragHandle: '.node-header',
        data: hydrateNodeDataForGraph(node.data),
    }));

    const edges = migrated.connections.map((connection) => ({
        id: connection.id,
        source: connection.source,
        sourceHandle: connection.sourceHandle ?? undefined,
        target: connection.target,
        targetHandle: connection.targetHandle ?? undefined,
        ...buildGraphEdgeStyle(connection, nodeById),
    }));

    return {
        id: graphId,
        name: migrated.name,
        nodes,
        edges,
        createdAt,
        updatedAt,
        order,
    };
}
