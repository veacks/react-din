import type { MidiNoteValue } from '../../midi/types';
import type { PatchDocument, PatchMidiBindings } from '../../patch/types';

export function applyInterfaceInputs(
    runtime: import('din-wasm').AudioRuntime,
    patch: PatchDocument,
    propValues: Record<string, unknown>
): void {
    patch.interface.inputs.forEach((item) => {
        if (!Object.prototype.hasOwnProperty.call(propValues, item.key)) return;
        const v = Number(propValues[item.key]);
        if (!Number.isFinite(v)) return;
        try {
            runtime.setInput(item.key, v);
        } catch {
            /* unknown or invalid key */
        }
    });
}

export function applyInterfaceEvents(
    runtime: import('din-wasm').AudioRuntime,
    patch: PatchDocument,
    propValues: Record<string, unknown>
): void {
    patch.interface.events.forEach((item) => {
        if (!Object.prototype.hasOwnProperty.call(propValues, item.key)) return;
        const raw = propValues[item.key];
        const token =
            typeof raw === 'bigint' ? raw : BigInt(Math.max(0, Math.floor(Number(raw) || 0)));
        try {
            runtime.triggerEvent(item.key, token);
        } catch {
            /* unknown event key */
        }
    });
}

export function applyMidiNoteEdges(
    runtime: import('din-wasm').AudioRuntime,
    patch: PatchDocument,
    midi: PatchMidiBindings<PatchDocument> | undefined,
    lastGateByNodeId: Map<string, boolean>
): void {
    patch.interface.midiInputs.forEach((item) => {
        const value = midi?.inputs?.[item.key as keyof NonNullable<typeof midi.inputs>];
        if (!value || !('gate' in value)) return;
        const mv = value as MidiNoteValue;
        const nodeId = item.nodeId;
        const prev = lastGateByNodeId.get(nodeId) ?? false;
        const gate = Boolean(mv.gate);
        if (gate && !prev) {
            const note = mv.note != null ? mv.note : 60;
            const vel = Math.max(0, Math.min(127, Math.round(mv.velocity)));
            runtime.pushMidi(0x90, note, vel, 0);
        } else if (!gate && prev) {
            const note = mv.note != null ? mv.note : 60;
            runtime.pushMidi(0x80, note, 0, 0);
        }
        lastGateByNodeId.set(nodeId, gate);
    });
}
