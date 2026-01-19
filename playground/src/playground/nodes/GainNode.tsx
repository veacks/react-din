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
            <div className="node-header" style={{ justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Handle type="target" position={Position.Left} id="in" className="handle handle-in handle-audio" style={{ left: '-10px' }} />
                    <span className="node-icon">◧</span>
                    <span className="node-title">Gain</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="handle-label-static" style={{ fontSize: '9px', color: '#888', marginRight: '8px', textTransform: 'uppercase' }}>Out</span>
                    <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" style={{ right: '-10px' }} />
                </div>
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
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="gain"
                        className="handle handle-in handle-param"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                    />
                </div>
            </div>
        </div>
    );
});

GainNode.displayName = 'GainNode';
export default GainNode;
