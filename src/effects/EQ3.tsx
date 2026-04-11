import type { FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { EQ3Props } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const EQ3: FC<EQ3Props> = ({
    children,
    mix = 1,
    bypass = false,
    low = 0,
    mid = 0,
    high = 0,
    lowFrequency = 400,
    highFrequency = 2500,
}) => {
    const { nodeId } = useWasmNode('eq3', {
        wet: mix,
        lowGain: low,
        midGain: mid,
        highGain: high,
        lowFreq: lowFrequency,
        highFreq: highFrequency,
        bypass,
    });
    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
