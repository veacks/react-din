import { useRef, useState, useEffect, useCallback, type RefObject, type ReactNode } from 'react';
import { useOnTrigger } from '../sequencer/useTrigger';
import { useAudio } from '../core';
import { midiToFreq } from '../notes';
import type { TriggerEvent } from '../sequencer/types';

/**
 * Props passed to the Voice render function.
 */
export interface VoiceRenderProps {
    /** Gate signal for connection to Envelope (true = Note On) */
    gate: boolean;
    /** Velocity 0-1 */
    velocity: number;
    /** Frequency in Hz */
    frequency: number;
    /** Duration in seconds */
    duration: number;
    /** Ref for OscillatorNode - allows Voice to schedule frequency changes */
    oscRef: RefObject<OscillatorNode | null>;
    /** Ref for BiquadFilterNode - allows Voice to schedule filter changes (future) */
    filterRef: RefObject<BiquadFilterNode | null>;
    /** Ref for GainNode - allows Voice to schedule volume changes (future) */
    gainRef: RefObject<GainNode | null>;
}

export interface VoiceProps {
    /** Render function for the voice patch */
    children: (props: VoiceRenderProps) => ReactNode;
    /** Map of MIDI note to frequency (optional override) */
    notes?: Record<number, number> | ((note: number) => number);
    /** Portamento time in seconds @default 0 */
    portamento?: number;
    /** Manual event override (for PolyVoice) */
    event?: TriggerEvent | null;
}

/**
 * Voice Component - Monophonic voice controller.
 * 
 * Captures triggers from the sequencer (or parent PolyVoice) and exposes
 * control signals (gate, freq, etc.) to its children components via a render prop.
 * 
 * It manages direct scheduling of critical AudioParams (like Oscillator frequency)
 * to ensure sample-accurate timing, avoiding React render latency for pitch changes.
 */
export const Voice = ({
    children,
    portamento = 0,
    notes,
    event: propEvent
}: VoiceProps) => {
    // Refs for imperative access to nodes
    const oscRef = useRef<OscillatorNode>(null);
    const filterRef = useRef<BiquadFilterNode>(null);
    const gainRef = useRef<GainNode>(null);

    // State for declarative props
    const [gate, setGate] = useState(false);
    const [velocity, setVelocity] = useState(0);
    const [frequency, setFrequency] = useState(440);
    const [duration, setDuration] = useState(0);

    const { context } = useAudio();

    // Helper to process a trigger event
    const processEvent = useCallback((event: TriggerEvent) => {
        if (!context) return;

        // Calculate Frequency
        let freq = 440;
        if (notes) {
            if (typeof notes === 'function') {
                freq = notes(event.note);
            } else {
                freq = notes[event.note] || midiToFreq(event.note);
            }
        } else {
            freq = midiToFreq(event.note);
        }

        // Schedule Frequency on Oscillator (Sample Accurate)
        if (oscRef.current) {
            const now = event.time;
            const osc = oscRef.current;

            // Cancel any scheduled changes to be safe
            try {
                osc.frequency.cancelScheduledValues(now);
            } catch (e) {
                // Ignore error if valid state
            }

            if (portamento > 0) {
                osc.frequency.setTargetAtTime(freq, now, portamento);
            } else {
                osc.frequency.setValueAtTime(freq, now);
            }
        }

        // Apply to state for declarative usage
        setFrequency(freq);
        setVelocity(event.velocity);
        setDuration(event.duration);
        setGate(true);

        // Note Off logic?
        // Note Off is usually handled by the sequencer sending a Note Off event, 
        // OR by the duration provided in the Note On event.
        // react-din sequencer sends atomic events with duration.
        // The Envelope component usually handles duration auto-release.
        // But if we want `gate` to go false, we need to schedule that state update?
        // React state timing is not reliable for duration end. 
        // It's better if `Envelope` handles `duration` prop logic internally.
        // We just leave `gate` true until next event? 
        // Or we toggle it off after duration to represent "key release"?
        if (event.duration > 0) {
            // We set a timeout to turn off gate for visual/logic consistency
            const timeout = setTimeout(() => {
                setGate(false);
            }, event.duration * 1000);
            return () => clearTimeout(timeout);
        }
    }, [context, notes, portamento]);

    // Mode 1: Controlled via prop (PolyVoice)
    useEffect(() => {
        if (propEvent) {
            processEvent(propEvent);
        } else if (propEvent === null && portamento === 0) {
            // If explicit null passed (voice setup/cleared), maybe reset gate?
            // But usually we just wait for next event.
        }
    }, [propEvent, processEvent, portamento]);

    // Mode 2: Autonomous (Sequencer Subscription)
    // Only subscribe if no propEvent is passed/managed (implied by usage context)
    // Actually, `useOnTrigger` will always subscribe if called.
    // We should only use `useOnTrigger` if `propEvent` is undefined.
    const shouldUseTrigger = propEvent === undefined;

    // We can't conditionally call hooks.
    // So we use the hook providing a dummy callback if we are controlled?
    // Or we rely on `useOnTrigger`'s options to filter? No.
    // `useTrigger` hook architecture might make conditional subscription hard?
    // The `useOnTrigger` hook subscribes on mount.
    // We can just ignore the callback if we are in controlled mode.

    useOnTrigger((event) => {
        if (shouldUseTrigger) {
            processEvent(event);
        }
    });

    const renderProps: VoiceRenderProps = {
        gate,
        velocity,
        frequency,
        duration,
        oscRef,
        filterRef,
        gainRef
    };

    return <>{children(renderProps)}</>;
};
