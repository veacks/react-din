import { useState, useEffect, useRef } from 'react';
import { useAnalyzer } from './useAnalyzer';
import type { MeterData, UseAnalyzerOptions } from './types';

/**
 * Default meter data.
 */
const defaultMeterData: MeterData = {
    rmsDb: -Infinity,
    peakDb: -Infinity,
    rms: 0,
    peak: 0,
    peakHold: 0,
    isClipping: false,
};

/**
 * Convert linear amplitude to decibels.
 */
function linearToDb(linear: number): number {
    if (linear <= 0) return -Infinity;
    return 20 * Math.log10(linear);
}

/**
 * Hook for level metering with RMS, peak, and peak hold.
 *
 * Provides audio level information suitable for VU meters
 * and level displays.
 *
 * @param options - Analyzer configuration
 * @returns Level metering data
 *
 * @example
 * ```tsx
 * function LevelMeter() {
 *   const { rmsDb, peakDb, peakHold, isClipping } = useMeter();
 *
 *   return (
 *     <div className={isClipping ? 'clipping' : ''}>
 *       <div className="rms" style={{ height: `${(rmsDb + 60) / 60 * 100}%` }} />
 *       <div className="peak-hold" style={{ bottom: `${(peakHold + 60) / 60 * 100}%` }} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMeter(options: UseAnalyzerOptions = {}): MeterData {
    const analyzerData = useAnalyzer({ ...options, fftSize: 256 }); // Smaller FFT for faster response

    const peakHoldRef = useRef<number>(0);
    const peakHoldDecayRef = useRef<number>(0);

    const [meterData, setMeterData] = useState<MeterData>(defaultMeterData);

    useEffect(() => {
        const { rms, peak } = analyzerData;

        // Convert to dB
        const rmsDb = linearToDb(rms);
        const peakDb = linearToDb(peak);

        // Peak hold with decay
        if (peakDb > peakHoldRef.current) {
            peakHoldRef.current = peakDb;
            peakHoldDecayRef.current = 0;
        } else {
            peakHoldDecayRef.current++;
            // Start decay after ~30 frames (~500ms at 60fps)
            if (peakHoldDecayRef.current > 30) {
                peakHoldRef.current = Math.max(peakHoldRef.current - 0.5, peakDb);
            }
        }

        // Clipping detection (peak above -0.1dB)
        const isClipping = peakDb > -0.1;

        setMeterData({
            rmsDb,
            peakDb,
            rms,
            peak,
            peakHold: peakHoldRef.current,
            isClipping,
        });
    }, [analyzerData]);

    return meterData;
}
