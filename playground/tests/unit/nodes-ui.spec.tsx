import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import OscNode from '../../src/playground/nodes/OscNode';
import OutputNode from '../../src/playground/nodes/OutputNode';
import { StepSequencerNode } from '../../src/playground/nodes/StepSequencerNode';
import MathNode from '../../src/playground/nodes/MathNode';
import SwitchNode from '../../src/playground/nodes/SwitchNode';

const updateNodeData = vi.fn();

vi.mock('@xyflow/react', () => ({
    Handle: ({ id }: { id?: string }) => <div data-testid={`handle-${id ?? 'default'}`} />,
    Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
    useHandleConnections: () => [],
    useNodesData: () => null,
}));

vi.mock('../../src/playground/store', () => ({
    useAudioGraphStore: (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
            updateNodeData,
            nodes: [],
            edges: [],
        }),
}));

vi.mock('../../src/playground/AudioEngine', () => ({
    audioEngine: {
        start: vi.fn(),
        stop: vi.fn(),
        updateNode: vi.fn(),
        subscribeStep: () => () => {},
        updateSamplerParam: vi.fn(),
        playSampler: vi.fn(),
        stopSampler: vi.fn(),
        onSamplerEnd: () => () => {},
    },
}));

describe('playground node UIs', () => {
    it('renders representative node families with their controls', () => {
        const sharedProps = {
            dragging: false,
            selected: false,
            zIndex: 0,
            selectable: true,
            draggable: true,
            isConnectable: true,
            positionAbsoluteX: 0,
            positionAbsoluteY: 0,
            xPos: 0,
            yPos: 0,
        } as const;

        render(
            <div>
                <OscNode {...(sharedProps as any)} id="osc-1" data={{ type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' }} />
                <OutputNode {...(sharedProps as any)} id="out-1" data={{ type: 'output', playing: false, masterGain: 0.5, label: 'Output' }} />
                <StepSequencerNode {...(sharedProps as any)} id="seq-1" data={{ type: 'stepSequencer', steps: 4, pattern: [1, 0, 1, 0], activeSteps: [true, false, true, false], label: 'Step Sequencer' }} />
                <MathNode {...(sharedProps as any)} id="math-1" data={{ type: 'math', operation: 'add', a: 0, b: 1, c: 2, label: 'Math' }} />
                <SwitchNode {...(sharedProps as any)} id="switch-1" data={{ type: 'switch', inputs: 3, selectedIndex: 0, values: [0, 1, 2], label: 'Switch' }} />
            </div>
        );

        expect(screen.getByText('Oscillator')).toBeInTheDocument();
        expect(screen.getByText('Output')).toBeInTheDocument();
        expect(screen.getByText('Step Sequencer')).toBeInTheDocument();
        expect(screen.getByText('Math')).toBeInTheDocument();
        expect(screen.getByText('Switch')).toBeInTheDocument();
        expect(screen.getAllByTestId(/handle-/).length).toBeGreaterThan(5);
    });
});
