import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { PhaserProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Phaser: FC<PhaserProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 0.5,
    depth = 0.5,
    feedback = 0.7,
    baseFrequency = 1000,
    stages = 4,
}) => {
    const { nodeId } = useWasmNode('phaser', {
        wet: mix,
        rate,
        depth,
        feedback,
        baseFrequency,
        stages,
        bypass,
    });
    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
