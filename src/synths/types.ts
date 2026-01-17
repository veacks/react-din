// =============================================================================
// Synths Module - Type Definitions
// =============================================================================

import type { ReactNode } from 'react';

// =============================================================================
// Envelope Configuration
// =============================================================================

/**
 * ADSR envelope configuration.
 */
export interface EnvelopeConfig {
    /**
     * Attack time in seconds.
     * @default 0.01
     */
    attack?: number;

    /**
     * Decay time in seconds.
     * @default 0.1
     */
    decay?: number;

    /**
     * Sustain level (0-1).
     * @default 0.5
     */
    sustain?: number;

    /**
     * Release time in seconds.
     * @default 0.3
     */
    release?: number;

    /**
     * Attack curve type.
     * @default 'linear'
     */
    attackCurve?: 'linear' | 'exponential';

    /**
     * Release curve type.
     * @default 'exponential'
     */
    releaseCurve?: 'linear' | 'exponential';
}

// =============================================================================
// Oscillator Configuration
// =============================================================================

/**
 * Oscillator waveform type.
 */
export type OscillatorWaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';

/**
 * Oscillator configuration.
 */
export interface OscillatorConfig {
    /**
     * Waveform type.
     * @default 'sine'
     */
    type?: OscillatorWaveType;

    /**
     * Detune in cents.
     * @default 0
     */
    detune?: number;

    /**
     * Pulse width for 'square' wave (future extension).
     */
    pulseWidth?: number;
}

// =============================================================================
// Filter Configuration
// =============================================================================

/**
 * Filter type.
 */
export type FilterTypeOption =
    | 'lowpass'
    | 'highpass'
    | 'bandpass'
    | 'lowshelf'
    | 'highshelf'
    | 'peaking'
    | 'notch'
    | 'allpass';

/**
 * Filter configuration.
 */
export interface FilterConfig {
    /**
     * Filter type.
     * @default 'lowpass'
     */
    type?: FilterTypeOption;

    /**
     * Cutoff/center frequency in Hz.
     * @default 2000
     */
    frequency?: number;

    /**
     * Q factor (resonance).
     * @default 1
     */
    Q?: number;

    /**
     * Gain for shelving/peaking filters in dB.
     * @default 0
     */
    gain?: number;

    /**
     * Filter envelope modulation amount in Hz.
     * Positive values sweep up, negative values sweep down.
     * @default 0
     */
    envelope?: number;

    /**
     * Filter envelope configuration (if different from amp envelope).
     */
    envelopeConfig?: EnvelopeConfig;
}

// =============================================================================
// Base Synth Props
// =============================================================================

/**
 * Common props shared by all synth components.
 */
export interface BaseSynthProps {
    children?: ReactNode;

    /**
     * Volume/gain level (0-1).
     * @default 0.5
     */
    volume?: number;

    /**
     * Amplitude envelope configuration.
     */
    envelope?: EnvelopeConfig;

    /**
     * Whether to bypass the synth (pass-through).
     * @default false
     */
    bypass?: boolean;

    /**
     * Node reference for external access.
     */
    nodeRef?: React.RefObject<GainNode>;
}

/**
 * Props for basic Synth component.
 */
export interface SynthProps extends BaseSynthProps {
    /**
     * Oscillator configuration.
     */
    oscillator?: OscillatorConfig;

    /**
     * Filter configuration.
     */
    filter?: FilterConfig;

    /**
     * Note values for each step (MIDI numbers or note strings).
     */
    notes?: (number | string)[];
}

/**
 * Props for MonoSynth component.
 */
export interface MonoSynthProps extends SynthProps {
    /**
     * Accent pattern (for emphasis on certain steps).
     */
    accents?: (0 | 1 | boolean)[];

    /**
     * Portamento/glide time in seconds.
     * @default 0
     */
    portamento?: number;
}

/**
 * Props for FMSynth component.
 */
export interface FMSynthProps extends BaseSynthProps {
    /**
     * Carrier oscillator configuration.
     */
    carrier?: OscillatorConfig;

    /**
     * Modulator oscillator configuration.
     */
    modulator?: OscillatorConfig;

    /**
     * Frequency ratio of modulator to carrier.
     * @default 1
     */
    modulationRatio?: number;

    /**
     * Modulation index (depth of FM).
     * @default 1
     */
    modulationIndex?: number;

    /**
     * Filter configuration.
     */
    filter?: FilterConfig;

    /**
     * Note values for each step.
     */
    notes?: (number | string)[];
}

/**
 * Props for AMSynth component.
 */
export interface AMSynthProps extends BaseSynthProps {
    /**
     * Carrier oscillator configuration.
     */
    carrier?: OscillatorConfig;

    /**
     * Modulation rate in Hz.
     * @default 4
     */
    modulationRate?: number;

    /**
     * Modulation depth (0-1).
     * @default 0.5
     */
    modulationDepth?: number;

    /**
     * Filter configuration.
     */
    filter?: FilterConfig;

    /**
     * Note values for each step.
     */
    notes?: (number | string)[];
}

/**
 * Props for NoiseSynth component.
 */
export interface NoiseSynthProps extends BaseSynthProps {
    /**
     * Noise type.
     * @default 'white'
     */
    noiseType?: 'white' | 'pink' | 'brown';

    /**
     * Filter configuration.
     */
    filter?: FilterConfig;
}

// =============================================================================
// Envelope Props
// =============================================================================

/**
 * Props for Envelope component.
 */
export interface EnvelopeProps extends EnvelopeConfig {
    children?: ReactNode;

    /**
     * Whether to bypass the envelope.
     * @default false
     */
    bypass?: boolean;

    /**
     * Node reference for external access.
     */
    nodeRef?: React.RefObject<GainNode>;
}

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_ENVELOPE: Required<EnvelopeConfig> = {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.3,
    attackCurve: 'linear',
    releaseCurve: 'exponential',
};

export const DEFAULT_OSCILLATOR: Required<OscillatorConfig> = {
    type: 'sine',
    detune: 0,
    pulseWidth: 0.5,
};

export const DEFAULT_FILTER: Required<FilterConfig> = {
    type: 'lowpass',
    frequency: 2000,
    Q: 1,
    gain: 0,
    envelope: 0,
    envelopeConfig: DEFAULT_ENVELOPE,
};
