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
        expect(toPascalCase('bass lab')).toBe('BassLab');

        const code = generateCode(state.nodes, state.edges, true, 'Bass Lab');
        expect(code).toContain('export const BassLabRoot');
        expect(code).toContain('<AudioProvider>');
    });
});
