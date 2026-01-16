import type { ReactNode, RefObject } from 'react';

// =============================================================================
// Analyzer Data
// =============================================================================

/**
 * Audio analysis data returned by analyzers and hooks.
 */
export interface AnalyzerData {
    /**
     * Frequency domain data (FFT magnitude).
     * Uint8Array with values from 0-255.
     */
    frequencyData: Uint8Array;

    /**
     * Time domain data (waveform).
     * Uint8Array with values from 0-255 (128 = zero crossing).
     */
    timeDomainData: Uint8Array;

    /**
     * RMS (root mean square) level (0-1).
     * Represents average signal level.
     */
    rms: number;

    /**
     * Peak level (0-1).
     * Represents maximum signal level.
     */
    peak: number;

    /**
     * Number of frequency bins (half of fftSize).
     */
    frequencyBinCount: number;

    /**
     * Frequency resolution in Hz per bin.
     */
    frequencyResolution: number;
}

// =============================================================================
// Analyzer Props
// =============================================================================

/**
 * Props for the Analyzer component.
 */
export interface AnalyzerProps {
    children?: ReactNode;

    /**
     * FFT size (must be power of 2 between 32 and 32768).
     * Higher values = better frequency resolution, worse time resolution.
     * @default 2048
     */
    fftSize?: number;

    /**
     * Smoothing time constant (0-1).
     * Higher values = smoother but slower response.
     * @default 0.8
     */
    smoothingTimeConstant?: number;

    /**
     * Minimum decibels for FFT range.
     * @default -100
     */
    minDecibels?: number;

    /**
     * Maximum decibels for FFT range.
     * @default -30
     */
    maxDecibels?: number;

    /**
     * Callback called each frame with analysis data.
     */
    onAnalyze?: (data: AnalyzerData) => void;

    /**
     * Update frequency in Hz.
     * @default 60
     */
    updateRate?: number;

    /**
     * Whether to automatically update.
     * Set to false for manual updates.
     * @default true
     */
    autoUpdate?: boolean;

    /**
     * Ref to access the underlying AnalyserNode.
     */
    nodeRef?: RefObject<AnalyserNode | null>;
}

// =============================================================================
// useAnalyzer Options
// =============================================================================

/**
 * Options for the useAnalyzer hook.
 */
export interface UseAnalyzerOptions {
    /**
     * FFT size (power of 2).
     * @default 2048
     */
    fftSize?: number;

    /**
     * Enable automatic updates.
     * @default true
     */
    autoUpdate?: boolean;

    /**
     * Update rate in Hz.
     * @default 60
     */
    updateRate?: number;

    /**
     * Smoothing time constant (0-1).
     * @default 0.8
     */
    smoothing?: number;

    /**
     * Minimum decibels.
     * @default -100
     */
    minDecibels?: number;

    /**
     * Maximum decibels.
     * @default -30
     */
    maxDecibels?: number;
}

// =============================================================================
// FFT Data
// =============================================================================

/**
 * Processed FFT data with frequency band analysis.
 */
export interface FFTData {
    /**
     * Normalized frequency spectrum (0-1).
     * Float32Array with one value per frequency bin.
     */
    spectrum: Float32Array;

    /**
     * Raw frequency data in decibels.
     */
    spectrumDb: Float32Array;

    /**
     * Bass level (20-250Hz), normalized 0-1.
     */
    bass: number;

    /**
     * Low-mid level (250-500Hz), normalized 0-1.
     */
    lowMid: number;

    /**
     * Mid level (500-2000Hz), normalized 0-1.
     */
    mid: number;

    /**
     * High-mid level (2000-4000Hz), normalized 0-1.
     */
    highMid: number;

    /**
     * High level (4000-20000Hz), normalized 0-1.
     */
    high: number;

    /**
     * Manually trigger an update.
     */
    update: () => void;
}

// =============================================================================
// Waveform Data
// =============================================================================

/**
 * Time-domain waveform data.
 */
export interface WaveformData {
    /**
     * Normalized waveform samples (-1 to 1).
     */
    waveform: Float32Array;

    /**
     * Number of samples.
     */
    length: number;

    /**
     * Zero-crossing rate (indicator of pitch/noise).
     */
    zeroCrossingRate: number;

    /**
     * Manually trigger an update.
     */
    update: () => void;
}

// =============================================================================
// Meter Data
// =============================================================================

/**
 * Level metering data.
 */
export interface MeterData {
    /**
     * Current RMS level in decibels.
     */
    rmsDb: number;

    /**
     * Current peak level in decibels.
     */
    peakDb: number;

    /**
     * RMS level normalized (0-1).
     */
    rms: number;

    /**
     * Peak level normalized (0-1).
     */
    peak: number;

    /**
     * Peak hold value (with decay).
     */
    peakHold: number;

    /**
     * Whether signal is clipping.
     */
    isClipping: boolean;
}
