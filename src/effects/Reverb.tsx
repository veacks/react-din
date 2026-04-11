import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { ReverbProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Reverb: FC<ReverbProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    type = 'hall',
    decay = 2,
    preDelay = 0.01,
    damping = 0.5,
    size = 0.5,
    impulse,
}) => {
    const patchAsset = typeof impulse === 'string' ? impulse : undefined;
    const { nodeId } = useWasmNode('reverb', {
        wet: mix,
        type,
        decay,
        preDelay,
        damping,
        size,
        patchAsset,
        bypass,
    });
    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
