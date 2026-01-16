import { useState, useEffect, useRef } from 'react';
import { useAnalyzer } from './useAnalyzer';
import type { WaveformData, UseAnalyzerOptions } from './types';

/**
 * Hook for time-domain waveform analysis.
 *
 * Provides normalized waveform samples and zero-crossing rate.
 *
 * @param options - Analyzer configuration
 * @returns Waveform data
 *
 * @example
 * ```tsx
 * function WaveformVisualizer() {
 *   const { waveform, zeroCrossingRate } = useWaveform({ fftSize: 2048 });
 *
 *   // Draw waveform to canvas
 *   useEffect(() => {
 *     const ctx = canvasRef.current.getContext('2d');
 *     // ...draw waveform
 *   }, [waveform]);
 *
 *   return <canvas ref={canvasRef} />;
 * }
 * ```
 */
export function useWaveform(options: UseAnalyzerOptions = {}): WaveformData {
    const { fftSize = 2048 } = options;
    const analyzerData = useAnalyzer(options);

    const waveformRef = useRef<Float32Array>(new Float32Array(fftSize));

    const [waveformData, setWaveformData] = useState<WaveformData>({
        waveform: new Float32Array(fftSize),
        length: fftSize,
        zeroCrossingRate: 0,
        update: () => { },
    });

    useEffect(() => {
        const { timeDomainData } = analyzerData;

        if (!timeDomainData || timeDomainData.length === 0) return;

        const waveform = waveformRef.current;

        // Normalize to -1 to 1 range
        let zeroCrossings = 0;
        let prevSample = 0;

        for (let i = 0; i < timeDomainData.length; i++) {
            const sample = (timeDomainData[i] - 128) / 128;
            waveform[i] = sample;

            // Count zero crossings
            if (i > 0 && ((prevSample >= 0 && sample < 0) || (prevSample < 0 && sample >= 0))) {
                zeroCrossings++;
            }
            prevSample = sample;
        }

        const zeroCrossingRate = zeroCrossings / timeDomainData.length;

        setWaveformData({
            waveform: new Float32Array(waveform),
            length: timeDomainData.length,
            zeroCrossingRate,
            update: () => { },
        });
    }, [analyzerData, fftSize]);

    return waveformData;
}
