import { useEffect, useRef, useState, type FC } from 'react';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import type { TremoloProps } from './types';
import { createTremoloGraph, updateTremoloGraph, type TremoloGraph } from '@din/vanilla';

export const Tremolo: FC<TremoloProps> = ({
    children,
    mix = 0.5,
    bypass = false,
    rate = 4,
    depth = 0.5,
    waveform = 'sine',
    stereo = false,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();
    const graphRef = useRef<TremoloGraph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createTremoloGraph(context, stereo);
        graph.output.connect(outputNode);
        graph.lfo.start();
        graph.stereoLfo?.start();
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
        updateTremoloGraph(
            graphRef.current,
            {
                rate,
                depth,
                waveform,
                mix,
                bypass,
            },
            context?.currentTime
        );
    }, [context, mix, bypass, rate, depth, waveform]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
