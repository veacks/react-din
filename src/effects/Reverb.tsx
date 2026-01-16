import { useEffect, useRef, type FC } from 'react';
import type { ReverbProps } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';

/**
 * Generate an impulse response buffer for algorithmic reverb.
 */
function generateImpulseResponse(
    context: AudioContext,
    decay: number,
    preDelay: number,
    damping: number
): AudioBuffer {
    const sampleRate = context.sampleRate;
    const length = sampleRate * (decay + preDelay);
    const buffer = context.createBuffer(2, length, sampleRate);

    const preDelaySamples = Math.floor(preDelay * sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);

        for (let i = 0; i < length; i++) {
            if (i < preDelaySamples) {
                data[i] = 0;
            } else {
                const t = (i - preDelaySamples) / sampleRate;
                const envelope = Math.exp(-t / (decay * 0.5));

                // Add some early reflections
                let sample = (Math.random() * 2 - 1) * envelope;

                // Apply damping (simple low-pass effect)
                if (i > preDelaySamples && damping > 0) {
                    sample = sample * (1 - damping) + data[i - 1] * damping * 0.5;
                }

                data[i] = sample;
            }
        }
    }

    return buffer;
}

/**
 * Reverb effect component.
 *
 * Provides algorithmic or convolution-based reverb.
 *
 * @example
 * ```tsx
 * // Algorithmic reverb
 * <Reverb decay={2} mix={0.3}>
 *   <Sampler src="/guitar.wav" />
 * </Reverb>
 *
 * // Convolution reverb with custom IR
 * <Reverb impulse="/impulses/hall.wav" mix={0.5}>
 *   <Sampler src="/vocals.wav" />
 * </Reverb>
 * ```
 */
export const Reverb: FC<ReverbProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    decay = 2,
    preDelay = 0.01,
    damping = 0.5,
    impulse,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();

    const convolverRef = useRef<ConvolverNode | null>(null);
    const dryGainRef = useRef<GainNode | null>(null);
    const wetGainRef = useRef<GainNode | null>(null);
    const inputGainRef = useRef<GainNode | null>(null);

    // Create effect chain
    useEffect(() => {
        if (!context || !outputNode) return;

        // Create nodes
        const inputGain = context.createGain();
        const convolver = context.createConvolver();
        const dryGain = context.createGain();
        const wetGain = context.createGain();

        // Set mix
        dryGain.gain.value = 1 - mix;
        wetGain.gain.value = mix;

        // Connect
        // input -> dry -> output
        // input -> convolver -> wet -> output
        inputGain.connect(dryGain);
        dryGain.connect(outputNode);

        inputGain.connect(convolver);
        convolver.connect(wetGain);
        wetGain.connect(outputNode);

        inputGainRef.current = inputGain;
        convolverRef.current = convolver;
        dryGainRef.current = dryGain;
        wetGainRef.current = wetGain;

        return () => {
            inputGain.disconnect();
            convolver.disconnect();
            dryGain.disconnect();
            wetGain.disconnect();
        };
    }, [context, outputNode]);

    // Generate or load impulse response
    useEffect(() => {
        if (!context || !convolverRef.current) return;

        if (typeof impulse === 'string') {
            // Load from URL
            fetch(impulse)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
                .then((buffer) => {
                    if (convolverRef.current) {
                        convolverRef.current.buffer = buffer;
                    }
                })
                .catch(console.error);
        } else if (impulse instanceof AudioBuffer) {
            convolverRef.current.buffer = impulse;
        } else {
            // Generate algorithmic IR
            const buffer = generateImpulseResponse(context, decay, preDelay, damping);
            convolverRef.current.buffer = buffer;
        }
    }, [context, impulse, decay, preDelay, damping]);

    // Update mix
    useEffect(() => {
        if (dryGainRef.current && wetGainRef.current) {
            dryGainRef.current.gain.value = bypass ? 1 : 1 - mix;
            wetGainRef.current.gain.value = bypass ? 0 : mix;
        }
    }, [mix, bypass]);

    return (
        <AudioOutProvider node={bypass ? outputNode : inputGainRef.current}>
            {children}
        </AudioOutProvider>
    );
};
