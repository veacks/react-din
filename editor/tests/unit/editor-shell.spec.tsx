import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLatestReactFlowProps, installEditorShellGlobals, installEditorShellViewport, renderEditor } from './editor-shell-test-utils';

describe('editor shell', () => {
    beforeEach(() => {
        vi.resetModules();
        installEditorShellGlobals();
        installEditorShellViewport(1440);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the main workspace regions for the desktop shell', async () => {
        const project = {
            id: 'project-shell',
            name: 'Shell Lab',
            accentColor: '#68a5ff',
            onRevealProject: vi.fn(),
        };

        await renderEditor(project);

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        expect(screen.getByTestId('activity-rail')).toBeInTheDocument();
        expect(screen.getByTestId('left-drawer')).toBeInTheDocument();
        expect(screen.getByTestId('canvas-panel')).toBeInTheDocument();
        expect(screen.getByTestId('graph-tabs')).toBeInTheDocument();
        expect(screen.getByTestId('inspector-pane')).toBeInTheDocument();
        expect(screen.getByTestId('editor-footer')).toBeInTheDocument();
        expect(screen.getByText('Graph Explorer')).toBeInTheDocument();
        expect(screen.getByText('Templates')).toBeInTheDocument();
        expect(screen.getByText('Graph defaults')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Graph name')).toBeInTheDocument();
        expect(screen.queryByLabelText('Search library files')).not.toBeInTheDocument();

        const bottomDrawer = screen.getByTestId('bottom-drawer');
        expect(within(bottomDrawer).getByText('Runtime')).toBeInTheDocument();
        expect(within(bottomDrawer).getByText('Diagnostics')).toBeInTheDocument();
        expect(within(bottomDrawer).queryByText('Library')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Explorer'));
        expect(screen.getByTitle('Reveal in list')).toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Library'));
        expect(screen.getByLabelText('Search library files')).toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Open command palette'));

        expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
        expect(screen.getByText('Copy Patch JSON')).toBeInTheDocument();
        expect(screen.getByText('Download Patch JSON')).toBeInTheDocument();
        expect(screen.getByText('Import Patch JSON')).toBeInTheDocument();
    });

    it('migrates the legacy library drawer tab into the left drawer layout', async () => {
        cleanup();
        installEditorShellGlobals({
            'din-editor-bottom-drawer-tab': 'library',
            'din-editor-bottom-drawer-open': 'false',
        });

        await renderEditor();

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        expect(screen.getByText('Audio Library')).toBeInTheDocument();
        expect(screen.getByLabelText('Search library files')).toBeInTheDocument();

        const bottomDrawer = screen.getByTestId('bottom-drawer');
        expect(within(bottomDrawer).getByText('Runtime')).toBeInTheDocument();
        expect(within(bottomDrawer).queryByText('Library')).not.toBeInTheDocument();
    });
});
