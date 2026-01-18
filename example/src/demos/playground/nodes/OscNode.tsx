import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type OscNodeData } from '../store';
import { audioEngine } from '../AudioEngine';

const waveforms: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];

const OscNode = memo(({ id, data, selected }: NodeProps) => {
    const oscData = data as OscNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    const handleFrequencyChange = (value: number) => {
        updateNodeData(id, { frequency: value });
        audioEngine.updateNode(id, { frequency: value });
    };

    const handleDetuneChange = (value: number) => {
        updateNodeData(id, { detune: value });
        audioEngine.updateNode(id, { detune: value });
    };

    const handleWaveformChange = (value: OscillatorType) => {
        updateNodeData(id, { waveform: value });
        audioEngine.updateNode(id, { waveform: value });
    };

    return (
        <div className={`audio-node osc-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">◐</span>
                <span className="node-title">Oscillator</span>
            </div>
            <div className="node-content">
                <div className="node-control">
                    <label>Type</label>
                    <select
                        value={oscData.waveform}
                        onChange={(e) => handleWaveformChange(e.target.value as OscillatorType)}
                        title="Waveform type"
                    >
                        {waveforms.map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </div>
                <div className="node-control">
                    <label>Freq</label>
                    <input
                        type="range"
                        min="20"
                        max="2000"
                        value={oscData.frequency}
                        onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                        title="Frequency in Hz"
                    />
                    <span className="value">{oscData.frequency} Hz</span>
                    <Handle type="target" position={Position.Left} id="frequency" className="handle handle-in handle-param" style={{ top: 'auto', left: '-5px' }} />
                </div>
                <div className="node-control">
                    <label>Detune</label>
                    <input
                        type="range"
                        min="-1200"
                        max="1200"
                        step="10"
                        value={oscData.detune}
                        onChange={(e) => handleDetuneChange(Number(e.target.value))}
                        title="Detune in cents"
                    />
                    <span className="value">{oscData.detune} c</span>
                    <Handle type="target" position={Position.Left} id="detune" className="handle handle-in handle-param" style={{ top: 'auto', left: '-5px' }} />
                </div>
            </div>

            <div className="handle-label handle-label-out">Audio Out</div>
            <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" />
        </div>
    );
});

OscNode.displayName = 'OscNode';
export default OscNode;
