import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { NoiseProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Noise: FC<NoiseProps> = ({
    children,
    nodeRef: externalRef,
    type = 'white',
    autoStart = false,
    active,
    bufferSize = 4096,
}) => {
    const { nodeId } = useWasmNode('noise', {
        type,
        autoStart,
        active,
        bufferSize,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<AudioScheduledSourceNode | null>).current = null;
        return () => {
            (externalRef as React.MutableRefObject<AudioScheduledSourceNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
