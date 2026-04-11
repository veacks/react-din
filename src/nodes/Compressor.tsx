import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { CompressorProps } from './types';
import { useWasmNode } from './useAudioNode';

export const Compressor: FC<CompressorProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    threshold = -24,
    knee = 30,
    ratio = 12,
    attack = 0.003,
    release = 0.25,
    sidechainBusId,
    sidechainStrength = 0.7,
}) => {
    const { nodeId } = useWasmNode('compressor', {
        threshold,
        knee,
        ratio,
        attack,
        release,
        sidechainBusId,
        sidechainStrength,
        bypass,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<DynamicsCompressorNode | null>).current = {} as DynamicsCompressorNode;
        return () => {
            (externalRef as React.MutableRefObject<DynamicsCompressorNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
