import { useState, useMemo, type ReactNode } from 'react';
import { useOnTrigger } from '../sequencer/useTrigger';
import { Voice, type VoiceRenderProps, type VoiceProps } from './Voice';
import type { TriggerEvent } from '../sequencer/types';

export interface PolyVoiceProps {
    /** Number of polyphonic voices @default 4 */
    voices?: number;
    /** Render function for each voice */
    children: (props: VoiceRenderProps) => ReactNode;
    /** Map of MIDI note to frequency */
    notes?: VoiceProps['notes'];
    /** Portamento time in seconds @default 0 */
    portamento?: number;
}

interface VoiceState {
    id: number;
    event: TriggerEvent | null;
    lastTriggerTime: number;
}

/**
 * PolyVoice Component - Polyphonic voice allocator.
 * 
 * Manages a pool of Voice components and routes incoming sequencer triggers
 * to available voices using a simple voice stealing algorithm (oldest trigger).
 */
export const PolyVoice = ({
    voices = 4,
    children,
    notes,
    portamento = 0
}: PolyVoiceProps) => {
    // Initialize pool of voices
    const [voicePool, setVoicePool] = useState<VoiceState[]>(() =>
        Array.from({ length: voices }, (_, i) => ({
            id: i,
            event: null,
            lastTriggerTime: 0
        }))
    );

    useOnTrigger((event) => {
        setVoicePool(prevPool => {
            const now = performance.now();
            const newPool = [...prevPool];

            // 1. Find free voice (no event or old event) - Simplistic: "Note Off" isn't explicitly tracked in state here easily
            // We assume voices are "free" to be stolen if they are the oldest.
            // A better approach usually tracks "active" boolean based on note-off.
            // But here we rely on stealing oldest.

            // Find index of voice with oldest trigger
            let oldestIndex = 0;
            let oldestTime = Infinity;

            // Also check for same note retrigger (monophonic behavior per note?)
            // If same note is playing, retrigger that voice? Common behavior.
            const sameNoteIndex = newPool.findIndex(v => v.event?.note === event.note);

            let targetIndex = -1;

            if (sameNoteIndex !== -1) {
                targetIndex = sameNoteIndex;
            } else {
                // Find oldest
                for (let i = 0; i < newPool.length; i++) {
                    if (newPool[i].lastTriggerTime < oldestTime) {
                        oldestTime = newPool[i].lastTriggerTime;
                        oldestIndex = i;
                    }
                }
                targetIndex = oldestIndex;
            }

            // Allocate voice
            newPool[targetIndex] = {
                ...newPool[targetIndex],
                event: event,
                lastTriggerTime: now
            };

            return newPool;
        });
    });

    return (
        <>
            {voicePool.map((voice) => (
                <Voice
                    key={voice.id}
                    event={voice.event}
                    notes={notes}
                    portamento={portamento}
                >
                    {children}
                </Voice>
            ))}
        </>
    );
};
