import { useAudio } from '../../core';
import type { MidiTransportState, PatchDocument, PatchMidiBindings } from '../../patch/types';
import type { MidiNoteValue } from '../../midi/types';
import {
    resolveConvolverAssetPath,
    resolveMidiPlayerAssetPath,
    resolveSamplerAssetPath,
} from '../../patch/document/assets';
import { resolvePatchAssetPath } from '../../patch/document';
import { useEffect, useRef, type FC } from 'react';
import { ensureWasmInitialized } from './loadWasmOnce';

/** ScriptProcessor buffer size must be one of the allowed legacy sizes; matches `AudioRuntime` block. */
const WASM_BLOCK_FRAMES = 256;
const WASM_CHANNELS = 2;

function applyInterfaceInputs(
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

function applyInterfaceEvents(
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

function applyMidiNoteEdges(
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

export interface PatchWasmBridgeProps<TPatch extends PatchDocument> {
    patch: TPatch;
    assetRoot?: string;
    propValues: Record<string, unknown>;
    midi?: PatchMidiBindings<TPatch>;
    onTransportState?: (state: MidiTransportState) => void;
}

async function loadPatchAssets(
    runtime: import('din-wasm').AudioRuntime,
    patch: PatchDocument,
    assetRoot?: string
): Promise<void> {
    const tasks: Array<{ path: string; resolvedPath: string }> = [];

    for (const node of patch.nodes) {
        const nodeType = node.data?.type;
        if (nodeType === 'sampler' || nodeType === 'triggeredSampler') {
            const samplerPath = resolveSamplerAssetPath(node.data);
            tasks.push({
                path: samplerPath,
                resolvedPath: resolvePatchAssetPath(samplerPath, assetRoot) ?? samplerPath,
            });
        } else if (nodeType === 'convolver') {
            const convolverPath = resolveConvolverAssetPath(node.data);
            tasks.push({
                path: convolverPath,
                resolvedPath: resolvePatchAssetPath(convolverPath, assetRoot) ?? convolverPath,
            });
        } else if (nodeType === 'midiPlayer') {
            const midiPath = resolveMidiPlayerAssetPath(node.data);
            tasks.push({
                path: midiPath,
                resolvedPath: resolvePatchAssetPath(midiPath, assetRoot) ?? midiPath,
            });
        }
    }

    await Promise.all(tasks.map(async ({ path, resolvedPath }) => {
        try {
            const response = await fetch(resolvedPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const bytes = new Uint8Array(await response.arrayBuffer());
            runtime.loadAsset(path, bytes);
        } catch (error) {
            console.warn(`[PatchWasmBridge] Failed to load asset ${resolvedPath}:`, error);
        }
    }));
}

/**
 * Connects `din-wasm` `AudioRuntime` to the WebAudio graph via a `ScriptProcessorNode`
 * into the shared `AudioProvider` master bus.
 */
export const PatchWasmBridge: FC<PatchWasmBridgeProps<PatchDocument>> = ({
    patch,
    assetRoot,
    propValues,
    midi,
    onTransportState,
}) => {
    const { context, masterBus, sampleRate } = useAudio();

    const propValuesRef = useRef(propValues);
    const midiRef = useRef(midi);
    propValuesRef.current = propValues;
    midiRef.current = midi;

    const lastGateRef = useRef<Map<string, boolean>>(new Map());
    const lastTickCountRef = useRef<number | null>(null);

    useEffect(() => {
        if (!context || !masterBus) return undefined;

        let cancelled = false;
        let processor: ScriptProcessorNode | null = null;
        let runtime: import('din-wasm').AudioRuntime | null = null;

        const lastGateByNodeId = lastGateRef.current;

        void(async () => {
            try {
                await ensureWasmInitialized();
                if (cancelled) return;

                const { AudioRuntime } = await import('din-wasm');
                const patchJson = JSON.stringify(patch);
                const audioRuntime = new AudioRuntime(
                    patchJson,
                    sampleRate,
                    WASM_CHANNELS,
                    WASM_BLOCK_FRAMES
                );

                if (cancelled) {
                    audioRuntime.free();
                    return;
                }

                await loadPatchAssets(audioRuntime, patch, assetRoot);
                if (cancelled) {
                    audioRuntime.free();
                    return;
                }

                runtime = audioRuntime;
                const scratch = new Float32Array(audioRuntime.interleavedOutputLen());

                const proc = context.createScriptProcessor(WASM_BLOCK_FRAMES, 0, WASM_CHANNELS);
                processor = proc;
                proc.onaudioprocess = (event) => {
                    applyInterfaceInputs(audioRuntime, patch, propValuesRef.current);
                    applyInterfaceEvents(audioRuntime, patch, propValuesRef.current);
                    applyMidiNoteEdges(audioRuntime, patch, midiRef.current, lastGateByNodeId);
                    audioRuntime.renderBlockInto(scratch);
                    if (onTransportState) {
                        const state = audioRuntime.transportState() as MidiTransportState;
                        if (state.tick_count !== lastTickCountRef.current) {
                            lastTickCountRef.current = state.tick_count;
                            onTransportState(state);
                        }
                    }
                    const outL = event.outputBuffer.getChannelData(0);
                    const outR = event.outputBuffer.getChannelData(1);
                    for (let i = 0; i < WASM_BLOCK_FRAMES; i++) {
                        outL[i] = scratch[i * 2];
                        outR[i] = scratch[i * 2 + 1];
                    }
                };

                proc.connect(masterBus);
            } catch (error) {
                if (!cancelled) {
                    console.error('[react-din] PatchWasmBridge failed to init din-wasm AudioRuntime', error);
                }
            }
        })();

        return () => {
            cancelled = true;
            if (processor) {
                try {
                    processor.disconnect();
                } catch {
                    /* ignore */
                }
                processor = null;
            }
            if (runtime) {
                runtime.free();
                runtime = null;
            }
        };
    }, [assetRoot, context, masterBus, onTransportState, patch, sampleRate]);

    return null;
};
