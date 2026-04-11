import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { ChorusProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Chorus: FC<ChorusProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 1.5,
    depth = 3.5,
    feedback = 0.2,
    delay = 20,
    stereo = true,
}) => {
    const { nodeId } = useWasmNode('chorus', {
        wet: mix,
        rate,
        depth,
        feedback,
        delay,
        stereo,
        bypass,
    });
    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
