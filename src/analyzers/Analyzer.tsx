import { useEffect, useRef, type FC } from 'react';
import type { AnalyzerProps, AnalyzerData } from './types';
import { useAudioNode } from '../nodes/useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * Analyzer node component for audio analysis.
 *
 * Can be placed anywhere in the audio graph to analyze that point.
 * Supports both global (master) and local (instrument) analysis.
 *
 * @example
 * ```tsx
 * // Global analyzer on master
 * <AudioProvider>
 *   <Analyzer onAnalyze={handleAnalysis} />
 *   <MyAudioGraph />
 * </AudioProvider>
 *
 * // Local analyzer on specific instrument
 * <Gain>
 *   <Analyzer fftSize={2048} onAnalyze={handleInstrumentAnalysis} />
 *   <Synth />
 * </Gain>
 * ```
 */
export const Analyzer: FC<AnalyzerProps> = ({
    children,
    nodeRef: externalRef,
    fftSize = 2048,
    smoothingTimeConstant = 0.8,
    minDecibels = -100,
    maxDecibels = -30,
    onAnalyze,
    updateRate = 60,
    autoUpdate = true,
}) => {
    const { nodeRef, context } = useAudioNode<AnalyserNode>({
        createNode: (ctx) => ctx.createAnalyser(),
    });

    const frequencyDataRef = useRef<Uint8Array | null>(null);
    const timeDomainDataRef = useRef<Uint8Array | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<AnalyserNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Configure analyzer
    useEffect(() => {
        if (!nodeRef.current) return;

        nodeRef.current.fftSize = fftSize;
        nodeRef.current.smoothingTimeConstant = smoothingTimeConstant;
        nodeRef.current.minDecibels = minDecibels;
        nodeRef.current.maxDecibels = maxDecibels;

        // Initialize data arrays
        frequencyDataRef.current = new Uint8Array(nodeRef.current.frequencyBinCount);
        timeDomainDataRef.current = new Uint8Array(nodeRef.current.fftSize);
    }, [fftSize, smoothingTimeConstant, minDecibels, maxDecibels]);

    // Analysis loop
    useEffect(() => {
        if (!autoUpdate || !onAnalyze || !nodeRef.current || !context) return;

        const analyser = nodeRef.current;
        const frequencyData = frequencyDataRef.current!;
        const timeDomainData = timeDomainDataRef.current!;
        const updateInterval = 1000 / updateRate;

        const analyze = (timestamp: number) => {
            // Throttle updates
            if (timestamp - lastUpdateRef.current < updateInterval) {
                rafRef.current = requestAnimationFrame(analyze);
                return;
            }
            lastUpdateRef.current = timestamp;

            // Get data (cast to satisfy strict ArrayBuffer typing)
            analyser.getByteFrequencyData(frequencyData as Uint8Array<ArrayBuffer>);
            analyser.getByteTimeDomainData(timeDomainData as Uint8Array<ArrayBuffer>);

            // Calculate RMS and peak
            let sum = 0;
            let peak = 0;
            for (let i = 0; i < timeDomainData.length; i++) {
                const sample = (timeDomainData[i] - 128) / 128;
                sum += sample * sample;
                peak = Math.max(peak, Math.abs(sample));
            }
            const rms = Math.sqrt(sum / timeDomainData.length);

            // Build analyzer data
            const data: AnalyzerData = {
                frequencyData,
                timeDomainData,
                rms,
                peak,
                frequencyBinCount: analyser.frequencyBinCount,
                frequencyResolution: context.sampleRate / fftSize,
            };

            onAnalyze(data);
            rafRef.current = requestAnimationFrame(analyze);
        };

        rafRef.current = requestAnimationFrame(analyze);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [autoUpdate, onAnalyze, updateRate, context, fftSize]);

    return (
        <AudioOutProvider node={nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
