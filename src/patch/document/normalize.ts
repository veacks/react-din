import type { PatchConnection } from '../types';
import type { GraphConnectionLike } from './shared';

export function normalizePatchConnection(connection: GraphConnectionLike, index: number): PatchConnection {
    return {
        id: connection.id || `${connection.source}:${connection.sourceHandle ?? 'out'}->${connection.target}:${connection.targetHandle ?? 'in'}:${index}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
    };
}
