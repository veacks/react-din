import { useState, useEffect } from 'react';
import { useTransport } from './useTransport';
import type { TimePosition } from './types';

/**
 * Hook that returns the current musical time position.
 * Updates reactively based on the subdivision.
 *
 * @param subdivision - Update frequency: 'step', 'beat', or 'bar'
 * @returns Current time position
 *
 * @example
 * ```tsx
 * function BeatDisplay() {
 *   const { beat, bar, step } = useBeat('step');
 *
 *   return (
 *     <div>
 *       Bar {bar + 1}, Beat {beat + 1}, Step {step + 1}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBeat(subdivision: 'step' | 'beat' | 'bar' = 'beat'): TimePosition {
    const transport = useTransport();
    const [position, setPosition] = useState<TimePosition>({
        step: transport.step,
        beat: transport.beat,
        bar: transport.bar,
        phrase: transport.phrase,
        totalSteps: transport.totalSteps,
        totalTime: transport.totalTime,
    });

    useEffect(() => {
        // Determine which value to watch based on subdivision
        let shouldUpdate = false;

        switch (subdivision) {
            case 'step':
                shouldUpdate = position.step !== transport.step;
                break;
            case 'beat':
                shouldUpdate = position.beat !== transport.beat;
                break;
            case 'bar':
                shouldUpdate = position.bar !== transport.bar;
                break;
        }

        if (shouldUpdate) {
            setPosition({
                step: transport.step,
                beat: transport.beat,
                bar: transport.bar,
                phrase: transport.phrase,
                totalSteps: transport.totalSteps,
                totalTime: transport.totalTime,
            });
        }
    }, [subdivision, transport.step, transport.beat, transport.bar, transport.phrase, transport.totalSteps, transport.totalTime, position.step, position.beat, position.bar]);

    return position;
}

/**
 * Hook that returns the current step.
 * Updates every step (16th note).
 *
 * @returns Current step number (0-indexed within beat)
 *
 * @example
 * ```tsx
 * function StepIndicator() {
 *   const step = useStep();
 *   return <div>Step: {step}</div>;
 * }
 * ```
 */
export function useStep(): number {
    const transport = useTransport();
    return transport.step;
}

/**
 * Hook that returns the current bar.
 * Updates every bar.
 *
 * @returns Current bar number (0-indexed within phrase)
 *
 * @example
 * ```tsx
 * function BarIndicator() {
 *   const bar = useBar();
 *   return <div>Bar: {bar + 1}</div>;
 * }
 * ```
 */
export function useBar(): number {
    const transport = useTransport();
    return transport.bar;
}

/**
 * Hook that returns the current phrase.
 * Updates every phrase.
 *
 * @returns Current phrase number (0-indexed)
 *
 * @example
 * ```tsx
 * function PhraseIndicator() {
 *   const phrase = usePhrase();
 *   return <div>Phrase: {phrase + 1}</div>;
 * }
 * ```
 */
export function usePhrase(): number {
    const transport = useTransport();
    return transport.phrase;
}
