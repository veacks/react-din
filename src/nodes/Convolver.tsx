import { useEffect, useState, type FC } from 'react';
import type { ConvolverProps } from './types';
import { useAudioNode } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';
import { useAudio } from '../core/AudioProvider';

/**
 * Convolver node component for convolution reverb.
 *
 * Accepts either a pre-decoded AudioBuffer or a URL to load.
 *
 * @example
 * ```tsx
 * // Using URL
 * <Convolver impulse="/impulses/hall.wav" normalize>
 *   <Sampler src="/guitar.wav" />
 * </Convolver>
 *
 * // Using AudioBuffer
 * <Convolver impulse={myImpulseBuffer}>
 *   <Sampler src="/vocals.wav" />
 * </Convolver>
 * ```
 */
export const Convolver: FC<ConvolverProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    impulse,
    normalize = true,
    onLoad,
    onError,
    id,
}) => {
    const { context } = useAudio();
    const [buffer, setBuffer] = useState<AudioBuffer | null>(null);

    const { nodeRef } = useAudioNode<ConvolverNode>({
        createNode: (ctx) => ctx.createConvolver(),
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<ConvolverNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Load impulse from URL if string
    useEffect(() => {
        if (!context || !impulse) return;

        if (typeof impulse === 'string') {
            // Load from URL
            fetch(impulse)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
                .then((decodedBuffer) => {
                    setBuffer(decodedBuffer);
                    onLoad?.(decodedBuffer);
                })
                .catch((error) => {
                    onError?.(error);
                });
        } else {
            // Use provided AudioBuffer directly
            setBuffer(impulse);
        }
    }, [context, impulse, onLoad, onError]);

    // Apply buffer and normalize
    useEffect(() => {
        if (nodeRef.current && buffer) {
            nodeRef.current.buffer = buffer;
            nodeRef.current.normalize = normalize;
        }
    }, [buffer, normalize]);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
