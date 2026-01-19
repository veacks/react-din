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
 * // With LFO modulation (tremolo effect)
 * const lfo = useLFO({ rate: 5, depth: 0.3, waveform: 'sine' });
 * <Gain gain={lfo} gainBase={0.7}>
 *   <Osc frequency={440} />
 * </Gain>
 * ```
 */
export const Gain: FC<GainProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    gain = 1,
    gainBase,
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

    // Apply gain parameter (with LFO support)
    useAudioParam(nodeRef.current?.gain, gain, gainBase ?? 1, rampTo, rampType);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};

