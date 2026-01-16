import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    type FC,
    type ReactNode,
} from 'react';
import type {
    AudioProviderProps,
    AudioContextState,
    AudioState,
    AudioContextRef,
} from './types';
import { AudioOutProvider } from './AudioOutContext';
import { setupUnlock } from './unlock';

/**
 * Internal context for the audio system.
 */
const AudioContext = createContext<AudioContextState | null>(null);

/**
 * Root provider that owns the AudioContext and manages the audio graph.
 *
 * Features:
 * - Creates and owns the AudioContext (SSR-safe)
 * - Handles user gesture unlock automatically
 * - Provides master bus (GainNode) for global volume control
 * - Exposes context state via useAudio() hook
 *
 * @example
 * ```tsx
 * <AudioProvider masterGain={0.8} onUnlock={() => console.log('Audio ready!')}>
 *   <MyAudioGraph />
 * </AudioProvider>
 * ```
 */
export const AudioProvider: FC<AudioProviderProps> = ({
    children,
    contextOptions,
    manualUnlock = false,
    masterGain: initialMasterGain = 1,
    onStateChange,
    onUnlock,
    onError,
}) => {
    // SSR safety: only create AudioContext on client
    const [context, setContext] = useState<AudioContextRef>(null);
    const [state, setState] = useState<AudioState>('suspended');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const masterBusRef = useRef<GainNode | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    // Initialize AudioContext on mount (client only)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const AudioContextClass =
                window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

            if (!AudioContextClass) {
                throw new Error('WebAudio API not supported');
            }

            const ctx = new AudioContextClass(contextOptions);
            const masterBus = ctx.createGain();
            masterBus.gain.value = initialMasterGain;
            masterBus.connect(ctx.destination);

            setContext(ctx);
            masterBusRef.current = masterBus;
            setState(ctx.state as AudioState);

            // Listen for state changes
            const handleStateChange = () => {
                const newState = ctx.state as AudioState;
                setState(newState);
                onStateChange?.(newState);

                if (newState === 'running' && !isUnlocked) {
                    setIsUnlocked(true);
                    onUnlock?.();
                }
            };

            ctx.addEventListener('statechange', handleStateChange);

            // Setup automatic unlock if not manual
            if (!manualUnlock) {
                cleanupRef.current = setupUnlock(ctx, () => {
                    setIsUnlocked(true);
                    onUnlock?.();
                });
            }

            return () => {
                ctx.removeEventListener('statechange', handleStateChange);
                cleanupRef.current?.();
                ctx.close();
            };
        } catch (error) {
            onError?.(error as Error);
        }
    }, [contextOptions, manualUnlock, initialMasterGain, onStateChange, onUnlock, onError, isUnlocked]);

    // Unlock function
    const unlock = useCallback(async () => {
        if (!context) return;
        if (context.state === 'running') {
            setIsUnlocked(true);
            return;
        }
        await context.resume();
        setIsUnlocked(true);
        onUnlock?.();
    }, [context, onUnlock]);

    // Master gain control
    const setMasterGain = useCallback((gain: number) => {
        if (masterBusRef.current) {
            masterBusRef.current.gain.value = Math.max(0, Math.min(1, gain));
        }
    }, []);

    // Build context value
    const value: AudioContextState = {
        context,
        state,
        masterBus: masterBusRef.current,
        isUnlocked,
        unlock,
        setMasterGain,
        sampleRate: context?.sampleRate ?? 44100,
        get currentTime() {
            return context?.currentTime ?? 0;
        },
    };

    return (
        <AudioContext.Provider value={value}>
            <AudioOutProvider node={masterBusRef.current}>
                {children}
            </AudioOutProvider>
        </AudioContext.Provider>
    );
};

/**
 * Hook to access the AudioContext and audio system state.
 * Must be used within an AudioProvider.
 *
 * @throws Error if used outside AudioProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { context, isUnlocked, currentTime } = useAudio();
 *   // ...
 * }
 * ```
 */
export function useAudio(): AudioContextState {
    const ctx = useContext(AudioContext);
    if (!ctx) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return ctx;
}
