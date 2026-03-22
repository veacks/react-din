import type { FC, ReactNode } from 'react';
import { WaveShaper } from './WaveShaper';
import type { OversampleType } from './types';
import { dinCoreCreateWaveShaperCurve } from '../internal/dinCore';

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
        <WaveShaper curve={dinCoreCreateWaveShaperCurve(amount, preset)} oversample={oversample}>
            {children}
        </WaveShaper>
    );
};
