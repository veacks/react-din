import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLatestReactFlowProps, installEditorShellGlobals, installEditorShellViewport, renderEditor } from './editor-shell-test-utils';

describe('editor catalog', () => {
    beforeEach(() => {
        vi.resetModules();
        installEditorShellGlobals();
        installEditorShellViewport(1440);
    });

    afterEach(() => {
        cleanup();
    });

    it('shows the node browser and exposes draggable palette items', async () => {
        await renderEditor();

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        const { useAudioGraphStore } = await import('../../ui/editor/store');
        fireEvent.click(screen.getByTitle('Catalog'));

        expect(screen.getByLabelText('Search nodes')).toBeInTheDocument();
        const oscillatorButton = screen.getByRole('button', { name: 'Add Oscillator' });
        expect(oscillatorButton).toBeInTheDocument();
        expect(screen.getByText('Sources')).toBeInTheDocument();

        const dataTransfer = {
            effectAllowed: 'move',
            dropEffect: 'move',
            store: new Map<string, string>(),
            setData(type: string, value: string) {
                this.store.set(type, value);
            },
            getData(type: string) {
                return this.store.get(type) ?? '';
            },
        };

        fireEvent.dragStart(oscillatorButton, { dataTransfer });
        expect(dataTransfer.getData('application/reactflow')).toBe('oscNode');
    });

    it('loads a template graph from the browser panel', async () => {
        await renderEditor();

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        const { useAudioGraphStore } = await import('../../ui/editor/store');

        fireEvent.click(screen.getByRole('button', { name: /Voice Synth/ }));

        expect(useAudioGraphStore.getState().nodes.some((node) => node.data.type === 'voice')).toBe(true);
        expect(useAudioGraphStore.getState().nodes.some((node) => node.data.type === 'output')).toBe(true);
    });
});
