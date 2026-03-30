import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLatestReactFlowProps, installEditorShellGlobals, installEditorShellViewport, renderEditorDemo } from './editor-shell-test-utils';

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

        await renderEditorDemo(project);

        await waitFor(async () => {
            expect(await getLatestReactFlowProps()).toBeTruthy();
        });

        expect(screen.getByText('Catalog')).toBeInTheDocument();
        expect(screen.getByText('Templates')).toBeInTheDocument();
        expect(screen.getByText('Inspect')).toBeInTheDocument();
        expect(screen.getAllByText('Library').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Runtime').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Diagnostics').length).toBeGreaterThan(0);
        expect(screen.getByPlaceholderText('Graph name')).toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Explorer'));
        expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Command' }));

        expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
        expect(screen.getByText('Copy Patch JSON')).toBeInTheDocument();
        expect(screen.getByText('Download Patch JSON')).toBeInTheDocument();
        expect(screen.getByText('Import Patch JSON')).toBeInTheDocument();
    });
});
