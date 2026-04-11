import {
    createContext,
    useContext,
    useMemo,
    useRef,
    type FC,
    type ReactNode,
} from 'react';

export interface PatchGraphEntry {
    type: string;
    data: Record<string, unknown>;
}

export interface PatchGraphConnection {
    id: string;
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
}

export interface PatchGraphContextValue {
    addNode(id: string, type: string, data: Record<string, unknown>): void;
    removeNode(id: string): void;
    updateNodeData(id: string, data: Record<string, unknown>): void;
    addConnection(
        id: string,
        source: string,
        sourceHandle: string,
        target: string,
        targetHandle: string
    ): void;
    removeConnection(id: string): void;
    subscribe(callback: () => void): () => void;
    getNodes(): ReadonlyMap<string, PatchGraphEntry>;
    getConnections(): ReadonlyMap<string, PatchGraphConnection>;
    getTopologyVersion(): number;
    getDataVersion(): number;
}

const PatchGraphContext = createContext<PatchGraphContextValue | null>(null);

export const PatchGraphProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const nodesRef = useRef(new Map<string, PatchGraphEntry>());
    const connectionsRef = useRef(new Map<string, PatchGraphConnection>());
    const subscribersRef = useRef(new Set<() => void>());
    const topologyVersionRef = useRef(0);
    const dataVersionRef = useRef(0);

    const notifyTopology = () => {
        topologyVersionRef.current += 1;
        for (const callback of subscribersRef.current) {
            callback();
        }
    };

    const value = useMemo<PatchGraphContextValue>(() => ({
        addNode(id, type, data) {
            nodesRef.current.set(id, { type, data });
            notifyTopology();
        },
        removeNode(id) {
            if (!nodesRef.current.delete(id)) return;
            for (const [connectionId, connection] of connectionsRef.current.entries()) {
                if (connection.source === id || connection.target === id) {
                    connectionsRef.current.delete(connectionId);
                }
            }
            notifyTopology();
        },
        updateNodeData(id, data) {
            const existing = nodesRef.current.get(id);
            if (!existing) return;
            nodesRef.current.set(id, { ...existing, data });
            dataVersionRef.current += 1;
        },
        addConnection(id, source, sourceHandle, target, targetHandle) {
            connectionsRef.current.set(id, {
                id,
                source,
                sourceHandle,
                target,
                targetHandle,
            });
            notifyTopology();
        },
        removeConnection(id) {
            if (!connectionsRef.current.delete(id)) return;
            notifyTopology();
        },
        subscribe(callback) {
            subscribersRef.current.add(callback);
            return () => {
                subscribersRef.current.delete(callback);
            };
        },
        getNodes() {
            return nodesRef.current;
        },
        getConnections() {
            return connectionsRef.current;
        },
        getTopologyVersion() {
            return topologyVersionRef.current;
        },
        getDataVersion() {
            return dataVersionRef.current;
        },
    }), []);

    return (
        <PatchGraphContext.Provider value={value}>
            {children}
        </PatchGraphContext.Provider>
    );
};

export function usePatchGraph(): PatchGraphContextValue {
    const context = useContext(PatchGraphContext);
    if (!context) {
        throw new Error('usePatchGraph must be used within PatchGraphProvider');
    }
    return context;
}
