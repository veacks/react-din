import { useEffect, useRef, useState, type FC } from 'react';
import type { ReactNode } from 'react';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut, AudioOutProvider } from '../core/AudioOutContext';
import { useTrigger } from '../sequencer/useTrigger';

/**
 * Props for TriggeredSampler.
 */
export interface TriggeredSamplerProps {
    children?: ReactNode;
    src?: string | AudioBuffer;
    autoStart?: boolean;
    active?: boolean;
    loop?: boolean;
    playbackRate?: number;
    detune?: number;
    offset?: number;
    duration?: number;
}

/**
 * Trigger-aware sampler source.
 *
 * Uses `useTrigger()` from the nearest trigger context and plays
 * one-shot samples on each emitted trigger.
 */
export const TriggeredSampler: FC<TriggeredSamplerProps> = ({
    children,
    src,
    autoStart = false,
    active,
    loop = false,
    playbackRate = 1,
    detune = 0,
    offset = 0,
    duration,
}) => {
    const { context, isUnlocked } = useAudio();
    const { outputNode } = useAudioOut();
    const trigger = useTrigger();
    const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const activeRef = useRef(false);

    useEffect(() => {
        if (!context || !src) return;

        let cancelled = false;

        if (typeof src === 'string') {
            fetch(src)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to load sampler source: ${src}`);
                    }
                    return response.arrayBuffer();
                })
                .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
                .then((decodedBuffer) => {
                    if (!cancelled) {
                        setBuffer(decodedBuffer);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setBuffer(null);
                    }
                });
        } else {
            setBuffer(src);
        }

        return () => {
            cancelled = true;
        };
    }, [context, src]);

    const stop = () => {
        const source = sourceRef.current;
        if (!source) return;
        try {
            source.stop();
        } catch {
            // Ignore stop races during retriggering.
        }
        sourceRef.current = null;
    };

    const play = (playDuration?: number) => {
        if (!context || !outputNode || !buffer || !isUnlocked) return;

        stop();

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.playbackRate.value = playbackRate;
        source.detune.value = detune;
        source.connect(outputNode);
        source.onended = () => {
            if (sourceRef.current === source) {
                sourceRef.current = null;
            }
        };

        sourceRef.current = source;

        if (loop || !playDuration) {
            source.start(context.currentTime, offset);
        } else {
            source.start(context.currentTime, offset, playDuration);
        }

        if (loop && playDuration) {
            window.setTimeout(() => {
                if (sourceRef.current === source) {
                    stop();
                }
            }, playDuration * 1000);
        }
    };

    useEffect(() => {
        if (autoStart && active === undefined && buffer && isUnlocked) {
            play(duration);
        }
        // Intentionally scoped to source/loading changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart, active, buffer, isUnlocked, src]);

    useEffect(() => {
        if (!trigger || active !== undefined) return;
        play(trigger.duration);
        // Intentionally scoped to trigger edges.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger, active]);

    useEffect(() => {
        if (active === undefined) return;

        if (active && !activeRef.current) {
            play(duration);
        } else if (!active && activeRef.current && loop) {
            stop();
        }

        activeRef.current = active;
        // Intentionally scoped to active edge changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, duration, loop]);

    useEffect(() => () => stop(), []);

    return (
        <AudioOutProvider node={outputNode}>
            {children}
        </AudioOutProvider>
    );
};
