import { render } from '@testing-library/react';
import React from 'react';
import { AudioProvider } from '@open-din/react';
import { Analyzer } from '@open-din/react/analyzers';
import { Gain, Osc } from '@open-din/react/nodes';

describe('Analyzer', () => {
    it('mounts an analyzer graph without crashing', () => {
        const onAnalyze = vi.fn();

        expect(() =>
            render(
                <AudioProvider>
                    <Analyzer onAnalyze={onAnalyze} updateRate={30} autoUpdate={false}>
                        <Gain gain={0.25}>
                            <Osc autoStart />
                        </Gain>
                    </Analyzer>
                </AudioProvider>
            )
        ).not.toThrow();
    });
});
