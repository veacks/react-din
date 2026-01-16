import { useAnalyzer } from './useAnalyzer';
import type { UseAnalyzerOptions } from './types';

/**
 * Hook for RMS (root mean square) level.
 *
 * Returns the average signal level, useful for VU meters.
 *
 * @param options - Analyzer configuration
 * @returns RMS level (0-1)
 *
 * @example
 * ```tsx
 * function LevelMeter() {
 *   const rms = useRMS();
 *   return <div style={{ width: `${rms * 100}%` }} className="meter" />;
 * }
 * ```
 */
export function useRMS(options: UseAnalyzerOptions = {}): number {
    const analyzerData = useAnalyzer(options);
    return analyzerData.rms;
}

/**
 * Hook for peak level.
 *
 * Returns the maximum signal level, useful for peak indicators.
 *
 * @param options - Analyzer configuration
 * @returns Peak level (0-1)
 *
 * @example
 * ```tsx
 * function PeakIndicator() {
 *   const peak = usePeak();
 *   return <div className={peak > 0.9 ? 'clipping' : ''}>Peak: {peak}</div>;
 * }
 * ```
 */
export function usePeak(options: UseAnalyzerOptions = {}): number {
    const analyzerData = useAnalyzer(options);
    return analyzerData.peak;
}
