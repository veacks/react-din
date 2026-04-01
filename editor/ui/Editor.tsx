import { useState, useCallback, useEffect, useMemo, type FC, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    useOnSelectionChange,
    type NodeTypes,
    type Node,
    type Edge,
    type OnConnectStartParams,
    type XYPosition,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './editor/editor.css';
import Inspector from './editor/Inspector';
import { CodeGenerator } from './editor/CodeGenerator';
import ConnectionAssistMenu from './editor/ConnectionAssistMenu';
import { MidiProvider } from '../../src/midi';

import { useAudioGraphStore } from './editor/store';
import type { AudioNodeData } from './editor/types';
import {
    OscNode, GainNode, FilterNode, OutputNode, NoiseNode, DelayNode, ReverbNode,
    CompressorNode, PhaserNode, FlangerNode, TremoloNode, EQ3Node, DistortionNode,
    ChorusNode, NoiseBurstNode, WaveShaperNode, ConvolverNode, AnalyzerNode,
    StereoPannerNode, Panner3DNode, MixerNode, AuxSendNode, AuxReturnNode,
    MatrixMixerNode, InputNode, UiTokensNode, ConstantSourceNode, MediaStreamNode,
    EventTriggerNode, NoteNode, TransportNode, StepSequencerNode, PianoRollNode,
    LFONode, ADSRNode, VoiceNode, SamplerNode, MidiNoteNode, MidiCCNode,
    MidiNoteOutputNode, MidiCCOutputNode, MidiSyncNode, MathNode, CompareNode,
    MixNode, ClampNode, SwitchNode,
} from './editor/nodes';
import { loadActiveGraphId, loadGraphs, saveActiveGraphId, saveGraph } from './editor/graphStorage';
import { subscribeAssets, listAssets } from './editor/audioLibrary';
import { audioEngine } from './editor/AudioEngine';
import {
    getCompatibleNodeSuggestions,
    type NodeSuggestion,
} from './editor/nodeHelpers';
import { McpStatusBadge } from '../bridge/McpStatusBadge';
import { createAtmosphericBreakbeatArcTemplate } from './editor/templates/atmosphericBreakbeatArcTemplate';
import { ActivityRail } from './shell/ActivityRail';
import { BottomDrawer } from './shell/BottomDrawer';
import { CatalogExplorerPanel } from './shell/CatalogExplorerPanel';
import { CommandPalette } from './shell/CommandPalette';
import { EditorTopbar } from './shell/EditorTopbar';
import { EditorShell } from './shell/EditorShell';
import { FooterStatus } from './shell/FooterStatus';
import { GraphDefaultsPanel } from './shell/GraphDefaultsPanel';
import { InspectorPane } from './shell/InspectorPane';
import { useEditorLayout } from './shell/useEditorLayout';
import { SHELL_LAYOUT } from './shell/shellTokens';
import { WindowTitlebar } from './shell/WindowTitlebar';
import { getMiniMapNodeColor } from './editor/nodeColorMap';

// Extracted Utilities
import { computeAutoLayoutPositions } from './editor/layoutUtils';
import { 
    createMedievalStrategyLongformTemplate 
} from './editor/templates/feedbackTemplates';

// Extracted Components
import { NodePalette } from './editor/components/NodePalette';
import { ExplorerPanel } from './editor/components/ExplorerPanel';
import { LibraryDrawerContent, RuntimeDrawerContent, DiagnosticsDrawerContent, type LibraryItem, type AudioPreviewState } from './editor/components/Drawers';

const nodeTypes: NodeTypes = {
    oscNode: OscNode as NodeTypes[string],
    gainNode: GainNode as NodeTypes[string],
    filterNode: FilterNode as NodeTypes[string],
    outputNode: OutputNode as NodeTypes[string],
    noiseNode: NoiseNode as NodeTypes[string],
    delayNode: DelayNode as NodeTypes[string],
    reverbNode: ReverbNode as NodeTypes[string],
    compressorNode: CompressorNode as NodeTypes[string],
    phaserNode: PhaserNode as NodeTypes[string],
    flangerNode: FlangerNode as NodeTypes[string],
    tremoloNode: TremoloNode as NodeTypes[string],
    eq3Node: EQ3Node as NodeTypes[string],
    distortionNode: DistortionNode as NodeTypes[string],
    chorusNode: ChorusNode as NodeTypes[string],
    noiseBurstNode: NoiseBurstNode as NodeTypes[string],
    waveShaperNode: WaveShaperNode as NodeTypes[string],
    convolverNode: ConvolverNode as NodeTypes[string],
    analyzerNode: AnalyzerNode as NodeTypes[string],
    pannerNode: StereoPannerNode as NodeTypes[string],
    panner3dNode: Panner3DNode as NodeTypes[string],
    mixerNode: MixerNode as NodeTypes[string],
    auxSendNode: AuxSendNode as NodeTypes[string],
    auxReturnNode: AuxReturnNode as NodeTypes[string],
    matrixMixerNode: MatrixMixerNode as NodeTypes[string],
    inputNode: InputNode as NodeTypes[string],
    uiTokensNode: UiTokensNode as NodeTypes[string],
    constantSourceNode: ConstantSourceNode as NodeTypes[string],
    mediaStreamNode: MediaStreamNode as NodeTypes[string],
    eventTriggerNode: EventTriggerNode as NodeTypes[string],
    noteNode: NoteNode as NodeTypes[string],
    transportNode: TransportNode as NodeTypes[string],
    stepSequencerNode: StepSequencerNode as NodeTypes[string],
    pianoRollNode: PianoRollNode as NodeTypes[string],
    lfoNode: LFONode as NodeTypes[string],
    adsrNode: ADSRNode as NodeTypes[string],
    voiceNode: VoiceNode as NodeTypes[string],
    samplerNode: SamplerNode as NodeTypes[string],
    midiNoteNode: MidiNoteNode as NodeTypes[string],
    midiCCNode: MidiCCNode as NodeTypes[string],
    midiNoteOutputNode: MidiNoteOutputNode as NodeTypes[string],
    midiCCOutputNode: MidiCCOutputNode as NodeTypes[string],
    midiSyncNode: MidiSyncNode as NodeTypes[string],
    mathNode: MathNode as NodeTypes[string],
    compareNode: CompareNode as NodeTypes[string],
    mixNode: MixNode as NodeTypes[string],
    clampNode: ClampNode as NodeTypes[string],
    switchNode: SwitchNode as NodeTypes[string],
};

const AUDIO_EDGE_STYLE = {
    stroke: '#6366f1',
    strokeWidth: 2,
};

export interface ProjectMeta {
    id: string;
    name: string;
    accentColor: string;
    path?: string;
    onRevealProject?: () => void | Promise<void>;
}

export interface EditorProps {
    project?: ProjectMeta;
}

const isEditableTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const editable = target.closest('input, textarea, select, [contenteditable="true"]');
    return Boolean(editable) || target.isContentEditable;
};

