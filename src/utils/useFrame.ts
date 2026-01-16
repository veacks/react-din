import { useEffect, useRef, useCallback } from 'react';

/**
 * Frame callback function signature.
 */
export type FrameCallback = (time: number, delta: number) => void;

/**
 * Global frame loop management.
 */
const frameCallbacks = new Set<FrameCallback>();
let rafId: number | null = null;
let lastTime = 0;
let isRunning = false;

/**
 * Start the global animation frame loop.
 */
function startLoop() {
    if (isRunning) return;
    isRunning = true;
    lastTime = performance.now();

    const loop = (time: number) => {
        const delta = (time - lastTime) / 1000;
        lastTime = time;

        frameCallbacks.forEach((callback) => {
            try {
                callback(time, delta);
            } catch (error) {
                console.error('Error in frame callback:', error);
            }
        });

        if (frameCallbacks.size > 0) {
            rafId = requestAnimationFrame(loop);
        } else {
            isRunning = false;
        }
    };

    rafId = requestAnimationFrame(loop);
}

/**
 * Stop the global animation frame loop.
 */
function stopLoop() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    isRunning = false;
}

/**
 * Manually tick the audio system.
 *
 * Call this from an external frame loop when you want to
 * synchronize audio updates with an external render loop.
 *
 * @example
 * ```tsx
 * // In an external render loop
 * function renderLoop() {
 *   tickAudio();
 *   requestAnimationFrame(renderLoop);
 * }
 * ```
 */
export function tickAudio(): void {
    const time = performance.now();
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    frameCallbacks.forEach((callback) => {
        try {
            callback(time, delta);
        } catch (error) {
            console.error('Error in frame callback:', error);
        }
    });
}

/**
 * Hook for per-frame updates.
 *
 * Uses an internal requestAnimationFrame loop. Can also be
 * synchronized with external loops using tickAudio().
 *
 * @param callback - Function to call each frame
 * @param priority - Execution priority (lower = earlier)
 *
 * @example
 * ```tsx
 * // Standalone usage - auto-starts internal RAF loop
 * useFrame((time, delta) => {
 *   updateVisualizer(analyzerData.current);
 * });
 *
 * // Manual tick mode for external loops
 * useFrame((time, delta) => {
 *   updateAudioReactiveElement(bass);
 * });
 * // Call tickAudio() from your external loop
 * ```
 */
export function useFrame(callback: FrameCallback, priority = 0): void {
    const callbackRef = useRef(callback);

    // Update callback ref
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const wrappedCallback: FrameCallback = (time, delta) => {
            callbackRef.current(time, delta);
        };

        frameCallbacks.add(wrappedCallback);
        startLoop();

        return () => {
            frameCallbacks.delete(wrappedCallback);
            if (frameCallbacks.size === 0) {
                stopLoop();
            }
        };
    }, []);
}

/**
 * Lower-level hook for custom animation frame management.
 *
 * @param callback - Function to call each frame
 * @param deps - Dependencies to watch
 * @returns Object with start/stop controls
 *
 * @example
 * ```tsx
 * function Visualizer() {
 *   const { start, stop, isActive } = useAnimationFrame(
 *     (time) => updateCanvas(time),
 *     [canvasRef]
 *   );
 *
 *   return (
 *     <canvas ref={canvasRef} />
 *   );
 * }
 * ```
 */
export function useAnimationFrame(
    callback: FrameCallback,
    deps: unknown[] = []
): { start: () => void; stop: () => void; isActive: boolean } {
    const rafRef = useRef<number | null>(null);
    const isActiveRef = useRef(false);
    const callbackRef = useRef(callback);
    const lastTimeRef = useRef(performance.now());

    // Update callback ref
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const start = useCallback(() => {
        if (isActiveRef.current) return;
        isActiveRef.current = true;
        lastTimeRef.current = performance.now();

        const loop = (time: number) => {
            const delta = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            callbackRef.current(time, delta);

            if (isActiveRef.current) {
                rafRef.current = requestAnimationFrame(loop);
            }
        };

        rafRef.current = requestAnimationFrame(loop);
    }, []);

    const stop = useCallback(() => {
        isActiveRef.current = false;
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    // Auto-start on deps change (if previously active)
    useEffect(() => {
        if (isActiveRef.current) {
            stop();
            start();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return {
        start,
        stop,
        get isActive() {
            return isActiveRef.current;
        },
    };
}
