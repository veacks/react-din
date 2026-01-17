// =============================================================================
// DrumSynth Component - Drum/Percussion Synthesizer
// =============================================================================

import { useEffect, useRef, type FC } from 'react';
import { useAudio } from '../core';
import { useTriggerContext } from '../sequencer/TriggerContext';
import type { EnvelopeConfig } from './types';
import { DEFAULT_ENVELOPE } from './types';

// =============================================================================
// Types
// =============================================================================

/**
 * Oscillator layer configuration for drum synthesis.
 */
export interface DrumOscillatorConfig {
    /**
     * Waveform type.
     * @default 'sine'
     */
    type?: OscillatorType;

    /**
     * Starting frequency in Hz.
     */
    frequency: number;

    /**
     * End frequency for pitch sweep (if different from start).
     */
    pitchDecay?: number;

    /**
     * Time for pitch to decay from start to end frequency.
     * @default 0.05
     */
    pitchDecayTime?: number;

    /**
     * Volume of this oscillator layer (0-1).
     * @default 1
     */
    gain?: number;

    /**
     * Duration of this oscillator in seconds.
     */
    duration?: number;
}

/**
 * Noise layer configuration for drum synthesis.
 */
export interface DrumNoiseConfig {
    /**
     * Noise type.
     * @default 'white'
     */
    type?: 'white' | 'pink' | 'brown';

    /**
     * Filter type for noise shaping.
     * @default 'highpass'
     */
    filterType?: BiquadFilterType;

    /**
     * Filter frequency in Hz.
     * @default 1000
     */
    filterFrequency?: number;

    /**
     * Filter Q (resonance).
     * @default 1
     */
    filterQ?: number;

    /**
     * Volume of this noise layer (0-1).
     * @default 0.5
     */
    gain?: number;

    /**
     * Duration of this noise layer in seconds.
     * @default 0.05
     */
    duration?: number;
}

/**
 * Props for DrumSynth component.
 */
export interface DrumSynthProps {
    /**
     * Oscillator layers (tone body, click transient, etc.).
     */
    oscillators?: DrumOscillatorConfig[];

    /**
     * Noise layers (snare rattle, hi-hat sizzle, etc.).
     */
    noise?: DrumNoiseConfig[];

    /**
     * Amplitude envelope configuration.
     */
    envelope?: EnvelopeConfig;

    /**
     * Overall volume (0-1).
     * @default 0.5
     */
    volume?: number;

    /**
     * Apply soft saturation/distortion.
     * @default false
     */
    saturation?: boolean;

    /**
     * Saturation amount (1-5).
     * @default 2
     */
    saturationAmount?: number;

    /**
     * Whether to bypass the synth.
     * @default false
     */
    bypass?: boolean;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Drum/Percussion Synthesizer.
 *
 * Flexible drum synth supporting:
 * - Multiple oscillator layers with pitch sweep
 * - Multiple noise layers with filtering
 * - Soft saturation for warmth
 * - ADSR envelope shaping
 *
 * @example
 * ```tsx
 * // 909-style kick
 * <DrumSynth
 *   oscillators={[
 *     { type: 'sine', frequency: 180, pitchDecay: 45, pitchDecayTime: 0.08, gain: 0.9 },
 *     { type: 'triangle', frequency: 4000, pitchDecay: 100, pitchDecayTime: 0.01, gain: 0.3, duration: 0.02 }
 *   ]}
 *   envelope={{ attack: 0.002, decay: 0.25, sustain: 0, release: 0.1 }}
 *   saturation
 * />
 *
 * // Hi-hat
 * <DrumSynth
 *   noise={[
 *     { type: 'white', filterType: 'highpass', filterFrequency: 9000, gain: 0.8, duration: 0.05 }
 *   ]}
 *   envelope={{ attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 }}
 * />
 * ```
 */
export const DrumSynth: FC<DrumSynthProps> = ({
    oscillators = [],
    noise = [],
    envelope = {},
    volume = 0.5,
    saturation = false,
    saturationAmount = 2,
    bypass = false,
}) => {
    const { context } = useAudio();
    const { subscribe } = useTriggerContextSafe();

    // Merge with defaults
    const envConfig = { ...DEFAULT_ENVELOPE, ...envelope };

    // Keep refs updated
    const paramsRef = useRef({
        oscillators, noise, envConfig, volume, saturation, saturationAmount
    });
    paramsRef.current = {
        oscillators, noise, envConfig, volume, saturation, saturationAmount
    };

    // Noise buffer cache
    const noiseBuffersRef = useRef<{
        white?: AudioBuffer;
        pink?: AudioBuffer;
        brown?: AudioBuffer;
    }>({});

    // Create noise buffers on mount
    useEffect(() => {
        if (!context) return;

        const bufferSize = context.sampleRate * 2;

        // White noise
        const whiteBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const whiteData = whiteBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            whiteData[i] = Math.random() * 2 - 1;
        }
        noiseBuffersRef.current.white = whiteBuffer;

        // Pink noise
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

        // Brown noise
        const brownBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const brownData = brownBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            brownData[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = brownData[i];
            brownData[i] *= 3.5;
        }
        noiseBuffersRef.current.brown = brownBuffer;
    }, [context]);

