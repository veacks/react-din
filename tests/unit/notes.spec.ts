import {
    midiToFreq,
    midiToNote,
    noteFromFrench,
    noteToFrench,
    noteToFreq,
    noteToMidi,
    parseNote,
} from '../../src/notes/noteUtils';

describe('note utils', () => {
    it('parses English and French note names', () => {
        expect(parseNote('C4').midi).toBe(60);
        expect(parseNote('Do4').frequency).toBeCloseTo(261.63, 1);
        expect(noteToMidi('Sol#2')).toBe(44);
        expect(noteToFreq('La4')).toBeCloseTo(440, 5);
    });

    it('converts between note formats', () => {
        expect(midiToNote(61, true)).toBe('Db4');
        expect(midiToFreq(69)).toBeCloseTo(440, 5);
        expect(noteToFrench('G#')).toBe('Sol#');
        expect(noteFromFrench('Reb')).toBe('Db');
    });
});
