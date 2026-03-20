import { render, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';
import {
    ADSR,
    AudioProvider,
    Compressor,
    Delay,
    Filter,
    Gain,
    Osc,
    Panner,
    StereoPanner,
    WaveShaper,
} from 'react-din';

describe('library audio node components', () => {
    it('wires a representative graph and auto-starts oscillators', async () => {
        const oscRef = createRef<OscillatorNode>();
        const gainRef = createRef<AudioNode>();

        render(
            <AudioProvider>
                <Gain gain={0.5} nodeRef={gainRef}>
                    <Filter frequency={880}>
                        <Delay delayTime={0.2}>
                            <Compressor>
                                <Panner positionX={1}>
                                    <StereoPanner pan={-0.1}>
                                        <WaveShaper curve={new Float32Array([-1, -0.2, 0, 0.2, 1])}>
                                            <ADSR trigger>
                                                <Osc nodeRef={oscRef} autoStart type="sawtooth" />
                                            </ADSR>
                                        </WaveShaper>
                                    </StereoPanner>
                                </Panner>
                            </Compressor>
                        </Delay>
                    </Filter>
                </Gain>
            </AudioProvider>
        );

        await waitFor(() => {
            expect(gainRef.current).not.toBeNull();
            expect(oscRef.current).not.toBeNull();
            expect((oscRef.current as unknown as { started?: boolean }).started).toBe(true);
        });
    });
});
