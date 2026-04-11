import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { NoiseType } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export interface NoiseBurstProps {
    children?: React.ReactNode;
    type?: NoiseType;
    duration?: number;
    gain?: number;
    attack?: number;
    release?: number;
}

export const NoiseBurst: FC<NoiseBurstProps> = ({
    children,
    type = 'white',
    duration = 0.1,
    gain = 1,
    attack = 0.001,
    release = 0.05,
}) => {
    const { nodeId } = useWasmNode('noiseBurst', {
        type,
        duration,
        gain,
        attack,
        release,
    });

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
