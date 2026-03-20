import { vi } from 'vitest';

describe('playground store and code generation', () => {
    it('adds nodes and updates node data through the zustand store', async () => {
        vi.resetModules();
        const { audioEngine } = await import('../../src/playground/AudioEngine');
        const refreshConnections = vi.spyOn(audioEngine, 'refreshConnections').mockImplementation(() => {});
        const refreshDataValues = vi.spyOn(audioEngine, 'refreshDataValues').mockImplementation(() => {});
        const updateNode = vi.spyOn(audioEngine, 'updateNode').mockImplementation(() => {});
        const { useAudioGraphStore } = await import('../../src/playground/store');
        const initialLength = useAudioGraphStore.getState().nodes.length;

        useAudioGraphStore.getState().addNode('mix');
        const mixNode = useAudioGraphStore.getState().nodes.at(-1);
        expect(useAudioGraphStore.getState().nodes).toHaveLength(initialLength + 1);
        expect(mixNode?.data.type).toBe('mix');

        if (!mixNode) {
            throw new Error('Expected a mix node');
        }

        useAudioGraphStore.getState().updateNodeData(mixNode.id, { t: 0.75 });
        const updated = useAudioGraphStore.getState().nodes.find((node) => node.id === mixNode.id);

        expect((updated?.data as { t: number }).t).toBe(0.75);
        expect(refreshConnections).toHaveBeenCalled();
        expect(refreshDataValues).toHaveBeenCalled();
        expect(updateNode).toHaveBeenCalledWith(mixNode.id, { t: 0.75 });

        refreshConnections.mockRestore();
        refreshDataValues.mockRestore();
        updateNode.mockRestore();
    });

    it('sanitizes persisted graphs and emits component names for generated code', async () => {
        vi.resetModules();
        const { generateCode } = await import('../../src/playground/CodeGenerator');
        const { sanitizeGraphForStorage, toPascalCase } = await import('../../src/playground/graphUtils');
        const { useAudioGraphStore } = await import('../../src/playground/store');
        const state = useAudioGraphStore.getState();

        const graph = sanitizeGraphForStorage({
            id: 'graph-1',
            name: 'Bass Lab',
            nodes: state.nodes.map((node) =>
                node.data.type === 'output'
                    ? { ...node, data: { ...node.data, playing: true } }
                    : node
            ),
            edges: state.edges,
            createdAt: 0,
            updatedAt: 0,
            order: 0,
        });

        expect(graph.name).toBe('Bass Lab');
        expect(graph.nodes.some((node) => node.data.type === 'output' && (node.data as { playing: boolean }).playing)).toBe(false);
        expect(graph.nodes.some((node) => node.data.type === 'transport' && (node.data as { playing: boolean }).playing)).toBe(false);
        expect(toPascalCase('bass lab')).toBe('BassLab');

        const code = generateCode(state.nodes, state.edges, true, 'Bass Lab');
        expect(code).toContain('export const BassLabRoot');
        expect(code).toContain('<AudioProvider>');
    });

    it('migrates legacy handles, rejects removed note triggers, and keeps singleton transport/output nodes', async () => {
        vi.resetModules();
        const { useAudioGraphStore } = await import('../../src/playground/store');

        useAudioGraphStore.getState().loadGraph(
            [
                {
                    id: 'input-1',
                    type: 'inputNode',
                    position: { x: 0, y: 0 },
                    data: {
                        type: 'input',
                        label: 'Params',
                        params: [{ id: 'cutoff', name: 'cutoff', label: 'Cutoff', type: 'float', value: 440, defaultValue: 440, min: 20, max: 20000 }],
                    },
                },
                {
                    id: 'transport-a',
                    type: 'transportNode',
                    position: { x: 0, y: 0 },
                    data: { type: 'transport', bpm: 120, playing: false, label: 'Transport' },
                },
                {
                    id: 'transport-b',
                    type: 'transportNode',
                    position: { x: 0, y: 0 },
                    data: { type: 'transport', bpm: 90, playing: false, label: 'Transport 2' },
                },
                {
                    id: 'seq-1',
                    type: 'stepSequencerNode',
                    position: { x: 0, y: 0 },
                    data: { type: 'stepSequencer', steps: 16, pattern: Array(16).fill(0.8), activeSteps: Array(16).fill(false), label: 'Step Sequencer' },
                },
                {
                    id: 'osc-1',
                    type: 'oscNode',
                    position: { x: 0, y: 0 },
                    data: { type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' },
                },
                {
                    id: 'note-1',
                    type: 'noteNode',
                    position: { x: 0, y: 0 },
                    data: { type: 'note', note: 'C', octave: 4, frequency: 261.6, language: 'en', label: 'Note' },
                },
                {
                    id: 'output-a',
                    type: 'outputNode',
                    position: { x: 0, y: 0 },
                    data: { type: 'output', playing: false, masterGain: 0.5, label: 'Output' },
                },
                {
                    id: 'output-b',
                    type: 'outputNode',
                    position: { x: 0, y: 0 },
                    data: { type: 'output', playing: false, masterGain: 0.8, label: 'Output 2' },
                },
            ],
            [
                { id: 'legacy-input', source: 'input-1', sourceHandle: 'param_0', target: 'osc-1', targetHandle: 'frequency' },
                { id: 'legacy-transport', source: 'transport-a', target: 'seq-1' },
                { id: 'dead-note-trigger', source: 'osc-1', sourceHandle: 'out', target: 'note-1', targetHandle: 'trigger' },
            ]
        );

        const state = useAudioGraphStore.getState();

        expect(state.nodes.filter((node) => node.data.type === 'transport')).toHaveLength(1);
        expect(state.nodes.filter((node) => node.data.type === 'output')).toHaveLength(1);
        expect(state.edges.find((edge) => edge.id === 'legacy-input')?.sourceHandle).toBe('param:cutoff');
        expect(state.edges.find((edge) => edge.id === 'legacy-transport')?.targetHandle).toBe('transport');
        expect(state.edges.some((edge) => edge.id === 'dead-note-trigger')).toBe(false);
    });

    it('gates generated sequencing on transport links and emits helper components for delay feedback and sampler triggers', async () => {
        vi.resetModules();
        const { generateCode } = await import('../../src/playground/CodeGenerator');

        const nodes = [
            {
                id: 'transport-1',
                type: 'transportNode',
                position: { x: 0, y: 0 },
                data: { type: 'transport', bpm: 128, playing: false, beatsPerBar: 4, beatUnit: 4, stepsPerBeat: 4, barsPerPhrase: 4, swing: 0.2, label: 'Transport' },
            },
            {
                id: 'seq-1',
                type: 'stepSequencerNode',
                position: { x: 0, y: 0 },
                data: { type: 'stepSequencer', steps: 32, pattern: Array(32).fill(0.8), activeSteps: Array(32).fill(true), label: 'Step Sequencer' },
            },
            {
                id: 'input-1',
                type: 'inputNode',
                position: { x: 0, y: 0 },
                data: {
                    type: 'input',
                    label: 'Params',
                    params: [{ id: 'cutoff', name: 'cutoff', label: 'Cutoff', type: 'float', value: 880, defaultValue: 880, min: 20, max: 20000 }],
                },
            },
            {
                id: 'osc-1',
                type: 'oscNode',
                position: { x: 0, y: 0 },
                data: { type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' },
            },
            {
                id: 'filter-1',
                type: 'filterNode',
                position: { x: 0, y: 0 },
                data: { type: 'filter', filterType: 'lowpass', frequency: 1000, detune: 0, q: 1, gain: 0, label: 'Filter' },
            },
            {
                id: 'sampler-1',
                type: 'samplerNode',
                position: { x: 0, y: 0 },
                data: { type: 'sampler', src: '/samples/kick.wav', loop: false, playbackRate: 1, detune: 0, loaded: true, label: 'Sampler' },
            },
            {
                id: 'delay-1',
                type: 'delayNode',
                position: { x: 0, y: 0 },
                data: { type: 'delay', delayTime: 0.25, feedback: 0.6, label: 'Delay' },
            },
            {
                id: 'output-1',
                type: 'outputNode',
                position: { x: 0, y: 0 },
                data: { type: 'output', playing: false, masterGain: 0.5, label: 'Output' },
            },
        ];

        const edges = [
            { id: 'transport', source: 'transport-1', sourceHandle: 'out', target: 'seq-1', targetHandle: 'transport' },
            { id: 'seq-sampler', source: 'seq-1', sourceHandle: 'trigger', target: 'sampler-1', targetHandle: 'trigger' },
            { id: 'input-filter', source: 'input-1', sourceHandle: 'param:cutoff', target: 'filter-1', targetHandle: 'frequency' },
            { id: 'osc-filter', source: 'osc-1', sourceHandle: 'out', target: 'filter-1', targetHandle: 'in' },
            { id: 'filter-output', source: 'filter-1', sourceHandle: 'out', target: 'output-1', targetHandle: 'in' },
            { id: 'sampler-delay', source: 'sampler-1', sourceHandle: 'out', target: 'delay-1', targetHandle: 'in' },
            { id: 'delay-output', source: 'delay-1', sourceHandle: 'out', target: 'output-1', targetHandle: 'in' },
        ];

        const connectedCode = generateCode(nodes as any, edges as any, true, 'Bass Lab');
        const disconnectedCode = generateCode(nodes as any, edges.filter((edge) => edge.id !== 'transport') as any, true, 'Bass Lab');

        expect(connectedCode).toContain('const FeedbackDelay');
        expect(connectedCode).toContain('const TriggeredSampler');
        expect(connectedCode).toContain('cutoff?: number;');
        expect(connectedCode).toContain('<Sequencer');
        expect(connectedCode).toContain('<TransportProvider');
        expect(connectedCode).not.toContain('param_0');
        expect(disconnectedCode).not.toContain('<Sequencer');
    });
});
