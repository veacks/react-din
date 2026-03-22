import { useEffect, useRef, useState, type FC } from 'react';
import type { DistortionProps, DistortionType } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { createDistortionGraph, updateDistortionGraph, type DistortionGraph } from '@din/vanilla';

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
    const graphRef = useRef<DistortionGraph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createDistortionGraph(context);
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
        updateDistortionGraph(
            graphRef.current,
            {
                type: type as DistortionType,
                drive,
                level,
                mix,
                tone,
                oversample,
                bypass,
            },
            context?.currentTime
        );
    }, [context, type, drive, level, oversample, tone, mix, bypass]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
