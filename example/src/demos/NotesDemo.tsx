import { useState, useCallback, useEffect, type FC } from 'react';
import {
    AudioProvider,
    Osc,
    Gain,
    noteToFreq,
    parseNote,
} from 'react-din';

/**
 * Notes Demo - Interactive Piano Keyboard
 *
 * Demonstrates:
 * - Note string parsing (English & French)
 * - MIDI to frequency conversion
 * - Interactive piano keyboard
 * - Different synth sounds per octave
 */

// Piano key configuration
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

interface PianoKeyProps {
    note: string;
    isBlack: boolean;
    isActive: boolean;
    onPress: () => void;
    onRelease: () => void;
}

const PianoKey: FC<PianoKeyProps> = ({ note, isBlack, isActive, onPress, onRelease }) => {
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        onPress();
    }, [onPress]);

    const handlePointerUp = useCallback(() => {
        onRelease();
    }, [onRelease]);

    return (
        <button
            className={`piano-key ${isBlack ? 'black' : 'white'} ${isActive ? 'active' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            aria-label={`Play note ${note}`}
        >
            <span className="key-label">{note}</span>
        </button>
    );
};

// Synth voice component - using react-din declarative components
interface VoiceProps {
    note: string;
    waveform: OscillatorType;
}

const Voice: FC<VoiceProps> = ({ note, waveform }) => {
    const frequency = noteToFreq(note);

    return (
        <Gain gain={0.3}>
            <Osc frequency={frequency} type={waveform} autoStart />
        </Gain>
    );
};

// Piano keyboard component
interface PianoProps {
    startOctave: number;
    octaves: number;
    waveform: OscillatorType;
}

// Calculate black key positions relative to white keys
const BLACK_KEY_OFFSETS: { [key: string]: number } = {
    'C#': 0.65,
    'D#': 1.75,
    'F#': 3.6,
    'G#': 4.7,
    'A#': 5.8,
};

const Piano: FC<PianoProps> = ({ startOctave, octaves, waveform }) => {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    const handlePress = useCallback((note: string) => {
        setActiveNotes(prev => new Set([...prev, note]));
    }, []);

    const handleRelease = useCallback((note: string) => {
        setActiveNotes(prev => {
            const next = new Set(prev);
            next.delete(note);
            return next;
        });
    }, []);

    // Generate white keys
    const whiteKeys: { note: string; index: number }[] = [];
    let whiteKeyIndex = 0;
    for (let octave = startOctave; octave < startOctave + octaves; octave++) {
        WHITE_KEYS.forEach((key) => {
            whiteKeys.push({ note: `${key}${octave}`, index: whiteKeyIndex });
            whiteKeyIndex++;
        });
    }
    // Add final C
    whiteKeys.push({ note: `C${startOctave + octaves}`, index: whiteKeyIndex });

    // Generate black keys with positions
    const blackKeys: { note: string; leftOffset: number }[] = [];
    const whiteKeyWidth = 50;
    const gap = 2;

    for (let octave = startOctave; octave < startOctave + octaves; octave++) {
        const octaveOffset = (octave - startOctave) * 7;

        Object.entries(BLACK_KEY_OFFSETS).forEach(([key, offset]) => {
            const leftPos = (octaveOffset + offset) * (whiteKeyWidth + gap) + 10; // 10 = padding
            blackKeys.push({
                note: `${key}${octave}`,
                leftOffset: leftPos,
            });
        });
    }

    return (
        <div className="piano-container">
            <div className="piano-keyboard">
                {whiteKeys.map(({ note }) => (
                    <PianoKey
                        key={note}
                        note={note}
                        isBlack={false}
                        isActive={activeNotes.has(note)}
                        onPress={() => handlePress(note)}
                        onRelease={() => handleRelease(note)}
                    />
                ))}
                {blackKeys.map(({ note, leftOffset }) => (
                    <button
                        key={note}
                        className={`piano-key black ${activeNotes.has(note) ? 'active' : ''}`}
                        style={{ left: `${leftOffset}px` }}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            (e.target as HTMLElement).setPointerCapture(e.pointerId);
                            handlePress(note);
                        }}
                        onPointerUp={() => handleRelease(note)}
                        onPointerLeave={() => handleRelease(note)}
                        aria-label={`Play note ${note}`}
                    >
                        <span className="key-label">{note}</span>
                    </button>
                ))}
            </div>

            {/* Render voices for active notes */}
            {Array.from(activeNotes).map(note => (
                <Voice key={note} note={note} waveform={waveform} />
            ))}
        </div>
    );
};

// Note converter panel
const NoteConverter: FC = () => {
    const [input, setInput] = useState('C4');
    const [result, setResult] = useState<{ midi: number; freq: number; note: string } | null>(null);

    const convert = useCallback(() => {
        try {
            const parsed = parseNote(input);
            if (parsed) {
                setResult({
                    midi: parsed.midi,
                    freq: parsed.frequency,
                    note: `${parsed.note}${parsed.octave}`,
                });
            }
        } catch {
            setResult(null);
        }
    }, [input]);

    useEffect(() => {
        convert();
    }, [input, convert]);

    return (
        <div className="note-converter">
            <h3>Note Converter</h3>
            <div className="converter-input">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter note (C4, Do3, Sol#2...)"
                />
            </div>
            {result && (
                <div className="converter-result">
                    <div className="result-item">
                        <span className="label">Note:</span>
                        <span className="value">{result.note}</span>
                    </div>
                    <div className="result-item">
                        <span className="label">MIDI:</span>
                        <span className="value">{result.midi}</span>
                    </div>
                    <div className="result-item">
                        <span className="label">Frequency:</span>
                        <span className="value">{result.freq.toFixed(2)} Hz</span>
                    </div>
                </div>
            )}
            <div className="examples">
                <p>Try: <code>A4</code>, <code>Do4</code>, <code>Sol#3</code>, <code>Bb2</code>, <code>Mi5</code></p>
            </div>
        </div>
    );
};

// Waveform selector
interface WaveformSelectorProps {
    value: OscillatorType;
    onChange: (waveform: OscillatorType) => void;
}

const WaveformSelector: FC<WaveformSelectorProps> = ({ value, onChange }) => {
    const waveforms: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];

    return (
        <div className="waveform-selector">
            <h3>Waveform</h3>
            <div className="waveform-buttons">
                {waveforms.map(wf => (
                    <button
                        key={wf}
                        className={`waveform-btn ${value === wf ? 'active' : ''}`}
                        onClick={() => onChange(wf)}
                    >
                        {wf}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Main demo component
export const NotesDemo: FC = () => {
    const [waveform, setWaveform] = useState<OscillatorType>('sine');
    const [startOctave, setStartOctave] = useState(3);

    return (
        <AudioProvider>
            <div className="notes-demo">
                <style>{`
                    .notes-demo {
                        padding: 20px;
                        max-width: 1000px;
                        margin: 0 auto;
                        font-family: system-ui, -apple-system, sans-serif;
                    }

                    .notes-demo h1 {
                        text-align: center;
                        margin-bottom: 10px;
                    }

                    .notes-demo .subtitle {
                        text-align: center;
                        color: #666;
                        margin-bottom: 30px;
                    }

                    .controls-row {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 30px;
                        flex-wrap: wrap;
                    }

                    .waveform-selector, .note-converter, .octave-selector {
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        flex: 1;
                        min-width: 200px;
                    }

                    .waveform-selector h3, .note-converter h3, .octave-selector h3 {
                        margin: 0 0 10px 0;
                        font-size: 14px;
                        text-transform: uppercase;
                        color: #666;
                    }

                    .waveform-buttons {
                        display: flex;
                        gap: 8px;
                    }

                    .waveform-btn {
                        flex: 1;
                        padding: 8px 12px;
                        border: 2px solid #ddd;
                        background: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        text-transform: capitalize;
                        transition: all 0.1s;
                    }

                    .waveform-btn.active {
                        border-color: #0066ff;
                        background: #0066ff;
                        color: white;
                    }

                    .converter-input input {
                        width: 100%;
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 6px;
                        font-size: 16px;
                        font-family: monospace;
                    }

                    .converter-result {
                        display: flex;
                        gap: 15px;
                        margin-top: 10px;
                        flex-wrap: wrap;
                    }

                    .result-item {
                        display: flex;
                        flex-direction: column;
                    }

                    .result-item .label {
                        font-size: 11px;
                        color: #999;
                        text-transform: uppercase;
                    }

                    .result-item .value {
                        font-size: 18px;
                        font-weight: bold;
                        font-family: monospace;
                    }

                    .examples {
                        margin-top: 10px;
                        font-size: 12px;
                        color: #888;
                    }

                    .examples code {
                        background: #e8e8e8;
                        padding: 2px 5px;
                        border-radius: 3px;
                    }

                    .octave-buttons {
                        display: flex;
                        gap: 8px;
                    }

                    .octave-btn {
                        width: 40px;
                        height: 40px;
                        border: 2px solid #ddd;
                        background: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.1s;
                    }

                    .octave-btn.active {
                        border-color: #0066ff;
                        background: #0066ff;
                        color: white;
                    }

                    .piano-container {
                        margin-top: 20px;
                    }

                    .piano-keyboard {
                        display: flex;
                        position: relative;
                        height: 180px;
                        background: #333;
                        padding: 10px;
                        border-radius: 8px;
                        overflow-x: auto;
                    }

                    .piano-key {
                        position: relative;
                        border: none;
                        cursor: pointer;
                        transition: all 0.05s;
                        display: flex;
                        align-items: flex-end;
                        justify-content: center;
                        padding-bottom: 10px;
                    }

                    .piano-key.white {
                        width: 50px;
                        height: 160px;
                        background: linear-gradient(to bottom, #f8f8f8 0%, #fff 100%);
                        border-radius: 0 0 6px 6px;
                        box-shadow: 0 2px 0 #bbb, inset 0 -1px 0 #ddd;
                        z-index: 1;
                        margin-right: 2px;
                    }

                    .piano-key.white:active, .piano-key.white.active {
                        background: linear-gradient(to bottom, #e8e8e8 0%, #f5f5f5 100%);
                        box-shadow: 0 1px 0 #aaa, inset 0 -1px 0 #ccc;
                        transform: translateY(2px);
                    }

                    .piano-key.white .key-label {
                        font-size: 10px;
                        color: #666;
                    }

                    .piano-key.black {
                        position: absolute;
                        width: 32px;
                        height: 100px;
                        background: linear-gradient(to bottom, #333 0%, #111 100%);
                        border-radius: 0 0 4px 4px;
                        box-shadow: 0 2px 0 #000;
                        z-index: 2;
                        margin-left: -18px;
                    }

                    .piano-key.black:active, .piano-key.black.active {
                        background: linear-gradient(to bottom, #444 0%, #222 100%);
                        box-shadow: 0 1px 0 #000;
                        transform: translateY(2px);
                    }

                    .piano-key.black .key-label {
                        font-size: 8px;
                        color: #888;
                    }

                    .key-info {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f0f8ff;
                        border-radius: 8px;
                        font-size: 14px;
                    }

                    .key-info code {
                        background: #ddeeff;
                        padding: 2px 5px;
                        border-radius: 3px;
                        font-family: monospace;
                    }
                `}</style>

                <h1>🎹 Notes Demo</h1>
                <p className="subtitle">Interactive piano keyboard with note conversion</p>

                <div className="controls-row">
                    <WaveformSelector value={waveform} onChange={setWaveform} />

                    <div className="octave-selector">
                        <h3>Start Octave</h3>
                        <div className="octave-buttons">
                            {[1, 2, 3, 4, 5].map(oct => (
                                <button
                                    key={oct}
                                    className={`octave-btn ${startOctave === oct ? 'active' : ''}`}
                                    onClick={() => setStartOctave(oct)}
                                >
                                    {oct}
                                </button>
                            ))}
                        </div>
                    </div>

                    <NoteConverter />
                </div>

                <Piano startOctave={startOctave} octaves={2} waveform={waveform} />

                <div className="key-info">
                    <strong>How to use:</strong> Click or tap on piano keys to play notes.
                    The <code>noteToFreq()</code> function converts note strings like <code>"C4"</code>, <code>"Do3"</code>, or <code>"Sol#2"</code> to frequencies.
                </div>
            </div>
        </AudioProvider>
    );
};

export default NotesDemo;
