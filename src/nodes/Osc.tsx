import { useEffect, useRef, type FC } from 'react';
import type { OscProps } from './types';
import { useAudioNode, useAudioParam } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * Oscillator node component for generating periodic waveforms.
 *
 * Supports standard waveforms (sine, square, sawtooth, triangle)
 * and custom periodic waves.
 *
 * @example
 * ```tsx
 * // Simple sine wave
 * <Osc type="sine" frequency={440} autoStart />
 *
 * // Detuned sawtooth
 * <Osc type="sawtooth" frequency={220} detune={-5} autoStart />
 * ```
 */
export const Osc: FC<OscProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    type = 'sine',
    frequency = 440,
    detune = 0,
    autoStart = false,
    periodicWave,
    id,
}) => {
    const startedRef = useRef(false);

    const { nodeRef, context } = useAudioNode<OscillatorNode>({
        createNode: (ctx) => ctx.createOscillator(),
        bypass,
        // Create a new oscillator when type changes (oscillators are single-use)
        deps: [type],
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<OscillatorNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply oscillator type
    useEffect(() => {
        if (nodeRef.current && !periodicWave) {
            nodeRef.current.type = type;
        }
    }, [type, periodicWave]);

    // Apply periodic wave
    useEffect(() => {
        if (nodeRef.current && periodicWave) {
            nodeRef.current.setPeriodicWave(periodicWave);
        }
    }, [periodicWave]);

    // Apply parameters
    useAudioParam(nodeRef.current?.frequency, frequency);
    useAudioParam(nodeRef.current?.detune, detune);

    // Auto-start
    useEffect(() => {
        if (nodeRef.current && autoStart && !startedRef.current) {
            try {
                nodeRef.current.start();
                startedRef.current = true;
            } catch {
                // Already started
            }
        }
    }, [autoStart, nodeRef.current]);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
