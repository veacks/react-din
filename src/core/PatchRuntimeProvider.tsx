import {
    createContext,
    useContext,
    useEffect,
    useRef,
    type FC,
    type MutableRefObject,
    type ReactNode,
} from 'react';
import { graphDocumentToPatch, type GraphDocumentLike } from '../patch/document';
import { bumpWasmDebugCounter } from '../runtime/wasm/loadWasmOnce';
import {
    DIN_AUDIO_RUNTIME_PROCESSOR_NAME,
    ensureDinAudioWorkletLoaded,
} from '../runtime/wasm/loadDinAudioWorklet';
import { usePatchGraph } from './PatchGraphContext';

interface PatchRuntimeProviderProps {
    masterBus: GainNode | null;
    sampleRate: number;
    /** Must match the AudioWorklet render quantum (128). */
    blockSize?: number;
    children: ReactNode;
}

/** Subset of `din-wasm` `AudioRuntime` used from React; implemented via `AudioWorkletNode` message port. */
export type PatchRuntimeHandle = {
    setInput: (key: string, value: number) => void;
    pushMidi: (status: number, data1: number, data2: number, frameOffset: number) => void;
};

interface PatchRuntimeContextValue {
    runtimeRef: MutableRefObject<PatchRuntimeHandle | null>;
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
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = Array.from(graph.getConnections().values())
        .filter((c) => nodeIds.has(c.source) && nodeIds.has(c.target))
        .map((connection) => ({
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
    blockSize = 128,
    children,
}) => {
    const graph = usePatchGraph();
    const runtimeRef = useRef<PatchRuntimeHandle | null>(null);
    const workletRef = useRef<AudioWorkletNode | null>(null);

    useEffect(() => {
        if (!masterBus) return undefined;
        const context = masterBus.context;
        let cancelled = false;

        const destroyRuntime = () => {
            const node = workletRef.current;
            if (node) {
                node.port.onmessage = null;
                try {
                    node.disconnect();
                } catch {
                    /* ignore */
                }
                workletRef.current = null;
            }
            runtimeRef.current = null;
        };

        const rebuildRuntime = async () => {
            if (cancelled) return;
            if (graph.getNodes().size === 0) {
                destroyRuntime();
                return;
            }

            let patchJson: string;
            try {
                const graphDoc = buildGraphDocument(graph) as GraphDocumentLike;
                patchJson = JSON.stringify(graphDocumentToPatch(graphDoc));
            } catch (error) {
                console.error('[PatchRuntimeProvider] graph → patch failed:', error);
                destroyRuntime();
                return;
            }

            try {
                await ensureDinAudioWorkletLoaded(context);
            } catch (error) {
                console.error('[PatchRuntimeProvider] AudioWorklet module failed:', error);
                return;
            }

            if (cancelled) return;

            destroyRuntime();
            if (cancelled) return;

            const node = new AudioWorkletNode(context, DIN_AUDIO_RUNTIME_PROCESSOR_NAME, {
                numberOfInputs: 0,
                numberOfOutputs: 1,
                outputChannelCount: [2],
                processorOptions: {
                    kind: 'graph-runtime',
                    patchJson,
                    sampleRate,
                    channels: 2,
                    blockSize,
                },
            });
            workletRef.current = node;

            node.port.onmessage = (event: MessageEvent) => {
                const data = event.data;
                if (!data || typeof data !== 'object') return;
                if (data.type === 'bump' && data.key === 'patchRuntimeCreated') {
                    bumpWasmDebugCounter('patchRuntimeCreated');
                }
                if (data.type === 'error' && typeof data.message === 'string') {
                    console.error('[PatchRuntimeProvider] worklet:', data.message);
                }
            };

            const facade: PatchRuntimeHandle = {
                setInput(key: string, value: number) {
                    node.port.postMessage({ type: 'setInput', key, value });
                },
                pushMidi(status: number, data1: number, data2: number, frameOffset: number) {
                    node.port.postMessage({ type: 'pushMidi', status, d1: data1, d2: data2, frameOffset });
                },
            };

            runtimeRef.current = facade;
            node.connect(masterBus);
        };

        void rebuildRuntime().catch((error) => {
            console.error('[PatchRuntimeProvider] rebuild failed:', error);
        });

        const unsubscribe = graph.subscribe(() => {
            void rebuildRuntime().catch((error) => {
                console.error('[PatchRuntimeProvider] rebuild failed:', error);
            });
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

/** Returns the patch graph WASM runtime handle (`setInput` / `pushMidi` via AudioWorklet). */
export function usePatchRuntime(): PatchRuntimeContextValue {
    const context = useContext(PatchRuntimeContext);
    if (!context) {
        throw new Error('usePatchRuntime must be used within PatchRuntimeProvider');
    }
    return context;
}
