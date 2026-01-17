// =============================================================================
// MonoSynth Component - Monophonic Synthesizer with Filter Envelope
// =============================================================================

import { useEffect, useRef, type FC } from 'react';
import { useAudio } from '../core';
import { useTriggerContext } from '../sequencer/TriggerContext';
import { noteToFreq } from '../notes';
import type { MonoSynthProps } from './types';
import { DEFAULT_ENVELOPE, DEFAULT_OSCILLATOR, DEFAULT_FILTER } from './types';

/**
 * Monophonic synthesizer with filter envelope and accent support.
 *
 * Ideal for TB-303 style acid bass lines with squelchy filter sweeps.
 * Supports accents for emphasized notes and portamento for glide effects.
 *
 * @example
 * ```tsx
 * <Track id="acid" pattern={pattern}>
 *   <MonoSynth
 *     notes={['C3', 'C3', 'G3', 'C4']}
 *     accents={[1, 0, 0, 1]}
 *     oscillator={{ type: 'sawtooth' }}
 *     envelope={{ attack: 0.003, decay: 0.1, sustain: 0.6, release: 0.1 }}
 *     filter={{
 *       type: 'lowpass',
 *       frequency: 600,
 *       Q: 15,
 *       envelope: 3000  // Filter sweep amount
 *     }}
 *   />
 * </Track>
 * ```
 */
export const MonoSynth: FC<MonoSynthProps> = ({
    notes = [],
    accents = [],
    oscillator = {},
    envelope = {},
    filter = {},
    volume = 0.5,
    portamento = 0,
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
    const paramsRef = useRef({ notes, accents, oscConfig, envConfig, filterConfig, volume, portamento });
    paramsRef.current = { notes, accents, oscConfig, envConfig, filterConfig, volume, portamento };

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
            const { notes, accents, oscConfig, envConfig, filterConfig, volume, portamento } = paramsRef.current;
            const { time, step, velocity, duration } = event;

            if (!masterGainRef.current) return;

            // Get note for this step
            const noteInput = notes[step % notes.length];
            if (noteInput === undefined || noteInput === null) return;

            const frequency = typeof noteInput === 'number'
                ? noteToFreq(noteInput)
                : noteToFreq(noteInput);

            // Check for accent
            const isAccent = accents.length > 0 && (accents[step % accents.length] === 1 || accents[step % accents.length] === true);
            const accentMultiplier = isAccent ? 1.5 : 1;

            // Create main oscillator (sawtooth for classic 303)
            const osc = context.createOscillator();
            osc.type = oscConfig.type;
            osc.frequency.setValueAtTime(frequency, time);
            if (oscConfig.detune) {
                osc.detune.setValueAtTime(oscConfig.detune, time);
            }

            // Create sub oscillator for thickness
            const oscSub = context.createOscillator();
            oscSub.type = 'square';
            oscSub.frequency.setValueAtTime(frequency, time);

            // Create resonant low-pass filter
            const filterNode = context.createBiquadFilter();
            filterNode.type = filterConfig.type;
            filterNode.Q.setValueAtTime(filterConfig.Q, time);

            // Filter envelope - more aggressive for accents
            const envAmount = filterConfig.envelope || 0;
            const peakCutoff = filterConfig.frequency + (isAccent ? envAmount * 2 : envAmount);
            filterNode.frequency.setValueAtTime(Math.max(peakCutoff, 20), time);
            filterNode.frequency.exponentialRampToValueAtTime(
                Math.max(filterConfig.frequency, 20),
                time + 0.12
            );

            // Amp envelope gains
            const ampLevel = (isAccent ? 0.35 : 0.22) * velocity * volume * accentMultiplier;

            const gainSaw = context.createGain();
            gainSaw.gain.setValueAtTime(0, time);
            gainSaw.gain.linearRampToValueAtTime(ampLevel, time + envConfig.attack);
            gainSaw.gain.setValueAtTime(ampLevel * 0.9, time + duration * 0.7);
            gainSaw.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.95);

            const gainSub = context.createGain();
            gainSub.gain.setValueAtTime(0, time);
            gainSub.gain.linearRampToValueAtTime(ampLevel * 0.3, time + envConfig.attack);
            gainSub.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.9);

            // Soft saturation
            const waveshaper = context.createWaveShaper();
            const curve = new Float32Array(256);
            for (let i = 0; i < 256; i++) {
                const x = (i / 128) - 1;
                curve[i] = Math.tanh(x * 2.5);
            }
            waveshaper.curve = curve;

            const master = context.createGain();
            master.gain.setValueAtTime(0.7, time);

            // Connect: oscs -> gains -> filter -> waveshaper -> master -> output
            osc.connect(gainSaw);
            oscSub.connect(gainSub);
            gainSaw.connect(filterNode);
            gainSub.connect(filterNode);
            filterNode.connect(waveshaper);
            waveshaper.connect(master);
            master.connect(masterGainRef.current!);

            // Play
            osc.start(time);
            oscSub.start(time);
            osc.stop(time + duration);
            oscSub.stop(time + duration);
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
