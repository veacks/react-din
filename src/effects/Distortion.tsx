import { useEffect, useRef, type FC } from 'react';
import type { DistortionProps, DistortionType } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { dinCoreCreateDistortionCurve } from '../internal/dinCore';

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
        waveshaper.curve = dinCoreCreateDistortionCurve(type as DistortionType, drive) as Float32Array<ArrayBuffer>;
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
