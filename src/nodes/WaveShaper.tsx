import { useEffect, type FC } from 'react';
import type { WaveShaperProps } from './types';
import { useAudioNode } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * WaveShaper node component for distortion and waveshaping.
 *
 * @example
 * ```tsx
 * // Soft clipping distortion
 * const softClipCurve = new Float32Array(256);
 * for (let i = 0; i < 256; i++) {
 *   const x = (i / 128) - 1;
 *   softClipCurve[i] = Math.tanh(x * 2);
 * }
 *
 * <WaveShaper curve={softClipCurve} oversample="4x">
 *   <Osc type="sawtooth" frequency={220} />
 * </WaveShaper>
 * ```
 */
export const WaveShaper: FC<WaveShaperProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    curve,
    oversample = 'none',
    id,
}) => {
    const { nodeRef, context } = useAudioNode<WaveShaperNode>({
        createNode: (ctx) => ctx.createWaveShaper(),
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<WaveShaperNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply curve and oversample
    useEffect(() => {
        if (nodeRef.current) {
            nodeRef.current.curve = (curve ?? null) as Float32Array<ArrayBuffer> | null;
            nodeRef.current.oversample = oversample;
        }
    }, [curve, oversample]);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
