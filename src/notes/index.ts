// =============================================================================
// Notes Module Exports
// =============================================================================

// Types
export type {
    NoteName,
    FrenchNoteName,
    NoteString,
    NoteInput,
    ParsedNote,
} from './types';

// Utils
export {
    parseNote,
    noteToMidi,
    midiToNote,
    midiToFreq,
    noteToFreq,
    noteToFrench,
    noteFromFrench,
} from './noteUtils';
