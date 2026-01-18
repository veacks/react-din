import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type InputNodeData } from '../store';

const InputNode = memo(({ id, data, selected }: NodeProps) => {
    const inputData = data as InputNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);
    const [newParamName, setNewParamName] = useState('');

    const handleBpmChange = (value: number) => {
        updateNodeData(id, { bpm: value });
    };

    const handleAddParam = useCallback(() => {
        if (!newParamName.trim()) return;

        const params = [...(inputData.params || [])];
        params.push({
            name: newParamName.trim(),
            value: 0,
            min: 0,
            max: 1,
        });
        updateNodeData(id, { params });
        setNewParamName('');
    }, [id, newParamName, inputData.params, updateNodeData]);

    const handleParamChange = useCallback((index: number, value: number) => {
        const params = [...(inputData.params || [])];
        params[index] = { ...params[index], value };
        updateNodeData(id, { params });
    }, [id, inputData.params, updateNodeData]);

    const handleRemoveParam = useCallback((index: number) => {
        const params = [...(inputData.params || [])];
        params.splice(index, 1);
        updateNodeData(id, { params });
    }, [id, inputData.params, updateNodeData]);

    return (
        <div className={`audio-node input-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">⏱️</span>
                <span className="node-title">Input</span>
            </div>
            <div className="node-content">
                {/* Transport section */}
                <div className="node-section">
                    <label className="section-label">Transport</label>
                    <div className="node-control">
                        <label>BPM</label>
                        <input
                            type="range"
                            min="40"
                            max="240"
                            step="1"
                            value={inputData.bpm}
                            onChange={(e) => handleBpmChange(Number(e.target.value))}
                            title="Tempo in BPM"
                        />
                        <span className="value">{inputData.bpm}</span>
                    </div>
                    <div className="transport-outputs">
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="bpm"
                            className="handle handle-out handle-param"
                            style={{ top: '85px' }}
                            title="BPM output"
                        />
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="beat"
                            className="handle handle-out handle-param"
                            style={{ top: '105px' }}
                            title="Beat trigger"
                        />
                    </div>
                </div>

                {/* Custom parameters */}
                <div className="node-section params-section">
                    <label className="section-label">Parameters</label>
                    {(inputData.params || []).map((param, index) => (
                        <div key={index} className="custom-param">
                            <span className="param-name">{param.name}</span>
                            <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step="0.01"
                                value={param.value}
                                onChange={(e) => handleParamChange(index, Number(e.target.value))}
                                title={param.name}
                            />
                            <span className="value">{param.value.toFixed(2)}</span>
                            <button
                                className="remove-param"
                                onClick={() => handleRemoveParam(index)}
                                title="Remove parameter"
                            >×</button>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`param_${index}`}
                                className="handle handle-out handle-param"
                                style={{ top: `${130 + index * 40}px` }}
                            />
                        </div>
                    ))}
                    <div className="add-param">
                        <input
                            type="text"
                            placeholder="Param name..."
                            value={newParamName}
                            onChange={(e) => setNewParamName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddParam()}
                        />
                        <button onClick={handleAddParam} title="Add parameter">+</button>
                    </div>
                </div>
            </div>
        </div>
    );
});

InputNode.displayName = 'InputNode';
export default InputNode;
