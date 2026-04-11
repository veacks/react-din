import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { StereoPannerProps } from './types';
import { useWasmNode } from './useAudioNode';

export const StereoPanner: FC<StereoPannerProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    pan = 0,
}) => {
    const { nodeId } = useWasmNode('panner', {
        pan,
        bypass,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<StereoPannerNode | null>).current = {} as StereoPannerNode;
        return () => {
            (externalRef as React.MutableRefObject<StereoPannerNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
