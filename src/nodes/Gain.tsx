import { useEffect, type FC } from 'react';
import type { GainProps } from './types';
import { useAudioNode, useAudioParam } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * Gain node component for volume control.
 *
 * Wraps the WebAudio GainNode, providing declarative control
 * over audio volume in the graph.
 *
 * @example
 * ```tsx
 * // Simple volume control
 * <Gain gain={0.5}>
 *   <Osc frequency={440} />
 * </Gain>
 *
 * // With automation
 * <Gain gain={0.8} rampTo={0.5} rampType="exponential">
 *   <Sampler src="/drum.wav" />
 * </Gain>
 * ```
 */
export const Gain: FC<GainProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    gain = 1,
    rampTo,
    rampType = 'exponential',
    id,
}) => {
    const { nodeRef, context } = useAudioNode<GainNode>({
        createNode: (ctx) => ctx.createGain(),
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<GainNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply gain parameter
    useAudioParam(nodeRef.current?.gain, gain, rampTo, rampType);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
