import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type TransportNodeData } from '../store';
import '../playground.css';

export const TransportNode: React.FC<NodeProps<ReactFlow.Node<TransportNodeData>>> = memo(({ id, data, selected }) => {


    return (
        <div className={`audio-node transport-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">⏱️</span>
                <span className="node-title">{data.label}</span>
            </div>

            {/* Controls removed - moved to Inspector */}

            {/* Transport is a source of timing/events, but typically controls the global context. 
                However, to be "patchable" it might output a clock signal or similar.
                For now user requested it as INPUT only (source).
                Since it's a global controller, maybe it doesn't need audio handles?
                But user said "this node must be used only as input" (meaning source).
                So we give it an output handle.
            */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="out"
                className="handle handle-audio"
            />
            <div className="handle-label source-label">Clock Out</div>
        </div>
    );
});
