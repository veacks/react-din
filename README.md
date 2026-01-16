# react-din

A React-first declarative WebAudio library for building audio graphs.

Build complex audio graphs using React's declarative paradigm. Audio nodes are represented as React components that automatically connect based on their parent-child relationships.

## Features

- 🎛️ **Declarative Audio Graph** - Build audio graphs using JSX components
- 🔊 **AudioContext Management** - Automatic context creation, unlock handling, and master bus
- 🎹 **Sequencer & Transport** - Musical timing with BPM, time signature, and step sequencing
- 🎯 **Scoped Triggers** - Per-track trigger events for instruments
- 📊 **Analyzers** - FFT, waveform, and metering analysis
- 🎨 **Effects** - Reverb, Chorus, Distortion, and more
- 🖥️ **SSR-Safe** - No AudioContext errors on the server
- ⚡ **Headless** - No DOM output, pure audio graph
- 🔊 **3D Spatial Audio** - Built-in Panner for 3D positioning

## Installation

```bash
npm install react-din
# or
yarn add react-din
# or
pnpm add react-din
```

## Quick Start

```tsx
import { AudioProvider, Gain, Filter, Osc } from 'react-din';

function App() {
  return (
    <AudioProvider masterGain={0.8}>
      <Gain gain={0.5}>
        <Filter type="lowpass" frequency={1000}>
          <Osc type="sawtooth" frequency={440} autoStart />
        </Filter>
      </Gain>
    </AudioProvider>
  );
}
```

## Core Concepts

### Audio Graph

Components automatically connect to their parent's output. The tree structure defines the audio routing:

```tsx
<AudioProvider>           {/* Creates AudioContext + master bus */}
  <Gain gain={0.8}>       {/* Connects to master bus */}
    <Filter>              {/* Connects to Gain above */}
      <Osc />             {/* Connects to Filter above */}
    </Filter>
  </Gain>
</AudioProvider>
```

### Sequencer & Tracks

Create step sequences with pattern-based triggering:

```tsx
import { Sequencer, Track, useTrigger, Sampler } from 'react-din';

function DrumMachine() {
  return (
    <Sequencer bpm={120} steps={16} loop autoStart>
      <Track id="kick" pattern={[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0]}>
        <Sampler src="/kick.wav" />
      </Track>
      <Track id="snare" pattern={[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]}>
        <Sampler src="/snare.wav" />
      </Track>
    </Sequencer>
  );
}
```

### Transport

Use musical timing with the transport system:

```tsx
import { TransportProvider, useTransport, useBeat } from 'react-din';

function PlayButton() {
  const { isPlaying, play, stop, bpm } = useTransport();
  
  return (
    <button onClick={isPlaying ? stop : play}>
      {isPlaying ? '⏹' : '▶'} {bpm} BPM
    </button>
  );
}

function BeatDisplay() {
  const { beat, bar, step } = useBeat('step');
  return <div>Bar {bar + 1}, Beat {beat + 1}</div>;
}
```

### Analyzers

Analyze audio with FFT and metering:

```tsx
import { useFFT, useMeter, Analyzer } from 'react-din';

function Visualizer() {
  const { bass, mid, high, spectrum } = useFFT({ fftSize: 512 });
  const { rmsDb, isClipping } = useMeter();
  
  return (
    <div style={{ transform: `scale(${1 + bass * 0.5})` }}>
      Level: {rmsDb.toFixed(1)} dB
    </div>
  );
}
```

### Effects

Apply effects to audio:

```tsx
import { Reverb, Chorus, Distortion } from 'react-din/effects';

function EffectsChain() {
  return (
    <Reverb decay={2} mix={0.3}>
      <Chorus rate={1.5} depth={3} mix={0.4}>
        <Distortion type="soft" drive={0.5}>
          <Osc type="sawtooth" frequency={220} />
        </Distortion>
      </Chorus>
    </Reverb>
  );
}
```

