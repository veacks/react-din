// =============================================================================
// react-din - Declarative WebAudio for React
// =============================================================================
// A React-first library for building audio graphs declaratively.
// =============================================================================

// -----------------------------------------------------------------------------
// Core
// -----------------------------------------------------------------------------
export {
    // Components
    AudioProvider,
    // Hooks
    useAudio,
    // Internal (advanced use)
    AudioOutProvider,
    useAudioOut,
} from './core';

export type {
    AudioContextRef,
    AudioState,
    AudioProviderProps,
    AudioContextState,
    AudioOutContextValue,
} from './core';

// -----------------------------------------------------------------------------
// Nodes
// -----------------------------------------------------------------------------
export {
    // Components
    Gain,
    Filter,
    Osc,
    Delay,
    Compressor,
    Convolver,
    Panner,
    StereoPanner,
    WaveShaper,
    // Hooks
    useAudioNode,
} from './nodes';

export type {
    AudioNodeProps,
    GainProps,
    FilterProps,
    FilterType,
    OscProps,
    OscillatorType,
    DelayProps,
    CompressorProps,
    ConvolverProps,
    PannerProps,
    StereoPannerProps,
    WaveShaperProps,
    OversampleType,
} from './nodes';

// -----------------------------------------------------------------------------
// Transport
// -----------------------------------------------------------------------------
export {
    // Components
    TransportProvider,
    // Hooks
    useTransport,
    useBeat,
    useStep,
    useBar,
    usePhrase,
} from './transport';

export type {
    TimePosition,
    TransportConfig,
    TransportState,
    TransportEvents,
} from './transport';

// -----------------------------------------------------------------------------
// Sequencer
// -----------------------------------------------------------------------------
export {
    // Components
    Sequencer,
    Track,
    // Hooks
    useTrigger,
    useOnTrigger,
    // Context (advanced)
    TriggerContext,
    useTriggerContext,
} from './sequencer';

export type {
    Pattern,
    TriggerEvent,
    SequencerProps,
    TrackProps,
    UseTriggerOptions,
    SequencerContextValue,
    TrackContextValue,
} from './sequencer';

// -----------------------------------------------------------------------------
// Analyzers
// -----------------------------------------------------------------------------
export {
    // Components
    Analyzer,
    // Hooks
    useAnalyzer,
    useFFT,
    useMeter,
    useWaveform,
    useRMS,
    usePeak,
} from './analyzers';

export type {
    AnalyzerData,
    AnalyzerProps,
    UseAnalyzerOptions,
    FFTData,
    WaveformData,
    MeterData,
} from './analyzers';

// -----------------------------------------------------------------------------
// Sources
// -----------------------------------------------------------------------------
export {
    Sampler,
    Noise,
    NoiseBurst,
    MediaStream,
    ConstantSource,
} from './sources';

export type {
    SourceNodeProps,
    SamplerProps,
    NoiseProps,
    NoiseType,
    NoiseBurstProps,
    MediaStreamProps,
    ConstantSourceProps,
} from './sources';


// -----------------------------------------------------------------------------
// Effects (Extension)
// -----------------------------------------------------------------------------
export {
    Reverb,
    Chorus,
    Distortion,
} from './effects';

export type {
    EffectProps,
    ReverbProps,
    ReverbType,
    ChorusProps,
    DistortionProps,
    DistortionType,
    PhaserProps,
    FlangerProps,
    TremoloProps,
    EQ3Props,
} from './effects';

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------
export {
    useFrame,
    tickAudio,
    useAnimationFrame,
    isSSR,
    getAudioContext,
} from './utils';
