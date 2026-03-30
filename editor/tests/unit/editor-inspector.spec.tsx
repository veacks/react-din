import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Inspector from '../../ui/editor/Inspector';

const storeState = {
    nodes: [] as any[],
    selectedNodeId: null as string | null,
    updateNodeData: vi.fn(),
};

vi.mock('../../ui/editor/store', () => ({
    useAudioGraphStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
}));

vi.mock('../../ui/editor/CodeGenerator', () => ({
    CodeGenerator: () => <textarea aria-label="Generated code" readOnly value="generated code" />,
}));

describe('editor inspector', () => {
    beforeEach(() => {
        vi.resetModules();
        storeState.nodes = [];
        storeState.selectedNodeId = null;
        storeState.updateNodeData.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('falls back to generated code when nothing is selected', () => {
        render(<Inspector />);

        expect(screen.getByLabelText('Generated code')).toBeInTheDocument();
    });

    it('edits input parameters for the selected node', () => {
        storeState.nodes = [
            {
                id: 'input-1',
                type: 'inputNode',
                data: {
                    type: 'input',
                    label: 'Params',
                    params: [
                        { id: 'cutoff', name: 'cutoff', label: 'Cutoff', type: 'float', value: 440, defaultValue: 440, min: 20, max: 20000 },
                    ],
                },
            },
        ];
        storeState.selectedNodeId = 'input-1';

        render(<Inspector />);

        expect(screen.getByDisplayValue('Cutoff')).toBeInTheDocument();
        expect(screen.getAllByDisplayValue('440').length).toBeGreaterThan(0);

        fireEvent.change(screen.getByDisplayValue('Cutoff'), { target: { value: 'Brightness' } });

        expect(storeState.updateNodeData).toHaveBeenCalled();
    });
});
