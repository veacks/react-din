import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { MatrixMixerProps } from './types';
import { useWasmNode } from '../nodes/useAudioNode';

export const MatrixMixer: FC<MatrixMixerProps> = ({
    children,
    bypass = false,
    inputs = 4,
    outputs = 4,
    matrix,
    smoothingTime = 0.01,
    nodeRef: externalRef,
}) => {
    const { nodeId } = useWasmNode('matrixMixer', {
        rows: inputs,
        cols: outputs,
        gains: matrix,
        smoothingTime,
        bypass,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<GainNode | null>).current = null;
        return () => {
            (externalRef as React.MutableRefObject<GainNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
