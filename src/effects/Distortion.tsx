import { useEffect, useRef, type FC } from 'react';
import type { DistortionProps, DistortionType } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';

/**
 * Generate a distortion curve based on the type.
 */
function createDistortionCurve(
    type: DistortionType,
    drive: number,
    samples = 256
): Float32Array {
    const curve = new Float32Array(samples);
    const k = drive * 100;

    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;

        switch (type) {
            case 'soft':
                // Soft clipping (tanh)
                curve[i] = Math.tanh(x * (1 + k / 10));
                break;

            case 'hard':
                // Hard clipping
                curve[i] = Math.max(-1, Math.min(1, x * (1 + k / 5)));
                break;

            case 'fuzz':
                // Fuzz (asymmetric clipping)
                if (x >= 0) {
                    curve[i] = Math.min(1, x * (1 + k / 3));
                } else {
                    curve[i] = Math.max(-1, x * (1 + k / 2) + Math.sin(x * k) * 0.1);
                }
                break;

            case 'bitcrush':
                // Bit reduction effect
                const bits = Math.max(2, 16 - Math.floor(k / 10));
                const steps = Math.pow(2, bits);
                curve[i] = Math.round(x * steps) / steps;
                break;

            case 'saturate':
                // Soft saturation
                const amt = 1 + k / 20;
                curve[i] = (3 + amt) * x * 20 / (Math.PI + amt * Math.abs(x * 20));
                break;

            default:
                curve[i] = x;
        }
    }

    return curve;
}

/**
 * Distortion effect component.
 *
 * Provides various distortion algorithms from soft saturation
 * to hard clipping and bitcrushing.
 *
 * @example
 * ```tsx
 * // Soft overdrive
 * <Distortion type="soft" drive={0.5} mix={0.7}>
 *   <Osc type="sine" frequency={440} />
 * </Distortion>
 *
 * // Heavy fuzz
 * <Distortion type="fuzz" drive={0.9} tone={2000}>
 *   <Sampler src="/guitar.wav" />
 * </Distortion>
 * ```
 */
export const Distortion: FC<DistortionProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    type = 'soft',
    drive = 0.5,
    level = 0.5,
    oversample = '2x',
    tone = 4000,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();

    const inputGainRef = useRef<GainNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        // Create nodes
        const inputGain = context.createGain();
        const driveGain = context.createGain();
        const waveshaper = context.createWaveShaper();
        const toneFilter = context.createBiquadFilter();
        const outputGain = context.createGain();
        const dryGain = context.createGain();
        const wetGain = context.createGain();

        // Configure
        driveGain.gain.value = 1 + drive * 5; // Pre-gain for more drive
        waveshaper.curve = createDistortionCurve(type, drive) as Float32Array<ArrayBuffer>;
        waveshaper.oversample = oversample;
        toneFilter.type = 'lowpass';
        toneFilter.frequency.value = tone;
        outputGain.gain.value = level;
        dryGain.gain.value = 1 - mix;
        wetGain.gain.value = mix;

        // Connect
        inputGain.connect(dryGain);
        dryGain.connect(outputNode);

        inputGain.connect(driveGain);
        driveGain.connect(waveshaper);
        waveshaper.connect(toneFilter);
        toneFilter.connect(outputGain);
        outputGain.connect(wetGain);
        wetGain.connect(outputNode);

        inputGainRef.current = inputGain;

        return () => {
            inputGain.disconnect();
            driveGain.disconnect();
            waveshaper.disconnect();
            toneFilter.disconnect();
            outputGain.disconnect();
            dryGain.disconnect();
            wetGain.disconnect();
        };
    }, [context, outputNode, type, drive, level, oversample, tone, mix]);

    return (
        <AudioOutProvider node={bypass ? outputNode : inputGainRef.current}>
            {children}
        </AudioOutProvider>
    );
};
