// Re-export useAudio from AudioProvider

/**
 * Hook to access the AudioContext and audio system state.
 * Must be used within an AudioProvider.
 *
 * This is a re-export from AudioProvider for convenience.
 * The actual implementation is in AudioProvider.tsx.
 *
 * @throws Error if used outside AudioProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { context, isUnlocked, currentTime } = useAudio();
 *
 *   if (!isUnlocked) {
 *     return <button onClick={() => unlock()}>Click to enable audio</button>;
 *   }
 *
 *   return <div>Audio ready! Sample rate: {sampleRate}Hz</div>;
 * }
 * ```
 */
export { useAudio } from './AudioProvider';
