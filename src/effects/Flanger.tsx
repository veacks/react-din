import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { FlangerProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Flanger: FC<FlangerProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 0.2,
    depth = 2,
    feedback = 0.5,
    delay = 1,
}) => {
    const { nodeId } = useWasmNode('flanger', {
        wet: mix,
        rate,
        depth,
        feedback,
        delay,
        bypass,
    });
    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
