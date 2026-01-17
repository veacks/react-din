// =============================================================================
// Notes Module - Type Definitions
// =============================================================================

/**
 * English note names (sharps/flats)
 */
export type NoteName =
    | 'C' | 'C#' | 'Db'
    | 'D' | 'D#' | 'Eb'
    | 'E'
    | 'F' | 'F#' | 'Gb'
    | 'G' | 'G#' | 'Ab'
    | 'A' | 'A#' | 'Bb'
    | 'B';

/**
 * French note names (solfege)
 * Accented chars like "Re" accepted as alias for "Re" (ASCII-only in source)
 */
export type FrenchNoteName =
    | 'Do' | 'Do#' | 'Dob'
    | 'Re' | 'Re#' | 'Reb'
    | 'Mi' | 'Mib'
    | 'Fa' | 'Fa#' | 'Fab'
    | 'Sol' | 'Sol#' | 'Solb'
    | 'La' | 'La#' | 'Lab'
    | 'Si' | 'Sib';

/**
 * Note string with octave (e.g., "C4", "Do3", "F#5")
 */
export type NoteString = `${NoteName | FrenchNoteName}${number}`;

/**
 * Parsed note result
 */
export interface ParsedNote {
    /** Base note name (English) */
    note: NoteName;
    /** Octave number */
    octave: number;
    /** MIDI note number */
    midi: number;
    /** Frequency in Hz */
    frequency: number;
}

/**
 * Input types accepted by note functions
 */
export type NoteInput = number | string | NoteString;