### 3D Spatial Audio

Use the Panner component for 3D positional audio:

```tsx
import { AudioProvider, Panner, Sampler } from 'react-din';

function SpatialAudio() {
  const [position, setPosition] = useState({ x: 0, y: 0, z: -5 });
  
  return (
    <AudioProvider>
      <Panner
        positionX={position.x}
        positionY={position.y}
        positionZ={position.z}
        panningModel="HRTF"
        distanceModel="inverse"
        refDistance={1}
        maxDistance={10000}
        rolloffFactor={1}
      >
        <Sampler src="/ambient.wav" loop autoStart />
      </Panner>
    </AudioProvider>
  );
}
```

## API Reference

### Core

| Export | Type | Description |
|--------|------|-------------|
| `AudioProvider` | Component | Root provider, owns AudioContext |
| `useAudio` | Hook | Access AudioContext and state |

### Nodes

| Export | Type | Description |
|--------|------|-------------|
| `Gain` | Component | Volume control |
| `Filter` | Component | Biquad filter (lowpass, highpass, etc.) |
| `Osc` | Component | Oscillator (sine, square, sawtooth, triangle) |
| `Delay` | Component | Delay effect |
| `Compressor` | Component | Dynamics compressor |
| `Convolver` | Component | Convolution reverb |
| `Panner` | Component | 3D spatial audio |
| `StereoPanner` | Component | Simple L/R panning |
| `WaveShaper` | Component | Distortion/waveshaping |

### Transport

| Export | Type | Description |
|--------|------|-------------|
| `TransportProvider` | Component | Musical timing provider |
| `useTransport` | Hook | Access transport state and controls |
| `useBeat` | Hook | Reactive time position |

### Sequencer

| Export | Type | Description |
|--------|------|-------------|
| `Sequencer` | Component | Step sequencer |
| `Track` | Component | Defines pattern and triggers children |
| `useTrigger` | Hook | Receive trigger events (state-based) |
| `useOnTrigger` | Hook | Receive trigger events (callback-based) |

### Analyzers

| Export | Type | Description |
|--------|------|-------------|
| `Analyzer` | Component | Analysis node |
| `useAnalyzer` | Hook | Raw analysis data |
| `useFFT` | Hook | Frequency band analysis |
| `useMeter` | Hook | Level metering |

### Sources

| Export | Type | Description |
|--------|------|-------------|
| `Sampler` | Component | Audio buffer playback |
| `Noise` | Component | Noise generator |
| `MediaStream` | Component | Microphone/stream input |
| `ConstantSource` | Component | Constant value source |

### Effects

| Export | Type | Description |
|--------|------|-------------|
| `Reverb` | Component | Algorithmic/convolution reverb |
| `Chorus` | Component | Chorus effect |
| `Distortion` | Component | Distortion/overdrive |

### Utils

| Export | Type | Description |
|--------|------|-------------|
| `useFrame` | Hook | Per-frame updates |
| `tickAudio` | Function | Manual frame tick for external loops |
| `isSSR` | Function | Check if running on server |

## Spatial Audio with @react-three/drei

If you're using [react-three-fiber](https://github.com/pmndrs/react-three-fiber) for 3D graphics, you can integrate spatial audio using `@react-three/drei`'s `PositionalAudio` component which wraps Three.js Audio system.

```tsx
import { Canvas } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';

function Scene() {
  return (
    <Canvas>
      {/* Moving audio source in 3D space */}
      <mesh position={[5, 0, 0]}>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial color="hotpink" />
        <PositionalAudio
          url="/sounds/ambient.mp3"
          distance={1}
          loop
          autoplay
        />
      </mesh>
      
      {/* Camera acts as the listener */}
      <OrbitControls />
    </Canvas>
  );
}
```

For more advanced Three.js audio integration, see the [drei PositionalAudio documentation](https://github.com/pmndrs/drei#positionalaudio).

## License

MIT
