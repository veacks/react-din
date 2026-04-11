import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useWasmNode } from '../nodes/useAudioNode';
import type { MonoSynthProps } from './types';
import { DEFAULT_ENVELOPE, DEFAULT_OSCILLATOR } from './types';
import {
    resolveMidiNote,
    useMirrorExternalNodeRef,
    useSynthTriggerToMidi,
} from './runtime';

export const MonoSynth: FC<MonoSynthProps> = ({
    children,
    notes = [],
    oscillator = {},
    envelope = {},
    volume = 0.5,
    bypass = false,
    portamento = 0,
    nodeRef: externalRef,
}) => {
    const oscConfig = { ...DEFAULT_OSCILLATOR, ...oscillator };
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };

    const { nodeId } = useWasmNode('monoSynth', {
        waveform: oscConfig.type,
        attack: envConfig.attack,
        decay: envConfig.decay,
        sustain: envConfig.sustain,
        release: envConfig.release,
        glide: portamento,
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
