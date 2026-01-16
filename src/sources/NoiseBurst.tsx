import { useEffect, useRef, type FC } from 'react';
import type { NoiseType } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { useTriggerContext } from '../sequencer/TriggerContext';

/**
 * Props for NoiseBurst component.
 */
export interface NoiseBurstProps {
    children?: React.ReactNode;

    /**
     * Type of noise to generate.
     * @default 'white'
     */
    type?: NoiseType;

    /**
     * Duration of the burst in seconds.
     * @default 0.1
     */
    duration?: number;

    /**
     * Gain/amplitude of the burst (0-1).
     * Multiplied by trigger velocity if triggered via Track.
     * @default 1
     */
    gain?: number;

    /**
     * Attack time in seconds.
     * @default 0.001
     */
    attack?: number;

    /**
     * Release time in seconds.
     * @default 0.05
     */
    release?: number;
}

/**
 * Generate noise buffer of specified type.
 */
function createNoiseBuffer(
    context: AudioContext,
    type: NoiseType,
    sampleCount: number
): AudioBuffer {
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
        case 'white':
            for (let i = 0; i < sampleCount; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            break;

        case 'pink': {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < sampleCount; i++) {
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
            let lastOut = 0;
            for (let i = 0; i < sampleCount; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + 0.02 * white) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }
            break;
        }

        default:
            for (let i = 0; i < sampleCount; i++) {
                data[i] = Math.random() * 2 - 1;
            }
    }

    return buffer;
}

/**
 * NoiseBurst component - one-shot noise triggered by the trigger system.
 *
 * Unlike <Noise> which is continuous, NoiseBurst creates a short burst
 * of noise each time it receives a trigger event from a parent Track.
 *
 * @example
 * ```tsx
 * <Track id="hihat" pattern={[1, 0, 1, 0, 1, 0, 1, 0]}>
 *   <NoiseBurst type="white" duration={0.05} />
 * </Track>
 * ```
 */
export const NoiseBurst: FC<NoiseBurstProps> = ({
    children,
    type = 'white',
    duration = 0.1,
    gain: gainProp = 1,
    attack = 0.001,
    release = 0.05,
}) => {
    const { context, isUnlocked } = useAudio();
    const { outputNode } = useAudioOut();
    const { subscribe } = useTriggerContext();

    // Cache noise buffer (lazy creation)
    const bufferRef = useRef<AudioBuffer | null>(null);
    const bufferTypeRef = useRef<NoiseType>(type);

    // Create or get cached buffer
    const getBuffer = () => {
        if (!context) return null;

        // Recreate if type changed
        if (bufferTypeRef.current !== type) {
            bufferRef.current = null;
            bufferTypeRef.current = type;
        }

        if (!bufferRef.current) {
            // Create buffer large enough for the duration
            const sampleCount = Math.ceil(context.sampleRate * (duration + attack + release));
            bufferRef.current = createNoiseBuffer(context, type, sampleCount);
        }

        return bufferRef.current;
    };

    // Subscribe to trigger events
    useEffect(() => {
        if (!context || !outputNode || !isUnlocked) return;

        const unsubscribe = subscribe((event) => {
            const buffer = getBuffer();
            if (!buffer) return;

            const now = event.time;
            const velocity = event.velocity;

            // Create one-shot source
            const source = context.createBufferSource();
            source.buffer = buffer;

            // Create envelope gain
            const envelope = context.createGain();
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(gainProp * velocity, now + attack);
            envelope.gain.linearRampToValueAtTime(0, now + attack + duration + release);

            // Connect
            source.connect(envelope);
            envelope.connect(outputNode);

            // Schedule start/stop
            source.start(now);
            source.stop(now + attack + duration + release + 0.01);

            // Cleanup on end
            source.onended = () => {
                source.disconnect();
                envelope.disconnect();
            };
        });

        return unsubscribe;
    }, [context, outputNode, isUnlocked, subscribe, type, duration, gainProp, attack, release]);

    return (
        <AudioOutProvider node={outputNode}>
            {children}
        </AudioOutProvider>
    );
};
