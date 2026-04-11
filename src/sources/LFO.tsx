import type { FC, ReactNode } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { LFOOutput, LFOWaveform } from '../core/ModulatableValue';
import { useWasmNode } from '../nodes/useAudioNode';
import type { UseLFOOptions } from './useLFO';

export interface LFOProps extends UseLFOOptions {
    children?: ReactNode | ((lfo: LFOOutput | null) => ReactNode);
}

export const LFO: FC<LFOProps> = ({
    children,
    rate = 1,
    depth = 100,
    waveform = 'sine',
    phase = 0,
    autoStart = true,
}) => {
    const { nodeId } = useWasmNode('lfo', {
        frequency: rate,
        depth,
        type: waveform,
        phase,
        autoStart,
    });

    if (typeof children === 'function') {
        return <>{children(null)}</>;
    }

    return (
        <AudioOutProvider node={null} nodeId={nodeId} inputHandle="control">
            {children}
        </AudioOutProvider>
    );
};

export type { LFOWaveform, LFOOutput };
