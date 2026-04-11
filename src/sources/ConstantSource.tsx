import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { ConstantSourceProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const ConstantSource: FC<ConstantSourceProps> = ({
    children,
    nodeRef: externalRef,
    offset = 1,
    autoStart = false,
    active,
}) => {
    const { nodeId } = useWasmNode('constant', {
        offset,
        autoStart,
        active,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<ConstantSourceNode | null>).current = null;
        return () => {
            (externalRef as React.MutableRefObject<ConstantSourceNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
