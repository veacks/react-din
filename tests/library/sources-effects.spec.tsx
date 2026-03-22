import { render } from '@testing-library/react';
import React from 'react';
import {
    AudioProvider,
    AuxReturn,
    AuxSend,
    Chorus,
    ConstantSource,
    Distortion,
    EQ3,
    EventTrigger,
    Flanger,
    LFO,
    MatrixMixer,
    Noise,
    NoiseBurst,
    Phaser,
    Reverb,
    Sampler,
    Tremolo,
    TriggeredSampler,
} from 'react-din';

describe('sources and effects', () => {
    it('mounts representative source and effect chains without crashing', () => {
        const onLoad = vi.fn();

        expect(() =>
            render(
                <AudioProvider>
                    <AuxSend busId="duck" sendGain={0.8}>
                        <Noise autoStart />
                    </AuxSend>
                    <AuxReturn busId="duck" gain={0.3} />
                    <MatrixMixer inputs={4} outputs={4}>
                        <Reverb mix={0.3}>
                            <Chorus rate={1.5}>
                                <Phaser rate={0.4}>
                                    <Flanger rate={0.2}>
                                        <Tremolo rate={4}>
                                            <EQ3 low={2} high={-1}>
                                                <Distortion drive={0.4}>
                                                    <Noise autoStart />
                                                    <EventTrigger token={1} trackId="ui-feedback">
                                                        <NoiseBurst type="white" duration={0.05} />
                                                    </EventTrigger>
                                                    <EventTrigger token={2} trackId="ui-triggered-sampler">
                                                        <TriggeredSampler src="/samples/kick.wav" />
                                                    </EventTrigger>
                                                    <ConstantSource offset={0.5} />
                                                    <LFO rate={2} depth={0.2} />
                                                    <Sampler src="/samples/kick.wav" onLoad={onLoad} />
                                                </Distortion>
                                            </EQ3>
                                        </Tremolo>
                                    </Flanger>
                                </Phaser>
                            </Chorus>
                        </Reverb>
                    </MatrixMixer>
                </AudioProvider>
            )
        ).not.toThrow();
    });

    it('keeps din-core-backed source and effect helpers mountable', () => {
        expect(() =>
            render(
                <AudioProvider>
                    <Reverb decay={1.5} preDelay={0.02} damping={0.35} mix={0.25}>
                        <Distortion type="saturate" drive={0.6} tone={1800}>
                            <Noise type="pink" autoStart />
                            <EventTrigger token={1} trackId="accent">
                                <NoiseBurst type="brown" duration={0.08} />
                            </EventTrigger>
                        </Distortion>
                    </Reverb>
                </AudioProvider>
            )
        ).not.toThrow();
    });
});
