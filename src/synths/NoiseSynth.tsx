import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useWasmNode } from '../nodes/useAudioNode';
import type { NoiseSynthProps } from './types';
import { DEFAULT_ENVELOPE } from './types';
import { useMirrorExternalNodeRef, useSynthTriggerToMidi } from './runtime';

export const NoiseSynth: FC<NoiseSynthProps> = ({
    children,
    noiseType = 'white',
    envelope = {},
    volume = 0.5,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const { nodeId } = useWasmNode('noiseSynth', {
        type: noiseType,
        attack: envConfig.attack,
        decay: envConfig.decay,
        sustain: envConfig.sustain,
        release: envConfig.release,
        volume,
        bypass,
    });

    useSynthTriggerToMidi((_, fallback) => fallback);
    useMirrorExternalNodeRef(externalRef);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
