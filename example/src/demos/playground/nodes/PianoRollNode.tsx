import React, { memo, useEffect, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useAudioGraphStore, type PianoRollNodeData, type NoteEvent } from '../store';
import { audioEngine } from '../AudioEngine';
import '../playground.css';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const midiToNoteName = (midi: number): string => {
    const octave = Math.floor(midi / 12) - 1;
    const note = NOTE_NAMES[midi % 12];
    return `${note}${octave}`;
};

export const PianoRollNode: React.FC<NodeProps<Node<PianoRollNodeData>>> = memo(({ id, data, selected }) => {
    const updateNodeData = useAudioGraphStore((s) => s.updateNodeData);
    const [currentStep, setCurrentStep] = useState<number>(-1);

    useEffect(() => {
        return audioEngine.subscribeStep((step) => {
            setCurrentStep(step);
        });
    }, []);

    const steps = data.steps || 16;
    const octaves = data.octaves || 2;
    const baseNote = data.baseNote || 48; // C3
    const notes = data.notes || [];

    const totalNotes = octaves * 12;

    const hasNoteAt = useCallback((pitch: number, step: number): NoteEvent | undefined => {
        return notes.find((n) => n.pitch === pitch && n.step === step);
    }, [notes]);

    const toggleNote = useCallback((pitch: number, step: number) => {
        const existingNote = hasNoteAt(pitch, step);
        let newNotes: NoteEvent[];

        if (existingNote) {
            // Remove note
            newNotes = notes.filter((n) => !(n.pitch === pitch && n.step === step));
        } else {
            // Add note
            const newNote: NoteEvent = {
                pitch,
                step,
                duration: 1,
                velocity: 0.8,
            };
            newNotes = [...notes, newNote];
        }

        updateNodeData(id, { notes: newNotes });
    }, [notes, hasNoteAt, updateNodeData, id]);

    return (
        <div className={`audio-node piano-roll-node ${selected ? 'selected' : ''}`}>
            <div className="node-header">
                <span className="node-icon">🎼</span>
                <span className="node-title">{data.label}</span>
            </div>

            <div className="node-content">
                <div className="piano-roll-grid">
                    {/* Piano keys column */}
                    <div className="piano-keys">
                        {Array.from({ length: totalNotes }).map((_, i) => {
                            const pitch = baseNote + totalNotes - 1 - i;
                            const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
                            return (
                                <div
                                    key={`key-${pitch}`}
                                    className={`piano-key ${isBlack ? 'black' : 'white'}`}
                                    title={midiToNoteName(pitch)}
                                >
                                    {!isBlack && <span className="key-label">{midiToNoteName(pitch)}</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    <div className="piano-grid-container">
                        {Array.from({ length: totalNotes }).map((_, rowIdx) => {
                            const pitch = baseNote + totalNotes - 1 - rowIdx;
                            return (
                                <div key={`row-${pitch}`} className="piano-grid-row">
                                    {Array.from({ length: steps }).map((_, stepIdx) => {
                                        const noteEvent = hasNoteAt(pitch, stepIdx);
                                        const isCurrent = currentStep === stepIdx;
                                        const isBeat = stepIdx % 4 === 0;

                                        return (
                                            <button
                                                key={`cell-${pitch}-${stepIdx}`}
                                                className={`piano-cell ${noteEvent ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isBeat ? 'beat' : ''}`}
                                                onClick={() => toggleNote(pitch, stepIdx)}
                                                title={`${midiToNoteName(pitch)} Step ${stepIdx + 1}`}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Transport Input */}
            <Handle
                type="target"
                position={Position.Left}
                id="transport"
                className="handle handle-in"
            />

            {/* Trigger Output */}
            <Handle
                type="source"
                position={Position.Right}
                id="trigger"
                className="handle handle-out"
            />
        </div>
    );
});
