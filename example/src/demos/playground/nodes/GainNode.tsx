import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type GainNodeData } from '../store';
import { audioEngine } from '../AudioEngine';

const GainNode = memo(({ id, data, selected }: NodeProps) => {
    const gainData = data as GainNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    const handleGainChange = (value: number) => {
        updateNodeData(id, { gain: value });
        audioEngine.updateNode(id, { gain: value });
    };

    return (
        <div className={`audio-node gain-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">◧</span>
                <span className="node-title">Gain</span>
            </div>
            <div className="node-content">
                <div className="node-control">
                    <label>Level</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={gainData.gain}
                        onChange={(e) => handleGainChange(Number(e.target.value))}
                        title="Gain level"
                    />
                    <span className="value">{Math.round(gainData.gain * 100)}%</span>
                    <Handle type="target" position={Position.Left} id="gain" className="handle handle-in handle-param" style={{ top: 'auto', left: '-5px' }} />
                </div>
            </div>
            <div className="handle-label handle-label-in" style={{ top: '40px' }}>Audio In</div>
            <Handle type="target" position={Position.Left} id="in" className="handle handle-in handle-audio" style={{ top: '40px' }} />

            <div className="handle-label handle-label-out">Audio Out</div>
            <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" />
        </div>
    );
});

GainNode.displayName = 'GainNode';
export default GainNode;
