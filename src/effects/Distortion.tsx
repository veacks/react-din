import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { DistortionProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Distortion: FC<DistortionProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    type = 'soft',
    drive = 0.5,
    level = 0.5,
    oversample = '2x',
    tone = 4000,
}) => {
    const { nodeId } = useWasmNode('distortion', {
        wet: mix,
        type,
        gain: drive,
        level,
        oversample,
        tone,
        bypass,
    });
    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
