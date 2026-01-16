import { useState, useEffect, useRef, useCallback } from 'react';
import { useAnalyzer } from './useAnalyzer';
import type { FFTData, UseAnalyzerOptions } from './types';

/**
 * Calculate average level for a frequency range.
 */
function getFrequencyRangeLevel(
    frequencyData: Uint8Array,
    sampleRate: number,
    fftSize: number,
    minHz: number,
    maxHz: number
): number {
    const nyquist = sampleRate / 2;
    const binCount = frequencyData.length;
    const binWidth = nyquist / binCount;

    const minBin = Math.floor(minHz / binWidth);
    const maxBin = Math.min(Math.ceil(maxHz / binWidth), binCount - 1);

    let sum = 0;
    let count = 0;

    for (let i = minBin; i <= maxBin; i++) {
        sum += frequencyData[i];
        count++;
    }

    return count > 0 ? sum / count / 255 : 0;
}

/**
 * Hook for processed FFT data with frequency band analysis.
 *
 * Provides normalized spectrum data and frequency band levels
 * (bass, low-mid, mid, high-mid, high).
 *
 * @param options - Analyzer configuration
 * @returns Processed FFT data
 *
 * @example
 * ```tsx
 * function BassReactiveElement() {
 *   const { bass, mid, high } = useFFT({ fftSize: 512 });
 *
 *   return (
 *     <div style={{ transform: `scale(${1 + bass * 0.5})` }}>
 *       Bass reactive!
 *     </div>
 *   );
 * }
 * ```
 */
export function useFFT(options: UseAnalyzerOptions = {}): FFTData {
    const { fftSize = 2048 } = options;
    const analyzerData = useAnalyzer(options);

    const spectrumRef = useRef<Float32Array>(new Float32Array(fftSize / 2));
    const spectrumDbRef = useRef<Float32Array>(new Float32Array(fftSize / 2));

    const [fftData, setFFTData] = useState<FFTData>({
        spectrum: new Float32Array(fftSize / 2),
        spectrumDb: new Float32Array(fftSize / 2),
        bass: 0,
        lowMid: 0,
        mid: 0,
        highMid: 0,
        high: 0,
        update: () => { },
    });

    // Process FFT data
    useEffect(() => {
        const { frequencyData, frequencyResolution } = analyzerData;
        const sampleRate = frequencyResolution * fftSize;

        if (!frequencyData || frequencyData.length === 0) return;

        // Normalize spectrum
        const spectrum = spectrumRef.current;
        const spectrumDb = spectrumDbRef.current;

        for (let i = 0; i < frequencyData.length; i++) {
            spectrum[i] = frequencyData[i] / 255;
            spectrumDb[i] = (frequencyData[i] / 255) * 100 - 100; // Approximate dB
        }

        // Calculate frequency bands
        const bass = getFrequencyRangeLevel(frequencyData, sampleRate, fftSize, 20, 250);
        const lowMid = getFrequencyRangeLevel(frequencyData, sampleRate, fftSize, 250, 500);
        const mid = getFrequencyRangeLevel(frequencyData, sampleRate, fftSize, 500, 2000);
        const highMid = getFrequencyRangeLevel(frequencyData, sampleRate, fftSize, 2000, 4000);
        const high = getFrequencyRangeLevel(frequencyData, sampleRate, fftSize, 4000, 20000);

        setFFTData({
            spectrum: new Float32Array(spectrum),
            spectrumDb: new Float32Array(spectrumDb),
            bass,
            lowMid,
            mid,
            highMid,
            high,
            update: () => { }, // Manual update not needed in auto mode
        });
    }, [analyzerData, fftSize]);

    return fftData;
}
