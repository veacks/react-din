import type { FC } from 'react';
import type { PatchOutputProps } from './types';

/**
 * Transparent wrapper for naming patch outputs in generated React code.
 */
export const PatchOutput: FC<PatchOutputProps> = ({ children }) => <>{children}</>;
