import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut } from '../core/AudioOutContext';
import type { AnalyzerData, UseAnalyzerOptions } from './types';

/**
 * Default analyzer data.
 */
const createDefaultData = (binCount: number, fftSize: number): AnalyzerData => ({
    frequencyData: new Uint8Array(binCount),
    timeDomainData: new Uint8Array(fftSize),
    rms: 0,
    peak: 0,
    frequencyBinCount: binCount,
    frequencyResolution: 0,
});

/**
 * Hook to create and use an analyzer with automatic updates.
 *
 * Creates an AnalyserNode connected to the current output and
 * provides real-time analysis data.
 *
 * @param options - Analyzer configuration
 * @returns Analyzer data that updates automatically
 *
 * @example
 * ```tsx
 * function Visualizer() {
 *   const { frequencyData, rms, peak } = useAnalyzer({ fftSize: 256 });
 *
 *   return (
 *     <canvas ref={canvasRef} />
 *   );
 * }
 * ```
 */
export function useAnalyzer(options: UseAnalyzerOptions = {}): AnalyzerData {
    const {
        fftSize = 2048,
        autoUpdate = true,
        updateRate = 60,
        smoothing = 0.8,
        minDecibels = -100,
        maxDecibels = -30,
    } = options;

    const { context } = useAudio();
    const { outputNode } = useAudioOut();

    const analyserRef = useRef<AnalyserNode | null>(null);
    const frequencyDataRef = useRef<Uint8Array | null>(null);
    const timeDomainDataRef = useRef<Uint8Array | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    const [data, setData] = useState<AnalyzerData>(() =>
        createDefaultData(fftSize / 2, fftSize)
    );

    // Create and connect analyzer
    useEffect(() => {
        if (!context || !outputNode) return;

        const analyser = context.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothing;
        analyser.minDecibels = minDecibels;
        analyser.maxDecibels = maxDecibels;

        // Connect output to analyzer (parallel connection, doesn't break the chain)
        outputNode.connect(analyser);

        analyserRef.current = analyser;
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        timeDomainDataRef.current = new Uint8Array(fftSize);

        return () => {
            try {
                outputNode.disconnect(analyser);
            } catch {
                // Already disconnected
            }
            analyserRef.current = null;
        };
    }, [context, outputNode, fftSize, smoothing, minDecibels, maxDecibels]);

    // Analysis loop
    useEffect(() => {
        if (!autoUpdate || !analyserRef.current || !context) return;

        const analyser = analyserRef.current;
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

            setData({
                frequencyData: frequencyData.slice() as Uint8Array,
                timeDomainData: timeDomainData.slice() as Uint8Array,
                rms,
                peak,
                frequencyBinCount: analyser.frequencyBinCount,
                frequencyResolution: context.sampleRate / fftSize,
            });

            rafRef.current = requestAnimationFrame(analyze);
        };

        rafRef.current = requestAnimationFrame(analyze);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [autoUpdate, updateRate, context, fftSize]);

    return data;
}
