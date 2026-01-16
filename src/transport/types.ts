// =============================================================================
// Time Position
// =============================================================================

/**
 * Musical time position representing the current playhead location.
 */
export interface TimePosition {
    /**
     * Current step (16th note, 0-indexed).
     * Resets each beat.
     */
    step: number;

    /**
     * Current beat within the bar (0-indexed).
     * Resets each bar.
     */
    beat: number;

    /**
     * Current bar within the phrase (0-indexed).
     * Resets each phrase.
     */
    bar: number;

    /**
     * Current phrase (0-indexed).
     * Increments indefinitely.
     */
    phrase: number;

    /**
     * Total elapsed steps since transport start.
     */
    totalSteps: number;

    /**
     * Total elapsed time in seconds since transport start.
     */
    totalTime: number;
}

// =============================================================================
// Transport Configuration
// =============================================================================

/**
 * Configuration for the musical transport.
 */
export interface TransportConfig {
    /**
     * Tempo in beats per minute.
     * @default 120
     */
    bpm: number;

    /**
     * Time signature numerator (beats per bar).
     * @default 4
     */
    beatsPerBar: number;

    /**
     * Time signature denominator (note value that gets one beat).
     * @default 4
     */
    beatUnit: number;

    /**
     * Number of bars per phrase.
     * @default 4
     */
    barsPerPhrase: number;

    /**
     * Number of steps (subdivisions) per beat.
     * @default 4 (16th notes)
     */
    stepsPerBeat: number;

    /**
     * Swing amount (0-1).
     * 0 = straight timing
     * 0.5 = triplet feel
     * @default 0
     */
    swing?: number;

    /**
     * Swing subdivision.
     * Applies swing to every Nth step.
     * @default 2
     */
    swingSubdivision?: number;
}

// =============================================================================
// Transport State
// =============================================================================

/**
 * Full transport state including playback controls.
 */
export interface TransportState extends TimePosition {
    /**
     * Whether the transport is currently playing.
     */
    isPlaying: boolean;

    /**
     * Current tempo in BPM.
     */
    bpm: number;

    /**
     * Duration of one step in seconds.
     */
    stepDuration: number;

    /**
     * Duration of one beat in seconds.
     */
    beatDuration: number;

    /**
     * Duration of one bar in seconds.
     */
    barDuration: number;

    /**
     * Duration of one phrase in seconds.
     */
    phraseDuration: number;

    /**
     * Start playback from current position.
     */
    play: () => void;

    /**
     * Stop playback and reset position to start.
     */
    stop: () => void;

    /**
     * Pause playback at current position.
     */
    pause: () => void;

    /**
     * Jump to a specific position.
     * @param position - Partial position (unspecified values default to 0)
     */
    seek: (position: Partial<TimePosition>) => void;

    /**
     * Set the tempo.
     * @param bpm - New tempo in beats per minute
     */
    setTempo: (bpm: number) => void;

    /**
     * Update transport configuration.
     * @param config - Partial configuration to merge
     */
    setConfig: (config: Partial<TransportConfig>) => void;
}

// =============================================================================
// Transport Events
// =============================================================================

/**
 * Events emitted by the transport for scheduling.
 */
export interface TransportEvents {
    /**
     * Fired on each step.
     */
    onStep?: (step: number, time: number) => void;

    /**
     * Fired on each beat.
     */
    onBeat?: (beat: number, time: number) => void;

    /**
     * Fired on each bar.
     */
    onBar?: (bar: number, time: number) => void;

    /**
     * Fired on each phrase.
     */
    onPhrase?: (phrase: number, time: number) => void;

    /**
     * Fired when playback starts.
     */
    onPlay?: () => void;

    /**
     * Fired when playback stops.
     */
    onStop?: () => void;

    /**
     * Fired when playback pauses.
     */
    onPause?: () => void;
}
