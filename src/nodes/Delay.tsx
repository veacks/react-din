import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { DelayProps } from './types';
import { useWasmNode } from './useAudioNode';

export const Delay: FC<DelayProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    delayTime = 0,
    maxDelayTime = 1,
}) => {
    const { nodeId } = useWasmNode('delay', {
        delayTime,
        maxDelayTime,
        bypass,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<DelayNode | null>).current = {} as DelayNode;
        return () => {
            (externalRef as React.MutableRefObject<DelayNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
