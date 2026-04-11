import {
    createContext,
    useState,
    useCallback,
    useRef,
    useEffect,
    type FC,
    type ReactNode,
} from 'react';
import type { TransportState, TransportConfig, TimePosition, TransportEvents } from './types';
import { useAudio } from '../core/AudioProvider';
import {
    bumpWasmDebugCounter,
    getWasmModuleSync,
    isWasmReady,
} from '../runtime/wasm/loadWasmOnce';

const DEFAULT_CONFIG: TransportConfig = {
    bpm: 120,
    beatsPerBar: 4,
    beatUnit: 4,
    barsPerPhrase: 4,
    stepsPerBeat: 4,
    swing: 0,
    swingSubdivision: 2,
    mode: 'raf',
};

const DEFAULT_POSITION: TimePosition = {
    step: 0,
    beat: 0,
    bar: 0,
    phrase: 0,
    totalSteps: 0,
    totalTime: 0,
};

export const TransportContext = createContext<TransportState | null>(null);

export interface TransportProviderProps extends Partial<TransportConfig>, TransportEvents {
    children: ReactNode;
}

type TransportRuntimeLike = {
    play: () => void;
    stop: () => void;
    reset: () => void;
    isPlaying: () => boolean;
    advanceSeconds: (deltaSeconds: number) => unknown;
    stepIndex: () => bigint;
    secondsPerBeat: () => number;
    secondsPerStep: () => number;
    free?: () => void;
    seekToStep?: (step: bigint) => void;
};

function clampTempo(bpm: number): number {
    return Math.max(20, Math.min(300, bpm));
}

function normalizeConfig(config: TransportConfig): TransportConfig {
    return {
        ...config,
        bpm: clampTempo(config.bpm),
        beatsPerBar: Math.max(1, Math.floor(config.beatsPerBar)),
        beatUnit: Math.max(1, Math.floor(config.beatUnit)),
        barsPerPhrase: Math.max(1, Math.floor(config.barsPerPhrase)),
        stepsPerBeat: Math.max(1, Math.floor(config.stepsPerBeat)),
        swing: Math.max(0, Math.min(1, config.swing ?? 0)),
        swingSubdivision: Math.max(1, Math.floor(config.swingSubdivision ?? 2)),
        mode: config.mode === 'manual' ? 'manual' : 'raf',
    };
}

function totalStepsToPosition(totalSteps: number, config: TransportConfig, secondsPerStep: number): TimePosition {
    const stepsPerBar = config.stepsPerBeat * config.beatsPerBar;
    const stepsPerPhrase = stepsPerBar * config.barsPerPhrase;
    const phrase = Math.floor(totalSteps / stepsPerPhrase);
    const stepsInPhrase = totalSteps % stepsPerPhrase;
    const bar = Math.floor(stepsInPhrase / stepsPerBar);
    const stepsInBar = stepsInPhrase % stepsPerBar;
    const beat = Math.floor(stepsInBar / config.stepsPerBeat);
    const step = stepsInBar % config.stepsPerBeat;
    return {
        step,
        beat,
        bar,
        phrase,
        totalSteps,
        totalTime: totalSteps * secondsPerStep,
    };
}

function positionToTotalSteps(position: Partial<TimePosition>, current: TimePosition, config: TransportConfig): number {
    const phrase = position.phrase ?? current.phrase;
    const bar = position.bar ?? current.bar;
    const beat = position.beat ?? current.beat;
    const step = position.step ?? current.step;
    const stepsPerBar = config.stepsPerBeat * config.beatsPerBar;
    const stepsPerPhrase = stepsPerBar * config.barsPerPhrase;
    const total =
        phrase * stepsPerPhrase +
        bar * stepsPerBar +
        beat * config.stepsPerBeat +
        step;
    return Math.max(0, Math.floor(total));
}

function toStepInBeat(tick: unknown, fallback: number): number {
    if (!tick || typeof tick !== 'object') return fallback;
    const value = (tick as Record<string, unknown>).stepInBeat ?? (tick as Record<string, unknown>).step_in_beat;
    return typeof value === 'number' ? value : fallback;
}

