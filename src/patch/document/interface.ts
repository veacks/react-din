import type {
    PatchEvent,
    PatchInput,
    PatchInterface,
    PatchMidiCCInput,
    PatchMidiCCOutput,
    PatchMidiInput,
    PatchMidiNoteInput,
    PatchMidiNoteOutput,
    PatchMidiOutput,
    PatchMidiSyncOutput,
    PatchNode,
} from '../types';
import type { MidiTransportSyncMode, MidiValueFormat } from '../../midi/types';
import { ensureUniqueName, toSafeIdentifier } from '../naming';
import { asNumber, asString } from './shared';
import { getInputParamHandleId } from './handles';

export function buildPatchInterface(nodes: readonly PatchNode[]): PatchInterface {
    const topLevelKeys = new Set<string>();
    const midiInputKeys = new Set<string>();
    const midiOutputKeys = new Set<string>();
    const inputs: PatchInput[] = [];
    const events: PatchEvent[] = [];
    const midiInputs: PatchMidiInput[] = [];
    const midiOutputs: PatchMidiOutput[] = [];

    nodes.forEach((node) => {
        const data = node.data as Record<string, unknown>;
        const label = asString(data.label) || node.type;

        if (node.type === 'input') {
            const params = Array.isArray(data.params) ? (data.params as Array<Record<string, unknown>>) : [];
            params.forEach((param, index) => {
                const paramId = asString(param.id) || `${node.id}-param-${index + 1}`;
                const paramLabel = asString(param.label) || asString(param.name) || `Param ${index + 1}`;
                const fallback = `param${inputs.length + 1}`;
                const key = ensureUniqueName(toSafeIdentifier(paramLabel, fallback, topLevelKeys), topLevelKeys);
                topLevelKeys.add(key);
                inputs.push({
                    id: `${node.id}:${paramId}`,
                    key,
                    label: paramLabel,
                    kind: 'input',
                    nodeId: node.id,
                    paramId,
                    handle: getInputParamHandleId(paramId),
                    defaultValue: asNumber(param.defaultValue, asNumber(param.value, 0)),
                    min: asNumber(param.min, 0),
                    max: asNumber(param.max, 1),
                });
            });
            return;
        }

        if (node.type === 'eventTrigger') {
            const fallback = `event${events.length + 1}`;
            const key = ensureUniqueName(toSafeIdentifier(label, fallback, topLevelKeys), topLevelKeys);
            topLevelKeys.add(key);
            events.push({
                id: node.id,
                key,
                label,
                kind: 'event',
                nodeId: node.id,
            });
            return;
        }

        if (node.type === 'midiNote') {
            const fallback = `midiInput${midiInputs.length + 1}`;
            const key = ensureUniqueName(toSafeIdentifier(label, fallback, midiInputKeys), midiInputKeys);
            midiInputKeys.add(key);
            midiInputs.push({
                id: node.id,
                key,
                label,
                kind: 'midi-note-input',
                nodeId: node.id,
                inputId: (data.inputId as string | 'default' | 'all' | null | undefined) ?? 'default',
                channel: (data.channel as number | 'all' | undefined) ?? 'all',
                noteMode: (data.noteMode as 'all' | 'single' | 'range' | undefined) ?? 'all',
                note: asNumber(data.note, 60),
                noteMin: asNumber(data.noteMin, 0),
                noteMax: asNumber(data.noteMax, 127),
            } satisfies PatchMidiNoteInput);
            return;
        }

        if (node.type === 'midiCC') {
            const fallback = `midiInput${midiInputs.length + 1}`;
            const key = ensureUniqueName(toSafeIdentifier(label, fallback, midiInputKeys), midiInputKeys);
            midiInputKeys.add(key);
            midiInputs.push({
                id: node.id,
                key,
                label,
                kind: 'midi-cc-input',
                nodeId: node.id,
                inputId: (data.inputId as string | 'default' | 'all' | null | undefined) ?? 'default',
                channel: (data.channel as number | 'all' | undefined) ?? 'all',
                cc: asNumber(data.cc, 1),
            } satisfies PatchMidiCCInput);
            return;
        }

        if (node.type === 'midiNoteOutput') {
            const fallback = `midiOutput${midiOutputs.length + 1}`;
            const key = ensureUniqueName(toSafeIdentifier(label, fallback, midiOutputKeys), midiOutputKeys);
            midiOutputKeys.add(key);
            midiOutputs.push({
                id: node.id,
                key,
                label,
                kind: 'midi-note-output',
                nodeId: node.id,
                outputId: (data.outputId as string | null | undefined) ?? null,
                channel: asNumber(data.channel, 1),
                note: asNumber(data.note, 60),
                frequency: asNumber(data.frequency, 261.63),
                velocity: asNumber(data.velocity, 1),
            } satisfies PatchMidiNoteOutput);
            return;
        }

        if (node.type === 'midiCCOutput') {
            const fallback = `midiOutput${midiOutputs.length + 1}`;
            const key = ensureUniqueName(toSafeIdentifier(label, fallback, midiOutputKeys), midiOutputKeys);
            midiOutputKeys.add(key);
            midiOutputs.push({
                id: node.id,
                key,
                label,
                kind: 'midi-cc-output',
                nodeId: node.id,
                outputId: (data.outputId as string | null | undefined) ?? null,
                channel: asNumber(data.channel, 1),
                cc: asNumber(data.cc, 1),
                valueFormat: (data.valueFormat as MidiValueFormat | undefined) ?? 'normalized',
            } satisfies PatchMidiCCOutput);
            return;
        }

        if (node.type === 'midiSync') {
            const fallback = `midiOutput${midiOutputs.length + 1}`;
            const key = ensureUniqueName(toSafeIdentifier(label, fallback, midiOutputKeys), midiOutputKeys);
            midiOutputKeys.add(key);
            midiOutputs.push({
                id: node.id,
                key,
                label,
                kind: 'midi-sync-output',
                nodeId: node.id,
                mode: (data.mode as MidiTransportSyncMode | undefined) ?? 'transport-master',
                inputId: (data.inputId as string | null | undefined) ?? null,
                outputId: (data.outputId as string | null | undefined) ?? null,
                sendStartStop: data.sendStartStop === false ? false : true,
                sendClock: data.sendClock === false ? false : true,
            } satisfies PatchMidiSyncOutput);
        }
    });

    return { inputs, events, midiInputs, midiOutputs };
}
