// =============================================================================
// Core Module Exports
// =============================================================================

// Types
export type {
    AudioContextRef,
    AudioState,
    AudioProviderProps,
    AudioContextState,
    AudioOutContextValue,
} from './types';

// Modulatable Value Types
export type {
    LFOOutput,
    LFOWaveform,
    ModulatableValue,
} from './ModulatableValue';
export { isLFOOutput, getNumericValue } from './ModulatableValue';

// Components (signatures only - implementation not included)
export { AudioProvider } from './AudioProvider';

// Hooks
export { useAudio } from './useAudio';

// Internal (for advanced use cases)
export { AudioOutProvider, useAudioOut } from './AudioOutContext';

