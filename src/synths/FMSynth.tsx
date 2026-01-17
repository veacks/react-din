// =============================================================================
// FMSynth Component - Two-Operator FM Synthesizer
// =============================================================================

import { useEffect, useRef, type FC } from 'react';
import { useAudio } from '../core';
import { useTriggerContext } from '../sequencer/TriggerContext';
import { noteToFreq } from '../notes';
import type { FMSynthProps } from './types';
import { DEFAULT_ENVELOPE, DEFAULT_OSCILLATOR, DEFAULT_FILTER } from './types';

/**
 * Two-operator FM synthesizer.
 *
 * Uses frequency modulation where a modulator oscillator modulates
 * the frequency of a carrier oscillator, creating complex harmonic content.
 *
 * @example
 * ```tsx
 * <Track id="fm-lead" pattern={pattern}>
 *   <FMSynth
 *     notes={['C4', 'E4', 'G4']}
 *     carrier={{ type: 'sine' }}
 *     modulator={{ type: 'sine' }}
 *     modulationRatio={2}
 *     modulationIndex={3}
 *     envelope={{ attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 }}
 *   />
 * </Track>
 * ```
 */
export const FMSynth: FC<FMSynthProps> = ({
    notes = [],
    carrier = {},
    modulator = {},
    modulationRatio = 1,
    modulationIndex = 1,
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
    const modulatorConfig = { ...DEFAULT_OSCILLATOR, ...modulator };
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const filterConfig = { ...DEFAULT_FILTER, ...filter };

    // Keep refs updated
    const paramsRef = useRef({
        notes, carrierConfig, modulatorConfig, modulationRatio, modulationIndex,
        envConfig, filterConfig, volume
    });
    paramsRef.current = {
        notes, carrierConfig, modulatorConfig, modulationRatio, modulationIndex,
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

            const carrierFreq = typeof noteInput === 'number'
                ? noteToFreq(noteInput)
                : noteToFreq(noteInput);

            const modulatorFreq = carrierFreq * params.modulationRatio;
            const modulationAmount = carrierFreq * params.modulationIndex;

            // Create modulator oscillator
            const modOsc = context.createOscillator();
            modOsc.type = params.modulatorConfig.type;
            modOsc.frequency.setValueAtTime(modulatorFreq, time);

            // Modulator gain (controls depth)
            const modGain = context.createGain();
            modGain.gain.setValueAtTime(modulationAmount, time);

            // Create carrier oscillator
            const carrierOsc = context.createOscillator();
            carrierOsc.type = params.carrierConfig.type;
            carrierOsc.frequency.setValueAtTime(carrierFreq, time);

            // Connect modulator to carrier's frequency
            modOsc.connect(modGain);
            modGain.connect(carrierOsc.frequency);

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

            // Connect: carrier -> filter -> envGain -> master
            carrierOsc.connect(filterNode);
            filterNode.connect(envGain);
            envGain.connect(masterGainRef.current!);

            // Play
            modOsc.start(time);
            carrierOsc.start(time);
            modOsc.stop(releaseEnd + 0.01);
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
