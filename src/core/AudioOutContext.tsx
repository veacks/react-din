import { createContext, useContext, type FC, type ReactNode } from 'react';
import type { AudioOutContextValue } from './types';

/**
 * Default context value when no output node is set.
 */
const defaultValue: AudioOutContextValue = {
    outputNode: null,
    setOutputNode: () => {
        console.warn('AudioOutContext: setOutputNode called without provider');
    },
};

/**
 * Internal context that tracks the current output node.
 * Children connect to their parent's output node automatically.
 *
 * This is an internal API - users don't interact with it directly.
 * @internal
 */
const AudioOutContext = createContext<AudioOutContextValue>(defaultValue);

/**
 * Props for AudioOutProvider.
 */
interface AudioOutProviderProps {
    children: ReactNode;
    node: AudioNode | null;
}

/**
 * Provider component for output node context.
 * Wraps children and provides them with the output node to connect to.
 *
 * Each audio node component wraps its children with this provider,
 * setting itself as the output node.
 *
 * @internal
 */
export const AudioOutProvider: FC<AudioOutProviderProps> = ({ children, node }) => {
    const value: AudioOutContextValue = {
        outputNode: node,
        setOutputNode: () => {
            // This is typically a no-op as nodes set themselves as output
            // when they mount. Kept for potential future use.
        },
    };

    return (
        <AudioOutContext.Provider value={value}>
            {children}
        </AudioOutContext.Provider>
    );
};

/**
 * Hook to access the current output node context.
 * Used internally by audio node components to connect to their parent.
 *
 * @returns The current output context value
 *
 * @example
 * ```tsx
 * // Internal use in a node component
 * function MyNode({ children }) {
 *   const { outputNode } = useAudioOut();
 *   const nodeRef = useRef<GainNode>(null);
 *
 *   useEffect(() => {
 *     if (nodeRef.current && outputNode) {
 *       nodeRef.current.connect(outputNode);
 *       return () => nodeRef.current?.disconnect();
 *     }
 *   }, [outputNode]);
 *
 *   return (
 *     <AudioOutProvider node={nodeRef.current}>
 *       {children}
 *     </AudioOutProvider>
 *   );
 * }
 * ```
 *
 * @internal
 */
export function useAudioOut(): AudioOutContextValue {
    return useContext(AudioOutContext);
}
