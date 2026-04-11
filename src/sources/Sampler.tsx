import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { SamplerProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const Sampler: FC<SamplerProps> = ({
    children,
    nodeRef: externalRef,
    src,
    autoStart = false,
    active,
    loop = false,
    loopStart = 0,
    loopEnd,
    playbackRate = 1,
    detune = 0,
    offset = 0,
    duration,
}) => {
    const patchAsset = typeof src === 'string' ? src : undefined;
    const { nodeId } = useWasmNode('sampler', {
        patchAsset,
        loop,
        loopStart,
        loopEnd,
        playbackRate,
        detune,
        offset,
        duration,
        autoStart,
        active,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<AudioBufferSourceNode | null>).current = null;
        return () => {
            (externalRef as React.MutableRefObject<AudioBufferSourceNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
