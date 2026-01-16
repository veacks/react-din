import { useEffect, useRef, type FC } from 'react';
import type { ConstantSourceProps } from './types';
import { useAudioNode, useAudioParam } from '../nodes/useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * ConstantSource component for generating a constant value.
 *
 * Useful for modulation, DC offset, or as a control signal.
 *
 * @example
 * ```tsx
 * // As modulation source
 * <ConstantSource offset={440} autoStart />
 *
 * // For parameter control
 * <ConstantSource offset={0.5} nodeRef={lfoRef} />
 * ```
 */
export const ConstantSource: FC<ConstantSourceProps> = ({
    children,
    nodeRef: externalRef,
    offset = 1,
    autoStart = false,
    active,
}) => {
    const startedRef = useRef(false);

    const { nodeRef, context } = useAudioNode<ConstantSourceNode>({
        createNode: (ctx) => ctx.createConstantSource(),
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<ConstantSourceNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply offset
    useAudioParam(nodeRef.current?.offset, offset);

    // Start/stop control
    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const shouldPlay = autoStart || active;

        if (shouldPlay && !startedRef.current) {
            try {
                node.start();
                startedRef.current = true;
            } catch {
                // Already started
            }
        }
    }, [autoStart, active, nodeRef.current]);

    return (
        <AudioOutProvider node={nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
