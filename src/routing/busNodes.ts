import type { PatchGraphContextValue } from '../core/PatchGraphContext';

const BUS_REF_COUNTS = new Map<string, number>();

function normalizeBusId(busId: string | undefined): string {
    const trimmed = busId?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : 'aux';
}

export function busNodeId(busId: string | undefined): string {
    return `bus:${normalizeBusId(busId)}`;
}

export function retainBusNode(graph: PatchGraphContextValue, busId: string | undefined): string {
    const normalized = normalizeBusId(busId);
    const id = `bus:${normalized}`;
    const refs = BUS_REF_COUNTS.get(id) ?? 0;
    BUS_REF_COUNTS.set(id, refs + 1);
    if (refs === 0) {
        graph.addNode(id, 'bus', { busId: normalized });
    }
    return id;
}

export function releaseBusNode(graph: PatchGraphContextValue, busNodeIdValue: string): void {
    const refs = BUS_REF_COUNTS.get(busNodeIdValue) ?? 0;
    if (refs <= 1) {
        BUS_REF_COUNTS.delete(busNodeIdValue);
        graph.removeNode(busNodeIdValue);
        return;
    }
    BUS_REF_COUNTS.set(busNodeIdValue, refs - 1);
}
