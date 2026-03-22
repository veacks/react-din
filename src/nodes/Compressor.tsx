import { useEffect, useRef, useState, type FC } from 'react';
import type { CompressorProps } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { getOrCreateBusNode } from '../routing/busRegistry';
import { createCompressorGraph, updateCompressorGraph, type CompressorGraph } from '@din/vanilla';

/**
 * DynamicsCompressor node component for dynamic range compression.
 *
 * @example
 * ```tsx
 * // Gentle compression
 * <Compressor threshold={-18} ratio={4} attack={0.01} release={0.1}>
 *   <Sampler src="/drums.wav" />
 * </Compressor>
 *
 * // Heavy limiting
 * <Compressor threshold={-6} ratio={20} knee={0} attack={0.001}>
 *   <Sampler src="/master.wav" />
 * </Compressor>
 * ```
 */
export const Compressor: FC<CompressorProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    threshold = -24,
    knee = 30,
    ratio = 12,
    attack = 0.003,
    release = 0.25,
    sidechainBusId,
    sidechainStrength = 0.7,
    id,
}) => {
    const { context } = useAudio();
    const { outputNode } = useAudioOut();
    const graphRef = useRef<CompressorGraph | null>(null);
    const [inputNode, setInputNode] = useState<AudioNode | null>(null);

    useEffect(() => {
        if (!context || !outputNode) return;

        const graph = createCompressorGraph(context);
        graph.output.connect(outputNode);
        graphRef.current = graph;
        setInputNode(bypass ? outputNode : graph.input);

        if (externalRef) {
            (externalRef as React.MutableRefObject<DynamicsCompressorNode | null>).current = graph.compressor;
        }

        return () => {
            graph.dispose();
            graphRef.current = null;
            setInputNode(null);
            if (externalRef) {
                (externalRef as React.MutableRefObject<DynamicsCompressorNode | null>).current = null;
            }
        };
    }, [context, outputNode, externalRef]);

    useEffect(() => {
        if (!graphRef.current) return;
        updateCompressorGraph(
            graphRef.current,
            {
                threshold,
                knee,
                ratio,
                attack,
                release,
            },
            context?.currentTime
        );
    }, [context, threshold, knee, ratio, attack, release]);

    useEffect(() => {
        if (!context || !graphRef.current) return;
        if (!sidechainBusId) {
            graphRef.current.duckGain.gain.setTargetAtTime(1, context.currentTime, 0.02);
            return;
        }

        const busNode = getOrCreateBusNode(context, sidechainBusId);
        const analyser = graphRef.current.sidechainAnalyser;
        const waveform = new Float32Array(analyser.fftSize);

        busNode.connect(analyser);

        const intervalId = window.setInterval(() => {
            if (!graphRef.current) return;
            analyser.getFloatTimeDomainData(waveform);
            let sumSquares = 0;
            for (let i = 0; i < waveform.length; i++) {
                const sample = waveform[i];
                sumSquares += sample * sample;
            }

            const rms = Math.sqrt(sumSquares / waveform.length);
            const levelDb = 20 * Math.log10(Math.max(rms, 0.0001));
            const overThreshold = Math.max(0, levelDb - threshold);
            const normalized = Math.min(1, overThreshold / 24);
            const ducking = normalized * Math.max(0, Math.min(1, sidechainStrength));
            const targetGain = Math.max(0.05, 1 - ducking);
            graphRef.current.duckGain.gain.setTargetAtTime(
                targetGain,
                context.currentTime,
                Math.max(0.005, attack || 0.005)
            );
        }, 20);

        return () => {
            window.clearInterval(intervalId);
            try { busNode.disconnect(analyser); } catch { /* noop */ }
            if (graphRef.current) {
                graphRef.current.duckGain.gain.setTargetAtTime(1, context.currentTime, Math.max(0.005, release || 0.005));
            }
        };
    }, [context, sidechainBusId, sidechainStrength, threshold, attack, release]);

    useEffect(() => {
        setInputNode(bypass ? outputNode : (graphRef.current?.input ?? null));
    }, [bypass, outputNode]);

    return (
        <AudioOutProvider node={inputNode}>
            {children}
        </AudioOutProvider>
    );
};
