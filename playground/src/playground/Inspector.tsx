import React, { useCallback, useState } from 'react';
import { useAudioGraphStore, type AudioNodeData, type InputNodeData, type InputParam } from './store';

import { CodeGenerator } from './CodeGenerator';

const Inspector: React.FC = () => {
    const nodes = useAudioGraphStore((s) => s.nodes);
    const selectedNodeId = useAudioGraphStore((s) => s.selectedNodeId);
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    const nodeData = selectedNode?.data as AudioNodeData | undefined;

    const [newParamName, setNewParamName] = useState('');

    const handleAddParam = useCallback(() => {
        if (!selectedNodeId || !newParamName.trim()) return;
        const currentData = nodeData as InputNodeData;
        const params = [...(currentData.params || [])];

        params.push({
            id: crypto.randomUUID(),
            name: newParamName.trim(),
            type: 'float',
            value: 0,
            defaultValue: 0,
            min: 0,
            max: 1,
            label: newParamName.trim()
        });

        updateNodeData(selectedNodeId, { params });
        setNewParamName('');
    }, [selectedNodeId, newParamName, nodeData, updateNodeData]);

    const handleUpdateParam = (index: number, updates: Partial<InputParam>) => {
        if (!selectedNodeId) return;
        const currentData = nodeData as InputNodeData;
        const params = [...(currentData.params || [])];
        params[index] = { ...params[index], ...updates };
        // If label changes, update name too? Or keep them separate.
        // For now, let's keep them somewhat synced or allow detailed editing.
        updateNodeData(selectedNodeId, { params });
    };

    const handleRemoveParam = (index: number) => {
        if (!selectedNodeId) return;
        const currentData = nodeData as InputNodeData;
        const params = [...(currentData.params || [])];
        params.splice(index, 1);
        updateNodeData(selectedNodeId, { params });
    };



    if (!selectedNode || !nodeData) {
        return <CodeGenerator />;
    }

    return (
        <div className="inspector">
            <div className="inspector-header">
                <h3>{nodeData.label || selectedNode.type}</h3>
                <span className="node-id">{selectedNode.id}</span>
            </div>

            <div className="inspector-content">
                {/* Input Node Specific Controls */}
                {nodeData.type === 'input' && (
                    <>
                        <div className="inspector-section">
                            <h4>Params</h4>
                            <div className="param-list">
                                {(nodeData as InputNodeData).params.map((param, index) => (
                                    <div key={param.id} className="param-item">
                                        <div className="param-header">
                                            <span className="param-type-indicator"></span>
                                            <input
                                                type="text"
                                                className="param-label-input"
                                                value={param.label || param.name}
                                                onChange={(e) => handleUpdateParam(index, { label: e.target.value, name: e.target.value })}
                                            />
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveParam(index)}
                                            >×</button>
                                        </div>
                                        <div className="param-details">
                                            <div className="control-row">
                                                <label>Default</label>
                                                <input
                                                    type="number"
                                                    value={param.defaultValue}
                                                    onChange={(e) => handleUpdateParam(index, { defaultValue: Number(e.target.value), value: Number(e.target.value) })}
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>Min</label>
                                                <input
                                                    type="number"
                                                    value={param.min}
                                                    onChange={(e) => handleUpdateParam(index, { min: Number(e.target.value) })}
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>Max</label>
                                                <input
                                                    type="number"
                                                    value={param.max}
                                                    onChange={(e) => handleUpdateParam(index, { max: Number(e.target.value) })}
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="control-row">
                                                <label>Current</label>
                                                <input
                                                    type="range"
                                                    min={param.min}
                                                    max={param.max}
                                                    step="0.01"
                                                    value={param.value}
                                                    onChange={(e) => handleUpdateParam(index, { value: Number(e.target.value) })}
                                                />
                                                <span className="value-display">{param.value.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="add-param-row">
                                <input
                                    type="text"
                                    placeholder="New param name..."
                                    value={newParamName}
                                    onChange={(e) => setNewParamName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddParam()}
                                />
                                <button onClick={handleAddParam}>+</button>
                            </div>
                        </div>
                    </>
                )}

                {/* Transport Node Specific Controls */}
                {nodeData.type === 'transport' && (
                    <div className="inspector-section">
                        <h4>Transport Controls</h4>
                        <div className="control-row">
                            <label>Playing</label>
                            <input
                                type="checkbox"
                                checked={(nodeData as any).playing}
                                onChange={(e) => updateNodeData(selectedNodeId!, { playing: e.target.checked })}
                            />
                        </div>
                        <div className="control-row">
                            <label>BPM</label>
                            <input
                                type="number"
                                value={(nodeData as any).bpm}
                                onChange={(e) => updateNodeData(selectedNodeId!, { bpm: Number(e.target.value) })}
                                min={40}
                                max={240}
                            />
                        </div>
                        <div className="control-row">
                            <label>Beats / Bar</label>
                            <input
                                type="number"
                                value={(nodeData as any).beatsPerBar ?? 4}
                                onChange={(e) => updateNodeData(selectedNodeId!, { beatsPerBar: Number(e.target.value) })}
                                min={1}
                                max={16}
                            />
                        </div>
                        <div className="control-row">
                            <label>Beat Unit</label>
                            <input
                                type="number"
                                value={(nodeData as any).beatUnit ?? 4}
                                onChange={(e) => updateNodeData(selectedNodeId!, { beatUnit: Number(e.target.value) })}
                                min={1}
                                max={16}
                            />
                        </div>
                        <div className="control-row">
                            <label>Steps / Beat</label>
                            <input
                                type="number"
                                value={(nodeData as any).stepsPerBeat ?? 4}
                                onChange={(e) => updateNodeData(selectedNodeId!, { stepsPerBeat: Number(e.target.value) })}
                                min={1}
                                max={16}
                            />
                        </div>
                        <div className="control-row">
                            <label>Bars / Phrase</label>
                            <input
                                type="number"
                                value={(nodeData as any).barsPerPhrase ?? 4}
                                onChange={(e) => updateNodeData(selectedNodeId!, { barsPerPhrase: Number(e.target.value) })}
                                min={1}
                                max={16}
                            />
                        </div>
                        <div className="control-row">
                            <label>Swing</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={(nodeData as any).swing ?? 0}
                                onChange={(e) => updateNodeData(selectedNodeId!, { swing: Number(e.target.value) })}
                            />
                            <span className="value-display">{((nodeData as any).swing ?? 0).toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {/* Common Properties */}
                <div className="inspector-section">
                    <h4>Node Properties</h4>
                    {(nodeData as any).label !== undefined && (
                        <div className="control-row">
                            <label>Label</label>
                            <input
                                type="text"
                                value={nodeData.label}
                                onChange={(e) => updateNodeData(selectedNodeId!, { label: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .inspector {
                    height: 100%;
                    background: #16161e;
                    border-left: 1px solid #2a2a3a;
                    display: flex;
                    flex-direction: column;
                    color: #ccc;
                    font-size: 11px;
                }
                .inspector.empty {
                    align-items: center;
                    justify-content: center;
                    color: #555;
                }
                .inspector-header {
                    padding: 12px;
                    background: #1a1a22;
                    border-bottom: 1px solid #2a2a3a;
                }
                .inspector-header h3 {
                    margin: 0;
                    font-size: 12px;
                    color: #fff;
                }
                .node-id {
                    font-size: 9px;
                    color: #555;
                }
                .inspector-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }
                .inspector-section {
                    margin-bottom: 20px;
                }
                .inspector-section h4 {
                    margin: 0 0 10px 0;
                    color: #888;
                    text-transform: uppercase;
                    font-size: 9px;
                    letter-spacing: 0.5px;
                }
                .control-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                    gap: 8px;
                }
                .control-row label {
                    flex: 1;
                    color: #aaa;
                }
                .control-row input {
                    background: #222;
                    border: 1px solid #333;
                    color: #eee;
                    padding: 4px;
                    border-radius: 3px;
                    width: 60px;
                }
                .control-row input[type="text"] {
                    flex: 1.5;
                }
                .control-row input[type="range"] {
                    flex: 2;
                    width: auto;
                }
                .value-display {
                    width: 30px;
                    text-align: right;
                    color: #4488ff;
                }
                .param-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .param-item {
                    background: #1e1e28;
                    border: 1px solid #333;
                    border-radius: 4px;
                    padding: 8px;
                }
                .param-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 8px;
                }
                .param-type-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #44cc44; /* Green for float/geometry usually, but let's stick to our palette */
                }
                .param-label-input {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-weight: bold;
                    flex: 1;
                }
                .remove-btn {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                }
                .remove-btn:hover { color: #ff4444; }
                .add-param-row {
                    display: flex;
                    gap: 6px;
                    margin-top: 10px;
                }
                .add-param-row input {
                    flex: 1;
                    background: #222;
                    border: 1px solid #333;
                    color: #eee;
                    padding: 4px;
                    border-radius: 3px;
                }
                .add-param-row button {
                    background: #333;
                    border: 1px solid #444;
                    color: #eee;
                    border-radius: 3px;
                    cursor: pointer;
                    width: 24px;
                }
                .add-param-row button:hover { background: #444; }
            `}</style>
        </div>
    );
};

export default Inspector;
