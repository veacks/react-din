import { useEffect, type FC, type ReactNode } from 'react';
import { useLFO, type UseLFOOptions } from './useLFO';
import type { LFOOutput, LFOWaveform } from '../core/ModulatableValue';

/**
 * Props for the LFO component.
 */
export interface LFOProps extends UseLFOOptions {
    /**
     * Children can be a render function that receives the LFO output,
     * or regular React nodes.
     */
    children?: ReactNode | ((lfo: LFOOutput | null) => ReactNode);
}

/**
 * LFO (Low Frequency Oscillator) component for audio modulation.
 * 
 * Creates an oscillator running at a low frequency that can be used
 * to modulate parameters like filter frequency, gain, etc.
 * 
 * @example
 * ```tsx
 * // Using render prop pattern
 * <LFO rate={2} depth={500} waveform="sine">
 *   {(lfo) => (
 *     <Filter frequency={lfo}>
 *       <Osc frequency={440} />
 *     </Filter>
 *   )}
 * </LFO>
 * 
 * // Or with useLFO hook for more control
 * const lfo = useLFO({ rate: 2, depth: 500 });
 * <Filter frequency={lfo}>...</Filter>
 * ```
 */
export const LFO: FC<LFOProps> = ({
    children,
    rate = 1,
    depth = 100,
    waveform = 'sine',
    phase = 0,
    autoStart = true,
}) => {
    const lfo = useLFO({
        rate,
        depth,
        waveform,
        phase,
        autoStart,
    });

    // Handle render prop pattern
    if (typeof children === 'function') {
        return <>{children(lfo)}</>;
    }

    // For non-function children, just render them
    // (they would need to use useLFO hook or context to access LFO)
    return <>{children}</>;
};

export type { LFOWaveform, LFOOutput };
