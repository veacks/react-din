import { useEffect, type FC } from 'react';
import type { FilterProps } from './types';
import { useAudioNode, useAudioParam } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * BiquadFilter node component for frequency-based audio filtering.
 *
 * Supports all standard filter types: lowpass, highpass, bandpass,
 * lowshelf, highshelf, peaking, notch, and allpass.
 *
 * @example
 * ```tsx
 * // Low-pass filter at 1000Hz
 * <Filter type="lowpass" frequency={1000} Q={1}>
 *   <Noise type="white" />
 * </Filter>
 *
 * // Resonant high-pass
 * <Filter type="highpass" frequency={200} Q={10}>
 *   <Osc type="sawtooth" frequency={110} />
 * </Filter>
 * ```
 */
export const Filter: FC<FilterProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    type = 'lowpass',
    frequency = 350,
    Q = 1,
    gain = 0,
    detune = 0,
    id,
}) => {
    const { nodeRef, context } = useAudioNode<BiquadFilterNode>({
        createNode: (ctx) => ctx.createBiquadFilter(),
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<BiquadFilterNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply filter type
    useEffect(() => {
        if (nodeRef.current) {
            nodeRef.current.type = type;
        }
    }, [type]);

    // Apply parameters
    useAudioParam(nodeRef.current?.frequency, frequency);
    useAudioParam(nodeRef.current?.Q, Q);
    useAudioParam(nodeRef.current?.gain, gain);
    useAudioParam(nodeRef.current?.detune, detune);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
