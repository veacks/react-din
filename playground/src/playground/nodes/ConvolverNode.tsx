import React, { memo, useCallback, useRef, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAudioGraphStore, type ConvolverNodeData } from '../store';
import { audioEngine } from '../AudioEngine';

const ConvolverNode = memo(({ id, data, selected }: NodeProps) => {
    const convolverData = data as ConvolverNodeData;
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const applyImpulseUpdate = useCallback((payload: Partial<ConvolverNodeData>) => {
        updateNodeData(id, payload);
        audioEngine.updateNode(id, payload);
    }, [id, updateNodeData]);

    const handleNormalizeChange = useCallback((normalize: boolean) => {
        applyImpulseUpdate({ normalize });
    }, [applyImpulseUpdate]);

    const handleBrowseClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (!result) {
                setUploadError('Failed to read audio file.');
                return;
            }

            applyImpulseUpdate({
                impulseSrc: result,
                impulseFileName: file.name,
            });
        };
        reader.onerror = () => {
            setUploadError('Failed to read audio file.');
        };
        reader.readAsDataURL(file);
    }, [applyImpulseUpdate]);

    const handleClearFile = useCallback(() => {
        setUploadError(null);
        applyImpulseUpdate({
            impulseSrc: '',
            impulseFileName: '',
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [applyImpulseUpdate]);

    const hasImpulse = Boolean(convolverData.impulseSrc);
    const fileLabel = convolverData.impulseFileName || (hasImpulse ? 'Impulse loaded' : 'No file selected');

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
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    title="Select impulse response audio file"
                />
                <div className="node-control">
                    <label>Impulse File</label>
                    <button
                        onClick={handleBrowseClick}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px dashed #555',
                            background: '#2a2a3e',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '11px',
                        }}
                    >
                        📁 Browse...
                    </button>
                </div>
                <div className="node-control" style={{ fontSize: '10px', color: hasImpulse ? '#44cc44' : '#888' }}>
                    {hasImpulse ? `✅ ${fileLabel}` : '⚪ No file selected'}
                </div>
                {uploadError && (
                    <div className="node-control" style={{ fontSize: '10px', color: '#ff6b6b' }}>
                        {uploadError}
                    </div>
                )}
                {hasImpulse && (
                    <div className="node-control">
                        <button
                            onClick={handleClearFile}
                            style={{
                                width: '100%',
                                padding: '6px',
                                borderRadius: '4px',
                                border: '1px solid #555',
                                background: '#2a2a3e',
                                color: '#ddd',
                                cursor: 'pointer',
                                fontSize: '10px',
                            }}
                        >
                            Clear file
                        </button>
                    </div>
                )}
                <div className="node-control">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" checked={convolverData.normalize} onChange={(e) => handleNormalizeChange(e.target.checked)} />
                        Normalize
                    </label>
                </div>
            </div>
        </div>
    );
});

ConvolverNode.displayName = 'ConvolverNode';
export default ConvolverNode;
