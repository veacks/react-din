import { useEffect, useRef, useState, type FC } from 'react';
import type { ChorusProps } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { createChorusGraph, updateChorusGraph, type ChorusGraph } from '@din/vanilla';

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
    const graphRef = useRef<ChorusGraph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createChorusGraph(context, stereo);
        graph.output.connect(outputNode);
        graph.primaryLfo.start();
        graph.secondaryLfo?.start();
        graphRef.current = graph;
        setInputNode(bypass ? outputNode : graph.input);

        return () => {
            graph.dispose();
            graphRef.current = null;
            setInputNode(null);
        };
    }, [context, outputNode, stereo]);

    useEffect(() => {
        if (!graphRef.current) return;
        updateChorusGraph(
            graphRef.current,
            {
                rate,
                depth,
                feedback,
                delay,
                mix,
                bypass,
                stereo,
            },
            context?.currentTime
        );
    }, [context, rate, depth, feedback, delay, mix, bypass, stereo]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