function toBeatInBar(tick: unknown, fallback: number): number {
    if (!tick || typeof tick !== 'object') return fallback;
    const value = (tick as Record<string, unknown>).beatInBar ?? (tick as Record<string, unknown>).beat_in_bar;
    return typeof value === 'number' ? value : fallback;
}

function toPhraseBar(tick: unknown, fallback: number): number {
    if (!tick || typeof tick !== 'object') return fallback;
    const value = (tick as Record<string, unknown>).phraseBar ?? (tick as Record<string, unknown>).phrase_bar;
    return typeof value === 'number' ? value : fallback;
}

export const TransportProvider: FC<TransportProviderProps> = ({
    children,
    bpm = DEFAULT_CONFIG.bpm,
    beatsPerBar = DEFAULT_CONFIG.beatsPerBar,
    beatUnit = DEFAULT_CONFIG.beatUnit,
    barsPerPhrase = DEFAULT_CONFIG.barsPerPhrase,
    stepsPerBeat = DEFAULT_CONFIG.stepsPerBeat,
    swing = DEFAULT_CONFIG.swing,
    swingSubdivision = DEFAULT_CONFIG.swingSubdivision,
    mode = DEFAULT_CONFIG.mode,
    onStep,
    onBeat,
    onBar,
    onPhrase,
    onPlay,
    onStop,
    onPause,
}) => {
    useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState<TimePosition>(DEFAULT_POSITION);
    const [config, setConfigState] = useState<TransportConfig>(normalizeConfig({
        bpm,
        beatsPerBar,
        beatUnit,
        barsPerPhrase,
        stepsPerBeat,
        swing,
        swingSubdivision,
        mode,
    }));

    const runtimeRef = useRef<TransportRuntimeLike | null>(null);
    const callbacksRef = useRef({ onStep, onBeat, onBar, onPhrase });
    const manualNowRef = useRef<number | null>(null);
    const fallbackCarryRef = useRef(0);
    const positionRef = useRef<TimePosition>(DEFAULT_POSITION);

    useEffect(() => {
        callbacksRef.current = { onStep, onBeat, onBar, onPhrase };
    }, [onStep, onBeat, onBar, onPhrase]);

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const createRuntime = useCallback((nextConfig: TransportConfig): TransportRuntimeLike | null => {
        if (!isWasmReady()) return null;
        const wasm = getWasmModuleSync();
        if (!wasm?.TransportRuntime?.fromConfig) return null;
        const runtime = wasm.TransportRuntime.fromConfig(
            nextConfig.bpm,
            nextConfig.beatsPerBar,
            nextConfig.beatUnit,
            nextConfig.barsPerPhrase,
            nextConfig.stepsPerBeat,
            nextConfig.swing ?? 0,
            'tick'
        ) as TransportRuntimeLike;
        bumpWasmDebugCounter('transportRuntimeCreated');
        return runtime;
    }, []);

    const syncPositionFromRuntime = useCallback((runtime: TransportRuntimeLike) => {
        const stepIndex = Number(runtime.stepIndex());
        const next = totalStepsToPosition(stepIndex, config, runtime.secondsPerStep());
        setPosition(next);
        return next;
    }, [config]);

    const seekRuntime = useCallback((runtime: TransportRuntimeLike, totalSteps: number) => {
        const nextStep = BigInt(Math.max(0, totalSteps));
        if (typeof runtime.seekToStep === 'function') {
            runtime.seekToStep(nextStep);
            return;
        }
        runtime.reset();
        const seconds = Number(nextStep) * runtime.secondsPerStep();
        if (seconds > 0) {
            runtime.advanceSeconds(seconds);
        }
    }, []);

    const replaceRuntime = useCallback((nextConfig: TransportConfig) => {
        const wasPlaying = runtimeRef.current?.isPlaying() ?? false;
        const currentStep = runtimeRef.current ? Number(runtimeRef.current.stepIndex()) : positionRef.current.totalSteps;
        const previous = runtimeRef.current;
        const nextRuntime = createRuntime(nextConfig);
        runtimeRef.current = nextRuntime;
        previous?.free?.();
        if (!nextRuntime) {
            return;
        }
        seekRuntime(nextRuntime, currentStep);
        if (wasPlaying) {
            nextRuntime.play();
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
        syncPositionFromRuntime(nextRuntime);
    }, [createRuntime, seekRuntime, syncPositionFromRuntime]);

    useEffect(() => {
        replaceRuntime(config);
        return () => {
            runtimeRef.current?.free?.();
            runtimeRef.current = null;
        };
    }, [config, replaceRuntime]);

    const play = useCallback(() => {
        if (runtimeRef.current) {
            runtimeRef.current.play();
        }
        setIsPlaying(true);
        manualNowRef.current = null;
        fallbackCarryRef.current = 0;
        onPlay?.();
    }, [onPlay]);

    const stop = useCallback(() => {
        runtimeRef.current?.stop();
        runtimeRef.current?.reset();
        setIsPlaying(false);
        setPosition(DEFAULT_POSITION);
        manualNowRef.current = null;
        fallbackCarryRef.current = 0;
        onStop?.();
    }, [onStop]);

    const pause = useCallback(() => {
        runtimeRef.current?.stop();
        setIsPlaying(false);
        manualNowRef.current = null;
        onPause?.();
    }, [onPause]);

    const seek = useCallback((targetPosition: Partial<TimePosition>) => {
        const targetSteps = positionToTotalSteps(targetPosition, position, config);
        if (runtimeRef.current) {
            seekRuntime(runtimeRef.current, targetSteps);
        }
        const secondsPerStep = runtimeRef.current
            ? runtimeRef.current.secondsPerStep()
            : (60 / config.bpm) / config.stepsPerBeat;
        const next = totalStepsToPosition(targetSteps, config, secondsPerStep);
        setPosition(next);
    }, [config, position, seekRuntime]);

    const setTempo = useCallback((newBpm: number) => {
        setConfigState((prev) => normalizeConfig({ ...prev, bpm: newBpm }));
    }, []);

    const setConfig = useCallback((updates: Partial<TransportConfig>) => {
        setConfigState((prev) => normalizeConfig({ ...prev, ...updates }));
    }, []);

    const toggle = useCallback(() => {
        if (isPlaying) stop();
        else play();
    }, [isPlaying, play, stop]);

    const reset = useCallback(() => {
        runtimeRef.current?.reset();
        setPosition(DEFAULT_POSITION);
        manualNowRef.current = null;
        fallbackCarryRef.current = 0;
    }, []);

    const processDelta = useCallback((deltaSeconds: number, wallClockSeconds: number) => {
        if (deltaSeconds <= 0) return;
        if (!runtimeRef.current) {
            const stepDuration = (60 / config.bpm) / config.stepsPerBeat;
            if (stepDuration <= 0) return;
            fallbackCarryRef.current += deltaSeconds;
            let nextTotal = positionRef.current.totalSteps;
            while (fallbackCarryRef.current >= stepDuration) {
                fallbackCarryRef.current -= stepDuration;
                nextTotal += 1;
                const next = totalStepsToPosition(nextTotal, config, stepDuration);
                setPosition(next);
                callbacksRef.current.onStep?.(next.step, wallClockSeconds);
                if (next.step === 0) {
                    callbacksRef.current.onBeat?.(next.beat, wallClockSeconds);
                    if (next.beat === 0) {
                        callbacksRef.current.onBar?.(next.bar, wallClockSeconds);
                        if (next.bar === 0) {
                            callbacksRef.current.onPhrase?.(next.phrase, wallClockSeconds);
                        }
                    }
                }
            }
            return;
        }
        bumpWasmDebugCounter('transportAdvanceCalls');
        const ticks = runtimeRef.current.advanceSeconds(deltaSeconds);
        const tickList = Array.isArray(ticks) ? ticks : [];
        if (tickList.length === 0) {
            syncPositionFromRuntime(runtimeRef.current);
            return;
        }
        for (const tick of tickList) {
            const totalSteps = Number(runtimeRef.current.stepIndex());
            const fallback = totalStepsToPosition(totalSteps, config, runtimeRef.current.secondsPerStep());
            const next: TimePosition = {
                ...fallback,
                step: toStepInBeat(tick, fallback.step),
                beat: toBeatInBar(tick, fallback.beat),
                bar: fallback.bar,
                phrase: toPhraseBar(tick, fallback.bar),
            };
            setPosition(next);
            callbacksRef.current.onStep?.(next.step, wallClockSeconds);
            if (next.step === 0) {
                callbacksRef.current.onBeat?.(next.beat, wallClockSeconds);
                if (next.beat === 0) {
                    callbacksRef.current.onBar?.(next.bar, wallClockSeconds);
                    if (next.phrase === 0) {
                        callbacksRef.current.onPhrase?.(fallback.phrase, wallClockSeconds);
                    }
                }
            }
        }
    }, [config, syncPositionFromRuntime]);

    const update = useCallback((now?: number) => {
        if (config.mode !== 'manual' || !isPlaying) return;
        const currentNow = now ?? performance.now() / 1000;
        if (manualNowRef.current === null) {
            manualNowRef.current = currentNow;
            const initialDelta = runtimeRef.current
                ? runtimeRef.current.secondsPerStep()
                : (60 / config.bpm) / config.stepsPerBeat;
            processDelta(initialDelta, currentNow);
            return;
        }
        const delta = Math.max(0, currentNow - manualNowRef.current);
        manualNowRef.current = currentNow;
        processDelta(delta, currentNow);
    }, [config.mode, isPlaying, processDelta]);

    const setBpm = useCallback((newBpm: number) => {
        setConfigState((prev) => normalizeConfig({ ...prev, bpm: newBpm }));
    }, []);

    const setTimeSignature = useCallback((nextBeatsPerBar: number, nextBeatUnit = 4) => {
        setConfigState((prev) => normalizeConfig({
            ...prev,
            beatsPerBar: nextBeatsPerBar,
            beatUnit: nextBeatUnit,
        }));
    }, []);

    const setStepsPerBeat = useCallback((steps: number) => {
        setConfigState((prev) => normalizeConfig({ ...prev, stepsPerBeat: steps }));
    }, []);

    const setPhraseBars = useCallback((bars: number) => {
        setConfigState((prev) => normalizeConfig({ ...prev, barsPerPhrase: bars }));
    }, []);

    useEffect(() => {
        if (config.mode === 'manual') return;
        let disposed = false;
        let rafId = 0;
        let lastNow = performance.now() / 1000;
        const tick = () => {
            if (disposed) return;
            const now = performance.now() / 1000;
            const delta = Math.max(0, now - lastNow);
            lastNow = now;
            if (isPlaying && (!runtimeRef.current || runtimeRef.current.isPlaying())) {
                processDelta(delta, now);
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => {
            disposed = true;
            cancelAnimationFrame(rafId);
        };
    }, [config.mode, isPlaying, processDelta]);

    const runtime = runtimeRef.current;
    const beatDuration = runtime ? runtime.secondsPerBeat() : 60 / config.bpm;
    const stepDuration = runtime ? runtime.secondsPerStep() : beatDuration / config.stepsPerBeat;
    const barDuration = beatDuration * config.beatsPerBar;
    const phraseDuration = barDuration * config.barsPerPhrase;

    const value: TransportState = {
        ...position,
        isPlaying,
        bpm: config.bpm,
        stepDuration,
        beatDuration,
        barDuration,
        phraseDuration,
        play,
        stop,
        pause,
        seek,
        setTempo,
        setConfig,
        toggle,
        reset,
        update,
        setBpm,
        setTimeSignature,
        setStepsPerBeat,
        setPhraseBars,
    };

    return (
        <TransportContext.Provider value={value}>
            {children}
        </TransportContext.Provider>
    );
};
