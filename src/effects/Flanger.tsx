import { useEffect, useRef, useState, type FC } from 'react';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import type { FlangerProps } from './types';
import { createFlangerGraph, updateFlangerGraph, type FlangerGraph } from '@din/vanilla';

export const Flanger: FC<FlangerProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 0.2,
    depth = 2,
    feedback = 0.5,
    delay = 1,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();
    const graphRef = useRef<FlangerGraph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createFlangerGraph(context);
        graph.output.connect(outputNode);
        graph.lfo.start();
        graphRef.current = graph;
        setInputNode(bypass ? outputNode : graph.input);

        return () => {
            graph.dispose();
            graphRef.current = null;
            setInputNode(null);
        };
    }, [context, outputNode]);

    useEffect(() => {
        if (!graphRef.current) return;
        updateFlangerGraph(
            graphRef.current,
            {
                rate,
                depth,
                feedback,
                delay,
                mix,
                bypass,
            },
            context?.currentTime
        );
    }, [context, mix, bypass, rate, depth, feedback, delay]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
