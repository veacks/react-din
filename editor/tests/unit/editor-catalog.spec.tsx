import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLatestReactFlowProps, installEditorShellGlobals, installEditorShellViewport, renderEditorDemo } from './editor-shell-test-utils';

describe('editor catalog', () => {
    beforeEach(() => {
        vi.resetModules();
        installEditorShellGlobals();
        installEditorShellViewport(1440);
    });

    afterEach(() => {
        cleanup();
    });

    it('shows the node browser and adds nodes from the palette', async () => {
        await renderEditorDemo();

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        const { useAudioGraphStore } = await import('../../ui/editor/store');

        expect(screen.getByLabelText('Search nodes')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Oscillator' })).toBeInTheDocument();
        expect(screen.getByText('Templates')).toBeInTheDocument();

        const before = useAudioGraphStore.getState().nodes.length;
        fireEvent.click(screen.getByRole('button', { name: 'Add Oscillator' }));
        expect(useAudioGraphStore.getState().nodes.length).toBe(before + 1);
    });

    it('loads a template graph from the browser panel', async () => {
        await renderEditorDemo();

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        const { useAudioGraphStore } = await import('../../ui/editor/store');

        fireEvent.click(screen.getByRole('button', { name: /Voice Synth/ }));

        expect(useAudioGraphStore.getState().nodes.some((node) => node.data.type === 'voice')).toBe(true);
        expect(useAudioGraphStore.getState().nodes.some((node) => node.data.type === 'output')).toBe(true);
    });
});
