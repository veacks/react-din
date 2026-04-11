import { useEffect, type FC } from 'react';
import { AudioOutProvider } from '../core/AudioOutContext';
import { usePatchGraph } from '../core/PatchGraphContext';
import { useWasmNode } from '../nodes/useAudioNode';
import type { AuxSendProps } from './types';
import { releaseBusNode, retainBusNode } from './busNodes';

export const AuxSend: FC<AuxSendProps> = ({
    children,
    bypass = false,
    busId = 'aux',
    sendGain = 0.5,
    tap = 'pre',
    nodeRef: externalRef,
}) => {
    const graph = usePatchGraph();
    const { nodeId } = useWasmNode('auxSend', {
        busId,
        sendLevel: sendGain,
        preFader: tap === 'pre',
        bypass,
    });

    useEffect(() => {
        const sharedBusNodeId = retainBusNode(graph, busId);
        const connectionId = `${nodeId}->${sharedBusNodeId}:send`;
        graph.addConnection(connectionId, nodeId, 'send', sharedBusNodeId, 'input');
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

    return (
        <AudioOutProvider node={null} nodeId={nodeId}>
            {children}
        </AudioOutProvider>
    );
};
