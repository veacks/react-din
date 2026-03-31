import { act, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLatestReactFlowProps, installEditorShellGlobals, installEditorShellViewport, renderEditor } from './editor-shell-test-utils';

describe('editor shortcuts', () => {
    beforeEach(() => {
        vi.resetModules();
        installEditorShellGlobals();
        installEditorShellViewport(1440);
    });

    afterEach(() => {
        cleanup();
    });

    it('supports undo and redo from the global keyboard handler', async () => {
        await act(async () => {
            await renderEditor();
        });

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        const graphNameInput = screen.getByPlaceholderText('Graph name');
        fireEvent.change(graphNameInput, { target: { value: 'Bass Lab' } });
        fireEvent.blur(graphNameInput);
        expect(graphNameInput).toHaveValue('Bass Lab');

        fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
        expect(screen.getByPlaceholderText('Graph name')).toHaveValue('Graph 1');

        fireEvent.keyDown(window, { key: 'y', ctrlKey: true });
        expect(screen.getByPlaceholderText('Graph name')).toHaveValue('Bass Lab');
    });

    it('ignores global undo when the event target is editable', async () => {
        await act(async () => {
            await renderEditor();
        });

        const graphNameInput = screen.getByPlaceholderText('Graph name');
        await act(async () => {
            fireEvent.change(graphNameInput, { target: { value: 'Editable Graph' } });
            fireEvent.keyDown(graphNameInput, { key: 'z', ctrlKey: true });
        });

        expect(graphNameInput).toHaveValue('Editable Graph');
    });
});
