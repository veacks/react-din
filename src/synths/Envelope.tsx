import type { FC, RefObject } from 'react';
import { ADSR } from '../nodes/ADSR';
import type { EnvelopeProps } from './types';

export const Envelope: FC<EnvelopeProps> = ({
    children,
    nodeRef,
    bypass = false,
    attack,
    decay,
    sustain,
    release,
    attackCurve,
    releaseCurve,
}) => (
    <ADSR
        nodeRef={nodeRef as RefObject<GainNode | null>}
        bypass={bypass}
        attack={attack}
        decay={decay}
        sustain={sustain}
        release={release}
        attackCurve={attackCurve}
        releaseCurve={releaseCurve}
    >
        {children}
    </ADSR>
);
