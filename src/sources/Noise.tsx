import { useEffect, useRef, type FC } from 'react';
import type { NoiseProps, NoiseType } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';

/**
 * Generate noise buffer of specified type.
 */
function createNoiseBuffer(
    context: AudioContext,
    type: NoiseType,
    bufferSize: number
): AudioBuffer {
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
        case 'white':
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            break;

        case 'pink': {
            // Pink noise using Paul Kellet's algorithm
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
            break;
        }

        case 'brown': {
            // Brown/red noise (-6dB/octave)
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + 0.02 * white) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for volume
            }
            break;
        }

        case 'blue': {
            // Blue noise (+3dB/octave) - differentiated white noise
            let lastSample = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = white - lastSample;
                lastSample = white;
            }
            break;
        }

        case 'violet': {
            // Violet noise (+6dB/octave) - differentiated twice
            let last1 = 0;
            let last2 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                const diff1 = white - last1;
                data[i] = diff1 - last2;
                last2 = diff1;
                last1 = white;
            }
            break;
        }
    }

    return buffer;
}

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

        const buffer = createNoiseBuffer(context, type, bufferSize * context.sampleRate / 44100);
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
