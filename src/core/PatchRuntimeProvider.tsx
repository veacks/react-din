import {
    createContext,
    useContext,
    useEffect,
    useRef,
    type FC,
    type MutableRefObject,
    type ReactNode,
} from 'react';
import { ensureWasmInitialized, getWasmModuleSync } from '../runtime/wasm/loadWasmOnce';
import { usePatchGraph } from './PatchGraphContext';

interface PatchRuntimeProviderProps {
    masterBus: GainNode | null;
    sampleRate: number;
    blockSize?: number;
    children: ReactNode;
}

interface PatchRuntimeContextValue {
    runtimeRef: MutableRefObject<import('din-wasm').AudioRuntime | null>;
}

const PatchRuntimeContext = createContext<PatchRuntimeContextValue | null>(null);

function buildGraphDocument(graph: ReturnType<typeof usePatchGraph>) {
    const nodes = Array.from(graph.getNodes().entries()).map(([id, node]) => ({
        id,
        position: { x: 0, y: 0 },
        data: {
            ...node.data,
            type: node.type,
        },
    }));
    const edges = Array.from(graph.getConnections().values()).map((connection) => ({
        id: connection.id,
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        target: connection.target,
        targetHandle: connection.targetHandle,
    }));
    return {
        name: 'Wasm Graph',
        nodes,
        edges,
    };
}

export const PatchRuntimeProvider: FC<PatchRuntimeProviderProps> = ({
    masterBus,
    sampleRate,
    blockSize = 256,
    children,
}) => {
    const graph = usePatchGraph();
    const runtimeRef = useRef<import('din-wasm').AudioRuntime | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);

    useEffect(() => {
        if (!masterBus) return undefined;
        const context = masterBus.context;
        let cancelled = false;

        const destroyRuntime = () => {
            if (processorRef.current) {
                try {
                    processorRef.current.disconnect();
                } catch {
                    /* ignore */
                }
                processorRef.current = null;
            }
            if (runtimeRef.current) {
                runtimeRef.current.free();
                runtimeRef.current = null;
            }
        };

        const rebuildRuntime = async () => {
            if (cancelled) return;
            const wasm = getWasmModuleSync();
            if (!wasm) return;
            if (graph.getNodes().size === 0) {
                destroyRuntime();
                return;
            }

            const graphDoc = buildGraphDocument(graph);
            const patchJson = wasm.graph_document_to_patch(JSON.stringify(graphDoc));
            const runtime = new wasm.AudioRuntime(patchJson, sampleRate, 2, blockSize);
            const scratch = new Float32Array(runtime.interleavedOutputLen());
            const processor = context.createScriptProcessor(blockSize, 0, 2);
            processor.onaudioprocess = (event) => {
                runtime.renderBlockInto(scratch);
                const outL = event.outputBuffer.getChannelData(0);
                const outR = event.outputBuffer.getChannelData(1);
                for (let i = 0; i < blockSize; i++) {
                    outL[i] = scratch[i * 2];
                    outR[i] = scratch[i * 2 + 1];
                }
            };

            destroyRuntime();
            if (cancelled) {
                runtime.free();
                processor.disconnect();
                return;
            }

            processor.connect(masterBus);
            runtimeRef.current = runtime;
            processorRef.current = processor;
        };

        void ensureWasmInitialized()
            .then(rebuildRuntime)
            .catch((error) => {
                console.error('[PatchRuntimeProvider] WASM init failed:', error);
            });

        const unsubscribe = graph.subscribe(() => {
            void rebuildRuntime();
        });

        return () => {
            cancelled = true;
            unsubscribe();
            destroyRuntime();
        };
    }, [blockSize, graph, masterBus, sampleRate]);

    return (
        <PatchRuntimeContext.Provider value={{ runtimeRef }}>
            {children}
        </PatchRuntimeContext.Provider>
    );
};

export function usePatchRuntime(): PatchRuntimeContextValue {
    const context = useContext(PatchRuntimeContext);
    if (!context) {
        throw new Error('usePatchRuntime must be used within PatchRuntimeProvider');
    }
    return context;
}
