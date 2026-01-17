// =============================================================================
// Synth Component - Basic Monophonic Synthesizer
// =============================================================================

import { useEffect, useRef, type FC } from 'react';
import { useAudio } from '../core';
import { useTriggerContext } from '../sequencer/TriggerContext';
import { noteToFreq } from '../notes';
import type { SynthProps } from './types';
import { DEFAULT_ENVELOPE, DEFAULT_OSCILLATOR, DEFAULT_FILTER } from './types';

/**
 * Basic monophonic synthesizer.
 *
 * Consists of: Oscillator -> Filter -> Gain Envelope -> Output
 *
 * Responds to trigger events from parent Track, playing notes
 * with ADSR envelope shaping.
 *
 * @example
 * ```tsx
 * <Track id="lead" pattern={pattern}>
 *   <Synth
 *     notes={['C4', 'E4', 'G4', 'C5']}
 *     oscillator={{ type: 'sawtooth' }}
 *     envelope={{ attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 }}
 *     filter={{ type: 'lowpass', frequency: 2000, Q: 2 }}
 *   />
 * </Track>
 * ```
 */
export const Synth: FC<SynthProps> = ({
    notes = [],
    oscillator = {},
    envelope = {},
    filter = {},
    volume = 0.5,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const { context } = useAudio();
    const { subscribe } = useTriggerContextSafe();

    // Merge with defaults
    const oscConfig = { ...DEFAULT_OSCILLATOR, ...oscillator };
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const filterConfig = { ...DEFAULT_FILTER, ...filter };

    // Keep refs updated
    const paramsRef = useRef({ notes, oscConfig, envConfig, filterConfig, volume });
    paramsRef.current = { notes, oscConfig, envConfig, filterConfig, volume };

    // Sync external ref (we'll create a master gain node for reference)
    const masterGainRef = useRef<GainNode | null>(null);

    useEffect(() => {
        if (externalRef && masterGainRef.current) {
            (externalRef as React.MutableRefObject<GainNode | null>).current = masterGainRef.current;
        }
    }, [externalRef, masterGainRef.current]);

    // Create master gain node
    useEffect(() => {
        if (!context) return;
        masterGainRef.current = context.createGain();
        masterGainRef.current.gain.value = volume;
        masterGainRef.current.connect(context.destination);

        return () => {
            masterGainRef.current?.disconnect();
            masterGainRef.current = null;
        };
    }, [context]);

    // Update master gain
    useEffect(() => {
        if (masterGainRef.current) {
            masterGainRef.current.gain.value = volume;
        }
    }, [volume]);

    // Subscribe to trigger events
    useEffect(() => {
        if (!context || !subscribe || bypass) return;

        const unsub = subscribe((event) => {
            const { notes, oscConfig, envConfig, filterConfig, volume } = paramsRef.current;
            const { time, step, velocity, duration } = event;

            if (!masterGainRef.current) return;

            // Get note for this step
            const noteInput = notes[step % notes.length];
            if (noteInput === undefined || noteInput === null) return;

            const frequency = typeof noteInput === 'number'
                ? noteToFreq(noteInput)
                : noteToFreq(noteInput);

            // Create oscillator
            const osc = context.createOscillator();
            osc.type = oscConfig.type;
            osc.frequency.setValueAtTime(frequency, time);
            if (oscConfig.detune) {
                osc.detune.setValueAtTime(oscConfig.detune, time);
            }

            // Create filter
            const filterNode = context.createBiquadFilter();
            filterNode.type = filterConfig.type;
            filterNode.frequency.setValueAtTime(filterConfig.frequency, time);
            filterNode.Q.setValueAtTime(filterConfig.Q, time);

            // Apply filter envelope if specified
            if (filterConfig.envelope && filterConfig.envelope !== 0) {
                const peakFreq = filterConfig.frequency + filterConfig.envelope;
                filterNode.frequency.setValueAtTime(peakFreq, time);
                filterNode.frequency.exponentialRampToValueAtTime(
                    Math.max(filterConfig.frequency, 20),
                    time + envConfig.attack + envConfig.decay
                );
            }

            // Create amp envelope gain
            const envGain = context.createGain();
            envGain.gain.setValueAtTime(0.0001, time);

            // ADSR envelope
            const peakLevel = velocity * volume;
            const sustainLevel = peakLevel * envConfig.sustain;
            const attackEnd = time + envConfig.attack;
            const decayEnd = attackEnd + envConfig.decay;
            const releaseStart = time + duration - envConfig.release;
            const releaseEnd = time + duration;

            // Attack
            if (envConfig.attackCurve === 'exponential') {
                envGain.gain.exponentialRampToValueAtTime(Math.max(peakLevel, 0.0001), attackEnd);
            } else {
                envGain.gain.linearRampToValueAtTime(peakLevel, attackEnd);
            }

            // Decay to sustain
            envGain.gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);

            // Sustain hold
            envGain.gain.setValueAtTime(Math.max(sustainLevel, 0.0001), Math.max(releaseStart, decayEnd));

            // Release
            if (envConfig.releaseCurve === 'exponential') {
                envGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);
            } else {
                envGain.gain.linearRampToValueAtTime(0, releaseEnd);
            }

            // Connect: osc -> filter -> envGain -> master
            osc.connect(filterNode);
            filterNode.connect(envGain);
            envGain.connect(masterGainRef.current!);

            // Play
            osc.start(time);
            osc.stop(releaseEnd + 0.01);
        });

        return unsub;
    }, [context, subscribe, bypass]);

    return null;
};

/**
 * Safe version of useTriggerContext.
 */
function useTriggerContextSafe() {
    try {
        return useTriggerContext();
    } catch {
        return { subscribe: null, currentTrigger: null, trackId: null };
    }
}
