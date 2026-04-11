import { useEffect, type FC, type ReactNode } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import { usePatchRuntime } from '../core/PatchRuntimeProvider';
import { useTrigger } from '../sequencer/useTrigger';
import { useWasmNode } from '../nodes/useAudioNode';

export interface TriggeredSamplerProps {
    children?: ReactNode;
    src?: string | AudioBuffer;
    autoStart?: boolean;
    active?: boolean;
    loop?: boolean;
    playbackRate?: number;
    detune?: number;
    offset?: number;
    duration?: number;
}

export const TriggeredSampler: FC<TriggeredSamplerProps> = ({
    children,
    src,
    autoStart = false,
    active,
    loop = false,
    playbackRate = 1,
    detune = 0,
    offset = 0,
    duration,
}) => {
    const { runtimeRef } = usePatchRuntime();
    const trigger = useTrigger();
    const patchAsset = typeof src === 'string' ? src : undefined;
    const { nodeId } = useWasmNode('sampler', {
        patchAsset,
        loop,
        playbackRate,
        detune,
        offset,
        duration,
        autoStart,
        active,
        triggered: true,
    });

    useEffect(() => {
        if (!trigger) return;
        const note = Number.isFinite(trigger.note) ? trigger.note : 60;
        const velocity = Math.max(0, Math.min(127, Math.round(trigger.velocity * 127)));
        runtimeRef.current?.pushMidi(0x90, note, velocity, 0);
        const timeout = window.setTimeout(() => {
            runtimeRef.current?.pushMidi(0x80, note, 0, 0);
        }, Math.max(0, trigger.duration * 1000));
        return () => window.clearTimeout(timeout);
    }, [runtimeRef, trigger]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
