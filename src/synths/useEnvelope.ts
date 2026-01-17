// =============================================================================
// useEnvelope Hook - ADSR Envelope Control
// =============================================================================

import { useRef, useCallback } from 'react';
import { useAudio } from '../core';
import type { EnvelopeConfig } from './types';
import { DEFAULT_ENVELOPE } from './types';

/**
 * Return type for useEnvelope hook.
 */
export interface UseEnvelopeResult {
    /**
     * Reference to the gain node controlled by the envelope.
     */
    gainRef: React.MutableRefObject<GainNode | null>;

    /**
     * Trigger the attack phase of the envelope.
     * @param velocity - Velocity/intensity (0-1)
     * @param time - AudioContext time to start
     */
    trigger: (velocity: number, time: number) => void;

    /**
     * Trigger the release phase of the envelope.
     * @param time - AudioContext time to start release
     */
    release: (time: number) => void;

    /**
     * Convenience method: attack immediately followed by release.
     * Similar to Tone.js triggerAttackRelease.
     * @param duration - Total duration in seconds
     * @param time - Optional AudioContext time (defaults to now)
     * @param velocity - Optional velocity (defaults to 1)
     */
    attackRelease: (duration: number, time?: number, velocity?: number) => void;

    /**
     * Apply envelope to a GainNode at a specific time.
     * @param gainNode - The GainNode to control
     * @param velocity - Velocity/intensity (0-1)
     * @param time - AudioContext time to start
     * @param duration - Optional duration for auto-release
     */
    applyEnvelope: (
        gainNode: GainNode,
        velocity: number,
        time: number,
        duration?: number
    ) => void;
}

/**
 * Hook for ADSR envelope control.
 *
 * @param config - Envelope configuration (ADSR parameters)
 * @returns Envelope control functions and gain node reference
 *
 * @example
 * ```tsx
 * function MySynth() {
 *   const { gainRef, trigger, release, attackRelease } = useEnvelope({
 *     attack: 0.01,
 *     decay: 0.1,
 *     sustain: 0.7,
 *     release: 0.3,
 *   });
 *
 *   // On note trigger
 *   attackRelease(0.5); // Play for 0.5 seconds
 * }
 * ```
 */
export function useEnvelope(config: EnvelopeConfig = {}): UseEnvelopeResult {
    const { context } = useAudio();
    const gainRef = useRef<GainNode | null>(null);

    // Merge with defaults
    const envelope = {
        ...DEFAULT_ENVELOPE,
        ...config,
    };

    /**
     * Apply ADSR envelope to a gain node.
     */
    const applyEnvelope = useCallback(
        (
            gainNode: GainNode,
            velocity: number,
            time: number,
            duration?: number
        ) => {
            const { attack, decay, sustain, release, attackCurve, releaseCurve } = envelope;
            const gain = gainNode.gain;
            const peakLevel = velocity;
            const sustainLevel = peakLevel * sustain;

            // Cancel any scheduled changes
            gain.cancelScheduledValues(time);

            // Start from zero
            gain.setValueAtTime(0.0001, time);

            // Attack phase
            const attackEnd = time + attack;
            if (attackCurve === 'exponential') {
                gain.exponentialRampToValueAtTime(Math.max(peakLevel, 0.0001), attackEnd);
            } else {
                gain.linearRampToValueAtTime(peakLevel, attackEnd);
            }

            // Decay phase (exponential decay to sustain)
            const decayEnd = attackEnd + decay;
            gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);

            // If duration is provided, schedule release
            if (duration !== undefined) {
                const releaseStart = time + duration - release;
                const releaseEnd = time + duration;

                // Hold at sustain until release
                gain.setValueAtTime(Math.max(sustainLevel, 0.0001), Math.max(releaseStart, decayEnd));

                // Release phase
                if (releaseCurve === 'exponential') {
                    gain.exponentialRampToValueAtTime(0.0001, releaseEnd);
                } else {
                    gain.linearRampToValueAtTime(0, releaseEnd);
                }
            }
        },
        [envelope]
    );

    /**
     * Trigger attack phase.
     */
    const trigger = useCallback(
        (velocity: number, time: number) => {
            if (!gainRef.current) return;
            applyEnvelope(gainRef.current, velocity, time);
        },
        [applyEnvelope]
    );

    /**
     * Trigger release phase.
     */
    const release = useCallback(
        (time: number) => {
            if (!gainRef.current) return;

            const { release: releaseTime, releaseCurve } = envelope;
            const gain = gainRef.current.gain;

            // Cancel scheduled changes and start release from current value
            gain.cancelScheduledValues(time);
            gain.setValueAtTime(gain.value, time);

            if (releaseCurve === 'exponential') {
                gain.exponentialRampToValueAtTime(0.0001, time + releaseTime);
            } else {
                gain.linearRampToValueAtTime(0, time + releaseTime);
            }
        },
        [envelope]
    );

    /**
     * Attack + Release convenience method.
     */
    const attackRelease = useCallback(
        (duration: number, time?: number, velocity = 1) => {
            if (!context || !gainRef.current) return;
            const startTime = time ?? context.currentTime;
            applyEnvelope(gainRef.current, velocity, startTime, duration);
        },
        [context, applyEnvelope]
    );

    return {
        gainRef,
        trigger,
        release,
        attackRelease,
        applyEnvelope,
    };
}
