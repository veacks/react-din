import type { RefObject } from 'react';

// =============================================================================
// LFO Output Type
// =============================================================================

/**
 * LFO waveform types.
 */
export type LFOWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

/**
 * LFO output object that can be passed to modulatable props.
 * Contains the audio node chain for modulation.
 */
export interface LFOOutput {
    /**
     * The output GainNode that applies depth scaling.
     * This is what gets connected to AudioParams.
     */
    readonly node: GainNode;

    /**
     * The underlying OscillatorNode for parameter updates.
     */
    readonly oscillator: OscillatorNode;

    /**
     * Current rate in Hz.
     */
    readonly rate: number;

    /**
     * Current depth (amplitude of modulation).
     */
    readonly depth: number;

    /**
     * Current waveform type.
     */
    readonly waveform: LFOWaveform;

    /**
     * Marker to identify LFO outputs at runtime.
     * @internal
     */
    readonly __lfoOutput: true;
}

// =============================================================================
// Modulatable Value Type
// =============================================================================

/**
 * A value that can be either a fixed number or modulated by an LFO.
 * 
 * When a number is provided, the parameter is set to that fixed value.
 * When an LFOOutput is provided, the LFO modulates the parameter around
 * its base value (usually defined by the number portion if using object syntax).
 * 
 * @example
 * ```tsx
 * // Fixed value
 * <Filter frequency={1000} />
 * 
 * // LFO modulation
 * const lfo = useLFO({ rate: 2, depth: 500 });
 * <Filter frequency={lfo} /> // Oscillates ±500 around 0
 * ```
 */
export type ModulatableValue = number | LFOOutput;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a value is an LFOOutput.
 * 
 * @param value - The value to check
 * @returns true if the value is an LFOOutput
 */
export function isLFOOutput(value: ModulatableValue | undefined | null): value is LFOOutput {
    return (
        value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        '__lfoOutput' in value &&
        value.__lfoOutput === true
    );
}

/**
 * Get the numeric value from a ModulatableValue.
 * Returns 0 for LFO outputs (since LFO adds to the base value).
 * 
 * @param value - The modulatable value
 * @param defaultValue - Default value if undefined
 * @returns The numeric value
 */
export function getNumericValue(
    value: ModulatableValue | undefined,
    defaultValue: number = 0
): number {
    if (value === undefined) return defaultValue;
    if (isLFOOutput(value)) return 0; // LFO adds to base value
    return value;
}
