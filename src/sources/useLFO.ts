import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../core/AudioProvider';
import type { LFOOutput, LFOWaveform } from '../core/ModulatableValue';

/**
 * Options for the useLFO hook.
 */
export interface UseLFOOptions {
    /**
     * LFO rate in Hz (cycles per second).
     * @default 1
     */
    rate?: number;

    /**
     * LFO depth (amplitude of modulation).
     * This determines how much the target parameter will be modulated.
     * @default 100
     */
    depth?: number;

    /**
     * LFO waveform type.
     * @default 'sine'
     */
    waveform?: LFOWaveform;

    /**
     * Phase offset in radians (0 to 2π).
     * @default 0
     */
    phase?: number;

    /**
     * Whether to start the LFO automatically.
     * @default true
     */
    autoStart?: boolean;
}

/**
 * Hook to create an LFO (Low Frequency Oscillator) for modulation.
 * 
 * Returns an LFOOutput that can be passed directly to modulatable props
 * like `frequency`, `gain`, `Q`, etc.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const lfo = useLFO({ rate: 2, depth: 500, waveform: 'sine' });
 *   
 *   return (
 *     <Filter frequency={lfo}>
 *       <Osc frequency={440} />
 *     </Filter>
 *   );
 * }
 * ```
 * 
 * @param options - LFO configuration options
 * @returns An LFOOutput object that can be passed to modulatable props
 */
export function useLFO(options: UseLFOOptions = {}): LFOOutput | null {
    const {
        rate = 1,
        depth = 100,
        waveform = 'sine',
        phase = 0,
        autoStart = true,
    } = options;

    const { context, isUnlocked } = useAudio();
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const startedRef = useRef(false);
    const [output, setOutput] = useState<LFOOutput | null>(null);

    // Create nodes when context is available
    useEffect(() => {
        if (!context) return;

        // Create oscillator (LFO source)
        const oscillator = context.createOscillator();
        oscillator.type = waveform;
        oscillator.frequency.value = rate;

        // Create gain node (depth control)
        const gain = context.createGain();
        gain.gain.value = depth;

        // Connect: Oscillator -> Gain
        oscillator.connect(gain);

        oscillatorRef.current = oscillator;
        gainRef.current = gain;

        // Create output object
        const lfoOutput: LFOOutput = {
            node: gain,
            oscillator,
            rate,
            depth,
            waveform,
            __lfoOutput: true,
        };

        setOutput(lfoOutput);

        // Start if autoStart is enabled and context is unlocked
        if (autoStart && isUnlocked && !startedRef.current) {
            try {
                oscillator.start();
                startedRef.current = true;
            } catch {
                // Already started
            }
        }

        return () => {
            try {
                if (startedRef.current) {
                    oscillator.stop();
                }
            } catch {
                // Already stopped
            }
            oscillator.disconnect();
            gain.disconnect();
            oscillatorRef.current = null;
            gainRef.current = null;
            startedRef.current = false;
        };
    }, [context]); // Only recreate when context changes

    // Handle autoStart when context gets unlocked
    useEffect(() => {
        if (!oscillatorRef.current || !autoStart || startedRef.current) return;

        if (isUnlocked) {
            try {
                oscillatorRef.current.start();
                startedRef.current = true;
            } catch {
                // Already started
            }
        }
    }, [isUnlocked, autoStart]);

    // Update rate
    useEffect(() => {
        if (oscillatorRef.current) {
            oscillatorRef.current.frequency.setTargetAtTime(rate, 0, 0.01);
        }
    }, [rate]);

    // Update depth
    useEffect(() => {
        if (gainRef.current) {
            gainRef.current.gain.setTargetAtTime(depth, 0, 0.01);
        }
    }, [depth]);

    // Update waveform
    useEffect(() => {
        if (oscillatorRef.current) {
            oscillatorRef.current.type = waveform;
        }
    }, [waveform]);

    // Update output object when params change
    useEffect(() => {
        if (oscillatorRef.current && gainRef.current) {
            setOutput({
                node: gainRef.current,
                oscillator: oscillatorRef.current,
                rate,
                depth,
                waveform,
                __lfoOutput: true,
            });
        }
    }, [rate, depth, waveform]);

    return output;
}
