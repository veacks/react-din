import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type StereoPannerNodeData } from '../store';
import { audioEngine } from '../AudioEngine';

const StereoPannerNode = memo(({ id, data, selected }: NodeProps) => {
    const pannerData = data as StereoPannerNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    const handlePanChange = (value: number) => {
        updateNodeData(id, { pan: value });
        audioEngine.updateNode(id, { pan: value });
    };

    return (
        <div className={`audio-node panner-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">↔️</span>
                <span className="node-title">Pan</span>
            </div>
            <div className="node-content">
                <div className="node-control">
                    <label>L/R</label>
                    <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={pannerData.pan}
                        onChange={(e) => handlePanChange(Number(e.target.value))}
                        title="Stereo pan position"
                    />
                    <span className="value">
                        {pannerData.pan < 0 ? `L ${Math.abs(Math.round(pannerData.pan * 100))}` :
                            pannerData.pan > 0 ? `R ${Math.round(pannerData.pan * 100)}` : 'C'}
                    </span>
                </div>
            </div>
            <div className="handle-label handle-label-in" style={{ top: '40px' }}>Audio In</div>
            <Handle type="target" position={Position.Left} id="in" className="handle handle-in handle-audio" style={{ top: '40px' }} />

            <div className="handle-label handle-label-out">Audio Out</div>
            <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" />
        </div>
    );
});

StereoPannerNode.displayName = 'StereoPannerNode';
export default StereoPannerNode;
