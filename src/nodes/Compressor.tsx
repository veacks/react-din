import { useEffect, type FC } from 'react';
import type { CompressorProps } from './types';
import { useAudioNode, useAudioParam } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * DynamicsCompressor node component for dynamic range compression.
 *
 * @example
 * ```tsx
 * // Gentle compression
 * <Compressor threshold={-18} ratio={4} attack={0.01} release={0.1}>
 *   <Sampler src="/drums.wav" />
 * </Compressor>
 *
 * // Heavy limiting
 * <Compressor threshold={-6} ratio={20} knee={0} attack={0.001}>
 *   <Sampler src="/master.wav" />
 * </Compressor>
 * ```
 */
export const Compressor: FC<CompressorProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    threshold = -24,
    knee = 30,
    ratio = 12,
    attack = 0.003,
    release = 0.25,
    id,
}) => {
    const { nodeRef, context } = useAudioNode<DynamicsCompressorNode>({
        createNode: (ctx) => ctx.createDynamicsCompressor(),
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<DynamicsCompressorNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply parameters
    useAudioParam(nodeRef.current?.threshold, threshold);
    useAudioParam(nodeRef.current?.knee, knee);
    useAudioParam(nodeRef.current?.ratio, ratio);
    useAudioParam(nodeRef.current?.attack, attack);
    useAudioParam(nodeRef.current?.release, release);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
