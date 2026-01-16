/**
 * Check if code is running on the server (SSR).
 *
 * @returns true if running on server, false if in browser
 *
 * @example
 * ```tsx
 * if (isSSR()) {
 *   return null; // Don't render audio on server
 * }
 * ```
 */
export function isSSR(): boolean {
    return (
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        typeof AudioContext === 'undefined'
    );
}

/**
 * Get the AudioContext constructor, with fallback for older browsers.
 *
 * @returns AudioContext constructor or null if not available
 *
 * @example
 * ```tsx
 * const AudioContextClass = getAudioContext();
 * if (AudioContextClass) {
 *   const ctx = new AudioContextClass();
 * }
 * ```
 */
export function getAudioContext(): typeof AudioContext | null {
    if (isSSR()) return null;

    return (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext ||
        null
    );
}

/**
 * Safe wrapper for Web Audio API that handles SSR.
 *
 * @param fn - Function to execute on client only
 * @returns Result of function or undefined on server
 *
 * @example
 * ```tsx
 * const result = clientOnly(() => {
 *   const ctx = new AudioContext();
 *   return ctx.sampleRate;
 * });
 * ```
 */
export function clientOnly<T>(fn: () => T): T | undefined {
    if (isSSR()) return undefined;
    return fn();
}

/**
 * Check browser support for Web Audio API features.
 *
 * @returns Object with feature support flags
 *
 * @example
 * ```tsx
 * const support = checkAudioSupport();
 * if (!support.audioContext) {
 *   console.warn('Web Audio API not supported');
 * }
 * ```
 */
export function checkAudioSupport(): {
    audioContext: boolean;
    audioWorklet: boolean;
    mediaDevices: boolean;
    webAudio: boolean;
} {
    if (isSSR()) {
        return {
            audioContext: false,
            audioWorklet: false,
            mediaDevices: false,
            webAudio: false,
        };
    }

    const AudioContextClass = getAudioContext();
    const hasAudioContext = AudioContextClass !== null;
    const hasAudioWorklet =
        hasAudioContext && typeof AudioWorkletNode !== 'undefined';
    const hasMediaDevices =
        typeof navigator !== 'undefined' &&
        typeof navigator.mediaDevices !== 'undefined';

    return {
        audioContext: hasAudioContext,
        audioWorklet: hasAudioWorklet,
        mediaDevices: hasMediaDevices,
        webAudio: hasAudioContext,
    };
}
