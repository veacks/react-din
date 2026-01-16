/**
 * User gesture events that can unlock the AudioContext.
 */
const UNLOCK_EVENTS = [
    'click',
    'touchstart',
    'touchend',
    'mousedown',
    'keydown',
] as const;

/**
 * Sets up automatic AudioContext unlock on user gesture.
 *
 * Many browsers require a user interaction before audio can play.
 * This function adds event listeners that will resume the AudioContext
 * on the first user gesture.
 *
 * @param context - The AudioContext to unlock
 * @param onUnlock - Callback fired when unlock is successful
 * @returns Cleanup function to remove event listeners
 *
 * @internal
 */
export function setupUnlock(
    context: AudioContext,
    onUnlock: () => void
): () => void {
    if (typeof window === 'undefined') {
        return () => { };
    }

    // Already running, no need to unlock
    if (context.state === 'running') {
        onUnlock();
        return () => { };
    }

    let unlocked = false;

    const handleUnlock = async () => {
        if (unlocked) return;

        try {
            await context.resume();

            if (context.state === 'running') {
                unlocked = true;
                onUnlock();
                cleanup();
            }
        } catch (error) {
            console.warn('Failed to unlock AudioContext:', error);
        }
    };

    const cleanup = () => {
        UNLOCK_EVENTS.forEach((event) => {
            document.removeEventListener(event, handleUnlock, { capture: true });
        });
    };

    // Add listeners
    UNLOCK_EVENTS.forEach((event) => {
        document.addEventListener(event, handleUnlock, {
            capture: true,
            passive: true,
        });
    });

    return cleanup;
}

/**
 * Check if the AudioContext is in a suspended state and needs unlocking.
 *
 * @param context - The AudioContext to check
 * @returns true if the context needs user gesture to play
 */
export function needsUnlock(context: AudioContext | null): boolean {
    if (!context) return true;
    return context.state === 'suspended';
}

/**
 * Attempt to unlock the AudioContext programmatically.
 * This must be called in response to a user gesture.
 *
 * @param context - The AudioContext to unlock
 * @returns Promise that resolves when unlocked
 */
export async function unlockContext(context: AudioContext): Promise<void> {
    if (context.state === 'running') return;
    await context.resume();
}
