import { useEffect, useRef, type FC } from 'react';
import type { ChorusProps } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';

/**
 * Chorus effect component.
 *
 * Creates a rich, modulated sound by mixing the original signal
 * with delayed, pitch-modulated copies.
 *
 * @example
 * ```tsx
 * <Chorus rate={1.5} depth={3.5} mix={0.5}>
 *   <Osc type="sawtooth" frequency={220} />
 * </Chorus>
 * ```
 */
export const Chorus: FC<ChorusProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 1.5,
    depth = 3.5,
    feedback = 0.2,
    delay = 20,
    stereo = true,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();

    const inputGainRef = useRef<GainNode | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        // Create nodes
        const inputGain = context.createGain();
        const dryGain = context.createGain();
        const wetGain = context.createGain();

        // Create delay lines for chorus effect
        const delayL = context.createDelay(0.1);
        const delayR = context.createDelay(0.1);

        // LFOs for modulation
        const lfoL = context.createOscillator();
        const lfoR = context.createOscillator();
        const lfoGainL = context.createGain();
        const lfoGainR = context.createGain();

        // Feedback
        const feedbackGainL = context.createGain();
        const feedbackGainR = context.createGain();

        // Channel splitter/merger for stereo
        const splitter = context.createChannelSplitter(2);
        const merger = context.createChannelMerger(2);

        // Configure LFOs
        lfoL.type = 'sine';
        lfoL.frequency.value = rate;
        lfoR.type = 'sine';
        lfoR.frequency.value = rate;

        // LFO depth (in seconds)
        const depthSeconds = depth / 1000;
        lfoGainL.gain.value = depthSeconds;
        lfoGainR.gain.value = depthSeconds;

        // Base delay time (in seconds)
        const delaySeconds = delay / 1000;
        delayL.delayTime.value = delaySeconds;
        delayR.delayTime.value = delaySeconds;

        // Feedback amount
        feedbackGainL.gain.value = feedback;
        feedbackGainR.gain.value = feedback;

        // Mix levels
        dryGain.gain.value = 1 - mix;
        wetGain.gain.value = mix;

        // Connect LFOs to delay time modulation
        lfoL.connect(lfoGainL);
        lfoGainL.connect(delayL.delayTime);
        lfoR.connect(lfoGainR);
        lfoGainR.connect(delayR.delayTime);

        // Phase offset for stereo
        if (stereo) {
            // Start R oscillator with phase offset via delay
            lfoR.frequency.value = rate * 1.01; // Slight detune for movement
        }

        // Connect signal path
        inputGain.connect(dryGain);
        dryGain.connect(outputNode);

        if (stereo) {
            inputGain.connect(splitter);
            splitter.connect(delayL, 0);
            splitter.connect(delayR, 1);

            delayL.connect(feedbackGainL);
            feedbackGainL.connect(delayL);
            delayL.connect(merger, 0, 0);

            delayR.connect(feedbackGainR);
            feedbackGainR.connect(delayR);
            delayR.connect(merger, 0, 1);

            merger.connect(wetGain);
        } else {
            inputGain.connect(delayL);
            delayL.connect(feedbackGainL);
            feedbackGainL.connect(delayL);
            delayL.connect(wetGain);
        }

        wetGain.connect(outputNode);

        // Start LFOs
        lfoL.start();
        lfoR.start();

        inputGainRef.current = inputGain;

        return () => {
            lfoL.stop();
            lfoR.stop();
            inputGain.disconnect();
            dryGain.disconnect();
            wetGain.disconnect();
            delayL.disconnect();
            delayR.disconnect();
        };
    }, [context, outputNode, rate, depth, feedback, delay, mix, stereo]);

    return (
        <AudioOutProvider node={bypass ? outputNode : inputGainRef.current}>
            {children}
        </AudioOutProvider>
    );
};
