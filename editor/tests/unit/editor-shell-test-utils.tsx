import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

const reactFlowState = vi.hoisted(() => ({
    latestProps: null as any,
}));

vi.mock('@xyflow/react', async () => {
    const React = await import('react');
    const NodeIdContext = React.createContext<string | null>(null);

    return {
        ReactFlow: ({ nodes, nodeTypes, children, onInit, ...props }: any) => {
            reactFlowState.latestProps = props;

            React.useEffect(() => {
                onInit?.({
                    screenToFlowPosition: (position: { x: number; y: number }) => position,
                    fitView: vi.fn(),
                });
            }, [onInit]);

            return (
                <div className="react-flow" data-testid="react-flow">
                    {nodes.map((node: any) => {
                        const NodeComponent = nodeTypes[node.type];
                        return (
                            <div key={node.id} className="react-flow__node" data-nodeid={node.id}>
                                <NodeIdContext.Provider value={node.id}>
                                    <NodeComponent
                                        id={node.id}
                                        data={node.data}
                                        selected={Boolean(node.selected)}
                                        dragging={false}
                                        zIndex={0}
                                        selectable
                                        draggable
                                        isConnectable
                                        positionAbsoluteX={node.position?.x ?? 0}
                                        positionAbsoluteY={node.position?.y ?? 0}
                                        xPos={node.position?.x ?? 0}
                                        yPos={node.position?.y ?? 0}
                                    />
                                </NodeIdContext.Provider>
                            </div>
                        );
                    })}
                    {children}
                </div>
            );
        },
        Background: () => null,
        Controls: () => null,
        MiniMap: () => null,
        BackgroundVariant: { Dots: 'dots' },
        Handle: ({ id, className }: { id?: string; className?: string }) => {
            const nodeId = React.useContext(NodeIdContext);
            return (
                <div
                    className={`react-flow__handle ${className ?? ''}`}
                    data-nodeid={nodeId ?? ''}
                    data-handleid={id ?? ''}
                    data-testid={`handle-${nodeId ?? 'unknown'}-${id ?? 'default'}`}
                />
            );
        },
        Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
        applyNodeChanges: (_changes: unknown, nodes: unknown) => nodes,
        applyEdgeChanges: (_changes: unknown, edges: unknown) => edges,
        addEdge: (edge: any, edges: any[]) => [...edges, { id: edge.id ?? `edge-${edges.length + 1}`, ...edge }],
        useHandleConnections: () => [],
        useNodesData: () => null,
        __getLatestReactFlowProps: () => reactFlowState.latestProps,
    };
});

vi.mock('../../ui/editor/graphStorage', () => ({
    deleteGraph: vi.fn().mockResolvedValue(undefined),
    loadActiveGraphId: vi.fn().mockResolvedValue(null),
    loadGraphs: vi.fn().mockResolvedValue([]),
    saveActiveGraphId: vi.fn().mockResolvedValue(undefined),
    saveGraph: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../ui/editor/audioLibrary', () => ({
    addAssetFromBlob: vi.fn().mockResolvedValue({
        id: 'asset-blob',
        name: 'imported.wav',
        mimeType: 'audio/wav',
        size: 100,
        createdAt: 1,
        updatedAt: 1,
    }),
    addAssetFromFile: vi.fn().mockResolvedValue({
        id: 'asset-file',
        name: 'uploaded.wav',
        mimeType: 'audio/wav',
        size: 100,
        createdAt: 1,
        updatedAt: 1,
    }),
    deleteAsset: vi.fn().mockResolvedValue(undefined),
    getAssetObjectUrl: vi.fn().mockResolvedValue(null),
    listAssets: vi.fn().mockResolvedValue([]),
    subscribeAssets: vi.fn(() => () => {}),
}));

vi.mock('../../ui/editor/AudioEngine', () => ({
        audioEngine: {
        getControlInputValue: vi.fn(() => null),
        getSourceOutputValue: vi.fn(() => null),
        loadSamplerBuffer: vi.fn(),
        onSamplerEnd: () => () => {},
        playSampler: vi.fn(),
        refreshConnections: vi.fn(),
        refreshDataValues: vi.fn(),
        stop: vi.fn(),
        stopSampler: vi.fn(),
        subscribeStep: vi.fn(() => () => {}),
        updateNode: vi.fn(),
        updateSamplerParam: vi.fn(),
    },
}));

export const installEditorShellViewport = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: width,
    });
    window.dispatchEvent(new Event('resize'));
};

export const installEditorShellGlobals = () => {
    Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        },
    });

    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: vi.fn().mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }),
    });

    Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        value: 'Linux x86_64',
    });
};

export const renderEditorDemo = async (project?: { id: string; name: string; accentColor: string; onRevealProject?: () => void | Promise<void> }) => {
    const { EditorDemo } = await import('../../ui/EditorDemo');
    return render(<EditorDemo project={project} />);
};

export const getLatestReactFlowProps = async () => {
    const reactFlowModule = await import('@xyflow/react') as typeof import('@xyflow/react') & {
        __getLatestReactFlowProps: () => any;
    };
    return reactFlowModule.__getLatestReactFlowProps();
};
