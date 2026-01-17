// =============================================================================
// Synths Module Exports
// =============================================================================

// Types
export type {
    EnvelopeConfig,
    OscillatorConfig,
    OscillatorWaveType,
    FilterConfig,
    FilterTypeOption,
    BaseSynthProps,
    SynthProps,
    MonoSynthProps,
    FMSynthProps,
    AMSynthProps,
    NoiseSynthProps,
    EnvelopeProps,
} from './types';

export type {
    DrumSynthProps,
    DrumOscillatorConfig,
    DrumNoiseConfig,
} from './DrumSynth';

export {
    DEFAULT_ENVELOPE,
    DEFAULT_OSCILLATOR,
    DEFAULT_FILTER,
} from './types';

// Hooks
export { useEnvelope } from './useEnvelope';
export type { UseEnvelopeResult } from './useEnvelope';

// Components
export { Envelope } from './Envelope';
export { Synth } from './Synth';
export { MonoSynth } from './MonoSynth';
export { FMSynth } from './FMSynth';
export { AMSynth } from './AMSynth';
export { NoiseSynth } from './NoiseSynth';
export { DrumSynth } from './DrumSynth';
