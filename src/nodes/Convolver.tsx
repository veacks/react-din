import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { ConvolverProps } from './types';
import { useWasmNode } from './useAudioNode';

export const Convolver: FC<ConvolverProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    impulse,
    normalize = true,
}) => {
    const patchAsset = typeof impulse === 'string' ? impulse : undefined;
    const { nodeId } = useWasmNode('convolver', {
        patchAsset,
        normalize,
        bypass,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<ConvolverNode | null>).current = {} as ConvolverNode;
        return () => {
            (externalRef as React.MutableRefObject<ConvolverNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
