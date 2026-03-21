import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, vi } from 'vitest';

import OscNode from '../../src/playground/nodes/OscNode';
import GainNode from '../../src/playground/nodes/GainNode';
import OutputNode from '../../src/playground/nodes/OutputNode';
import InputNode from '../../src/playground/nodes/InputNode';
import NoteNode from '../../src/playground/nodes/NoteNode';
import { StepSequencerNode } from '../../src/playground/nodes/StepSequencerNode';
import { PianoRollNode } from '../../src/playground/nodes/PianoRollNode';
import MathNode from '../../src/playground/nodes/MathNode';
import SwitchNode from '../../src/playground/nodes/SwitchNode';
import DelayNode from '../../src/playground/nodes/DelayNode';
import ReverbNode from '../../src/playground/nodes/ReverbNode';
import StereoPannerNode from '../../src/playground/nodes/StereoPannerNode';
import { getInputParamHandleId } from '../../src/playground/handleIds';

const updateNodeData = vi.fn();
const storeState = {
    updateNodeData,
    nodes: [] as any[],
    edges: [] as any[],
};
const audioEngineMock = vi.hoisted(() => ({
    subscribeStep: vi.fn((callback: (step: number) => void) => {
        callback(2);
        return () => {};
    }),
}));

vi.mock('@xyflow/react', () => ({
    Handle: ({ id }: { id?: string }) => <div data-testid={`handle-${id ?? 'default'}`} />,
    Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
    useHandleConnections: () => [],
    useNodesData: () => null,
}));

vi.mock('../../src/playground/store', () => ({
    useAudioGraphStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState),
}));

vi.mock('../../src/playground/AudioEngine', () => ({
    audioEngine: {
        start: vi.fn(),
        stop: vi.fn(),
        updateNode: vi.fn(),
        subscribeStep: audioEngineMock.subscribeStep,
        getControlInputValue: vi.fn(() => null),
        updateSamplerParam: vi.fn(),
        playSampler: vi.fn(),
        stopSampler: vi.fn(),
        onSamplerEnd: () => () => {},
    },
}));

describe('playground node UIs', () => {
    afterEach(() => {
        storeState.nodes = [];
        storeState.edges = [];
    });

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
                <InputNode
                    {...(sharedProps as any)}
                    id="input-1"
                    data={{
                        type: 'input',
                        label: 'Params',
                        params: [{ id: 'cutoff', name: 'cutoff', label: 'Cutoff', type: 'float', value: 440, defaultValue: 440, min: 20, max: 20000 }],
                    }}
                />
                <NoteNode {...(sharedProps as any)} id="note-1" data={{ type: 'note', note: 'C', octave: 4, frequency: 261.6, language: 'en', label: 'Note' }} />
                <OscNode {...(sharedProps as any)} id="osc-1" data={{ type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' }} />
                <OutputNode {...(sharedProps as any)} id="out-1" data={{ type: 'output', playing: false, masterGain: 0.5, label: 'Output' }} />
                <StepSequencerNode {...(sharedProps as any)} id="seq-1" data={{ type: 'stepSequencer', steps: 4, pattern: [1, 0, 1, 0], activeSteps: [true, false, true, false], label: 'Step Sequencer' }} />
                <PianoRollNode {...(sharedProps as any)} id="pr-1" data={{ type: 'pianoRoll', steps: 16, octaves: 2, baseNote: 48, notes: [], label: 'Piano Roll' }} />
                <DelayNode {...(sharedProps as any)} id="delay-1" data={{ type: 'delay', delayTime: 0.25, feedback: 0.5, label: 'Delay' }} />
                <ReverbNode {...(sharedProps as any)} id="reverb-1" data={{ type: 'reverb', decay: 2.5, mix: 0.4, label: 'Reverb' }} />
                <StereoPannerNode {...(sharedProps as any)} id="panner-1" data={{ type: 'panner', pan: 0.25, label: 'Pan' }} />
                <MathNode {...(sharedProps as any)} id="math-1" data={{ type: 'math', operation: 'add', a: 0, b: 1, c: 2, label: 'Math' }} />
                <SwitchNode {...(sharedProps as any)} id="switch-1" data={{ type: 'switch', inputs: 3, selectedIndex: 0, values: [0, 1, 2], label: 'Switch' }} />
            </div>
        );

        expect(screen.getByTestId('handle-param:cutoff')).toBeInTheDocument();
        expect(screen.getByText('Oscillator')).toBeInTheDocument();
        expect(screen.getByText('Output')).toBeInTheDocument();
        expect(screen.getByText('Step Sequencer')).toBeInTheDocument();
        expect(screen.getByText('Playing step 3 / 4')).toBeInTheDocument();
        expect(screen.getByText('Piano Roll')).toBeInTheDocument();
        expect(screen.getAllByText('Steps').length).toBeGreaterThan(1);
        expect(screen.getByText('Octaves')).toBeInTheDocument();
        expect(screen.getByText('Base')).toBeInTheDocument();
        expect(screen.getByTestId('handle-delayTime')).toBeInTheDocument();
        expect(screen.getByTestId('handle-feedback')).toBeInTheDocument();
        expect(screen.getByTestId('handle-decay')).toBeInTheDocument();
        expect(screen.getByTestId('handle-mix')).toBeInTheDocument();
        expect(screen.getByTestId('handle-pan')).toBeInTheDocument();
        expect(screen.getByTestId('handle-masterGain')).toBeInTheDocument();
        expect(screen.getByText('Math')).toBeInTheDocument();
        expect(screen.getByText('Switch')).toBeInTheDocument();
        expect(screen.getAllByTestId(/handle-/).length).toBeGreaterThan(5);
    });

    it('keeps only the frequency output on NoteNode', () => {
        cleanup();

        render(
            <NoteNode
                {...({
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
                } as any)}
                id="note-only"
                data={{ type: 'note', note: 'C', octave: 4, frequency: 261.6, language: 'en', label: 'Note' }}
            />
        );

        expect(screen.getByTestId('handle-freq')).toBeInTheDocument();
        expect(screen.queryByTestId('handle-trigger')).not.toBeInTheDocument();
    });

    it('replaces slider with connected value when parameter handle is connected', () => {
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

        const param = {
            id: 'gainParam',
            name: 'gainParam',
            label: 'Gain Param',
            type: 'float' as const,
            value: 0.72,
            defaultValue: 0.72,
            min: 0,
            max: 1,
        };

        storeState.nodes = [
            { id: 'input-1', data: { type: 'input', params: [param], label: 'Params' } },
            { id: 'gain-1', data: { type: 'gain', gain: 0.2, label: 'Gain' } },
        ];
        storeState.edges = [
            { id: 'e-1', source: 'input-1', sourceHandle: getInputParamHandleId(param), target: 'gain-1', targetHandle: 'gain' },
        ];

        render(
            <GainNode
                {...(sharedProps as any)}
                id="gain-1"
                data={{ type: 'gain', gain: 0.2, label: 'Gain' }}
            />
        );

        expect(screen.queryByTitle('Gain level')).not.toBeInTheDocument();
        expect(screen.getByText('72%')).toBeInTheDocument();
    });
});
