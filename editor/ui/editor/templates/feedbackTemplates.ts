import { type Node, type Edge } from '@xyflow/react';
import { type AudioNodeData } from '../store';
import { createUiTokenParams } from '../uiTokens';
import { getInputParamHandleId } from '../nodeHelpers';

export interface FeedbackTemplateGraph {
    nodes: Node<AudioNodeData>[];
    edges: Edge[];
}

const AUDIO_EDGE_STYLE = { stroke: '#44cc44', strokeWidth: 3 };
const CONTROL_EDGE_STYLE = { stroke: '#4488ff', strokeWidth: 2, strokeDasharray: '5,5' };
const TRIGGER_EDGE_STYLE = { stroke: '#ff4466', strokeWidth: 2, strokeDasharray: '6,4' };

function createUiTokensNodeData() {
    return {
        type: 'uiTokens' as const,
        params: createUiTokenParams(),
        label: 'UI Tokens',
    };
}

export function createHoverFeedbackTemplate(): FeedbackTemplateGraph {
    return {
        nodes: [
            { id: 'input-hover', type: 'uiTokensNode', dragHandle: '.node-header', position: { x: 40, y: 80 }, data: createUiTokensNodeData() as any },
            { id: 'evt-hover', type: 'eventTriggerNode', dragHandle: '.node-header', position: { x: 280, y: 80 }, data: { type: 'eventTrigger', token: 0, mode: 'change', cooldownMs: 40, velocity: 0.45, duration: 0.06, note: 72, trackId: 'hover', label: 'Hover Trigger' } as any },
            { id: 'noise-hover', type: 'noiseBurstNode', dragHandle: '.node-header', position: { x: 520, y: 40 }, data: { type: 'noiseBurst', noiseType: 'white', duration: 0.03, gain: 0.55, attack: 0.001, release: 0.02, label: 'Hover Noise' } as any },
            { id: 'filter-hover', type: 'filterNode', dragHandle: '.node-header', position: { x: 760, y: 40 }, data: { type: 'filter', filterType: 'highpass', frequency: 1800, detune: 0, q: 0.9, gain: 0, label: 'HP Filter' } as any },
            { id: 'chorus-hover', type: 'chorusNode', dragHandle: '.node-header', position: { x: 990, y: 40 }, data: { type: 'chorus', rate: 1.2, depth: 2.4, feedback: 0.12, delay: 14, mix: 0.22, stereo: true, label: 'Light Chorus' } as any },
            { id: 'gain-hover', type: 'gainNode', dragHandle: '.node-header', position: { x: 1220, y: 40 }, data: { type: 'gain', gain: 0.5, label: 'Hover Gain' } as any },
            { id: 'analyzer-hover', type: 'analyzerNode', dragHandle: '.node-header', position: { x: 1450, y: 40 }, data: { type: 'analyzer', fftSize: 1024, smoothingTimeConstant: 0.75, updateRate: 60, autoUpdate: true, label: 'Monitor' } as any },
            { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 1680, y: 120 }, data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' } as any },
        ],
        edges: [
            { id: 'hover-token', source: 'input-hover', sourceHandle: getInputParamHandleId('hoverToken'), target: 'evt-hover', targetHandle: 'token', animated: true, style: CONTROL_EDGE_STYLE },
            { id: 'hover-trigger', source: 'evt-hover', sourceHandle: 'trigger', target: 'noise-hover', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'hover-a1', source: 'noise-hover', sourceHandle: 'out', target: 'filter-hover', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'hover-a2', source: 'filter-hover', sourceHandle: 'out', target: 'chorus-hover', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'hover-a3', source: 'chorus-hover', sourceHandle: 'out', target: 'gain-hover', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'hover-a4', source: 'gain-hover', sourceHandle: 'out', target: 'analyzer-hover', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'hover-a5', source: 'analyzer-hover', sourceHandle: 'out', target: 'output', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
        ],
    };
}

export function createSuccessFeedbackTemplate(): FeedbackTemplateGraph {
    return {
        nodes: [
            { id: 'input-success', type: 'uiTokensNode', dragHandle: '.node-header', position: { x: 40, y: 80 }, data: createUiTokensNodeData() as any },
            { id: 'evt-success', type: 'eventTriggerNode', dragHandle: '.node-header', position: { x: 280, y: 80 }, data: { type: 'eventTrigger', token: 0, mode: 'change', cooldownMs: 120, velocity: 0.9, duration: 0.35, note: 76, trackId: 'success', label: 'Success Trigger' } as any },
            { id: 'sampler-success', type: 'samplerNode', dragHandle: '.node-header', position: { x: 530, y: 40 }, data: { type: 'sampler', src: '/samples/ui_success.wav', loop: false, playbackRate: 1, detune: 0, loaded: true, label: 'Success Sample' } as any },
            { id: 'convolver-success', type: 'convolverNode', dragHandle: '.node-header', position: { x: 760, y: 40 }, data: { type: 'convolver', impulseSrc: '/impulses/plate.wav', normalize: true, label: 'Plate IR' } as any },
            { id: 'chorus-success', type: 'chorusNode', dragHandle: '.node-header', position: { x: 990, y: 40 }, data: { type: 'chorus', rate: 0.9, depth: 1.6, feedback: 0.08, delay: 18, mix: 0.16, stereo: true, label: 'Subtle Chorus' } as any },
            { id: 'panner-success', type: 'panner3dNode', dragHandle: '.node-header', position: { x: 1220, y: 40 }, data: { type: 'panner3d', positionX: 0, positionY: 0, positionZ: -1, refDistance: 1, maxDistance: 10000, rolloffFactor: 1, panningModel: 'HRTF', distanceModel: 'inverse', label: 'Panner 3D' } as any },
            { id: 'gain-success', type: 'gainNode', dragHandle: '.node-header', position: { x: 1450, y: 40 }, data: { type: 'gain', gain: 0.65, label: 'Success Gain' } as any },
            { id: 'analyzer-success', type: 'analyzerNode', dragHandle: '.node-header', position: { x: 1680, y: 40 }, data: { type: 'analyzer', fftSize: 1024, smoothingTimeConstant: 0.8, updateRate: 60, autoUpdate: true, label: 'Monitor' } as any },
            { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 1910, y: 120 }, data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' } as any },
        ],
        edges: [
            { id: 'success-token', source: 'input-success', sourceHandle: getInputParamHandleId('successToken'), target: 'evt-success', targetHandle: 'token', animated: true, style: CONTROL_EDGE_STYLE },
            { id: 'success-trigger', source: 'evt-success', sourceHandle: 'trigger', target: 'sampler-success', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'success-a1', source: 'sampler-success', sourceHandle: 'out', target: 'convolver-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'success-a2', source: 'convolver-success', sourceHandle: 'out', target: 'chorus-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'success-a3', source: 'chorus-success', sourceHandle: 'out', target: 'panner-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'success-a4', source: 'panner-success', sourceHandle: 'out', target: 'gain-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'success-a5', source: 'gain-success', sourceHandle: 'out', target: 'analyzer-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'success-a6', source: 'analyzer-success', sourceHandle: 'out', target: 'output', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
        ],
    };
}

export function createErrorFeedbackTemplate(): FeedbackTemplateGraph {
    return {
        nodes: [
            { id: 'input-error', type: 'uiTokensNode', dragHandle: '.node-header', position: { x: 40, y: 80 }, data: createUiTokensNodeData() as any },
            { id: 'evt-error', type: 'eventTriggerNode', dragHandle: '.node-header', position: { x: 280, y: 80 }, data: { type: 'eventTrigger', token: 0, mode: 'change', cooldownMs: 120, velocity: 0.95, duration: 0.25, note: 45, trackId: 'error', label: 'Error Trigger' } as any },
            { id: 'noise-error', type: 'noiseBurstNode', dragHandle: '.node-header', position: { x: 530, y: 10 }, data: { type: 'noiseBurst', noiseType: 'brown', duration: 0.09, gain: 0.7, attack: 0.002, release: 0.08, label: 'Error Noise' } as any },
            { id: 'sampler-error', type: 'samplerNode', dragHandle: '.node-header', position: { x: 530, y: 150 }, data: { type: 'sampler', src: '/samples/ui_error.wav', loop: false, playbackRate: 1, detune: 0, loaded: true, label: 'Error Sample' } as any },
            { id: 'dist-error', type: 'distortionNode', dragHandle: '.node-header', position: { x: 780, y: 80 }, data: { type: 'distortion', distortionType: 'soft', drive: 0.35, level: 0.65, mix: 0.52, tone: 2400, label: 'Soft Distortion' } as any },
            { id: 'ws-error', type: 'waveShaperNode', dragHandle: '.node-header', position: { x: 1020, y: 80 }, data: { type: 'waveShaper', amount: 0.45, preset: 'saturate', oversample: '2x', label: 'WaveShaper' } as any },
            { id: 'filter-error', type: 'filterNode', dragHandle: '.node-header', position: { x: 1260, y: 80 }, data: { type: 'filter', filterType: 'lowpass', frequency: 1200, detune: 0, q: 1.2, gain: 0, label: 'LP Filter' } as any },
            { id: 'gain-error', type: 'gainNode', dragHandle: '.node-header', position: { x: 1490, y: 80 }, data: { type: 'gain', gain: 0.6, label: 'Error Gain' } as any },
            { id: 'analyzer-error', type: 'analyzerNode', dragHandle: '.node-header', position: { x: 1720, y: 80 }, data: { type: 'analyzer', fftSize: 1024, smoothingTimeConstant: 0.78, updateRate: 60, autoUpdate: true, label: 'Monitor' } as any },
            { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 1950, y: 140 }, data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' } as any },
        ],
        edges: [
            { id: 'error-token', source: 'input-error', sourceHandle: getInputParamHandleId('errorToken'), target: 'evt-error', targetHandle: 'token', animated: true, style: CONTROL_EDGE_STYLE },
            { id: 'error-trigger-noise', source: 'evt-error', sourceHandle: 'trigger', target: 'noise-error', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'error-trigger-sampler', source: 'evt-error', sourceHandle: 'trigger', target: 'sampler-error', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'error-a1', source: 'noise-error', sourceHandle: 'out', target: 'dist-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'error-a2', source: 'sampler-error', sourceHandle: 'out', target: 'dist-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'error-a3', source: 'dist-error', sourceHandle: 'out', target: 'ws-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'error-a4', source: 'ws-error', sourceHandle: 'out', target: 'filter-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'error-a5', source: 'filter-error', sourceHandle: 'out', target: 'gain-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'error-a6', source: 'gain-error', sourceHandle: 'out', target: 'analyzer-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'error-a7', source: 'analyzer-error', sourceHandle: 'out', target: 'output', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
        ],
    };
}

export function createUiFeedbackPackTemplate(): FeedbackTemplateGraph {
    return {
        nodes: [
            { id: 'input-ui', type: 'uiTokensNode', dragHandle: '.node-header', position: { x: 40, y: 220 }, data: createUiTokensNodeData() as any },
            { id: 'evt-hover', type: 'eventTriggerNode', dragHandle: '.node-header', position: { x: 280, y: 60 }, data: { type: 'eventTrigger', token: 0, mode: 'change', cooldownMs: 40, velocity: 0.45, duration: 0.06, note: 72, trackId: 'hover', label: 'Hover Trigger' } as any },
            { id: 'evt-success', type: 'eventTriggerNode', dragHandle: '.node-header', position: { x: 280, y: 220 }, data: { type: 'eventTrigger', token: 0, mode: 'change', cooldownMs: 120, velocity: 0.9, duration: 0.35, note: 76, trackId: 'success', label: 'Success Trigger' } as any },
            { id: 'evt-error', type: 'eventTriggerNode', dragHandle: '.node-header', position: { x: 280, y: 380 }, data: { type: 'eventTrigger', token: 0, mode: 'change', cooldownMs: 120, velocity: 0.95, duration: 0.25, note: 45, trackId: 'error', label: 'Error Trigger' } as any },
            { id: 'noise-hover', type: 'noiseBurstNode', dragHandle: '.node-header', position: { x: 540, y: 20 }, data: { type: 'noiseBurst', noiseType: 'white', duration: 0.03, gain: 0.55, attack: 0.001, release: 0.02, label: 'Hover Noise' } as any },
            { id: 'filter-hover', type: 'filterNode', dragHandle: '.node-header', position: { x: 770, y: 20 }, data: { type: 'filter', filterType: 'highpass', frequency: 1800, detune: 0, q: 0.9, gain: 0, label: 'HP Filter' } as any },
            { id: 'chorus-hover', type: 'chorusNode', dragHandle: '.node-header', position: { x: 1000, y: 20 }, data: { type: 'chorus', rate: 1.2, depth: 2.4, feedback: 0.12, delay: 14, mix: 0.22, stereo: true, label: 'Light Chorus' } as any },
            { id: 'gain-hover', type: 'gainNode', dragHandle: '.node-header', position: { x: 1230, y: 20 }, data: { type: 'gain', gain: 0.5, label: 'Hover Gain' } as any },
            { id: 'sampler-success', type: 'samplerNode', dragHandle: '.node-header', position: { x: 540, y: 190 }, data: { type: 'sampler', src: '/samples/ui_success.wav', loop: false, playbackRate: 1, detune: 0, loaded: true, label: 'Success Sample' } as any },
            { id: 'convolver-success', type: 'convolverNode', dragHandle: '.node-header', position: { x: 770, y: 190 }, data: { type: 'convolver', impulseSrc: '/impulses/plate.wav', normalize: true, label: 'Plate IR' } as any },
            { id: 'chorus-success', type: 'chorusNode', dragHandle: '.node-header', position: { x: 1000, y: 190 }, data: { type: 'chorus', rate: 0.9, depth: 1.6, feedback: 0.08, delay: 18, mix: 0.16, stereo: true, label: 'Subtle Chorus' } as any },
            { id: 'panner-success', type: 'panner3dNode', dragHandle: '.node-header', position: { x: 1230, y: 190 }, data: { type: 'panner3d', positionX: 0, positionY: 0, positionZ: -1, refDistance: 1, maxDistance: 10000, rolloffFactor: 1, panningModel: 'HRTF', distanceModel: 'inverse', label: 'Panner 3D' } as any },
            { id: 'gain-success', type: 'gainNode', dragHandle: '.node-header', position: { x: 1460, y: 190 }, data: { type: 'gain', gain: 0.65, label: 'Success Gain' } as any },
            { id: 'noise-error', type: 'noiseBurstNode', dragHandle: '.node-header', position: { x: 540, y: 360 }, data: { type: 'noiseBurst', noiseType: 'brown', duration: 0.09, gain: 0.7, attack: 0.002, release: 0.08, label: 'Error Noise' } as any },
            { id: 'sampler-error', type: 'samplerNode', dragHandle: '.node-header', position: { x: 540, y: 500 }, data: { type: 'sampler', src: '/samples/ui_error.wav', loop: false, playbackRate: 1, detune: 0, loaded: true, label: 'Error Sample' } as any },
            { id: 'dist-error', type: 'distortionNode', dragHandle: '.node-header', position: { x: 770, y: 430 }, data: { type: 'distortion', distortionType: 'soft', drive: 0.35, level: 0.65, mix: 0.52, tone: 2400, label: 'Soft Distortion' } as any },
            { id: 'ws-error', type: 'waveShaperNode', dragHandle: '.node-header', position: { x: 1000, y: 430 }, data: { type: 'waveShaper', amount: 0.45, preset: 'saturate', oversample: '2x', label: 'WaveShaper' } as any },
            { id: 'filter-error', type: 'filterNode', dragHandle: '.node-header', position: { x: 1230, y: 430 }, data: { type: 'filter', filterType: 'lowpass', frequency: 1200, detune: 0, q: 1.2, gain: 0, label: 'LP Filter' } as any },
            { id: 'gain-error', type: 'gainNode', dragHandle: '.node-header', position: { x: 1460, y: 430 }, data: { type: 'gain', gain: 0.6, label: 'Error Gain' } as any },
            { id: 'monitor', type: 'analyzerNode', dragHandle: '.node-header', position: { x: 1680, y: 250 }, data: { type: 'analyzer', fftSize: 1024, smoothingTimeConstant: 0.78, updateRate: 60, autoUpdate: true, label: 'Monitor' } as any },
            { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 1910, y: 250 }, data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' } as any },
        ],
        edges: [
            { id: 'token-hover', source: 'input-ui', sourceHandle: getInputParamHandleId('hoverToken'), target: 'evt-hover', targetHandle: 'token', animated: true, style: CONTROL_EDGE_STYLE },
            { id: 'token-success', source: 'input-ui', sourceHandle: getInputParamHandleId('successToken'), target: 'evt-success', targetHandle: 'token', animated: true, style: CONTROL_EDGE_STYLE },
            { id: 'token-error', source: 'input-ui', sourceHandle: getInputParamHandleId('errorToken'), target: 'evt-error', targetHandle: 'token', animated: true, style: CONTROL_EDGE_STYLE },
            { id: 'tr-hover', source: 'evt-hover', sourceHandle: 'trigger', target: 'noise-hover', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'tr-success', source: 'evt-success', sourceHandle: 'trigger', target: 'sampler-success', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'tr-error-1', source: 'evt-error', sourceHandle: 'trigger', target: 'noise-error', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'tr-error-2', source: 'evt-error', sourceHandle: 'trigger', target: 'sampler-error', targetHandle: 'trigger', animated: true, style: TRIGGER_EDGE_STYLE },
            { id: 'a-h1', source: 'noise-hover', sourceHandle: 'out', target: 'filter-hover', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-h2', source: 'filter-hover', sourceHandle: 'out', target: 'chorus-hover', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-h3', source: 'chorus-hover', sourceHandle: 'out', target: 'gain-hover', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-h4', source: 'gain-hover', sourceHandle: 'out', target: 'monitor', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-s1', source: 'sampler-success', sourceHandle: 'out', target: 'convolver-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-s2', source: 'convolver-success', sourceHandle: 'out', target: 'chorus-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-s3', source: 'chorus-success', sourceHandle: 'out', target: 'panner-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-s4', source: 'panner-success', sourceHandle: 'out', target: 'gain-success', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-s5', source: 'gain-success', sourceHandle: 'out', target: 'monitor', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-e1', source: 'noise-error', sourceHandle: 'out', target: 'dist-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-e2', source: 'sampler-error', sourceHandle: 'out', target: 'dist-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-e3', source: 'dist-error', sourceHandle: 'out', target: 'ws-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-e4', source: 'ws-error', sourceHandle: 'out', target: 'filter-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-e5', source: 'filter-error', sourceHandle: 'out', target: 'gain-error', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-e6', source: 'gain-error', sourceHandle: 'out', target: 'monitor', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
            { id: 'a-out', source: 'monitor', sourceHandle: 'out', target: 'output', targetHandle: 'in', animated: false, style: AUDIO_EDGE_STYLE },
        ],
    };
}

export function createMedievalStrategyLongformTemplate(): FeedbackTemplateGraph {
    const calmNotes = [
        { pitch: 50, step: 0, duration: 10, velocity: 0.56 },   // D3
        { pitch: 57, step: 10, duration: 8, velocity: 0.53 },   // A3
        { pitch: 53, step: 18, duration: 10, velocity: 0.5 },   // F3
        { pitch: 55, step: 28, duration: 8, velocity: 0.48 },   // G3
        { pitch: 62, step: 36, duration: 10, velocity: 0.52 },  // D4
        { pitch: 60, step: 46, duration: 8, velocity: 0.47 },   // C4
        { pitch: 57, step: 54, duration: 10, velocity: 0.5 },   // A3
    ];

    const activeNotes = [
        { pitch: 62, step: 0, duration: 2, velocity: 0.72 },    // D4
        { pitch: 64, step: 2, duration: 2, velocity: 0.74 },    // E4
        { pitch: 65, step: 4, duration: 2, velocity: 0.7 },     // F4
        { pitch: 69, step: 6, duration: 2, velocity: 0.76 },    // A4
        { pitch: 67, step: 8, duration: 2, velocity: 0.71 },    // G4
        { pitch: 65, step: 10, duration: 2, velocity: 0.69 },   // F4
        { pitch: 64, step: 12, duration: 2, velocity: 0.7 },    // E4
        { pitch: 62, step: 14, duration: 2, velocity: 0.72 },   // D4
        { pitch: 74, step: 16, duration: 2, velocity: 0.78 },   // D5
        { pitch: 72, step: 18, duration: 2, velocity: 0.74 },   // C5
        { pitch: 69, step: 20, duration: 2, velocity: 0.76 },   // A4
        { pitch: 67, step: 22, duration: 2, velocity: 0.71 },   // G4
        { pitch: 65, step: 24, duration: 2, velocity: 0.7 },    // F4
        { pitch: 64, step: 26, duration: 2, velocity: 0.72 },   // E4
        { pitch: 62, step: 28, duration: 2, velocity: 0.7 },    // D4
        { pitch: 60, step: 30, duration: 2, velocity: 0.68 },   // C4
    ];

    const drumPattern = [
        1, 0, 0.72, 0, 0.86, 0, 0.64, 0,
        0.95, 0, 0.58, 0, 0.82, 0, 0.7, 0,
        1, 0, 0.66, 0, 0.88, 0, 0.62, 0,
        0.93, 0, 0.56, 0, 0.8, 0, 0.68, 0,
    ];

    return {
        nodes: [
            { id: 'transport', type: 'transportNode', dragHandle: '.node-header', position: { x: 40, y: 60 }, data: { type: 'transport', bpm: 86, stepsPerBeat: 4, swing: 0.08, barsPerPhrase: 4, playing: true, label: 'Transport' } as any },

            { id: 'pianoroll-calm', type: 'pianoRollNode', dragHandle: '.node-header', position: { x: 40, y: 220 }, data: { type: 'pianoRoll', steps: 64, octaves: 2, baseNote: 48, notes: calmNotes, label: 'Calm Theme Roll' } as any },
            { id: 'voice-calm', type: 'voiceNode', dragHandle: '.node-header', position: { x: 320, y: 220 }, data: { type: 'voice', portamento: 0.06, label: 'Calm Voice' } as any },
            { id: 'osc-calm-a', type: 'oscNode', dragHandle: '.node-header', position: { x: 560, y: 120 }, data: { type: 'osc', frequency: 0, waveform: 'triangle', detune: -6, label: 'Calm Osc A' } as any },
            { id: 'osc-calm-b', type: 'oscNode', dragHandle: '.node-header', position: { x: 560, y: 270 }, data: { type: 'osc', frequency: 0, waveform: 'sine', detune: 5, label: 'Calm Osc B' } as any },
            { id: 'adsr-calm', type: 'adsrNode', dragHandle: '.node-header', position: { x: 560, y: 430 }, data: { type: 'adsr', attack: 0.28, decay: 0.9, sustain: 0.72, release: 1.8, label: 'Calm ADSR' } as any },
            { id: 'gain-calm-a', type: 'gainNode', dragHandle: '.node-header', position: { x: 820, y: 130 }, data: { type: 'gain', gain: 0, label: 'Calm VCA A' } as any },
            { id: 'gain-calm-b', type: 'gainNode', dragHandle: '.node-header', position: { x: 820, y: 290 }, data: { type: 'gain', gain: 0, label: 'Calm VCA B' } as any },
            { id: 'filter-calm', type: 'filterNode', dragHandle: '.node-header', position: { x: 1060, y: 220 }, data: { type: 'filter', filterType: 'lowpass', frequency: 1300, detune: 0, q: 0.8, gain: 0, label: 'Calm Filter' } as any },
            { id: 'reverb-calm', type: 'reverbNode', dragHandle: '.node-header', position: { x: 1290, y: 220 }, data: { type: 'reverb', decay: 6.8, mix: 0.42, label: 'Hall Reverb Calm' } as any },
            { id: 'gain-calm-main', type: 'gainNode', dragHandle: '.node-header', position: { x: 1520, y: 220 }, data: { type: 'gain', gain: 0.22, label: 'Calm Layer Gain' } as any },

            { id: 'pianoroll-active', type: 'pianoRollNode', dragHandle: '.node-header', position: { x: 40, y: 560 }, data: { type: 'pianoRoll', steps: 32, octaves: 2, baseNote: 60, notes: activeNotes, label: 'Active Theme Roll' } as any },
            { id: 'voice-active', type: 'voiceNode', dragHandle: '.node-header', position: { x: 320, y: 560 }, data: { type: 'voice', portamento: 0.015, label: 'Active Voice' } as any },
            { id: 'osc-active', type: 'oscNode', dragHandle: '.node-header', position: { x: 560, y: 520 }, data: { type: 'osc', frequency: 0, waveform: 'sawtooth', detune: 0, label: 'Active Osc' } as any },
            { id: 'adsr-active', type: 'adsrNode', dragHandle: '.node-header', position: { x: 560, y: 690 }, data: { type: 'adsr', attack: 0.01, decay: 0.16, sustain: 0.2, release: 0.12, label: 'Active ADSR' } as any },
            { id: 'filter-active', type: 'filterNode', dragHandle: '.node-header', position: { x: 820, y: 520 }, data: { type: 'filter', filterType: 'lowpass', frequency: 1900, detune: 0, q: 4.2, gain: 0, label: 'Active Filter' } as any },
            { id: 'gain-active-vca', type: 'gainNode', dragHandle: '.node-header', position: { x: 1060, y: 520 }, data: { type: 'gain', gain: 0, label: 'Active VCA' } as any },
            { id: 'gain-active-main', type: 'gainNode', dragHandle: '.node-header', position: { x: 1290, y: 520 }, data: { type: 'gain', gain: 0.12, label: 'Active Layer Gain' } as any },
            { id: 'delay-active', type: 'delayNode', dragHandle: '.node-header', position: { x: 1520, y: 520 }, data: { type: 'delay', delayTime: 0.27, feedback: 0.34, label: 'Active Delay' } as any },

            { id: 'sequencer-drum', type: 'stepSequencerNode', dragHandle: '.node-header', position: { x: 40, y: 910 }, data: { type: 'stepSequencer', steps: 32, pattern: drumPattern, activeSteps: drumPattern.map((value) => value > 0), label: 'Battle Pulse Seq' } as any },
            { id: 'noise-drum', type: 'noiseBurstNode', dragHandle: '.node-header', position: { x: 320, y: 910 }, data: { type: 'noiseBurst', noiseType: 'brown', duration: 0.07, gain: 0.5, attack: 0.001, release: 0.05, label: 'Drum Burst' } as any },
            { id: 'filter-drum', type: 'filterNode', dragHandle: '.node-header', position: { x: 560, y: 910 }, data: { type: 'filter', filterType: 'bandpass', frequency: 700, detune: 0, q: 5, gain: 0, label: 'Drum Filter' } as any },
            { id: 'gain-drum', type: 'gainNode', dragHandle: '.node-header', position: { x: 820, y: 910 }, data: { type: 'gain', gain: 0.06, label: 'Drum Layer Gain' } as any },

            { id: 'lfo-phase', type: 'lfoNode', dragHandle: '.node-header', position: { x: 1060, y: 770 }, data: { type: 'lfo', rate: 0.007, depth: 0.48, waveform: 'sine', label: 'Phase LFO' } as any },
            { id: 'math-phase-shift', type: 'mathNode', dragHandle: '.node-header', position: { x: 1290, y: 770 }, data: { type: 'math', operation: 'add', a: 0, b: 0.5, c: 0, label: 'Shift to 0..1' } as any },
            { id: 'mix-calm-level', type: 'mixNode', dragHandle: '.node-header', position: { x: 1520, y: 680 }, data: { type: 'mix', a: 0.34, b: 0.08, t: 0.5, clamp: true, label: 'Calm Level Mix' } as any },
            { id: 'mix-active-level', type: 'mixNode', dragHandle: '.node-header', position: { x: 1520, y: 770 }, data: { type: 'mix', a: 0.05, b: 0.28, t: 0.5, clamp: true, label: 'Active Level Mix' } as any },
            { id: 'mix-drum-level', type: 'mixNode', dragHandle: '.node-header', position: { x: 1520, y: 860 }, data: { type: 'mix', a: 0.02, b: 0.2, t: 0.5, clamp: true, label: 'Drum Level Mix' } as any },

            { id: 'mixer-main', type: 'mixerNode', dragHandle: '.node-header', position: { x: 1760, y: 520 }, data: { type: 'mixer', inputs: 3, label: 'Phase Mixer' } as any },
            { id: 'reverb-main', type: 'reverbNode', dragHandle: '.node-header', position: { x: 1990, y: 520 }, data: { type: 'reverb', decay: 4.6, mix: 0.28, label: 'Master Hall' } as any },
            { id: 'output', type: 'outputNode', dragHandle: '.node-header', position: { x: 2220, y: 520 }, data: { type: 'output', masterGain: 0.44, playing: false, label: 'Output' } as any },
        ],
        edges: [
            { id: 'med-t-calm', source: 'transport', sourceHandle: 'out', target: 'pianoroll-calm', targetHandle: 'transport', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-t-active', source: 'transport', sourceHandle: 'out', target: 'pianoroll-active', targetHandle: 'transport', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-t-drum', source: 'transport', sourceHandle: 'out', target: 'sequencer-drum', targetHandle: 'transport', style: CONTROL_EDGE_STYLE, animated: true },

            { id: 'med-calm-trg', source: 'pianoroll-calm', sourceHandle: 'trigger', target: 'voice-calm', targetHandle: 'trigger', style: TRIGGER_EDGE_STYLE, animated: true },
            { id: 'med-calm-note-a', source: 'voice-calm', sourceHandle: 'note', target: 'osc-calm-a', targetHandle: 'frequency', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-calm-note-b', source: 'voice-calm', sourceHandle: 'note', target: 'osc-calm-b', targetHandle: 'frequency', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-calm-gate', source: 'voice-calm', sourceHandle: 'gate', target: 'adsr-calm', targetHandle: 'gate', style: TRIGGER_EDGE_STYLE, animated: true },
            { id: 'med-calm-audio-a', source: 'osc-calm-a', sourceHandle: 'out', target: 'gain-calm-a', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-calm-audio-b', source: 'osc-calm-b', sourceHandle: 'out', target: 'gain-calm-b', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-calm-env-a', source: 'adsr-calm', sourceHandle: 'envelope', target: 'gain-calm-a', targetHandle: 'gain', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-calm-env-b', source: 'adsr-calm', sourceHandle: 'envelope', target: 'gain-calm-b', targetHandle: 'gain', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-calm-audio-1', source: 'gain-calm-a', sourceHandle: 'out', target: 'filter-calm', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-calm-audio-2', source: 'gain-calm-b', sourceHandle: 'out', target: 'filter-calm', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-calm-audio-3', source: 'filter-calm', sourceHandle: 'out', target: 'reverb-calm', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-calm-audio-4', source: 'reverb-calm', sourceHandle: 'out', target: 'gain-calm-main', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },

            { id: 'med-active-trg', source: 'pianoroll-active', sourceHandle: 'trigger', target: 'voice-active', targetHandle: 'trigger', style: TRIGGER_EDGE_STYLE, animated: true },
            { id: 'med-active-note', source: 'voice-active', sourceHandle: 'note', target: 'osc-active', targetHandle: 'frequency', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-active-gate', source: 'voice-active', sourceHandle: 'gate', target: 'adsr-active', targetHandle: 'gate', style: TRIGGER_EDGE_STYLE, animated: true },
            { id: 'med-active-audio-1', source: 'osc-active', sourceHandle: 'out', target: 'filter-active', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-active-audio-2', source: 'filter-active', sourceHandle: 'out', target: 'gain-active-vca', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-active-audio-3', source: 'gain-active-vca', sourceHandle: 'out', target: 'gain-active-main', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-active-audio-4', source: 'gain-active-main', sourceHandle: 'out', target: 'delay-active', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-active-env-gain', source: 'adsr-active', sourceHandle: 'envelope', target: 'gain-active-vca', targetHandle: 'gain', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-active-env-filter', source: 'adsr-active', sourceHandle: 'envelope', target: 'filter-active', targetHandle: 'frequency', style: CONTROL_EDGE_STYLE, animated: true },

            { id: 'med-drum-trg', source: 'sequencer-drum', sourceHandle: 'trigger', target: 'noise-drum', targetHandle: 'trigger', style: TRIGGER_EDGE_STYLE, animated: true },
            { id: 'med-drum-audio-1', source: 'noise-drum', sourceHandle: 'out', target: 'filter-drum', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-drum-audio-2', source: 'filter-drum', sourceHandle: 'out', target: 'gain-drum', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },

            { id: 'med-phase-lfo', source: 'lfo-phase', sourceHandle: 'out', target: 'math-phase-shift', targetHandle: 'a', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-phase-calm', source: 'math-phase-shift', sourceHandle: 'out', target: 'mix-calm-level', targetHandle: 't', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-phase-active', source: 'math-phase-shift', sourceHandle: 'out', target: 'mix-active-level', targetHandle: 't', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-phase-drum', source: 'math-phase-shift', sourceHandle: 'out', target: 'mix-drum-level', targetHandle: 't', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-calm-level', source: 'mix-calm-level', sourceHandle: 'out', target: 'gain-calm-main', targetHandle: 'gain', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-active-level', source: 'mix-active-level', sourceHandle: 'out', target: 'gain-active-main', targetHandle: 'gain', style: CONTROL_EDGE_STYLE, animated: true },
            { id: 'med-drum-level', source: 'mix-drum-level', sourceHandle: 'out', target: 'gain-drum', targetHandle: 'gain', style: CONTROL_EDGE_STYLE, animated: true },

            { id: 'med-main-calm', source: 'gain-calm-main', sourceHandle: 'out', target: 'mixer-main', targetHandle: 'in1', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-main-active', source: 'delay-active', sourceHandle: 'out', target: 'mixer-main', targetHandle: 'in2', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-main-drum', source: 'gain-drum', sourceHandle: 'out', target: 'mixer-main', targetHandle: 'in3', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-main-reverb', source: 'mixer-main', sourceHandle: 'out', target: 'reverb-main', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
            { id: 'med-main-output', source: 'reverb-main', sourceHandle: 'out', target: 'output', targetHandle: 'in', style: AUDIO_EDGE_STYLE, animated: false },
        ],
    };
}
