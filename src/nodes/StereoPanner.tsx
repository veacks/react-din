import { useEffect, type FC } from 'react';
import type { StereoPannerProps } from './types';
import { useAudioNode, useAudioParam } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * StereoPanner node component for simple left/right panning.
 *
 * @example
 * ```tsx
 * // Pan to the left
 * <StereoPanner pan={-0.7}>
 *   <Sampler src="/guitar.wav" />
 * </StereoPanner>
 *
 * // Center (default)
 * <StereoPanner pan={0}>
 *   <Sampler src="/vocals.wav" />
 * </StereoPanner>
 * ```
 */
export const StereoPanner: FC<StereoPannerProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    pan = 0,
    id,
}) => {
    const { nodeRef, context } = useAudioNode<StereoPannerNode>({
        createNode: (ctx) => ctx.createStereoPanner(),
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<StereoPannerNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply pan parameter
    useAudioParam(nodeRef.current?.pan, pan);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
