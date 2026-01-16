import { useState, useEffect, useRef } from 'react';
import { useTriggerContext } from './TriggerContext';
import type { TriggerEvent, UseTriggerOptions } from './types';

/**
 * Hook to receive trigger events from the sequencer.
 * Scoped to the parent Track by default.
 *
 * @param options - Optional configuration
 * @returns The current trigger event, or null if no trigger
 *
 * @example
 * ```tsx
 * function DrumSound() {
 *   const trigger = useTrigger();
 *
 *   useEffect(() => {
 *     if (trigger) {
 *       playSound(trigger.time, trigger.velocity);
 *     }
 *   }, [trigger]);
 *
 *   return null;
 * }
 * ```
 */
export function useTrigger(options: UseTriggerOptions = {}): TriggerEvent | null {
    const { trackId: filterTrackId, debounce, steps: filterSteps } = options;
    const { subscribe, currentTrigger: _currentTrigger, trackId: _trackId } = useTriggerContext();

    const [trigger, setTrigger] = useState<TriggerEvent | null>(null);
    const lastTriggerTimeRef = useRef<number>(0);

    useEffect(() => {
        const unsubscribe = subscribe((event) => {
            // Filter by track ID if specified
            if (filterTrackId && event.trackId !== filterTrackId) {
                return;
            }

            // Filter by steps if specified
            if (filterSteps && !filterSteps.includes(event.step)) {
                return;
            }

            // Apply debounce
            if (debounce) {
                const now = performance.now();
                if (now - lastTriggerTimeRef.current < debounce) {
                    return;
                }
                lastTriggerTimeRef.current = now;
            }

            setTrigger(event);
        });

        return unsubscribe;
    }, [subscribe, filterTrackId, filterSteps, debounce]);

    // Clear trigger after processing
    useEffect(() => {
        if (trigger) {
            const timeout = setTimeout(() => setTrigger(null), 10);
            return () => clearTimeout(timeout);
        }
    }, [trigger]);

    return trigger;
}

/**
 * Hook to subscribe to trigger events with a callback.
 * More efficient than useTrigger for side effects.
 *
 * @param callback - Function to call on each trigger
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * function Synth() {
 *   const oscillatorRef = useRef<OscillatorNode>(null);
 *
 *   useOnTrigger((event) => {
 *     if (oscillatorRef.current) {
 *       oscillatorRef.current.start(event.time);
 *       oscillatorRef.current.stop(event.time + event.duration);
 *     }
 *   });
 *
 *   return <Osc ref={oscillatorRef} />;
 * }
 * ```
 */
export function useOnTrigger(
    callback: (event: TriggerEvent) => void,
    options: UseTriggerOptions = {}
): void {
    const { trackId: filterTrackId, debounce, steps: filterSteps } = options;
    const { subscribe } = useTriggerContext();

    const callbackRef = useRef(callback);
    const lastTriggerTimeRef = useRef<number>(0);

    // Update callback ref
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const unsubscribe = subscribe((event) => {
            // Filter by track ID if specified
            if (filterTrackId && event.trackId !== filterTrackId) {
                return;
            }

            // Filter by steps if specified
            if (filterSteps && !filterSteps.includes(event.step)) {
                return;
            }

            // Apply debounce
            if (debounce) {
                const now = performance.now();
                if (now - lastTriggerTimeRef.current < debounce) {
                    return;
                }
                lastTriggerTimeRef.current = now;
            }

            callbackRef.current(event);
        });

        return unsubscribe;
    }, [subscribe, filterTrackId, filterSteps, debounce]);
}
