import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { TremoloProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Tremolo: FC<TremoloProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 4,
    depth = 0.5,
    waveform = 'sine',
    stereo = false,
}) => {
    const { nodeId } = useWasmNode('tremolo', {
        wet: mix,
        rate,
        depth,
        type: waveform,
        stereo,
        bypass,
    });
    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
