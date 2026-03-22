import { useEffect, useRef, useState, type FC } from 'react';
import type { ReverbProps } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { applyReverbImpulse, createReverbGraph, updateReverbMix, type ReverbGraph } from '@din/vanilla';

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
    const graphRef = useRef<ReverbGraph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    // Create effect chain
    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createReverbGraph(context, mix);
        graph.output.connect(outputNode);
        graphRef.current = graph;
        setInputNode(bypass ? outputNode : graph.input);

        return () => {
            graph.dispose();
            graphRef.current = null;
            setInputNode(null);
        };
    }, [context, outputNode]);

    // Generate or load impulse response
    useEffect(() => {
        if (!context || !graphRef.current) return;

        let active = true;
        void applyReverbImpulse(graphRef.current, context, impulse, decay, preDelay, damping)
            .catch(console.error)
            .then(() => {
                if (!active) return;
            });

        return () => {
            active = false;
        };
    }, [context, impulse, decay, preDelay, damping]);

    // Update mix
    useEffect(() => {
        if (!graphRef.current) return;
        updateReverbMix(graphRef.current, mix, bypass, context?.currentTime);
    }, [context, mix, bypass]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
