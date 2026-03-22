import { useEffect, useRef, useState, type FC } from 'react';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import type { EQ3Props } from './types';
import { createEq3Graph, updateEq3Graph, type Eq3Graph } from '@din/vanilla';

export const EQ3: FC<EQ3Props> = ({
    children,
    mix = 1,
    bypass = false,
    low = 0,
    mid = 0,
    high = 0,
    lowFrequency = 400,
    highFrequency = 2500,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();
    const graphRef = useRef<Eq3Graph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createEq3Graph(context);
        graph.output.connect(outputNode);
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
        updateEq3Graph(
            graphRef.current,
            {
                low,
                mid,
                high,
                lowFrequency,
                highFrequency,
                mix,
                bypass,
            },
            context?.currentTime
        );
    }, [context, low, mid, high, lowFrequency, highFrequency, mix, bypass]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
