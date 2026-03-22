import { useEffect, useRef, type FC } from 'react';
import type { NoiseType } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { useTriggerContext } from '../sequencer/TriggerContext';
import { dinCoreFillNoiseSamples } from '../internal/dinCore';

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
            const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
            dinCoreFillNoiseSamples(type as NoiseType, sampleCount, buffer.getChannelData(0));
            bufferRef.current = buffer;
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
