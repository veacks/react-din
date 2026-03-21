import type { FC, ReactNode } from 'react';
import { WaveShaper } from './WaveShaper';
import type { OversampleType } from './types';

/**
 * Preset curve types for `PresetWaveShaper`.
 */
export type WaveShaperPreset = 'softClip' | 'hardClip' | 'saturate';

/**
 * Props for the PresetWaveShaper component.
 */
export interface PresetWaveShaperProps {
    children?: ReactNode;
    amount?: number;
    preset?: WaveShaperPreset;
    oversample?: OversampleType;
}

function createPresetWaveShaperCurve(amount: number, preset: WaveShaperPreset): Float32Array {
    const samples = 512;
    const curve = new Float32Array(samples);
    const k = Math.max(0, amount) * 100;

    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        if (preset === 'hardClip') {
            curve[i] = Math.max(-1, Math.min(1, x * (1 + k / 8)));
        } else if (preset === 'saturate') {
            const amt = 1 + k / 20;
            curve[i] = ((3 + amt) * x * 20) / (Math.PI + (amt * Math.abs(x * 20)));
        } else {
            curve[i] = Math.tanh(x * (1 + k / 12));
        }
    }

    return curve;
}

/**
 * Preset-based wave shaper wrapper.
 *
 * Generates a shaping curve from `amount` and `preset`,
 * then delegates rendering to `WaveShaper`.
 */
export const PresetWaveShaper: FC<PresetWaveShaperProps> = ({
    children,
    amount = 0.5,
    preset = 'softClip',
    oversample = '2x',
}) => {
    return (
        <WaveShaper curve={createPresetWaveShaperCurve(amount, preset)} oversample={oversample}>
            {children}
        </WaveShaper>
    );
};
