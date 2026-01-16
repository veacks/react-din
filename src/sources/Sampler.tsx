import { useEffect, useRef, useState, type FC } from 'react';
import type { SamplerProps } from './types';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';

/**
 * Sampler component for playing audio buffers.
 *
 * Loads and plays audio files or pre-decoded AudioBuffers.
 *
 * @example
 * ```tsx
 * // From URL
 * <Sampler src="/samples/kick.wav" autoStart />
 *
 * // With options
 * <Sampler
 *   src="/samples/loop.wav"
 *   loop
 *   loopStart={0.5}
 *   loopEnd={2.5}
 *   playbackRate={1.2}
 * />
 * ```
 */
export const Sampler: FC<SamplerProps> = ({
    children,
    nodeRef: externalRef,
    src,
    autoStart = false,
    active,
    loop = false,
    loopStart = 0,
    loopEnd,
    playbackRate = 1,
    detune = 0,
    offset = 0,
    duration,
    onLoad,
    onEnded,
    onError,
}) => {
    const { context, isUnlocked } = useAudio();
    const { outputNode } = useAudioOut();

    const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const isPlayingRef = useRef(false);

    // Load buffer from URL if string
    useEffect(() => {
        if (!context) return;

        if (typeof src === 'string') {
            fetch(src)
                .then((response) => {
                    if (!response.ok) throw new Error(`Failed to load: ${src}`);
                    return response.arrayBuffer();
                })
                .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
                .then((decodedBuffer) => {
                    setBuffer(decodedBuffer);
                    onLoad?.(decodedBuffer);
                })
                .catch((error) => {
                    onError?.(error);
                });
        } else if (src instanceof AudioBuffer) {
            setBuffer(src);
        }
    }, [context, src, onLoad, onError]);

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<AudioBufferSourceNode | null>).current = sourceRef.current;
        }
    }, [externalRef, sourceRef.current]);

    // Play function
    const play = () => {
        if (!context || !buffer || !outputNode || isPlayingRef.current) return;

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.loopStart = loopStart;
        source.loopEnd = loopEnd ?? buffer.duration;
        source.playbackRate.value = playbackRate;
        source.detune.value = detune;

        source.connect(outputNode);

        source.onended = () => {
            isPlayingRef.current = false;
            sourceRef.current = null;
            onEnded?.();
        };

        const startTime = context.currentTime;
        const actualDuration = duration ?? (loop ? undefined : buffer.duration - offset);

        if (actualDuration) {
            source.start(startTime, offset, actualDuration);
        } else {
            source.start(startTime, offset);
        }

        sourceRef.current = source;
        isPlayingRef.current = true;

        if (externalRef) {
            (externalRef as React.MutableRefObject<AudioBufferSourceNode | null>).current = source;
        }
    };

    // Stop function
    const stop = () => {
        if (sourceRef.current && isPlayingRef.current) {
            try {
                sourceRef.current.stop();
            } catch {
                // Already stopped
            }
            isPlayingRef.current = false;
            sourceRef.current = null;
        }
    };

    // Auto-start
    useEffect(() => {
        if (autoStart && buffer && isUnlocked) {
            play();
        }
    }, [autoStart, buffer, isUnlocked]);

    // Active control
    useEffect(() => {
        if (active !== undefined) {
            if (active && buffer && isUnlocked) {
                play();
            } else if (!active) {
                stop();
            }
        }
    }, [active, buffer, isUnlocked]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    return (
        <AudioOutProvider node={outputNode}>
            {children}
        </AudioOutProvider>
    );
};
