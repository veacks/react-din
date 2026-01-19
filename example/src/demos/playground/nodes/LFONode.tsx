import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useAudioGraphStore, type LFONodeData } from '../store';
import '../playground.css';

const WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'] as const;

export const LFONode: React.FC<NodeProps<Node<LFONodeData>>> = memo(({ id, data, selected }) => {
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    return (
        <div className={`audio-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">🌀</span>
                <span className="node-title">{data.label}</span>
            </div>

            <div className="node-content">
                <div className="node-control">
                    <label>Waveform</label>
                    <select
                        value={data.waveform}
                        onChange={(e) => updateNodeData(id, { waveform: e.target.value })}
                    >
                        {WAVEFORMS.map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </div>

                <div className="node-control">
                    <label>Rate {data.rate.toFixed(2)} Hz</label>
                    <input
                        type="range"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={data.rate}
                        onChange={(e) => updateNodeData(id, { rate: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="node-control">
                    <label>Depth {data.depth.toFixed(0)}</label>
                    <input
                        type="range"
                        min="0"
                        max="2000"
                        step="10"
                        value={data.depth}
                        onChange={(e) => updateNodeData(id, { depth: parseFloat(e.target.value) })}
                    />
                </div>
            </div>

            {/* Output */}
            <Handle
                type="source"
                position={Position.Right}
                id="out"
                className="handle handle-out handle-cv"
            />
        </div>
    );
});
