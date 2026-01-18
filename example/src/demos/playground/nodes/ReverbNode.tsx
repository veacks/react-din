import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type ReverbNodeData } from '../store';
import { audioEngine } from '../AudioEngine';

const ReverbNode = memo(({ id, data, selected }: NodeProps) => {
    const reverbData = data as ReverbNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    const handleDecayChange = (value: number) => {
        updateNodeData(id, { decay: value });
        audioEngine.updateNode(id, { decay: value });
    };

    const handleMixChange = (value: number) => {
        updateNodeData(id, { mix: value });
        audioEngine.updateNode(id, { mix: value });
    };

    return (
        <div className={`audio-node reverb-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">🏛️</span>
                <span className="node-title">Reverb</span>
            </div>
            <div className="node-content">
                <div className="node-control">
                    <label>Decay</label>
                    <input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={reverbData.decay}
                        onChange={(e) => handleDecayChange(Number(e.target.value))}
                        title="Decay time in seconds"
                    />
                    <span className="value">{reverbData.decay.toFixed(1)}s</span>
                </div>
                <div className="node-control">
                    <label>Mix</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={reverbData.mix}
                        onChange={(e) => handleMixChange(Number(e.target.value))}
                        title="Wet/Dry mix"
                    />
                    <span className="value">{Math.round(reverbData.mix * 100)}%</span>
                </div>
            </div>
            <div className="handle-label handle-label-in" style={{ top: '40px' }}>Audio In</div>
            <Handle type="target" position={Position.Left} id="in" className="handle handle-in handle-audio" style={{ top: '40px' }} />

            <div className="handle-label handle-label-out">Audio Out</div>
            <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" />
        </div>
    );
});

ReverbNode.displayName = 'ReverbNode';
export default ReverbNode;
