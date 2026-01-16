import type { ReactNode } from 'react';

// =============================================================================
// Effect Base Props
// =============================================================================

/**
 * Common props for effect components.
 */
export interface EffectProps {
    children?: ReactNode;

    /**
     * Dry/wet mix (0 = fully dry, 1 = fully wet).
     * @default 0.5
     */
    mix?: number;

    /**
     * Bypass the effect.
     * @default false
     */
    bypass?: boolean;

    /**
     * Unique identifier.
     */
    id?: string;
}

// =============================================================================
// Reverb
// =============================================================================

/**
 * Reverb algorithm type.
 */
export type ReverbType = 'hall' | 'room' | 'plate' | 'spring' | 'ambient';

/**
 * Props for the Reverb effect component.
 */
export interface ReverbProps extends EffectProps {
    /**
     * Reverb algorithm/character.
     * @default 'hall'
     */
    type?: ReverbType;

    /**
     * Decay time in seconds.
     * @default 2
     */
    decay?: number;

    /**
     * Pre-delay in seconds.
     * @default 0.01
     */
    preDelay?: number;

    /**
     * High-frequency damping (0-1).
     * Higher values = darker reverb.
     * @default 0.5
     */
    damping?: number;

    /**
     * Room size (0-1).
     * @default 0.5
     */
    size?: number;

    /**
     * Custom impulse response URL or buffer.
     */
    impulse?: string | AudioBuffer;
}

// =============================================================================
// Chorus
// =============================================================================

/**
 * Props for the Chorus effect component.
 */
export interface ChorusProps extends EffectProps {
    /**
     * LFO rate in Hz.
     * @default 1.5
     */
    rate?: number;

    /**
     * Modulation depth in milliseconds.
     * @default 3.5
     */
    depth?: number;

    /**
     * Feedback amount (0-1).
     * @default 0.2
     */
    feedback?: number;

    /**
     * Base delay time in milliseconds.
     * @default 20
     */
    delay?: number;

    /**
     * Stereo spread.
     * @default true
     */
    stereo?: boolean;
}

// =============================================================================
// Distortion
// =============================================================================

/**
 * Distortion algorithm type.
 */
export type DistortionType = 'soft' | 'hard' | 'fuzz' | 'bitcrush' | 'saturate';

/**
 * Props for the Distortion effect component.
 */
export interface DistortionProps extends EffectProps {
    /**
     * Distortion algorithm.
     * @default 'soft'
     */
    type?: DistortionType;

    /**
     * Drive/gain amount (0-1).
     * @default 0.5
     */
    drive?: number;

    /**
     * Output level compensation (0-1).
     * @default 0.5
     */
    level?: number;

    /**
     * Oversampling for anti-aliasing.
     * @default '2x'
     */
    oversample?: 'none' | '2x' | '4x';

    /**
     * Tone control / low-pass filter cutoff in Hz.
     * @default 4000
     */
    tone?: number;
}

// =============================================================================
// Phaser
// =============================================================================

/**
 * Props for the Phaser effect component.
 */
export interface PhaserProps extends EffectProps {
    /**
     * LFO rate in Hz.
     * @default 0.5
     */
    rate?: number;

    /**
     * Modulation depth (0-1).
     * @default 0.5
     */
    depth?: number;

    /**
     * Feedback amount (-1 to 1).
     * @default 0.7
     */
    feedback?: number;

    /**
     * Base frequency in Hz.
     * @default 1000
     */
    baseFrequency?: number;

    /**
     * Number of all-pass stages.
     * @default 4
     */
    stages?: number;
}

// =============================================================================
// Flanger
// =============================================================================

/**
 * Props for the Flanger effect component.
 */
export interface FlangerProps extends EffectProps {
    /**
     * LFO rate in Hz.
     * @default 0.2
     */
    rate?: number;

    /**
     * Modulation depth in milliseconds.
     * @default 2
     */
    depth?: number;

    /**
     * Feedback amount (-1 to 1).
     * @default 0.5
     */
    feedback?: number;

    /**
     * Base delay time in milliseconds.
     * @default 1
     */
    delay?: number;
}

// =============================================================================
// Tremolo
// =============================================================================

/**
 * Props for the Tremolo effect component.
 */
export interface TremoloProps extends EffectProps {
    /**
     * LFO rate in Hz.
     * @default 4
     */
    rate?: number;

    /**
     * Modulation depth (0-1).
     * @default 0.5
     */
    depth?: number;

    /**
     * LFO waveform.
     * @default 'sine'
     */
    waveform?: 'sine' | 'square' | 'triangle' | 'sawtooth';

    /**
     * Stereo mode (alternating channels).
     * @default false
     */
    stereo?: boolean;
}

// =============================================================================
// EQ3
// =============================================================================

/**
 * Props for the EQ3 (3-band equalizer) effect component.
 */
export interface EQ3Props extends EffectProps {
    /**
     * Low band gain in dB.
     * @default 0
     */
    low?: number;

    /**
     * Mid band gain in dB.
     * @default 0
     */
    mid?: number;

    /**
     * High band gain in dB.
     * @default 0
     */
    high?: number;

    /**
     * Low-mid crossover frequency in Hz.
     * @default 400
     */
    lowFrequency?: number;

    /**
     * Mid-high crossover frequency in Hz.
     * @default 2500
     */
    highFrequency?: number;
}
