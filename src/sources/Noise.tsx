import { useEffect, useRef, type FC } from 'react';
import type { NoiseProps, NoiseType } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { createNoiseBuffer } from '@din/vanilla';

/**
 * Noise generator component.
 *
 * Generates various types of noise (white, pink, brown, blue, violet).
 *
 * @example
 * ```tsx
 * // White noise
 * <Noise type="white" autoStart />
 *
 * // Pink noise (more natural sounding)
 * <Gain gain={0.1}>
 *   <Noise type="pink" autoStart />
 * </Gain>
 * ```
 */
export const Noise: FC<NoiseProps> = ({
    children,
    nodeRef: externalRef,
    type = 'white',
    autoStart = false,
    active,
    bufferSize = 4096,
}) => {
    const { context, isUnlocked } = useAudio();
    const { outputNode } = useAudioOut();

    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const isPlayingRef = useRef(false);

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<AudioScheduledSourceNode | null>).current = sourceRef.current;
        }
    }, [externalRef, sourceRef.current]);

    // Play function
    const play = () => {
        if (!context || !outputNode || isPlayingRef.current) return;

        const sampleCount = Math.ceil(bufferSize * context.sampleRate / 44100);
        const buffer = createNoiseBuffer(context, type as NoiseType, sampleCount);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(outputNode);
        source.start();

        sourceRef.current = source;
        isPlayingRef.current = true;

        if (externalRef) {
            (externalRef as React.MutableRefObject<AudioScheduledSourceNode | null>).current = source;
        }
    };

    // Stop function
    const stop = () => {
        if (sourceRef.current && isPlayingRef.current) {
            try {
                sourceRef.current.stop();
            } catch {
                // Already stopped
            }
            isPlayingRef.current = false;
            sourceRef.current = null;
        }
    };

    // Auto-start
    useEffect(() => {
        if (autoStart && isUnlocked) {
            play();
        }
    }, [autoStart, isUnlocked, type]);

    // Active control
    useEffect(() => {
        if (active !== undefined) {
            if (active && isUnlocked) {
                play();
            } else if (!active) {
                stop();
            }
        }
    }, [active, isUnlocked]);

    // Cleanup
    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    return (
        <AudioOutProvider node={outputNode}>
            {children}
        </AudioOutProvider>
    );
};
