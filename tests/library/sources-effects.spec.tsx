import { render } from '@testing-library/react';
import React from 'react';
import { AudioProvider, EventTrigger } from '@open-din/react';
import { Chorus, Distortion, EQ3, Flanger, Phaser, Reverb, Tremolo } from '@open-din/react/effects';
import { AuxReturn, AuxSend, MatrixMixer } from '@open-din/react/routing';
import {
    ConstantSource,
    LFO,
    Noise,
    NoiseBurst,
    Sampler,
    TriggeredSampler,
} from '@open-din/react/sources';

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
});
