import { useEffect, type FC } from 'react';
import { usePatchGraph } from '../core/PatchGraphContext';
import { useWasmNode } from '../nodes/useAudioNode';
import type { AuxReturnProps } from './types';
import { releaseBusNode, retainBusNode } from './busNodes';

export const AuxReturn: FC<AuxReturnProps> = ({
    busId = 'aux',
    gain = 1,
    bypass = false,
    nodeRef: externalRef,
}) => {
    const graph = usePatchGraph();
    const { nodeId } = useWasmNode('auxReturn', {
        busId,
        returnLevel: gain,
        bypass,
    });

    useEffect(() => {
        const sharedBusNodeId = retainBusNode(graph, busId);
        const connectionId = `${sharedBusNodeId}->${nodeId}:return`;
        graph.addConnection(connectionId, sharedBusNodeId, 'output', nodeId, 'input');
        return () => {
            graph.removeConnection(connectionId);
            releaseBusNode(graph, sharedBusNodeId);
        };
    }, [busId, graph, nodeId]);

    useEffect(() => {
        if (!externalRef) return;
        (externalRef as React.MutableRefObject<GainNode | null>).current = null;
        return () => {
            (externalRef as React.MutableRefObject<GainNode | null>).current = null;
        };
    }, [externalRef]);

    return null;
};
