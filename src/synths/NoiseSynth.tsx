// =============================================================================
// NoiseSynth Component - Noise-based Synthesizer
// =============================================================================

import { useEffect, useRef, type FC } from 'react';
import { useAudio } from '../core';
import { useTriggerContext } from '../sequencer/TriggerContext';
import type { NoiseSynthProps } from './types';
import { DEFAULT_ENVELOPE, DEFAULT_FILTER } from './types';

/**
 * Noise-based synthesizer.
 *
 * Generates white, pink, or brown noise with filtering and envelope shaping.
 * Useful for percussion sounds, hi-hats, snares, and ambient textures.
 *
 * @example
 * ```tsx
 * <Track id="snare" pattern={pattern}>
 *   <NoiseSynth
 *     noiseType="white"
 *     filter={{ type: 'bandpass', frequency: 1200, Q: 2 }}
 *     envelope={{ attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.2 }}
 *   />
 * </Track>
 * ```
 */
export const NoiseSynth: FC<NoiseSynthProps> = ({
    noiseType = 'white',
    envelope = {},
    filter = {},
    volume = 0.5,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const { context } = useAudio();
    const { subscribe } = useTriggerContextSafe();

    // Merge with defaults
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };
    const filterConfig = { ...DEFAULT_FILTER, ...filter };

    // Keep refs updated
    const paramsRef = useRef({ noiseType, envConfig, filterConfig, volume });
    paramsRef.current = { noiseType, envConfig, filterConfig, volume };

    // Master gain node reference
    const masterGainRef = useRef<GainNode | null>(null);

    // Noise buffer cache
    const noiseBuffersRef = useRef<{
        white?: AudioBuffer;
        pink?: AudioBuffer;
        brown?: AudioBuffer;
    }>({});

    useEffect(() => {
        if (externalRef && masterGainRef.current) {
            (externalRef as React.MutableRefObject<GainNode | null>).current = masterGainRef.current;
        }
    }, [externalRef, masterGainRef.current]);

    // Create master gain and noise buffers
    useEffect(() => {
        if (!context) return;

        masterGainRef.current = context.createGain();
        masterGainRef.current.gain.value = 1;
        masterGainRef.current.connect(context.destination);

        // Generate noise buffers (2 seconds each)
        const bufferSize = context.sampleRate * 2;

        // White noise
        const whiteBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const whiteData = whiteBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            whiteData[i] = Math.random() * 2 - 1;
        }
        noiseBuffersRef.current.white = whiteBuffer;

        // Pink noise (using Paul Kellet's algorithm)
        const pinkBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const pinkData = pinkBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        noiseBuffersRef.current.pink = pinkBuffer;

        // Brown noise (integration of white noise)
        const brownBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const brownData = brownBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            brownData[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = brownData[i];
            brownData[i] *= 3.5; // Compensate for volume
        }
        noiseBuffersRef.current.brown = brownBuffer;

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
            const { time, velocity, duration } = event;

            if (!masterGainRef.current) return;

            // Get noise buffer
            const buffer = noiseBuffersRef.current[params.noiseType];
            if (!buffer) return;

            // Create noise source
            const source = context.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

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

            // Connect: source -> filter -> envGain -> master
            source.connect(filterNode);
            filterNode.connect(envGain);
            envGain.connect(masterGainRef.current!);

            // Play
            source.start(time);
            source.stop(releaseEnd + 0.01);
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
