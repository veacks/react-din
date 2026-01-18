import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type MixerNodeData } from '../store';

const MixerNode = memo(({ id, data, selected }: NodeProps) => {
    const mixerData = data as MixerNodeData;

    return (
        <div className={`audio-node mixer-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">⊕</span>
                <span className="node-title">Mixer</span>
            </div>
            <div className="node-content">
                <div className="node-control">
                    <span className="value">{mixerData.inputs} inputs</span>
                </div>
            </div>
            {/* Multiple input handles on left */}
            <div className="handle-label handle-label-in" style={{ top: '25%' }}>In 1</div>
            <Handle type="target" position={Position.Left} id="in1" className="handle handle-in handle-audio" style={{ top: '25%' }} />
            <div className="handle-label handle-label-in" style={{ top: '50%' }}>In 2</div>
            <Handle type="target" position={Position.Left} id="in2" className="handle handle-in handle-audio" style={{ top: '50%' }} />
            <div className="handle-label handle-label-in" style={{ top: '75%' }}>In 3</div>
            <Handle type="target" position={Position.Left} id="in3" className="handle handle-in handle-audio" style={{ top: '75%' }} />

            <div className="handle-label handle-label-out">Audio Out</div>
            <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" />
        </div>
    );
});

MixerNode.displayName = 'MixerNode';
export default MixerNode;
