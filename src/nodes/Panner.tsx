import { useEffect, type FC } from 'react';
import type { PannerProps } from './types';
import { useAudioNode, useAudioParam } from './useAudioNode';
import { AudioOutProvider } from '../core/AudioOutContext';

/**
 * Panner node component for 3D spatial audio positioning.
 *
 * @example
 * ```tsx
 * // Position audio in 3D space
 * <Panner positionX={2} positionY={0} positionZ={-3}>
 *   <Sampler src="/footsteps.wav" />
 * </Panner>
 *
 * // HRTF panning for headphones
 * <Panner panningModel="HRTF" positionX={-1}>
 *   <Sampler src="/voice.wav" />
 * </Panner>
 * ```
 */
export const Panner: FC<PannerProps> = ({
    children,
    nodeRef: externalRef,
    bypass = false,
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    orientationX = 1,
    orientationY = 0,
    orientationZ = 0,
    panningModel = 'equalpower',
    distanceModel = 'inverse',
    refDistance = 1,
    maxDistance = 10000,
    rolloffFactor = 1,
    coneInnerAngle = 360,
    coneOuterAngle = 360,
    coneOuterGain = 0,
    id,
}) => {
    const { nodeRef, context } = useAudioNode<PannerNode>({
        createNode: (ctx) => ctx.createPanner(),
        bypass,
    });

    // Sync external ref
    useEffect(() => {
        if (externalRef) {
            (externalRef as React.MutableRefObject<PannerNode | null>).current = nodeRef.current;
        }
    }, [externalRef, nodeRef.current]);

    // Apply panning model and distance model
    useEffect(() => {
        if (nodeRef.current) {
            nodeRef.current.panningModel = panningModel;
            nodeRef.current.distanceModel = distanceModel;
            nodeRef.current.refDistance = refDistance;
            nodeRef.current.maxDistance = maxDistance;
            nodeRef.current.rolloffFactor = rolloffFactor;
            nodeRef.current.coneInnerAngle = coneInnerAngle;
            nodeRef.current.coneOuterAngle = coneOuterAngle;
            nodeRef.current.coneOuterGain = coneOuterGain;
        }
    }, [
        panningModel,
        distanceModel,
        refDistance,
        maxDistance,
        rolloffFactor,
        coneInnerAngle,
        coneOuterAngle,
        coneOuterGain,
    ]);

    // Apply position and orientation as AudioParams
    useAudioParam(nodeRef.current?.positionX, positionX);
    useAudioParam(nodeRef.current?.positionY, positionY);
    useAudioParam(nodeRef.current?.positionZ, positionZ);
    useAudioParam(nodeRef.current?.orientationX, orientationX);
    useAudioParam(nodeRef.current?.orientationY, orientationY);
    useAudioParam(nodeRef.current?.orientationZ, orientationZ);

    return (
        <AudioOutProvider node={bypass ? null : nodeRef.current}>
            {children}
        </AudioOutProvider>
    );
};
