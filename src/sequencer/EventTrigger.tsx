import { useEffect, useRef, type FC } from 'react';
import { useAudio } from '../core/AudioProvider';
import { TriggerProvider } from './TriggerContext';
import type { EventTriggerProps, TriggerEvent } from './types';

function isRisingValue(previous: unknown, next: unknown): boolean {
    if (typeof previous === 'number' && typeof next === 'number') {
        return next > previous;
    }

    if (typeof previous === 'boolean' && typeof next === 'boolean') {
        return !previous && next;
    }

    if (previous == null && next != null) {
        return true;
    }

    return false;
}

/**
 * EventTrigger component.
 *
 * Bridges UI/application events into the sequencer trigger contract
 * without requiring a running Sequencer/Track timeline.
 */
export const EventTrigger: FC<EventTriggerProps> = ({
    children,
    token,
    mode = 'change',
    cooldownMs = 0,
    velocity = 1,
    duration = 0.1,
    note = 60,
    trackId = 'event',
    data,
}) => {
    const { context } = useAudio();

    const subscribersRef = useRef<Set<(event: TriggerEvent) => void>>(new Set());
    const currentTriggerRef = useRef<TriggerEvent | null>(null);
    const hasSeenTokenRef = useRef(false);
    const previousTokenRef = useRef<unknown>(token);
    const lastEmitAtRef = useRef<number>(-Infinity);

    useEffect(() => {
        if (!hasSeenTokenRef.current) {
            previousTokenRef.current = token;
            hasSeenTokenRef.current = true;
            return;
        }

        const previous = previousTokenRef.current;
        previousTokenRef.current = token;

        const shouldEmit = mode === 'rising'
            ? isRisingValue(previous, token)
            : !Object.is(previous, token);

        if (!shouldEmit) return;

        const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if ((nowMs - lastEmitAtRef.current) < cooldownMs) {
            return;
        }

        lastEmitAtRef.current = nowMs;

        const event: TriggerEvent = {
            step: 0,
            velocity: Math.max(0, Math.min(1, velocity)),
            time: context?.currentTime ?? 0,
            duration: Math.max(0, duration),
            trackId,
            note,
            data,
        };

        currentTriggerRef.current = event;
        subscribersRef.current.forEach((callback) => callback(event));
    }, [token, mode, cooldownMs, velocity, duration, note, trackId, data, context]);

    const subscribeToTrigger = (callback: (event: TriggerEvent) => void) => {
        subscribersRef.current.add(callback);
        return () => {
            subscribersRef.current.delete(callback);
        };
    };

    return (
        <TriggerProvider
            trackId={trackId}
            subscribe={subscribeToTrigger}
            currentTrigger={currentTriggerRef.current}
        >
            {children}
        </TriggerProvider>
    );
};
