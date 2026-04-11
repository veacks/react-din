import type { FC, ReactNode, RefObject } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useWasmNode } from '../nodes/useAudioNode';
import type { EnvelopeConfig } from './types';
import { DEFAULT_ENVELOPE } from './types';
import { useMirrorExternalNodeRef, useSynthTriggerToMidi } from './runtime';

export interface DrumOscillatorConfig {
    type?: OscillatorType;
    frequency: number;
    pitchDecay?: number;
    pitchDecayTime?: number;
    gain?: number;
    duration?: number;
}

export interface DrumNoiseConfig {
    type?: 'white' | 'pink' | 'brown';
    filterType?: BiquadFilterType;
    filterFrequency?: number;
    filterQ?: number;
    gain?: number;
    duration?: number;
}

export interface DrumSynthProps {
    children?: ReactNode;
    oscillators?: DrumOscillatorConfig[];
    noise?: DrumNoiseConfig[];
    envelope?: EnvelopeConfig;
    volume?: number;
    saturation?: boolean;
    saturationAmount?: number;
    bypass?: boolean;
    nodeRef?: RefObject<GainNode>;
}

export const DrumSynth: FC<DrumSynthProps> = ({
    children,
    oscillators = [],
    noise = [],
    envelope = {},
    volume = 0.5,
    saturation = false,
    saturationAmount = 2,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const { nodeId } = useWasmNode('drumSynth', {
        oscillators,
        noise,
        attack: envConfig.attack,
        decay: envConfig.decay,
        sustain: envConfig.sustain,
        release: envConfig.release,
        volume,
        saturation,
        distortion: saturationAmount,
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
