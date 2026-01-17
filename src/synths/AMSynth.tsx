// =============================================================================
// AMSynth Component - Amplitude Modulation Synthesizer
// =============================================================================

import { useEffect, useRef, type FC } from 'react';
import { useAudio } from '../core';
import { useTriggerContext } from '../sequencer/TriggerContext';
import { noteToFreq } from '../notes';
import type { AMSynthProps } from './types';
import { DEFAULT_ENVELOPE, DEFAULT_OSCILLATOR, DEFAULT_FILTER } from './types';

/**
 * Amplitude modulation synthesizer.
 *
 * Uses a low-frequency oscillator to modulate the amplitude of the carrier,
 * creating tremolo-like effects and ring modulation timbres.
 *
 * @example
 * ```tsx
 * <Track id="am-pad" pattern={pattern}>
 *   <AMSynth
 *     notes={['C4', 'E4', 'G4']}
 *     carrier={{ type: 'sine' }}
 *     modulationRate={5}
 *     modulationDepth={0.5}
 *     envelope={{ attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 }}
 *   />
 * </Track>
 * ```
 */
export const AMSynth: FC<AMSynthProps> = ({
    notes = [],
    carrier = {},
    modulationRate = 4,
    modulationDepth = 0.5,
    envelope = {},
    filter = {},
    volume = 0.5,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const { context } = useAudio();
    const { subscribe } = useTriggerContextSafe();

    // Merge with defaults
    const carrierConfig = { ...DEFAULT_OSCILLATOR, ...carrier };
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const filterConfig = { ...DEFAULT_FILTER, ...filter };

    // Keep refs updated
    const paramsRef = useRef({
        notes, carrierConfig, modulationRate, modulationDepth,
        envConfig, filterConfig, volume
    });
    paramsRef.current = {
        notes, carrierConfig, modulationRate, modulationDepth,
        envConfig, filterConfig, volume
    };

    // Master gain node reference
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
        masterGainRef.current.gain.value = 1;
        masterGainRef.current.connect(context.destination);

        return () => {
            masterGainRef.current?.disconnect();
            masterGainRef.current = null;
        };
    }, [context]);

    // Subscribe to trigger events
    useEffect(() => {
        if (!context || !subscribe || bypass) return;

        const unsub = subscribe((event) => {
            const params = paramsRef.current;
            const { time, step, velocity, duration } = event;

            if (!masterGainRef.current) return;

            // Get note for this step
            const noteInput = params.notes[step % params.notes.length];
            if (noteInput === undefined || noteInput === null) return;

            const frequency = typeof noteInput === 'number'
                ? noteToFreq(noteInput)
                : noteToFreq(noteInput);

            // Create carrier oscillator
            const carrierOsc = context.createOscillator();
            carrierOsc.type = params.carrierConfig.type;
            carrierOsc.frequency.setValueAtTime(frequency, time);

            // Create modulation LFO
            const lfo = context.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(params.modulationRate, time);

            // LFO gain (depth control)
            const lfoGain = context.createGain();
            const baseLevel = 1 - params.modulationDepth / 2;
            lfoGain.gain.setValueAtTime(params.modulationDepth / 2, time);

            // AM modulation gain
            const amGain = context.createGain();
            amGain.gain.setValueAtTime(baseLevel, time);

            // Connect LFO to modulate the AM gain
            lfo.connect(lfoGain);
            lfoGain.connect(amGain.gain);

            // Create filter
            const filterNode = context.createBiquadFilter();
            filterNode.type = params.filterConfig.type;
            filterNode.frequency.setValueAtTime(params.filterConfig.frequency, time);
            filterNode.Q.setValueAtTime(params.filterConfig.Q, time);

            // Create amp envelope
            const envGain = context.createGain();
            envGain.gain.setValueAtTime(0.0001, time);

            const peakLevel = velocity * params.volume;
            const sustainLevel = peakLevel * params.envConfig.sustain;
            const attackEnd = time + params.envConfig.attack;
            const decayEnd = attackEnd + params.envConfig.decay;
            const releaseStart = time + duration - params.envConfig.release;
            const releaseEnd = time + duration;

            // Attack
            envGain.gain.linearRampToValueAtTime(peakLevel, attackEnd);
            // Decay
            envGain.gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);
            // Sustain
            envGain.gain.setValueAtTime(Math.max(sustainLevel, 0.0001), Math.max(releaseStart, decayEnd));
            // Release
            envGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

            // Connect: carrier -> amGain -> filter -> envGain -> master
            carrierOsc.connect(amGain);
            amGain.connect(filterNode);
            filterNode.connect(envGain);
            envGain.connect(masterGainRef.current!);

            // Play
            lfo.start(time);
            carrierOsc.start(time);
            lfo.stop(releaseEnd + 0.01);
            carrierOsc.stop(releaseEnd + 0.01);
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