const getClientPosition = (event: MouseEvent | TouchEvent): XYPosition | null => {
    if ('clientX' in event) {
        return { x: event.clientX, y: event.clientY };
    }

    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) return null;
    return { x: touch.clientX, y: touch.clientY };
};

const EditorContent: FC<EditorProps> = ({ project }) => {
    const nodes = useAudioGraphStore((s) => s.nodes);
    const edges = useAudioGraphStore((s) => s.edges);
    const graphs = useAudioGraphStore((s) => s.graphs);
    const activeGraphId = useAudioGraphStore((s) => s.activeGraphId);
    const selectedNodeId = useAudioGraphStore((s) => s.selectedNodeId);
    
    // Store Actions
    const onNodesChange = useAudioGraphStore((s) => s.onNodesChange);
    const onEdgesChange = useAudioGraphStore((s) => s.onEdgesChange);
    const onConnect = useAudioGraphStore((s) => s.onConnect);
    const addNode = useAudioGraphStore((s) => s.addNode);
    const addNodeAndConnect = useAudioGraphStore((s) => s.addNodeAndConnect);
    const loadGraph = useAudioGraphStore((s) => s.loadGraph);
    const setGraphs = useAudioGraphStore((s) => s.setGraphs);
    const setActiveGraph = useAudioGraphStore((s) => s.setActiveGraph);
    const setSelectedNode = useAudioGraphStore((s) => s.setSelectedNode);
    const setPlaying = useAudioGraphStore((s) => s.setPlaying);
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);
    const renameGraph = useAudioGraphStore((s) => s.renameGraph);
    const undo = useAudioGraphStore((s) => s.undo);
    const redo = useAudioGraphStore((s) => s.redo);
    
    // Local UI State
    const [paletteFilter, setPaletteFilter] = useState('');
    const [libraryFilter, setLibraryFilter] = useState('');
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [audioPreview, setAudioPreview] = useState<AudioPreviewState>({ activeId: null, playing: false });
    const [nameDraft, setNameDraft] = useState('');
    
    const {
        isDark,
        setTheme,
        leftPanelView,
        leftPanelCollapsed,
        rightPanelCollapsed,
        bottomDrawerOpen,
        bottomDrawerTab,
        bottomDrawerHeight,
        inspectorTab,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toggleLeftPanel,
        toggleRightPanel,
        toggleBottomDrawer,
        openLeftPanelView,
        openBottomDrawerTab,
        openInspectorTab,
        updateBottomDrawerHeight,
    } = useEditorLayout();

    const connectionAssist = useAudioGraphStore((s) => s.connectionAssist);
    const assistPosition = useAudioGraphStore((s) => s.assistPosition);
    const assistQuery = useAudioGraphStore((s) => s.assistQuery);
    
    const setConnectionAssist = useAudioGraphStore((s) => s.setConnectionAssist);
    const setAssistPosition = useAudioGraphStore((s) => s.setAssistPosition);
    const setAssistQuery = useAudioGraphStore((s) => s.setAssistQuery);

    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const activeGraph = graphs.find(g => g.id === activeGraphId);
    const selectedNode = useMemo(
        () => (selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) ?? null : null),
        [nodes, selectedNodeId]
    );
    const outputNode = useMemo(
        () => nodes.find((node) => node.data.type === 'output') ?? null,
        [nodes]
    );
    const transportNode = useMemo(
        () => nodes.find((node) => node.data.type === 'transport') ?? null,
        [nodes]
    );
    const activeGraphName = activeGraph?.name;
    useEffect(() => {
        if (activeGraphName !== undefined) {
            setNameDraft(activeGraphName);
        }
    }, [activeGraphName]);

    // Track selection for inspector
    useOnSelectionChange({
        onChange: ({ nodes: selectedNodes }) => {
            const nextNode = selectedNodes[0] as Node<AudioNodeData> | undefined;
            setSelectedNode(nextNode?.id ?? null);
        },
    });

    // Helpers that wrap store logic
    const clearGraph = useCallback(() => {
        loadGraph([], []);
    }, [loadGraph]);

    const syncAudioEngine = useCallback(() => {
        audioEngine.stop();
        audioEngine.refreshConnections(nodes, edges);
    }, [nodes, edges]);

    const initializeFromGraphData = useCallback((graphData: { nodes: Node<AudioNodeData>[], edges: Edge[] }) => {
        loadGraph(graphData.nodes, graphData.edges);
        syncAudioEngine();
    }, [loadGraph, syncAudioEngine]);

    const loadTemplate = useCallback((template: { nodes: any[], edges: any[] }) => {
        initializeFromGraphData({ nodes: template.nodes as Node<AudioNodeData>[], edges: template.edges });
    }, [initializeFromGraphData]);

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            const storedGraphs = await loadGraphs();
            setGraphs(storedGraphs);

            const activeId = await loadActiveGraphId();
            if (activeId && storedGraphs.some(g => g.id === activeId)) {
                const graph = storedGraphs.find(g => g.id === activeId);
                if (graph) {
                    setActiveGraph(activeId);
                    initializeFromGraphData({ nodes: graph.nodes, edges: graph.edges });
                }
            }
        };

        loadInitialData();

        const refreshAssets = async () => {
            const assets = await listAssets();
            setLibraryItems(assets.map((a: any) => ({
                id: a.id,
                name: a.name,
                sizeBytes: a.sizeBytes || 0,
                type: a.type || 'audio/unknown',
                addedAt: a.addedAt || Date.now(),
                durationSec: a.durationSec || 0
            })));
        };

        refreshAssets();
        const unsubscribeAssets = subscribeAssets(refreshAssets);

        return () => {
            unsubscribeAssets();
        };
    }, []);

    // Save active graph
    const handleSaveActiveGraph = useCallback(async (nameOverride?: string) => {
        if (!activeGraphId) return;
        const graph = graphs.find(g => g.id === activeGraphId);
        if (!graph) return;

        const updatedGraph = {
            ...graph,
            name: nameOverride ?? graph.name,
            nodes,
            edges,
            updatedAt: Date.now(),
        };
        await saveGraph(updatedGraph);
        setGraphs(graphs.map(g => g.id === activeGraphId ? updatedGraph : g));
    }, [activeGraphId, nodes, edges, graphs, setGraphs]);

    // Handle graph loading
    const handleLoadGraph = useCallback(async (graphId: string) => {
        const graph = graphs.find(g => g.id === graphId);
        if (!graph) return;

        setActiveGraph(graphId);
        await saveActiveGraphId(graphId);
        initializeFromGraphData({ nodes: graph.nodes, edges: graph.edges });
    }, [graphs, setActiveGraph, initializeFromGraphData]);

    const handleNameBlur = useCallback(() => {
        if (!activeGraphId) return;
        renameGraph(activeGraphId, nameDraft);
        void handleSaveActiveGraph(nameDraft);
    }, [activeGraphId, nameDraft, renameGraph, handleSaveActiveGraph]);

    const handleNameKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    }, []);

    const handleAutoArrange = useCallback(() => {
        const positions = computeAutoLayoutPositions(nodes, edges);
        const repositionedNodes = nodes.map(n => ({
            ...n,
            position: positions.get(n.id) || n.position
        })) as Node<AudioNodeData>[];
        loadGraph(repositionedNodes, edges);
    }, [nodes, edges, loadGraph]);

    const handleTransportBpmChange = useCallback((value: number) => {
        if (!transportNode || !Number.isFinite(value)) return;
        const nextBpm = Math.min(300, Math.max(20, Math.round(value)));
        updateNodeData(transportNode.id, { bpm: nextBpm });
    }, [transportNode, updateNodeData]);

    // Command palette actions
    const commandActions = useMemo(() => [
        { id: 'save', title: 'Save Graph', shortcut: '⌘S', onSelect: handleSaveActiveGraph, section: 'File' },
        { id: 'clear', title: 'Clear Canvas', onSelect: clearGraph, section: 'Edit' },
        { id: 'arrange', title: 'Auto Arrange', shortcut: '⌘L', onSelect: handleAutoArrange, section: 'Layout' },
        { id: 'copy-patch', title: 'Copy Patch JSON', section: 'File', onSelect: () => {} },
        { id: 'download-patch', title: 'Download Patch JSON', section: 'File', onSelect: () => {} },
        { id: 'import-patch', title: 'Import Patch JSON', section: 'File', onSelect: () => {} },
        { id: 'template-breakbeat', title: 'Load Template: Breakbeat Arc', onSelect: () => loadTemplate(createAtmosphericBreakbeatArcTemplate()), section: 'Templates' },
        { id: 'template-medieval', title: 'Load Template: Medieval Strategy', onSelect: () => loadTemplate(createMedievalStrategyLongformTemplate()), section: 'Templates' },
    ], [handleSaveActiveGraph, clearGraph, handleAutoArrange, loadTemplate]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditableTarget(e.target)) return;
            
            const isMod = e.metaKey || e.ctrlKey;

            if (isMod && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(prev => !prev);
            }

            if (isMod && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleSaveActiveGraph();
            }

            if (isMod && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                handleAutoArrange();
            }

            if (isMod && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }

            if (isMod && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSaveActiveGraph, handleAutoArrange, setCommandPaletteOpen]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance?.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            }) || { x: 0, y: 0 };

            addNode(type as any, position);
        },
        [reactFlowInstance, addNode]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onConnectStart = useCallback((event: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
        const clientPos = getClientPosition(event);
        if (!clientPos) return;

        setAssistPosition(clientPos);
        setConnectionAssist({
            nodeId: params.nodeId || '',
            handleId: params.handleId || '',
            handleType: params.handleType || 'source',
        });
    }, []);

    const onConnectEnd = useCallback((event: any) => {
        const clientPos = getClientPosition(event);
        if (clientPos) {
            setAssistPosition(clientPos);
        }
    }, [setAssistPosition]);

    const assistSuggestions = useMemo(() => {
        if (!connectionAssist) return [];
        const all = getCompatibleNodeSuggestions(connectionAssist, nodes);
        if (!assistQuery) return all.slice(0, 8);
        return all.filter(s => 
            s.title.toLowerCase().includes(assistQuery.toLowerCase()) || 
            s.type.toLowerCase().includes(assistQuery.toLowerCase())
        ).slice(0, 8);
    }, [connectionAssist, nodes, assistQuery]);

    const handleSelectSuggestion = useCallback((suggestion: NodeSuggestion) => {
        if (!connectionAssist || !assistPosition) return;
        
        const flowPos = reactFlowInstance?.screenToFlowPosition(assistPosition) || { x: 0, y: 0 };
        addNodeAndConnect(suggestion.type, suggestion.connection, flowPos);
        
        setConnectionAssist(null);
        setAssistPosition(null);
        setAssistQuery('');
    }, [connectionAssist, assistPosition, reactFlowInstance, addNodeAndConnect]);
    const leftDrawerTitle = leftPanelView === 'explorer'
        ? 'Graph Explorer'
        : leftPanelView === 'catalog'
            ? 'Catalog'
            : 'Audio Library';
    const gitStatusLabel = project?.path ? 'git: linked workspace' : 'git: unavailable';
    const audioStatusLabel = outputNode?.data.type === 'output' && outputNode.data.playing
        ? 'Audio Live'
        : outputNode
            ? 'Audio Ready'
            : 'Audio Idle';
    const viewportPlayLabel = outputNode?.data.type === 'output' && outputNode.data.playing ? 'Pause graph output' : 'Play graph output';

    return (
        <MidiProvider>
            <div className={`flex h-full min-h-0 flex-col overflow-hidden select-none ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
                <WindowTitlebar
                    projectName={project?.name}
                    activeGraphName={activeGraph?.name || 'Untitled'}
                />
                <EditorTopbar
                    project={project ? {
                        name: project.name,
                        accentColor: project.accentColor,
                        onRevealProject: project.onRevealProject,
                    } : undefined}
                    isDark={isDark}
                    onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
                    onOpenCommandPalette={() => setCommandPaletteOpen(true)}
                />

                <div className="min-h-0 flex-1 overflow-hidden">
                    <EditorShell
                        rail={(
                            <ActivityRail
                                items={[
                                    { id: 'explorer', label: 'Explorer', shortLabel: 'EXP', active: leftPanelView === 'explorer', onSelect: () => openLeftPanelView('explorer') },
                                    { id: 'catalog', label: 'Catalog', shortLabel: 'CAT', active: leftPanelView === 'catalog', onSelect: () => openLeftPanelView('catalog') },
                                    { id: 'library', label: 'Library', shortLabel: 'LIB', active: leftPanelView === 'library', onSelect: () => openLeftPanelView('library') },
                                    { id: 'runtime', label: 'Runtime', shortLabel: 'RUN', active: bottomDrawerOpen && bottomDrawerTab === 'runtime', onSelect: () => openBottomDrawerTab('runtime') },
                                    { id: 'inspect', label: 'Inspect', shortLabel: 'INS', active: !rightPanelCollapsed, onSelect: toggleRightPanel },
                                ]}
                            />
                        )}
                        leftPanel={(
                            <CatalogExplorerPanel
                                collapsed={leftPanelCollapsed}
                                title={leftDrawerTitle}
                                onToggleCollapse={toggleLeftPanel}
                            >
                                {leftPanelView === 'explorer' ? (
                                    <ExplorerPanel
                                        onLoadGraph={handleLoadGraph}
                                        onLoadTemplate={(id) => {
                                            if (id === 'voice-synth') {
                                                loadTemplate(createAtmosphericBreakbeatArcTemplate());
                                            }
                                        }}
                                    />
                                ) : leftPanelView === 'catalog' ? (
                                    <NodePalette filter={paletteFilter} onFilterChange={setPaletteFilter} />
                                ) : (
                                    <LibraryDrawerContent
                                        items={libraryItems}
                                        filter={libraryFilter}
                                        onFilterChange={setLibraryFilter}
                                        preview={audioPreview}
                                        onPreviewChange={setAudioPreview}
                                        onItemsChange={setLibraryItems}
                                    />
                                )}
                            </CatalogExplorerPanel>
                        )}
                        canvas={(
                            <section className="ui-panel ui-canvas-stage flex min-h-0 flex-col border border-[var(--panel-border)]" data-testid="canvas-panel">
                                <div className="ui-panel-header border-b border-[var(--panel-border)] px-3 py-2" data-testid="graph-tabs">
                                    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                                        {graphs.map((graph) => (
                                            <button
                                                key={graph.id}
                                                type="button"
                                                onClick={() => void handleLoadGraph(graph.id)}
                                                className={`inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                                                    graph.id === activeGraphId
                                                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]'
                                                        : 'border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-subtle)] hover:text-[var(--text)]'
                                                }`}
                                            >
                                                <span className="truncate">{graph.name}</span>
                                                {graph.id === activeGraphId ? <span aria-hidden="true">x</span> : null}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAutoArrange}
                                            className="rounded-xl border border-[var(--panel-border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                        >
                                            Arrange
                                        </button>
                                    </div>
                                </div>
                                <main
                                    className="relative min-h-0 flex-1"
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                >
                                    <ReactFlow
                                        nodes={nodes}
                                        edges={edges}
                                        onNodesChange={onNodesChange}
                                        onEdgesChange={onEdgesChange}
                                        onConnect={(params) => {
                                            onConnect(params);
                                            setConnectionAssist(null);
                                            setAssistPosition(null);
                                        }}
                                        onConnectStart={onConnectStart}
                                        onConnectEnd={onConnectEnd}
                                        onInit={setReactFlowInstance}
                                        nodeTypes={nodeTypes}
                                        defaultEdgeOptions={{
                                            style: AUDIO_EDGE_STYLE,
                                            animated: false,
                                            deletable: true,
                                        }}
                                        fitView
                                        minZoom={0.1}
                                        maxZoom={4}
                                        snapToGrid
                                        snapGrid={[10, 10]}
                                        colorMode={isDark ? 'dark' : 'light'}
                                    >
                                        <Background variant={BackgroundVariant.Dots} gap={20} color={isDark ? '#27272a' : '#e4e4e7'} />
                                        <Controls className={`${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800'} fill-current`} />
                                        <MiniMap
                                            nodeColor={(node) => getMiniMapNodeColor(node.data.type as any)}
                                            className={isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}
                                            maskColor={isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
                                            pannable
                                            zoomable
                                        />

                                        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3">
                                            <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 p-1 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setPlaying(!(outputNode?.data.type === 'output' && outputNode.data.playing))}
                                                    className="rounded-md border border-[var(--panel-border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                                    aria-label={viewportPlayLabel}
                                                >
                                                    {outputNode?.data.type === 'output' && outputNode.data.playing ? 'Pause' : 'Play'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPlaying(false)}
                                                    className="rounded-md border border-[var(--panel-border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)] transition hover:text-[var(--text)]"
                                                    aria-label="Stop graph output"
                                                >
                                                    Stop
                                                </button>
                                            </div>
                                        </div>

                                        <ConnectionAssistMenu
                                            isOpen={Boolean(connectionAssist && assistPosition)}
                                            position={assistPosition || { x: 0, y: 0 }}
                                            query={assistQuery}
                                            suggestions={assistSuggestions}
                                            onQueryChange={setAssistQuery}
                                            onSelect={handleSelectSuggestion}
                                            onClose={() => {
                                                setConnectionAssist(null);
                                                setAssistPosition(null);
                                                setAssistQuery('');
                                            }}
                                        />
                                    </ReactFlow>
                                </main>
                            </section>
                        )}
                        bottomDrawer={(
                            <BottomDrawer
                                open={bottomDrawerOpen}
                                activeTab={bottomDrawerTab}
                                height={bottomDrawerHeight}
                                onToggle={toggleBottomDrawer}
                                onTabChange={openBottomDrawerTab}
                                onHeightChange={updateBottomDrawerHeight}
                                runtimeContent={<RuntimeDrawerContent />}
                                diagnosticsContent={<DiagnosticsDrawerContent />}
                            />
                        )}
                        rightPanel={(
                            <InspectorPane
                                collapsed={rightPanelCollapsed}
                                tab={inspectorTab}
                                onToggleCollapse={toggleRightPanel}
                                onTabChange={openInspectorTab}
                                hasSelection={Boolean(selectedNode)}
                                selectedNodeLabel={selectedNode?.data.label || null}
                                inspectContent={<Inspector />}
                                emptyInspectContent={(
                                    <GraphDefaultsPanel
                                        projectName={project?.name}
                                        activeGraphId={activeGraphId}
                                        nameDraft={nameDraft}
                                        onNameDraftChange={(event) => setNameDraft(event.target.value)}
                                        onNameKeyDown={handleNameKeyDown}
                                        onNameBlur={handleNameBlur}
                                        transportBpm={transportNode?.data.type === 'transport' ? transportNode.data.bpm : null}
                                        onTransportBpmChange={handleTransportBpmChange}
                                        onRevealProject={project?.onRevealProject}
                                    />
                                )}
                                codeContent={<CodeGenerator />}
                            />
                        )}
                        leftPanelCollapsed={leftPanelCollapsed}
                        rightPanelCollapsed={rightPanelCollapsed}
                        leftPanelWidth={SHELL_LAYOUT.leftPanelWidth}
                        rightPanelWidth={SHELL_LAYOUT.rightPanelWidth}
                    />
                </div>

                <FooterStatus
                    gitLabel={gitStatusLabel}
                    audioLabel={audioStatusLabel}
                    mcpBadge={<McpStatusBadge />}
                />

                <CommandPalette
                    open={commandPaletteOpen}
                    onClose={() => setCommandPaletteOpen(false)}
                    actions={commandActions}
                />
            </div>
        </MidiProvider>
    );
};

export const Editor: FC<EditorProps> = (props) => (
    <ReactFlowProvider>
        <EditorContent {...props} />
    </ReactFlowProvider>
);

export default Editor;
