import { useEffect, useRef } from 'react';
import { useAudio } from '../core/AudioProvider';
import { useAudioOut } from '../core/AudioOutContext';

/**
 * Options for the useAudioNode hook.
 */
export interface UseAudioNodeOptions<T extends AudioNode> {
    /**
     * Factory function to create the AudioNode.
     * Called with the AudioContext.
     */
    createNode: (context: AudioContext) => T;

    /**
     * Whether to bypass the node (pass-through input to output).
     */
    bypass?: boolean;

    /**
     * Dependencies to watch for node recreation.
     */
    deps?: unknown[];
}

/**
 * Return type for useAudioNode hook.
 */
export interface UseAudioNodeResult<T extends AudioNode> {
    /**
     * Ref to the created AudioNode.
     */
    nodeRef: React.MutableRefObject<T | null>;

    /**
     * The AudioContext.
     */
    context: AudioContext | null;

    /**
     * Whether the audio system is unlocked.
     */
    isUnlocked: boolean;
}

/**
 * Base hook for creating and managing audio nodes.
 *
 * Handles:
 * - Node creation (client-side only)
 * - Connection to parent output
 * - Cleanup on unmount
 * - Bypass mode
 *
 * @example
 * ```tsx
 * function MyGainNode({ gain = 1, children }) {
 *   const { nodeRef } = useAudioNode({
 *     createNode: (ctx) => ctx.createGain(),
 *   });
 *
 *   useEffect(() => {
 *     if (nodeRef.current) {
 *       nodeRef.current.gain.value = gain;
 *     }
 *   }, [gain]);
 *
 *   return (
 *     <AudioOutProvider node={nodeRef.current}>
 *       {children}
 *     </AudioOutProvider>
 *   );
 * }
 * ```
 */
export function useAudioNode<T extends AudioNode>({
    createNode,
    bypass = false,
    deps = [],
}: UseAudioNodeOptions<T>): UseAudioNodeResult<T> {
    const { context, isUnlocked } = useAudio();
    const { outputNode } = useAudioOut();
    const nodeRef = useRef<T | null>(null);
    const bypassConnectionRef = useRef<AudioNode | null>(null);

    // Create node
    useEffect(() => {
        if (!context) return;

        const node = createNode(context);
        nodeRef.current = node;

        return () => {
            node.disconnect();
            nodeRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context, ...deps]);

    // Connect to output
    useEffect(() => {
        const node = nodeRef.current;
        if (!node || !outputNode) return;

        if (bypass) {
            // In bypass mode, we don't connect through this node
            // Children will connect directly to our parent
            bypassConnectionRef.current = outputNode;
        } else {
            node.connect(outputNode);
            bypassConnectionRef.current = null;
        }

        return () => {
            if (!bypass) {
                try {
                    node.disconnect(outputNode);
                } catch {
                    // Node may already be disconnected
                }
            }
        };
    }, [outputNode, bypass]);

    return {
        nodeRef,
        context,
        isUnlocked,
    };
}

/**
 * Hook to set an AudioParam value with optional automation.
 *
 * @param param - The AudioParam to control
 * @param value - The target value
 * @param rampTime - Time to ramp to the value (0 = immediate)
 * @param rampType - Type of ramp ('linear' or 'exponential')
 */
export function useAudioParam(
    param: AudioParam | null | undefined,
    value: number,
    rampTime = 0,
    rampType: 'linear' | 'exponential' = 'exponential'
): void {
    useEffect(() => {
        if (!param) return;

        if (rampTime <= 0) {
            param.value = value;
        } else {
            // Note: For proper automation, we use setValueAtTime and ramps
            // The ramp times are relative to current time
            param.setValueAtTime(param.value, 0);

            if (rampType === 'linear') {
                param.linearRampToValueAtTime(value, rampTime);
            } else {
                // Exponential ramp can't go to 0, use a very small value
                const safeValue = Math.max(0.0001, value);
                param.exponentialRampToValueAtTime(safeValue, rampTime);
            }
        }
    }, [param, value, rampTime, rampType]);
}
