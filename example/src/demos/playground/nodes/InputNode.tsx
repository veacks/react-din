import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type InputNodeData } from '../store';

const InputNode = memo(({ id, data, selected }: NodeProps) => {
    const inputData = data as InputNodeData;

    return (
        <div className={`audio-node input-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <div className="header-title">
                    <span className="node-icon">⏱️</span>
                    <span className="node-title">Input</span>
                </div>
            </div>

            <div className="node-content">
                {/* Transport Sockets */}
                {inputData.transportEnabled && (
                    <div className="node-control input-transport-control">
                        <div className="input-control-stack">
                            <div className="input-param-row">
                                <label>BPM</label>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id="bpm"
                                    className="handle handle-out handle-param socket-fix-bpm"
                                    title="BPM output"
                                />
                            </div>
                            <div className="input-param-row">
                                <label>Beat</label>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id="beat"
                                    className="handle handle-out handle-param socket-fix-beat"
                                    title="Beat trigger"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Parameters */}
                {(inputData.params || []).map((param, index) => (
                    <div key={param.id || index} className="node-control input-param-row" style={{ justifyContent: 'center' }}>
                        <div className="input-param-row" style={{ width: '100%' }}>
                            <label className="input-param-label">{param.label || param.name}</label>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`param_${index}`}
                                className="handle handle-out handle-param socket-fix"
                            />
                        </div>
                    </div>
                ))}

                {(!inputData.params?.length && !inputData.transportEnabled) && (
                    <div className="node-control text-no-outputs">
                        No outputs
                    </div>
                )}
            </div>
        </div>
    );
});

InputNode.displayName = 'InputNode';
export default InputNode;
