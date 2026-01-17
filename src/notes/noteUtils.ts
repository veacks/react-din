// =============================================================================
// Notes Module - Utility Functions
// =============================================================================

import type { NoteName, NoteInput, ParsedNote } from './types';

// =============================================================================
// Constants
// =============================================================================

/**
 * English note names to semitone offset from C
 */
const NOTE_TO_SEMITONE: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4, 'E#': 5,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11, 'B#': 0,
};

/**
 * Semitone to note name (default to sharps)
 */
const SEMITONE_TO_NOTE_SHARP: NoteName[] = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

/**
 * Semitone to note name (flats)
 */
const SEMITONE_TO_NOTE_FLAT: NoteName[] = [
    'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
];

/**
 * French to English note mapping
 * Accept "Re" as alias for French accented "Re" (ASCII-only source)
 */
const FRENCH_TO_ENGLISH: Record<string, string> = {
    'Do': 'C',
    'Re': 'D',  // Accepts both "Re" and accented versions
    'Mi': 'E',
    'Fa': 'F',
    'Sol': 'G',
    'La': 'A',
    'Si': 'B',
};

/**
 * English to French note mapping
 */
const ENGLISH_TO_FRENCH: Record<string, string> = {
    'C': 'Do',
    'D': 'Re',
    'E': 'Mi',
    'F': 'Fa',
    'G': 'Sol',
    'A': 'La',
    'B': 'Si',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Normalize accented characters to ASCII equivalents
 * Handles French accented chars like "Re" -> "Re"
 */
function normalizeAccents(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convert French note name to English
 */
function frenchToEnglish(note: string): string {
    const normalized = normalizeAccents(note);

    // Check for French note with accidental (e.g., "Do#", "Reb", "Sol#")
    const frenchMatch = normalized.match(/^(Do|Re|Mi|Fa|Sol|La|Si)(#|b)?$/i);
    if (frenchMatch) {
        const baseFrench = frenchMatch[1].charAt(0).toUpperCase() + frenchMatch[1].slice(1).toLowerCase();
        const accidental = frenchMatch[2] || '';

        // Special case for "Sol" which starts with capital S
        const lookupKey = baseFrench === 'Sol' ? 'Sol' : baseFrench;
        const english = FRENCH_TO_ENGLISH[lookupKey];

        if (english) {
            return english + accidental;
        }
    }

    return note;
}

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Parse a note input into its components.
 *
 * @param input - MIDI number, note string (e.g., "C4", "Do3", "F#5")
 * @returns Parsed note with name, octave, MIDI, and frequency
 *
 * @example
 * ```ts
 * parseNote('C4');     // { note: 'C', octave: 4, midi: 60, frequency: 261.63 }
 * parseNote('Do3');    // { note: 'C', octave: 3, midi: 48, frequency: 130.81 }
 * parseNote(69);       // { note: 'A', octave: 4, midi: 69, frequency: 440 }
 * parseNote('Sol#2');  // { note: 'G#', octave: 2, midi: 44, frequency: 92.50 }
 * ```
 */
export function parseNote(input: NoteInput): ParsedNote {
    // Handle MIDI number
    if (typeof input === 'number') {
        const midi = Math.round(input);
        const octave = Math.floor(midi / 12) - 1;
        const semitone = midi % 12;
        const note = SEMITONE_TO_NOTE_SHARP[semitone];
        const frequency = midiToFreq(midi);

        return { note, octave, midi, frequency };
    }

    // Handle note string
    const normalized = normalizeAccents(input.trim());

    // Try to match note name with optional accidental and octave
    // Matches: C4, C#4, Db4, Do3, Do#3, Sol#2, etc.
    const match = normalized.match(/^([A-Za-z]+)(#|b)?(-?\d+)?$/);

    if (!match) {
        throw new Error(`Invalid note format: "${input}"`);
    }

    let notePart = match[1] + (match[2] || '');
    const octaveStr = match[3];

    // Convert French to English if needed
    notePart = frenchToEnglish(notePart);

    // Normalize case for lookup
    const noteUpper = notePart.charAt(0).toUpperCase() + notePart.slice(1).toLowerCase();

    // Look up semitone
    const semitone = NOTE_TO_SEMITONE[noteUpper];
    if (semitone === undefined) {
        throw new Error(`Unknown note name: "${notePart}" (from "${input}")`);
    }

    // Parse octave (default to 4 if not specified)
    const octave = octaveStr !== undefined ? parseInt(octaveStr, 10) : 4;

    // Calculate MIDI
    const midi = (octave + 1) * 12 + semitone;

    // Calculate frequency
    const frequency = midiToFreq(midi);

    // Normalize note name
    const note = SEMITONE_TO_NOTE_SHARP[semitone];

    return { note, octave, midi, frequency };
}

/**
 * Convert a note string to MIDI number.
 *
 * @param note - Note string (e.g., "C4", "Do3", "F#5") or just note name
 * @param octave - Optional octave if not included in note string
 * @returns MIDI note number (0-127)
 *
 * @example
 * ```ts
 * noteToMidi('C4');      // 60
 * noteToMidi('A4');      // 69
 * noteToMidi('C', 4);    // 60
 * noteToMidi('Do4');     // 60 (French)
 * noteToMidi('Sol#2');   // 44 (French with sharp)
 * ```
 */
export function noteToMidi(note: string, octave?: number): number {
    if (octave !== undefined) {
        // Combine note name with octave
        return parseNote(`${note}${octave}`).midi;
    }
    return parseNote(note).midi;
}

/**
 * Convert a MIDI number to note string.
 *
 * @param midi - MIDI note number (0-127)
 * @param preferFlats - Use flat names instead of sharps
 * @returns Note string (e.g., "C4", "Bb3")
 *
 * @example
 * ```ts
 * midiToNote(60);        // "C4"
 * midiToNote(69);        // "A4"
 * midiToNote(61);        // "C#4"
 * midiToNote(61, true);  // "Db4"
 * ```
 */
export function midiToNote(midi: number, preferFlats = false): string {
    const midiRounded = Math.round(midi);
    const octave = Math.floor(midiRounded / 12) - 1;
    const semitone = midiRounded % 12;
    const noteTable = preferFlats ? SEMITONE_TO_NOTE_FLAT : SEMITONE_TO_NOTE_SHARP;
    const note = noteTable[semitone];

    return `${note}${octave}`;
}

/**
 * Convert a MIDI number to frequency in Hz.
 *
 * @param midi - MIDI note number
 * @returns Frequency in Hz
 *
 * @example
 * ```ts
 * midiToFreq(69);  // 440 (A4)
 * midiToFreq(60);  // 261.63 (C4)
 * ```
 */
export function midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convert a note to frequency in Hz.
 * Accepts MIDI number, note string, or French note name.
 *
 * @param note - Note input (MIDI number or note string)
 * @returns Frequency in Hz
 *
 * @example
 * ```ts
 * noteToFreq('A4');     // 440
 * noteToFreq('C4');     // 261.63
 * noteToFreq('Do4');    // 261.63 (French)
 * noteToFreq(69);       // 440
 * ```
 */
export function noteToFreq(note: NoteInput): number {
    if (typeof note === 'number') {
        return midiToFreq(note);
    }
    return parseNote(note).frequency;
}

/**
 * Convert English note name to French (solfege).
 *
 * @param note - English note name
 * @returns French note name
 *
 * @example
 * ```ts
 * noteToFrench('C');   // "Do"
 * noteToFrench('G#');  // "Sol#"
 * ```
 */
export function noteToFrench(note: string): string {
    const match = note.match(/^([A-G])(#|b)?$/i);
    if (!match) return note;

    const base = match[1].toUpperCase();
    const accidental = match[2] || '';
    const french = ENGLISH_TO_FRENCH[base];

    return french ? `${french}${accidental}` : note;
}

/**
 * Convert French note name to English.
 *
 * @param note - French note name (solfege)
 * @returns English note name
 *
 * @example
 * ```ts
 * noteFromFrench('Do');    // "C"
 * noteFromFrench('Sol#');  // "G#"
 * ```
 */
export function noteFromFrench(note: string): string {
    return frenchToEnglish(note);
}
