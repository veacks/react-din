import { useEffect, type RefObject } from 'react';
import { usePatchRuntime } from '../core/PatchRuntimeProvider';
import { noteToMidi } from '../notes';
import { useOnTrigger } from '../sequencer/useTrigger';

export function resolveMidiNote(
    notes: (number | string)[] | undefined,
    step: number,
    fallback: number
): number {
    if (!notes || notes.length === 0) return fallback;
    const raw = notes[step % notes.length];
    if (typeof raw === 'number') return Math.round(raw);
    if (typeof raw === 'string') return noteToMidi(raw);
    return fallback;
}

export function useSynthTriggerToMidi(
    resolveNote: (step: number, fallback: number) => number
): void {
    const { runtimeRef } = usePatchRuntime();
    useOnTrigger((event) => {
        const note = resolveNote(event.step, event.note);
        const velocity = Math.max(0, Math.min(127, Math.round(event.velocity * 127)));
        runtimeRef.current?.pushMidi(0x90, note, velocity, 0);
        window.setTimeout(() => {
            runtimeRef.current?.pushMidi(0x80, note, 0, 0);
        }, Math.max(0, event.duration * 1000));
    });
}

export function useMirrorExternalNodeRef<TNode extends AudioNode>(
    externalRef?: RefObject<TNode | null>
): void {
    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<TNode | null>).current = null;
        return () => {
            (externalRef as React.MutableRefObject<TNode | null>).current = null;
        };
    }, [externalRef]);
}