    // Subscribe to trigger events
    useEffect(() => {
        if (!context || !subscribe || bypass) return;

        const unsub = subscribe((event) => {
            const params = paramsRef.current;
            const { time, velocity, duration: stepDuration } = event;
            const now = time;

            // Create mixer node
            const mixer = context.createGain();
            mixer.gain.setValueAtTime(params.volume * velocity, now);

            // Apply saturation if enabled
            let outputNode: AudioNode = mixer;
            if (params.saturation) {
                const waveshaper = context.createWaveShaper();
                const curve = new Float32Array(256);
                for (let i = 0; i < 256; i++) {
                    const x = (i / 128) - 1;
                    curve[i] = Math.tanh(x * params.saturationAmount);
                }
                waveshaper.curve = curve;
                mixer.connect(waveshaper);
                outputNode = waveshaper;
            }

            outputNode.connect(context.destination);

            // Create oscillator layers
            params.oscillators.forEach((oscConfig) => {
                const osc = context.createOscillator();
                osc.type = oscConfig.type || 'sine';

                const startFreq = oscConfig.frequency;
                const endFreq = oscConfig.pitchDecay ?? startFreq;
                const pitchTime = oscConfig.pitchDecayTime ?? 0.05;
                const oscGain = oscConfig.gain ?? 1;
                const oscDuration = oscConfig.duration ?? stepDuration;

                // Set frequency with pitch sweep
                osc.frequency.setValueAtTime(startFreq, now);
                if (endFreq !== startFreq) {
                    osc.frequency.exponentialRampToValueAtTime(
                        Math.max(endFreq, 20),
                        now + pitchTime
                    );
                }

                // Create gain envelope for this oscillator
                const gain = context.createGain();
                gain.gain.setValueAtTime(0, now);

                // Attack
                const attackEnd = now + params.envConfig.attack;
                gain.gain.linearRampToValueAtTime(oscGain, attackEnd);

                // Decay to sustain
                const decayEnd = attackEnd + params.envConfig.decay;
                const sustainLevel = oscGain * params.envConfig.sustain;
                gain.gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);

                // Release
                const releaseEnd = now + oscDuration;
                gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

                // Connect
                osc.connect(gain);
                gain.connect(mixer);

                // Play
                osc.start(now);
                osc.stop(releaseEnd + 0.01);
            });

            // Create noise layers
            params.noise.forEach((noiseConfig) => {
                const noiseType = noiseConfig.type || 'white';
                const buffer = noiseBuffersRef.current[noiseType];
                if (!buffer) return;

                const source = context.createBufferSource();
                source.buffer = buffer;

                const noiseDuration = noiseConfig.duration ?? 0.05;
                const noiseGain = noiseConfig.gain ?? 0.5;

                // Create filter
                const filter = context.createBiquadFilter();
                filter.type = noiseConfig.filterType || 'highpass';
                filter.frequency.setValueAtTime(noiseConfig.filterFrequency ?? 1000, now);
                filter.Q.setValueAtTime(noiseConfig.filterQ ?? 1, now);

                // Create gain envelope
                const gain = context.createGain();
                gain.gain.setValueAtTime(0, now);

                // Attack
                const attackEnd = now + Math.min(params.envConfig.attack, 0.005);
                gain.gain.linearRampToValueAtTime(noiseGain, attackEnd);

                // Decay/Release (noise usually decays quickly)
                const releaseEnd = now + noiseDuration;
                gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

                // Connect
                source.connect(filter);
                filter.connect(gain);
                gain.connect(mixer);

                // Play
                source.start(now);
                source.stop(releaseEnd + 0.01);
            });
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
