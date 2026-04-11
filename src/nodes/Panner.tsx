import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import type { PannerProps } from './types';
import { useWasmNode } from './useAudioNode';

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
}) => {
    const { nodeId } = useWasmNode('panner3d', {
        positionX,
        positionY,
        positionZ,
        orientationX,
        orientationY,
        orientationZ,
        panningModel,
        distanceModel,
        refDistance,
        maxDistance,
        rolloffFactor,
        coneInnerAngle,
        coneOuterAngle,
        coneOuterGain,
        bypass,
    });

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<PannerNode | null>).current = {} as PannerNode;
        return () => {
            (externalRef as React.MutableRefObject<PannerNode | null>).current = null;
        };
    }, [externalRef]);

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
