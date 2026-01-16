import type { ReactNode, RefObject } from 'react';

// =============================================================================
// Base Source Props
// =============================================================================

/**
 * Common props for all audio source components.
 */
export interface SourceNodeProps {
    children?: ReactNode;

    /**
     * Start the source immediately on mount.
     * @default false
     */
    autoStart?: boolean;

    /**
     * Ref to access the underlying source node.
     */
    nodeRef?: RefObject<AudioScheduledSourceNode | null>;

    /**
     * Whether this source is currently active.
     * Useful for one-shot sources that need to be re-triggered.
     */
    active?: boolean;
}

// =============================================================================
// Sampler
// =============================================================================

/**
 * Props for the Sampler component (audio buffer playback).
 */
export interface SamplerProps extends SourceNodeProps {
    /**
     * Audio source: URL string or pre-decoded AudioBuffer.
     */
    src: string | AudioBuffer;

    /**
     * Loop the sample.
     * @default false
     */
    loop?: boolean;

    /**
     * Loop start point in seconds.
     * @default 0
     */
    loopStart?: number;

    /**
     * Loop end point in seconds.
     * @default <buffer duration>
     */
    loopEnd?: number;

    /**
     * Playback rate (1 = normal speed).
     * 2 = double speed (one octave up)
     * 0.5 = half speed (one octave down)
     * @default 1
     */
    playbackRate?: number;

    /**
     * Detune in cents.
     * 100 cents = 1 semitone
     * @default 0
     */
    detune?: number;

    /**
     * Start offset in seconds.
     * Where in the buffer to start playback.
     * @default 0
     */
    offset?: number;

    /**
     * Duration to play in seconds.
     * @default <entire buffer>
     */
    duration?: number;

    /**
     * Callback when the buffer is loaded (if URL provided).
     */
    onLoad?: (buffer: AudioBuffer) => void;

    /**
     * Callback when playback ends.
     */
    onEnded?: () => void;

    /**
     * Callback on loading/playback error.
     */
    onError?: (error: Error) => void;

    /**
     * Override nodeRef type for AudioBufferSourceNode.
     */
    nodeRef?: RefObject<AudioBufferSourceNode | null>;
}

// =============================================================================
// Noise
// =============================================================================

/**
 * Types of noise.
 */
export type NoiseType = 'white' | 'pink' | 'brown' | 'blue' | 'violet';

/**
 * Props for the Noise generator component.
 */
export interface NoiseProps extends SourceNodeProps {
    /**
     * Type of noise to generate.
     * - white: Equal energy per frequency (harsh/hissy)
     * - pink: Equal energy per octave (natural sounding)
     * - brown: -6dB per octave (rumble/thunder)
     * - blue: +3dB per octave (bright)
     * - violet: +6dB per octave (very bright)
     * @default 'white'
     */
    type?: NoiseType;

    /**
     * Buffer size for noise generation.
     * Larger = more CPU efficient but higher latency.
     * @default 4096
     */
    bufferSize?: number;
}

// =============================================================================
// MediaStream
// =============================================================================

/**
 * Props for the MediaStream source component.
 */
export interface MediaStreamProps {
    children?: ReactNode;
    /**
     * Existing MediaStream to use (e.g., from getUserMedia).
     */
    stream?: MediaStream;

    /**
     * Automatically request microphone access on mount.
     * @default false
     */
    requestMic?: boolean;

    /**
     * Audio constraints for getUserMedia.
     */
    constraints?: MediaTrackConstraints;

    /**
     * Callback when stream is acquired.
     */
    onStream?: (stream: MediaStream) => void;

    /**
     * Callback on error (e.g., permission denied).
     */
    onError?: (error: Error) => void;

    /**
     * Override nodeRef type for MediaStreamAudioSourceNode.
     */
    nodeRef?: RefObject<MediaStreamAudioSourceNode | null>;
}

// =============================================================================
// Constant Source
// =============================================================================

/**
 * Props for the ConstantSource component.
 * Outputs a constant value, useful for modulation.
 */
export interface ConstantSourceProps extends SourceNodeProps {
    /**
     * The constant output value.
     * @default 1
     */
    offset?: number;

    /**
     * Override nodeRef type for ConstantSourceNode.
     */
    nodeRef?: RefObject<ConstantSourceNode | null>;
}
