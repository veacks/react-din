import { useEffect, type FC } from 'react';
import type { DelayProps } from './types';
import { useAudioNode, useAudioParam } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * Delay node component for audio delay effects.
 *
 * @example
 * ```tsx
 * // Simple delay
 * <Delay delayTime={0.5}>
 *   <Sampler src="/voice.wav" />
 * </Delay>
 *
 * // Feedback delay (using Gain for feedback loop)
 * <Gain gain={0.6}>
 *   <Delay delayTime={0.375} maxDelayTime={2}>
 *     <Sampler src="/guitar.wav" />
 *   </Delay>
 * </Gain>
 * ```
 */
export const Delay: FC<DelayProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    delayTime = 0,
    maxDelayTime = 1,
    id,
}) => {
    const { nodeRef, context } = useAudioNode<DelayNode>({
        createNode: (ctx) => ctx.createDelay(maxDelayTime),
        bypass,
        deps: [maxDelayTime],
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<DelayNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply delay time
    useAudioParam(nodeRef.current?.delayTime, delayTime);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
