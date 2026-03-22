import { useEffect, useRef, useState, type FC } from 'react';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import type { PhaserProps } from './types';
import { clampPhaserStageCount, createPhaserGraph, updatePhaserGraph, type PhaserGraph } from '@din/vanilla';

export const Phaser: FC<PhaserProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 0.5,
    depth = 0.5,
    feedback = 0.7,
    baseFrequency = 1000,
    stages = 4,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();
    const graphRef = useRef<PhaserGraph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createPhaserGraph(context, clampPhaserStageCount(stages));
        graph.output.connect(outputNode);
        graph.lfo.start();
        graphRef.current = graph;
        setInputNode(bypass ? outputNode : graph.input);

        return () => {
            graph.dispose();
            graphRef.current = null;
            setInputNode(null);
        };
    }, [context, outputNode, stages]);

    useEffect(() => {
        if (!graphRef.current) return;
        updatePhaserGraph(
            graphRef.current,
            {
                rate,
                depth,
                feedback,
                baseFrequency,
                mix,
                bypass,
            },
            context?.currentTime
        );
    }, [context, mix, bypass, rate, depth, feedback, baseFrequency]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
