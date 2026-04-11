import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useWasmNode } from '../nodes/useAudioNode';
import type { SynthProps } from './types';
import { DEFAULT_ENVELOPE, DEFAULT_FILTER, DEFAULT_OSCILLATOR } from './types';
import {
    resolveMidiNote,
    useMirrorExternalNodeRef,
    useSynthTriggerToMidi,
} from './runtime';

export const Synth: FC<SynthProps> = ({
    children,
    notes = [],
    oscillator = {},
    envelope = {},
    filter = {},
    volume = 0.5,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const oscConfig = { ...DEFAULT_OSCILLATOR, ...oscillator };
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const filterConfig = { ...DEFAULT_FILTER, ...filter };

    const { nodeId } = useWasmNode('polySynth', {
        voices: 1,
        waveform: oscConfig.type,
        attack: envConfig.attack,
        decay: envConfig.decay,
        sustain: envConfig.sustain,
        release: envConfig.release,
        filterFreq: filterConfig.frequency,
        filterQ: filterConfig.Q,
        volume,
        bypass,
    });

    useSynthTriggerToMidi((step, fallback) => resolveMidiNote(notes, step, fallback));
    useMirrorExternalNodeRef(externalRef);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
