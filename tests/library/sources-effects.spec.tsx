import { render } from '@testing-library/react';
import React from 'react';
import {
    AudioProvider,
    Chorus,
    ConstantSource,
    Distortion,
    EventTrigger,
    LFO,
    Noise,
    NoiseBurst,
    Reverb,
    Sampler,
} from 'react-din';

describe('sources and effects', () => {
    it('mounts representative source and effect chains without crashing', () => {
        const onLoad = vi.fn();

        expect(() =>
            render(
                <AudioProvider>
                    <Reverb mix={0.3}>
                        <Chorus rate={1.5}>
                            <Distortion drive={0.4}>
                                <Noise autoStart />
                                <EventTrigger token={1} trackId="ui-feedback">
                                    <NoiseBurst type="white" duration={0.05} />
                                </EventTrigger>
                                <ConstantSource offset={0.5} />
                                <LFO rate={2} depth={0.2} />
                                <Sampler src="/samples/kick.wav" onLoad={onLoad} />
                            </Distortion>
                        </Chorus>
                    </Reverb>
                </AudioProvider>
            )
        ).not.toThrow();
    });
});
