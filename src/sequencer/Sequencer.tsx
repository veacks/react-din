import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
    type FC,
    type ReactNode,
} from 'react';
import type { SequencerProps, SequencerContextValue } from './types';
import { useAudio } from '../core/AudioProvider';

/**
 * Default sequencer context value.
 */
const defaultValue: SequencerContextValue = {
    currentStep: 0,
    totalSteps: 16,
    isPlaying: false,
    bpm: 120,
    subscribe: () => () => { },
};

/**
 * Sequencer context for step timing.
 */
export const SequencerContext = createContext<SequencerContextValue>(defaultValue);

/**
 * Sequencer component that manages step timing and triggers.
 *
 * Provides a step-based sequencer that triggers its child Tracks
 * according to the tempo and step count.
 *
 * @example
 * ```tsx
 * <Sequencer bpm={120} steps={16} loop>
 *   <Track id="kick" pattern={[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0]}>
 *     <Sampler src="/kick.wav" />
 *   </Track>
 *   <Track id="snare" pattern={[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]}>
 *     <Sampler src="/snare.wav" />
 *   </Track>
 * </Sequencer>
 * ```
 */
export const Sequencer: FC<SequencerProps> = ({
    children,
    bpm = 120,
    steps = 16,
    autoStart = false,
    loop = true,
    lookAhead = 0.1,
    scheduleInterval = 25,
    onStep,
    onComplete,
    onStart,
    onStop,
}) => {
    const { context, isUnlocked } = useAudio();
    const [isPlaying, setIsPlaying] = useState(autoStart);
    const [currentStep, setCurrentStep] = useState(0);

    const subscribersRef = useRef<Set<(step: number, time: number) => void>>(new Set());
    const schedulerIntervalRef = useRef<number | null>(null);
    const nextStepTimeRef = useRef<number>(0);
    const currentStepRef = useRef<number>(0);

    // Calculate step duration from BPM (assuming 16th notes, 4 steps per beat)
    const stepDuration = 60 / bpm / 4;

    // Subscribe to step events
    const subscribe = useCallback((callback: (step: number, time: number) => void) => {
        subscribersRef.current.add(callback);
        return () => {
            subscribersRef.current.delete(callback);
        };
    }, []);

    // Start playback
    const start = useCallback(() => {
        if (!context || !isUnlocked) return;
        setIsPlaying(true);
        currentStepRef.current = 0;
        nextStepTimeRef.current = context.currentTime;
        onStart?.();
    }, [context, isUnlocked, onStart]);

    // Stop playback
    const stop = useCallback(() => {
        setIsPlaying(false);
        setCurrentStep(0);
        currentStepRef.current = 0;
        onStop?.();
    }, [onStop]);

    // Auto-start
    useEffect(() => {
        if (autoStart && isUnlocked && !isPlaying) {
            start();
        }
    }, [autoStart, isUnlocked, isPlaying, start]);

    // Scheduler
    useEffect(() => {
        if (!isPlaying || !context) return;

        const scheduler = () => {
            const currentTime = context.currentTime;

            while (nextStepTimeRef.current < currentTime + lookAhead) {
                const step = currentStepRef.current;
                const stepTime = nextStepTimeRef.current;

                // Notify subscribers
                subscribersRef.current.forEach((callback) => {
                    callback(step, stepTime);
                });

                // Fire onStep callback
                onStep?.(step, stepTime);

                // Update current step for UI
                setCurrentStep(step);

                // Move to next step
                currentStepRef.current++;
                nextStepTimeRef.current += stepDuration;

                // Handle loop or completion
                if (currentStepRef.current >= steps) {
                    if (loop) {
                        currentStepRef.current = 0;
                    } else {
                        setIsPlaying(false);
                        onComplete?.();
                        return;
                    }
                }
            }
        };

        // Run scheduler on interval
        schedulerIntervalRef.current = window.setInterval(scheduler, scheduleInterval);

        return () => {
            if (schedulerIntervalRef.current) {
                clearInterval(schedulerIntervalRef.current);
            }
        };
    }, [isPlaying, context, steps, loop, stepDuration, lookAhead, scheduleInterval, onStep, onComplete]);

    // Context value
    const value: SequencerContextValue = {
        currentStep,
        totalSteps: steps,
        isPlaying,
        bpm,
        subscribe,
    };

    return (
        <SequencerContext.Provider value={value}>
            {children}
        </SequencerContext.Provider>
    );
};

/**
 * Hook to access the sequencer context.
 */
export function useSequencer(): SequencerContextValue {
    return useContext(SequencerContext);
}
