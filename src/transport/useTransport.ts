import { useContext } from 'react';
import { TransportContext } from './TransportContext';
import type { TransportState } from './types';

/**
 * Hook to access and control the musical transport.
 *
 * Provides access to playback state, timing information,
 * and control methods.
 *
 * @throws Error if used outside TransportProvider
 *
 * @example
 * ```tsx
 * function PlayButton() {
 *   const { isPlaying, play, stop, bpm } = useTransport();
 *
 *   return (
 *     <button onClick={isPlaying ? stop : play}>
 *       {isPlaying ? '⏹ Stop' : '▶ Play'} at {bpm} BPM
 *     </button>
 *   );
 * }
 * ```
 */
export function useTransport(): TransportState {
    const ctx = useContext(TransportContext);
    if (!ctx) {
        throw new Error('useTransport must be used within a TransportProvider');
    }
    return ctx;
}
