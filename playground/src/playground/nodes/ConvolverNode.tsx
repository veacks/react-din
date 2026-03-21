import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type ConvolverNodeData } from '../store';
import { audioEngine } from '../AudioEngine';

const ConvolverNode = memo(({ id, data, selected }: NodeProps) => {
    const convolverData = data as ConvolverNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    const handleChange = (key: keyof ConvolverNodeData, value: string | boolean) => {
        updateNodeData(id, { [key]: value });
        audioEngine.updateNode(id, { [key]: value });
    };

    return (
        <div className={`audio-node convolver-node ${selected ? 'selected' : ''}`}>
            <div className="node-header" style={{ justifyContent: 'space-between', position: 'relative', background: '#8844ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Handle type="target" position={Position.Left} id="in" className="handle handle-in handle-audio" style={{ left: '0px' }} />
                    <span className="node-icon">🧱</span>
                    <span className="node-title">Convolver</span>
                </div>
                <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" style={{ right: '0px' }} />
            </div>
            <div className="node-content">
                <div className="node-control">
                    <label>Impulse URL</label>
                    <input type="text" value={convolverData.impulseSrc} onChange={(e) => handleChange('impulseSrc', e.target.value)} placeholder="/impulse/hall.wav" />
                </div>
                <div className="node-control">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" checked={convolverData.normalize} onChange={(e) => handleChange('normalize', e.target.checked)} />
                        Normalize
                    </label>
                </div>
            </div>
        </div>
    );
});

ConvolverNode.displayName = 'ConvolverNode';
export default ConvolverNode;
