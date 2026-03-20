import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { AudioProvider, Sequencer, Track, TransportProvider, useTrigger, useTransport } from 'react-din';

function TransportProbe() {
    const transport = useTransport();
    return (
        <button onClick={transport.play} type="button">
            {transport.isPlaying ? 'running' : 'idle'}
        </button>
    );
}

function TriggerProbe() {
    const trigger = useTrigger();
    return <span data-testid="trigger">{trigger ? `${trigger.trackId}:${trigger.step}` : 'none'}</span>;
}

describe('transport and sequencer components', () => {
    it('starts the transport and emits sequencer triggers', async () => {
        render(
            <AudioProvider>
                <TransportProvider>
                    <TransportProbe />
                </TransportProvider>
                <Sequencer bpm={120} steps={4} autoStart>
                    <Track id="lead" pattern={[1, 0, 1, 0]}>
                        <TriggerProbe />
                    </Track>
                </Sequencer>
            </AudioProvider>
        );

        expect(screen.getByRole('button')).toHaveTextContent('idle');

        fireEvent.click(document);
        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('running');
        expect(screen.getByTestId('trigger')).toHaveTextContent('none');
    });
});
