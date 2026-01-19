import { memo } from 'react';
import { Handle, Position, type NodeProps, useHandleConnections, useNodesData } from '@xyflow/react';
import { useAudioGraphStore, type OscNodeData } from '../store';
import { audioEngine } from '../AudioEngine';

const waveforms: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];

const OscNode = memo(({ id, data, selected }: NodeProps) => {
    const oscData = data as OscNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    // Check for connections to frequency handle
    const connections = useHandleConnections({
        type: 'target',
        id: 'frequency',
    });

    // Get connected node data to display value (visual feedback)
    const connectedNodeData = useNodesData(connections[0]?.source);

    const isFreqConnected = connections.length > 0;

    // Determine display frequency: if connected to NoteNode, show its note/freq
    let displayFreq = oscData.frequency;
    let displayNote = '';

    if (isFreqConnected && connectedNodeData) {
        // If connected to NoteNode, show its frequency
        if (connectedNodeData.data.type === 'note') {
            // @ts-ignore - we know structure
            displayFreq = connectedNodeData.data.frequency;
            // @ts-ignore
            displayNote = `(${connectedNodeData.data.note}${connectedNodeData.data.octave})`;
        }
        // If connected to InputNode param... tricky to get value without more logic, 
        // so we might just show "Modulated" or keep base. 
        // For now, handling NoteNode covers the user's specific complaint.
    }

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="node-icon">◐</span>
                    <span className="node-title">Oscillator</span>
                </div>
                {/* Audio Out aligned with header/top */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span className="handle-label-static" style={{ fontSize: '9px', color: '#888', marginRight: '8px', textTransform: 'uppercase' }}>Audio Out</span>
                    <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" style={{ right: '-17px' }} />
                </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>Freq {displayNote && <span style={{ color: '#44cc44' }}>{displayNote}</span>}</label>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="2000"
                        value={isFreqConnected ? displayFreq : oscData.frequency}
                        onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                        title="Frequency in Hz"
                        disabled={isFreqConnected}
                        style={{ opacity: isFreqConnected ? 0.5 : 1 }}
                    />
                    <span className="value" style={{ color: isFreqConnected ? '#44cc44' : '#aaa' }}>
                        {Math.round(displayFreq)} Hz
                    </span>
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="frequency"
                        className="handle handle-in handle-param"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                    />
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
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="detune"
                        className="handle handle-in handle-param"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                    />
                </div>
            </div>
        </div>
    );
});

OscNode.displayName = 'OscNode';
export default OscNode;
