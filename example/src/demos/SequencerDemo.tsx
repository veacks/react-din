import { useState, useCallback, useRef, useEffect, type FC } from 'react';
import {
    AudioProvider,
    useAudio,
    Sequencer,
    Track,
    Gain,
    Filter,
    NoiseBurst,
} from 'react-din';

/**
 * Sequencer Demo - TR-909 Drums & TB-303 Acid Synth
 *
 * Demonstrates:
 * - Multi-channel step sequencer
 * - TR-909 style drum synthesis
 * - TB-303 style acid synth with filter modulation
 * - Interactive pattern editing
 */

// ============================================================================
// Types
// ============================================================================

type Pattern = (0 | 1)[];

interface DrumPattern {
    bass: Pattern;
    hihat: Pattern;
    clap: Pattern;
    tone: Pattern;
}

interface AcidPattern {
    steps: Pattern;
    notes: number[];
    accents: Pattern;
    slides: Pattern;
}

// ============================================================================
// Default Patterns (TR-909 inspired)
// ============================================================================

const DEFAULT_DRUM_PATTERN: DrumPattern = {
    bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    tone: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
};

const DEFAULT_ACID_PATTERN: AcidPattern = {
    steps: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    notes: [60, 60, 62, 64, 62, 60, 60, 67, 65, 64, 62, 64, 62, 60, 60, 67],
    accents: [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1],
    slides: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
};

// MIDI note to frequency
function midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
}

// ============================================================================
// Main Demo Component
// ============================================================================

export function SequencerDemo() {
    return (
        <div className="demo sequencer-demo">
            <h1>🎛️ Sequencer Demo</h1>
            <p>TR-909 style drums + TB-303 acid synth with interactive step sequencer</p>

            <AudioProvider masterGain={0.6} createOnUserGesture debug>
                <SequencerDemoContent />
            </AudioProvider>
        </div>
    );
}

