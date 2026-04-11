import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useWasmNode } from '../nodes/useAudioNode';
import type { FMSynthProps } from './types';
import { DEFAULT_ENVELOPE } from './types';
import {
    resolveMidiNote,
    useMirrorExternalNodeRef,
    useSynthTriggerToMidi,
} from './runtime';

export const FMSynth: FC<FMSynthProps> = ({
    children,
    notes = [],
    modulationRatio = 1,
    modulationIndex = 1,
    envelope = {},
    volume = 0.5,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const { nodeId } = useWasmNode('fmSynth', {
        voices: 8,
        ratio: modulationRatio,
        modIndex: modulationIndex,
        attack: envConfig.attack,
        decay: envConfig.decay,
        sustain: envConfig.sustain,
        release: envConfig.release,
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
