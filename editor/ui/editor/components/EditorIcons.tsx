import type { SVGProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    AudioLines,
    BarChart3,
    ChevronDown,
    Circle,
    CornerDownLeft,
    Filter,
    Gauge,
    Grid2x2,
    Mic,
    MoveHorizontal,
    Music2,
    Piano,
    Play,
    Route,
    Rows3,
    Send,
    Sigma,
    SlidersHorizontal,
    SlidersVertical,
    Sparkles,
    Square,
    TrendingUp,
    Volume2,
    Waves,
} from 'lucide-react';
import type { EditorNodeType } from '../nodeCatalog';

type IconName =
    | EditorNodeType
    | 'play'
    | 'stop'
    | 'chevronDown'
    | 'status';

interface EditorIconProps extends SVGProps<SVGSVGElement> {
    name: IconName;
}

const ICONS: Record<IconName, LucideIcon> = {
    gain: SlidersVertical,
    filter: Filter,
    eq3: SlidersHorizontal,
    output: Volume2,
    mixer: SlidersHorizontal,
    auxSend: Send,
    auxReturn: CornerDownLeft,
    matrixMixer: Grid2x2,
    stepSequencer: Rows3,
    pianoRoll: Piano,
    transport: Play,
    play: Play,
    stop: Square,
    chevronDown: ChevronDown,
    status: Circle,
    midiNote: Piano,
    midiCC: SlidersHorizontal,
    midiNoteOutput: Send,
    midiCCOutput: Send,
    midiSync: Route,
    note: Music2,
    voice: AudioLines,
    osc: Activity,
    lfo: Activity,
    noise: Waves,
    noiseBurst: Sparkles,
    phaser: Waves,
    flanger: Waves,
    tremolo: Waves,
    chorus: Waves,
    waveShaper: Waves,
    delay: Waves,
    reverb: Waves,
    convolver: Waves,
    compressor: Gauge,
    distortion: Gauge,
    sampler: Mic,
    mediaStream: Mic,
    adsr: TrendingUp,
    panner: MoveHorizontal,
    panner3d: MoveHorizontal,
    analyzer: BarChart3,
    constantSource: SlidersHorizontal,
    input: SlidersHorizontal,
    uiTokens: Grid2x2,
    eventTrigger: Sparkles,
    math: Sigma,
    compare: Sigma,
    mix: Sigma,
    clamp: Sigma,
    switch: Sigma,
};

function getIcon(name: IconName): LucideIcon {
    return ICONS[name] ?? Grid2x2;
}

export function EditorIcon({ name, ...props }: EditorIconProps) {
    const Icon = getIcon(name);
    return <Icon aria-hidden="true" strokeWidth={1.8} {...props} />;
}

interface EditorNodeIconProps extends Omit<EditorIconProps, 'name'> {
    type: EditorNodeType;
}

export function EditorNodeIcon({ type, ...props }: EditorNodeIconProps) {
    return <EditorIcon name={type} {...props} />;
}