function SequencerDemoContent() {
    const { isUnlocked } = useAudio();

    // Sequencer settings
    const [bpm, setBpm] = useState(125);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Drum patterns (mutable)
    const [drumPattern, setDrumPattern] = useState<DrumPattern>(DEFAULT_DRUM_PATTERN);
    const [drumMutes, setDrumMutes] = useState({ bass: false, hihat: false, clap: false, tone: false });

    // Acid synth patterns and params
    const [acidPattern, setAcidPattern] = useState<AcidPattern>(DEFAULT_ACID_PATTERN);
    const [acidMute, setAcidMute] = useState(false);
    const [cutoff, setCutoff] = useState(400);
    const [resonance, setResonance] = useState(8);
    const [envAmount, setEnvAmount] = useState(2000);

    // Toggle step handler
    const toggleDrumStep = useCallback((track: keyof DrumPattern, step: number) => {
        setDrumPattern(prev => ({
            ...prev,
            [track]: prev[track].map((v, i) => i === step ? (v ? 0 : 1) as 0 | 1 : v),
        }));
    }, []);

    const toggleAcidStep = useCallback((step: number) => {
        setAcidPattern(prev => ({
            ...prev,
            steps: prev.steps.map((v, i) => i === step ? (v ? 0 : 1) as 0 | 1 : v),
        }));
    }, []);

    const toggleAcidAccent = useCallback((step: number) => {
        setAcidPattern(prev => ({
            ...prev,
            accents: prev.accents.map((v, i) => i === step ? (v ? 0 : 1) as 0 | 1 : v),
        }));
    }, []);

    // Step callback
    const onStep = useCallback((step: number) => {
        setCurrentStep(step);
    }, []);

    return (
        <>
            {/* Status */}
            <div className="demo-section">
                <div className="controls">
                    <div className="status">
                        <span className={`status-dot ${isUnlocked ? 'active' : 'inactive'}`} />
                        {isUnlocked ? 'Audio Ready' : 'Click to unlock audio'}
                    </div>
                </div>
            </div>

            {/* Transport Controls */}
            <div className="demo-section">
                <h2>▶️ Transport</h2>
                <div className="controls">
                    <button
                        className={isPlaying ? 'danger' : 'primary'}
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={!isUnlocked}
                    >
                        {isPlaying ? '⏹ Stop' : '▶ Play'}
                    </button>

                    <div className="control-group">
                        <label htmlFor="bpm-slider">BPM: {bpm}</label>
                        <input
                            id="bpm-slider"
                            type="range"
                            min="60"
                            max="180"
                            value={bpm}
                            onChange={(e) => setBpm(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Drum Machine */}
            <div className="demo-section">
                <h2>🥁 TR-909 Drums</h2>
                <p className="node-description">Click steps to toggle. Classic Roland TR-909 sound.</p>

                <div className="sequencer-grid">
                    {/* Bass Drum */}
                    <DrumRow
                        label="BASS"
                        pattern={drumPattern.bass}
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        muted={drumMutes.bass}
                        onToggle={(step) => toggleDrumStep('bass', step)}
                        onMuteToggle={() => setDrumMutes(m => ({ ...m, bass: !m.bass }))}
                        color="#FF5722"
                    />

                    {/* Hi-Hat */}
                    <DrumRow
                        label="HI-HAT"
                        pattern={drumPattern.hihat}
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        muted={drumMutes.hihat}
                        onToggle={(step) => toggleDrumStep('hihat', step)}
                        onMuteToggle={() => setDrumMutes(m => ({ ...m, hihat: !m.hihat }))}
                        color="#FFC107"
                    />

                    {/* Clap */}
                    <DrumRow
                        label="CLAP"
                        pattern={drumPattern.clap}
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        muted={drumMutes.clap}
                        onToggle={(step) => toggleDrumStep('clap', step)}
                        onMuteToggle={() => setDrumMutes(m => ({ ...m, clap: !m.clap }))}
                        color="#E91E63"
                    />

                    {/* Tone */}
                    <DrumRow
                        label="TONE"
                        pattern={drumPattern.tone}
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        muted={drumMutes.tone}
                        onToggle={(step) => toggleDrumStep('tone', step)}
                        onMuteToggle={() => setDrumMutes(m => ({ ...m, tone: !m.tone }))}
                        color="#9C27B0"
                    />
                </div>
            </div>

            {/* Acid Synth */}
            <div className="demo-section">
                <h2>🧪 TB-303 Acid</h2>
                <p className="node-description">Sawtooth + resonant filter. Adjust cutoff and resonance for that squelchy sound.</p>

                <div className="acid-controls">
                    <div className="control-group">
                        <label htmlFor="cutoff-slider">Cutoff: {cutoff}Hz</label>
                        <input
                            id="cutoff-slider"
                            type="range"
                            min="100"
                            max="4000"
                            value={cutoff}
                            onChange={(e) => setCutoff(Number(e.target.value))}
                        />
                    </div>
                    <div className="control-group">
                        <label htmlFor="resonance-slider">Resonance: {resonance}</label>
                        <input
                            id="resonance-slider"
                            type="range"
                            min="1"
                            max="30"
                            value={resonance}
                            onChange={(e) => setResonance(Number(e.target.value))}
                        />
                    </div>
                    <div className="control-group">
                        <label htmlFor="env-slider">Env Amount: {envAmount}Hz</label>
                        <input
                            id="env-slider"
                            type="range"
                            min="0"
                            max="6000"
                            value={envAmount}
                            onChange={(e) => setEnvAmount(Number(e.target.value))}
                        />
                    </div>
                    <button
                        className={`acid-mute-btn ${acidMute ? 'secondary' : 'primary'}`}
                        onClick={() => setAcidMute(!acidMute)}
                    >
                        {acidMute ? '🔇 Muted' : '🔊 On'}
                    </button>
                </div>

                <div className="sequencer-grid acid-grid">
                    <AcidRow
                        pattern={acidPattern}
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        muted={acidMute}
                        onToggle={toggleAcidStep}
                        onAccentToggle={toggleAcidAccent}
                    />
                </div>
            </div>

            {/* Audio Graph - conditionally render when playing */}
            {isPlaying && isUnlocked && (
                <Sequencer
                    bpm={bpm}
                    steps={16}
                    autoStart
                    loop
                    onStep={onStep}
                >
                    {/* Drum Tracks */}
                    <Track id="bass" pattern={drumPattern.bass} mute={drumMutes.bass}>
                        <BassDrum />
                    </Track>

                    <Track id="hihat" pattern={drumPattern.hihat} mute={drumMutes.hihat}>
                        <HiHat />
                    </Track>

                    <Track id="clap" pattern={drumPattern.clap} mute={drumMutes.clap}>
                        <Clap />
                    </Track>

                    <Track id="tone" pattern={drumPattern.tone} mute={drumMutes.tone}>
                        <ToneDrum />
                    </Track>

                    {/* Acid Track */}
                    <Track id="acid" pattern={acidPattern.steps} mute={acidMute}>
                        <AcidSynth
                            notes={acidPattern.notes}
                            accents={acidPattern.accents}
                            cutoff={cutoff}
                            resonance={resonance}
                            envAmount={envAmount}
                        />
                    </Track>
                </Sequencer>
            )}
        </>
    );
}

// ============================================================================
// Drum Row Component
// ============================================================================

interface DrumRowProps {
    label: string;
    pattern: Pattern;
    currentStep: number;
    isPlaying: boolean;
    muted: boolean;
    onToggle: (step: number) => void;
    onMuteToggle: () => void;
    color: string;
}

const DrumRow: FC<DrumRowProps> = ({
    label,
    pattern,
    currentStep,
    isPlaying,
    muted,
    onToggle,
    onMuteToggle,
    color,
}) => {
    return (
        <div className={`sequencer-row ${muted ? 'muted' : ''}`}>
            <div className="row-controls">
                <span className="row-label" style={{ color }}>{label}</span>
                <button
                    className={`mute-btn ${muted ? 'active' : ''}`}
                    onClick={onMuteToggle}
                    aria-label={`${muted ? 'Unmute' : 'Mute'} ${label}`}
                >
                    {muted ? 'M' : '○'}
                </button>
            </div>
            <div className="step-buttons">
                {pattern.map((value, i) => (
                    <button
                        key={i}
                        className={`step-btn ${value ? 'on' : ''} ${isPlaying && currentStep === i ? 'current' : ''} ${i % 4 === 0 ? 'beat-start' : ''}`}
                        onClick={() => onToggle(i)}
                        aria-label={`${label} step ${i + 1} ${value ? 'on' : 'off'}`}
                        style={{
                            '--step-color': color,
                        } as React.CSSProperties}
                    />
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// Acid Row Component
// ============================================================================

interface AcidRowProps {
    pattern: AcidPattern;
    currentStep: number;
    isPlaying: boolean;
    muted: boolean;
    onToggle: (step: number) => void;
    onAccentToggle: (step: number) => void;
}

const AcidRow: FC<AcidRowProps> = ({
    pattern,
    currentStep,
    isPlaying,
    muted,
    onToggle,
    onAccentToggle,
}) => {
    return (
        <div className={`sequencer-row acid-row ${muted ? 'muted' : ''}`}>
            <div className="row-controls">
                <span className="row-label acid-label">ACID</span>
            </div>
            <div className="step-buttons">
                {pattern.steps.map((value, i) => (
                    <div key={i} className="acid-step-container">
                        <button
                            className={`step-btn acid ${value ? 'on' : ''} ${pattern.accents[i] ? 'accent' : ''} ${isPlaying && currentStep === i ? 'current' : ''} ${i % 4 === 0 ? 'beat-start' : ''}`}
                            onClick={() => onToggle(i)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                onAccentToggle(i);
                            }}
                            aria-label={`Acid step ${i + 1} ${value ? 'on' : 'off'} ${pattern.accents[i] ? 'accented' : ''}`}
                        />
                        {value === 1 && (
                            <span className="note-indicator">{pattern.notes[i] % 12}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// TR-909 Drum Synth Components
// ============================================================================

/**
 * TR-909 Bass Drum - Sine wave with pitch envelope
 */
const BassDrum: FC = () => {
    const { context } = useAudio();
    const { subscribe } = useTriggerContextSafe();

    useEffect(() => {
        if (!context || !subscribe) return;

        const unsub = subscribe((event) => {
            // Create bass drum sound using Web Audio directly for precise envelope
            const now = event.time;
            const velocity = event.velocity;

            // Oscillator for the bass
            const osc = context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

            // Gain envelope
            const gain = context.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.8 * velocity, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            // Connect
            osc.connect(gain);
            gain.connect(context.destination);

            // Play
            osc.start(now);
            osc.stop(now + 0.35);
        });

        return unsub;
    }, [context, subscribe]);

    return null;
};

/**
 * TR-909 Hi-Hat - Filtered noise
 */
const HiHat: FC = () => {
    return (
        <Gain gain={0.15}>
            <Filter type="highpass" frequency={8000} Q={1}>
                <NoiseBurst type="white" duration={0.08} attack={0.001} release={0.03} />
            </Filter>
        </Gain>
    );
};

/**
 * TR-909 Clap - Multiple noise bursts with filtering
 */
const Clap: FC = () => {
    return (
        <Gain gain={0.25}>
            <Filter type="bandpass" frequency={1200} Q={1.5}>
                <NoiseBurst type="white" duration={0.1} attack={0.001} release={0.08} />
            </Filter>
        </Gain>
    );
};

/**
 * TR-909 Tone - Triangle wave with pitch envelope
 */
const ToneDrum: FC = () => {
    const { context } = useAudio();
    const { subscribe } = useTriggerContextSafe();

    useEffect(() => {
        if (!context || !subscribe) return;

        const unsub = subscribe((event) => {
            const now = event.time;
            const velocity = event.velocity;

            const osc = context.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

            const gain = context.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3 * velocity, now + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.connect(gain);
            gain.connect(context.destination);

            osc.start(now);
            osc.stop(now + 0.25);
        });

        return unsub;
    }, [context, subscribe]);

    return null;
};

// ============================================================================
// TB-303 Acid Synth Component
// ============================================================================

interface AcidSynthProps {
    notes: number[];
    accents: Pattern;
    cutoff: number;
    resonance: number;
    envAmount: number;
}

const AcidSynth: FC<AcidSynthProps> = ({ notes, accents, cutoff, resonance, envAmount }) => {
    const { context } = useAudio();
    const { subscribe } = useTriggerContextSafe();

    // Store refs for current parameters
    const paramsRef = useRef({ notes, accents, cutoff, resonance, envAmount });
    paramsRef.current = { notes, accents, cutoff, resonance, envAmount };

    useEffect(() => {
        if (!context || !subscribe) return;

        const unsub = subscribe((event) => {
            const { notes, accents, cutoff, resonance, envAmount } = paramsRef.current;
            const now = event.time;
            const step = event.step;
            const velocity = event.velocity;
            const duration = event.duration;

            const note = notes[step % notes.length];
            const freq = midiToFreq(note);
            const isAccent = accents[step % accents.length] === 1;

            // Create oscillator
            const osc = context.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            // Filter with envelope
            const filter = context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.setValueAtTime(resonance, now);

            // Filter envelope - characteristic 303 squelch
            const peakCutoff = cutoff + (isAccent ? envAmount * 1.5 : envAmount);
            filter.frequency.setValueAtTime(peakCutoff, now);
            filter.frequency.exponentialRampToValueAtTime(cutoff, now + 0.15);

            // Amp envelope
            const gain = context.createGain();
            const ampLevel = isAccent ? 0.4 * velocity : 0.25 * velocity;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(ampLevel, now + 0.005);
            gain.gain.setValueAtTime(ampLevel, now + duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.95);

            // Connect
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(context.destination);

            // Play
            osc.start(now);
            osc.stop(now + duration);
        });

        return unsub;
    }, [context, subscribe]);

    return null;
};

// ============================================================================
// Trigger Context Hook (Safe version)
// ============================================================================

import { useTriggerContext } from 'react-din';

function useTriggerContextSafe() {
    try {
        return useTriggerContext();
    } catch {
        return { subscribe: null, currentTrigger: null, trackId: null };
    }
}
