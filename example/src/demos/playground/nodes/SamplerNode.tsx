import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useAudioGraphStore, type SamplerNodeData } from '../store';
import { audioEngine } from '../AudioEngine';
import '../playground.css';

export const SamplerNode: React.FC<NodeProps<Node<SamplerNodeData>>> = memo(({ id, data, selected }) => {
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create object URL for the file
        const objectUrl = URL.createObjectURL(file);
        setFileName(file.name);
        updateNodeData(id, { src: objectUrl, loaded: false });

        // Load the buffer in the audio engine
        audioEngine.loadSamplerBuffer(id, objectUrl);
    }, [id, updateNodeData]);

    const handleBrowseClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handlePlayClick = useCallback(() => {
        if (!data.src) return;

        if (isPlaying) {
            audioEngine.stopSampler(id);
            setIsPlaying(false);
        } else {
            audioEngine.playSampler(id, data);
            setIsPlaying(true);
        }
    }, [id, data, isPlaying]);

    const handleLoop = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { loop: e.target.checked });
    }, [id, updateNodeData]);

    const handlePlaybackRate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const rate = parseFloat(e.target.value);
        updateNodeData(id, { playbackRate: rate });
        audioEngine.updateSamplerParam(id, 'playbackRate', rate);
    }, [id, updateNodeData]);

    const handleDetune = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const detune = parseFloat(e.target.value);
        updateNodeData(id, { detune });
        audioEngine.updateSamplerParam(id, 'detune', detune);
    }, [id, updateNodeData]);

    // Reset playing state when sample changes
    useEffect(() => {
        setIsPlaying(false);
    }, [data.src]);

    // Subscribe to end-of-playback events
    useEffect(() => {
        const unsubscribe = audioEngine.onSamplerEnd(id, () => {
            setIsPlaying(false);
        });
        return unsubscribe;
    }, [id]);

    return (
        <div className={`audio-node sampler-node ${selected ? 'selected' : ''}`}>
            <div className="node-header" style={{ background: '#44ccff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="node-icon">🎹</span>
                    <span className="node-title">{data.label}</span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span className="handle-label-static" style={{ fontSize: '9px', color: '#fff', marginRight: '8px', textTransform: 'uppercase' }}>Out</span>
                    <Handle type="source" position={Position.Right} id="out" className="handle handle-out handle-audio" style={{ right: '-17px' }} />
                </div>
            </div>

            <div className="node-content">
                {/* File input (hidden) */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    title="Select audio file"
                />

                {/* Browse button */}
                <div className="node-control">
                    <label>Audio File</label>
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

                {/* File name display */}
                <div className="node-control" style={{ fontSize: '10px', color: data.src ? '#44cc44' : '#888' }}>
                    {data.src ? `✅ ${fileName || 'Loaded'}` : '⚪ No file selected'}
                </div>

                {/* Play/Stop button */}
                <div className="node-control">
                    <button
                        onClick={handlePlayClick}
                        disabled={!data.src}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: 'none',
                            background: isPlaying ? '#ff4466' : (data.src ? '#22cc66' : '#444'),
                            color: '#fff',
                            cursor: data.src ? 'pointer' : 'not-allowed',
                            fontSize: '12px',
                            fontWeight: 'bold',
                        }}
                    >
                        {isPlaying ? '⏹ Stop' : '▶ Play'}
                    </button>
                </div>

                {/* Loop toggle */}
                <div className="node-control">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={data.loop}
                            onChange={handleLoop}
                        />
                        Loop
                    </label>
                </div>

                {/* Playback Rate */}
                <div className="node-control">
                    <label>Speed {data.playbackRate.toFixed(2)}x</label>
                    <input
                        type="range"
                        min="0.25"
                        max="4"
                        step="0.01"
                        value={data.playbackRate}
                        onChange={handlePlaybackRate}
                        title="Playback rate"
                    />
                </div>

                {/* Detune */}
                <div className="node-control">
                    <label>Detune {data.detune}¢</label>
                    <input
                        type="range"
                        min="-1200"
                        max="1200"
                        step="10"
                        value={data.detune}
                        onChange={handleDetune}
                        title="Detune in cents"
                    />
                </div>
            </div>

            {/* Trigger input for sequencer/gate */}
            <Handle
                type="target"
                position={Position.Left}
                id="trigger"
                className="handle handle-in handle-trigger"
                style={{ top: '50%' }}
            />
        </div>
    );
});

SamplerNode.displayName = 'SamplerNode';
export default SamplerNode;


