// =============================================================================
// Envelope Component - ADSR Gain Envelope
// =============================================================================

import { useEffect, type FC } from 'react';
import { useAudioNode } from '../nodes/useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useTriggerContext } from '../sequencer/TriggerContext';
import type { EnvelopeProps } from './types';
import { DEFAULT_ENVELOPE } from './types';

/**
 * ADSR Envelope component that wraps children with gain-based envelope control.
 *
 * When used within a Track, automatically responds to trigger events
 * and applies the envelope to the audio passing through.
 *
 * @example
 * ```tsx
 * <Track id="lead" pattern={pattern}>
 *   <Envelope attack={0.01} decay={0.2} sustain={0.7} release={0.5}>
 *     <Osc type="sawtooth" frequency={440} autoStart />
 *   </Envelope>
 * </Track>
 * ```
 */
export const Envelope: FC<EnvelopeProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    attack = DEFAULT_ENVELOPE.attack,
    decay = DEFAULT_ENVELOPE.decay,
    sustain = DEFAULT_ENVELOPE.sustain,
    release = DEFAULT_ENVELOPE.release,
    attackCurve = DEFAULT_ENVELOPE.attackCurve,
    releaseCurve = DEFAULT_ENVELOPE.releaseCurve,
}) => {
    const { nodeRef, context } = useAudioNode<GainNode>({
        createNode: (ctx) => {
            const gain = ctx.createGain();
            gain.gain.value = 0; // Start silent
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

    // Subscribe to trigger context for automatic envelope triggering
    const triggerContext = useTriggerContextSafe();

    useEffect(() => {
        if (!context || !triggerContext.subscribe || !nodeRef.current) return;

        const unsub = triggerContext.subscribe((event) => {
            const gainNode = nodeRef.current;
            if (!gainNode) return;

            const { time, velocity, duration } = event;
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

            // Decay phase
            const decayEnd = attackEnd + decay;
            gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);

            // Release phase (use event duration)
            const releaseStart = time + duration - release;
            const releaseEnd = time + duration;

            // Hold at sustain until release
            gain.setValueAtTime(Math.max(sustainLevel, 0.0001), Math.max(releaseStart, decayEnd));

            // Release
            if (releaseCurve === 'exponential') {
                gain.exponentialRampToValueAtTime(0.0001, releaseEnd);
            } else {
                gain.linearRampToValueAtTime(0, releaseEnd);
            }
        });

        return unsub;
    }, [context, triggerContext.subscribe, attack, decay, sustain, release, attackCurve, releaseCurve]);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};

/**
 * Safe version of useTriggerContext that doesn't throw outside Track.
 */
function useTriggerContextSafe() {
    try {
        return useTriggerContext();
    } catch {
        return { subscribe: null, currentTrigger: null, trackId: null };
    }
}
