// =============================================================================
// ADSR Node Component - Declarative ADSR Envelope
// =============================================================================

import { useEffect, useRef, type FC, type ReactNode } from 'react';
import { useAudioNode } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useAudio } from '../core';

/**
 * ADSR envelope configuration.
 */
export interface ADSRConfig {
    /** Attack time in seconds (default: 0.01) */
    attack?: number;
    /** Decay time in seconds (default: 0.1) */
    decay?: number;
    /** Sustain level 0-1 (default: 0.7) */
    sustain?: number;
    /** Release time in seconds (default: 0.3) */
    release?: number;
    /** Curve type for attack phase */
    attackCurve?: 'linear' | 'exponential';
    /** Curve type for release phase */
    releaseCurve?: 'linear' | 'exponential';
}

/**
 * Default ADSR values.
 */
export const DEFAULT_ADSR: Required<Omit<ADSRConfig, 'attackCurve' | 'releaseCurve'>> & {
    attackCurve: 'linear' | 'exponential';
    releaseCurve: 'linear' | 'exponential';
} = {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3,
    attackCurve: 'linear',
    releaseCurve: 'exponential',
};

export interface ADSRProps extends ADSRConfig {
    children?: ReactNode;
    /** Reference to the underlying GainNode */
    nodeRef?: React.RefObject<GainNode | null>;
    /** Bypass the envelope (pass audio through unchanged) */
    bypass?: boolean;
    /** Trigger the envelope (true = note on, false = note off) */
    trigger?: boolean;
    /** Velocity/amplitude for the envelope (0-1, default: 1) */
    velocity?: number;
    /** Duration in seconds for auto-release (if provided, will auto-release after this time) */
    duration?: number;
    /** Initial gain value (default: 0) */
    initialGain?: number;
}

/**
 * ADSR Envelope Node - Applies an ADSR (Attack, Decay, Sustain, Release) envelope
 * to audio passing through it.
 *
 * Can be triggered manually via the `trigger` prop or used within a Track
 * for automatic triggering.
 *
 * @example
 * ```tsx
 * // Manual trigger control
 * const [isPlaying, setIsPlaying] = useState(false);
 *
 * <ADSR trigger={isPlaying} attack={0.01} decay={0.1} sustain={0.7} release={0.5}>
 *   <Osc frequency={440} type="sawtooth" autoStart />
 * </ADSR>
 *
 * <button onPointerDown={() => setIsPlaying(true)} onPointerUp={() => setIsPlaying(false)}>
 *   Play
 * </button>
 * ```
 *
 * @example
 * ```tsx
 * // With auto-release duration
 * <ADSR trigger={noteOn} duration={0.5} attack={0.01} release={0.3}>
 *   <Osc frequency={440} autoStart />
 * </ADSR>
 * ```
 */
export const ADSR: FC<ADSRProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    trigger = false,
    velocity = 1,
    duration,
    initialGain = 0,
    attack = DEFAULT_ADSR.attack,
    decay = DEFAULT_ADSR.decay,
    sustain = DEFAULT_ADSR.sustain,
    release = DEFAULT_ADSR.release,
    attackCurve = DEFAULT_ADSR.attackCurve,
    releaseCurve = DEFAULT_ADSR.releaseCurve,
}) => {
    const { context } = useAudio();
    const wasTriggeredRef = useRef(false);
    const releaseTimeoutRef = useRef<number | null>(null);
    const lastTriggerRef = useRef(trigger);
    const nodeReadyRef = useRef(false);

    const { nodeRef } = useAudioNode<GainNode>({
        createNode: (ctx) => {
            const gain = ctx.createGain();
            gain.gain.value = initialGain;
            return gain;
        },
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<GainNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Handle trigger changes AND node initialization
    useEffect(() => {
        if (!context || !nodeRef.current) return;

        const gainNode = nodeRef.current;
        const gain = gainNode.gain;
        const now = context.currentTime;

        // Clear any pending auto-release
        if (releaseTimeoutRef.current !== null) {
            clearTimeout(releaseTimeoutRef.current);
            releaseTimeoutRef.current = null;
        }

        // Check if this is first time node is ready with trigger=true
        const isFirstNodeReady = !nodeReadyRef.current;
        nodeReadyRef.current = true;

        // Determine if we should start attack
        const shouldStartAttack = (trigger && !wasTriggeredRef.current) || (trigger && isFirstNodeReady);
        const shouldStartRelease = !trigger && wasTriggeredRef.current;

        if (shouldStartAttack) {
            // Note ON - Attack + Decay phase
            wasTriggeredRef.current = true;

            const peakLevel = velocity;
            const sustainLevel = peakLevel * sustain;

            // Cancel any scheduled changes
            gain.cancelScheduledValues(now);

            // Start from current value or near-zero
            gain.setValueAtTime(Math.max(gain.value, 0.0001), now);

            // Attack phase
            const attackEnd = now + attack;
            if (attackCurve === 'exponential') {
                gain.exponentialRampToValueAtTime(Math.max(peakLevel, 0.0001), attackEnd);
            } else {
                gain.linearRampToValueAtTime(peakLevel, attackEnd);
            }

            // Decay phase
            const decayEnd = attackEnd + decay;
            gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);

            // If duration is provided, auto-release after duration
            if (duration !== undefined) {
                const releaseStart = duration - release;
                const delayMs = Math.max(0, releaseStart * 1000);

                releaseTimeoutRef.current = window.setTimeout(() => {
                    if (!nodeRef.current || !context) return;
                    const releaseTime = context.currentTime;
                    const g = nodeRef.current.gain;

                    g.cancelScheduledValues(releaseTime);
                    g.setValueAtTime(Math.max(g.value, 0.0001), releaseTime);

                    if (releaseCurve === 'exponential') {
                        g.exponentialRampToValueAtTime(0.0001, releaseTime + release);
                    } else {
                        g.linearRampToValueAtTime(0, releaseTime + release);
                    }
                }, delayMs);
            }
        } else if (shouldStartRelease) {
            // Note OFF - Release phase
            wasTriggeredRef.current = false;

            // Cancel scheduled changes and release from current value
            gain.cancelScheduledValues(now);
            gain.setValueAtTime(Math.max(gain.value, 0.0001), now);

            if (releaseCurve === 'exponential') {
                gain.exponentialRampToValueAtTime(0.0001, now + release);
            } else {
                gain.linearRampToValueAtTime(0, now + release);
            }
        }

        lastTriggerRef.current = trigger;

        return () => {
            if (releaseTimeoutRef.current !== null) {
                clearTimeout(releaseTimeoutRef.current);
            }
        };
        // Include nodeRef.current to re-run when node becomes available
    }, [trigger, velocity, duration, context, attack, decay, sustain, release, attackCurve, releaseCurve, nodeRef.current]);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};

export default ADSR;

