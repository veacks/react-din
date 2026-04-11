import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { WaveShaperProps } from './types';
import { useWasmNode } from './useAudioNode';

export const WaveShaper: FC<WaveShaperProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    curve,
    oversample = 'none',
}) => {
    const curveValues = curve ? Array.from(curve) : undefined;
    const { nodeId } = useWasmNode('waveShaper', {
        curve: curveValues,
        oversample,
        bypass,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<WaveShaperNode | null>).current = {} as WaveShaperNode;
        return () => {
            (externalRef as React.MutableRefObject<WaveShaperNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
