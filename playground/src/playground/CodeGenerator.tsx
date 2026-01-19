import React, { useMemo, useState } from 'react';
import {
    useAudioGraphStore,
    type AudioNodeData,
    type OscNodeData,
    type GainNodeData,
    type FilterNodeData,
    type DelayNodeData,
    type ReverbNodeData,
    type StereoPannerNodeData,
    type NoteNodeData,
    type ADSRNodeData,
    type VoiceNodeData
} from './store';
import { type Node, type Edge } from '@xyflow/react';
import { toPascalCase } from './graphUtils';

export const CodeGenerator: React.FC = () => {
    const nodes = useAudioGraphStore((s) => s.nodes);
    const edges = useAudioGraphStore((s) => s.edges);
    const graphName = useAudioGraphStore((s) => {
        const activeGraph = s.graphs.find((graph) => graph.id === s.activeGraphId);
        return activeGraph?.name ?? 'AudioGraph';
    });
    const [includeProvider, setIncludeProvider] = useState(false);

    const generatedCode = useMemo(() => {
        return generateCode(nodes, edges, includeProvider, graphName);
    }, [nodes, edges, includeProvider, graphName]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
    };

    return (
        <div className="code-generator">
            <div className="code-header">
                <h4>Code Generator</h4>
                <div className="code-controls">
                    <label title="Wrap in self-contained AudioContext logic">
                        <input
                            type="checkbox"
                            checked={includeProvider}
                            onChange={(e) => setIncludeProvider(e.target.checked)}
                        />
                        Include Provider
                    </label>
                    <button onClick={handleCopy} className="copy-btn">Copy</button>
                </div>
            </div>
            <textarea
                className="code-output"
                value={generatedCode}
                readOnly
                spellCheck={false}
            />
            <style>{`
                .code-generator {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #1e1e1e;
                    color: #d4d4d4;
                    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
                }
                .code-header {
                    padding: 8px 12px;
                    background: #252526;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .code-header h4 {
                    margin: 0;
                    font-size: 11px;
                    color: #fff;
                    text-transform: uppercase;
                }
                .code-controls {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    font-size: 10px;
                }
                .code-controls label {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    user-select: none;
                }
                .copy-btn {
                    background: #0e639c;
                    color: white;
                    border: none;
                    padding: 2px 8px;
                    border-radius: 2px;
                    cursor: pointer;
                }
                .copy-btn:hover { background: #1177bb; }
                .code-output {
                    flex: 1;
                    background: #1e1e1e;
                    border: none;
                    color: #d4d4d4;
                    padding: 12px;
                    font-size: 11px;
                    line-height: 1.4;
                    resize: none;
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export function generateCode(
    nodes: Node<AudioNodeData>[],
    edges: Edge[],
    includeProvider: boolean = false,
    graphName: string = 'AudioGraph'
): string {
    const indent = (level: number) => '    '.repeat(level);
    const componentName = toPascalCase(graphName);
    const rootName = `${componentName}Root`;

    const audioEdges = edges.filter(e => !e.targetHandle || e.targetHandle === 'in');

    const nodesWithOutputs = new Set(audioEdges.map(e => e.source));
    const rootNodes = nodes.filter(n => !nodesWithOutputs.has(n.id) || n.data.type === 'output');

    const renderProps = (node: Node<AudioNodeData>) => {
        const data = node.data;
        const props: string[] = [];

        switch (data.type) {
            case 'osc':
                const osc = data as OscNodeData;
                if (osc.type) props.push(`type="${osc.waveform}"`);
                if (osc.frequency !== undefined) props.push(`frequency={${osc.frequency}}`);
                if (osc.detune) props.push(`detune={${osc.detune}}`);
                props.push('autoStart');
                break;
            case 'gain':
            case 'output':
                const gain = (data as any).gain ?? (data as any).masterGain ?? 1;
                props.push(`gain={${gain}}`);
                break;
            case 'filter':
                const filter = data as FilterNodeData;
                if (filter.filterType) props.push(`type="${filter.filterType}"`);
                if (filter.frequency !== undefined) props.push(`frequency={${filter.frequency}}`);
                if (filter.q !== undefined) props.push(`Q={${filter.q}}`);
                if (filter.gain !== undefined) props.push(`gain={${filter.gain}}`);
                break;
            case 'delay':
                const delay = data as DelayNodeData;
                if (delay.delayTime !== undefined) props.push(`delayTime={${delay.delayTime}}`);
                break;
            case 'panner':
                const pan = data as StereoPannerNodeData;
                if (pan.pan !== undefined) props.push(`pan={${pan.pan}}`);
                break;
            case 'reverb':
                props.push(`impulse="/ir/hall.wav"`);
                break;
            case 'note':
                const note = data as NoteNodeData;
                props.push(`offset={${note.frequency}}`);
                break;
            case 'noise':
                break;
            case 'adsr':
                const adsr = data as ADSRNodeData;
                if (adsr.attack !== undefined) props.push(`attack={${adsr.attack}}`);
                if (adsr.decay !== undefined) props.push(`decay={${adsr.decay}}`);
                if (adsr.sustain !== undefined) props.push(`sustain={${adsr.sustain}}`);
                if (adsr.release !== undefined) props.push(`release={${adsr.release}}`);
                break;
            case 'voice':
                const voice = data as VoiceNodeData;
                if (voice.portamento !== undefined && voice.portamento > 0) props.push(`portamento={${voice.portamento}}`);
                break;
        }
        return props.length > 0 ? ' ' + props.join(' ') : '';
    };

    const renderNode = (
        node: Node<AudioNodeData>,
        level: number,
        visitedIds: Set<string> = new Set(),
        usedVoiceIds: Set<string> = new Set()
    ): string => {
        if (visitedIds.has(node.id)) return '';
        visitedIds.add(node.id);

        const componentName = getComponentName(node.data.type);
        if (!componentName) return '';

        const sources = audioEdges
            .filter(e => e.target === node.id)
            .map(e => nodes.find(n => n.id === e.source))
            .filter((n): n is Node<AudioNodeData> => !!n);

        const triggerEdges = edges.filter(e => e.target === node.id && e.targetHandle === 'trigger');
        const triggerSequencers = triggerEdges
            .map(e => nodes.find(n => n.id === e.source))
            .filter((n): n is Node<AudioNodeData> => !!n && n.data.type === 'stepSequencer');

        const voiceCVEdges = edges.filter(e =>
            e.target === node.id &&
            (e.sourceHandle === 'note' || e.sourceHandle === 'gate' || e.sourceHandle === 'velocity')
        );
        const controllingVoices = voiceCVEdges
            .map(e => nodes.find(n => n.id === e.source))
            .filter((n): n is Node<AudioNodeData> => !!n && n.data.type === 'voice' && !usedVoiceIds.has(n.id));

        const sequencers = [...sources.filter(n => n.data.type === 'stepSequencer'), ...triggerSequencers];
        const audioSources = sources.filter(n => n.data.type !== 'stepSequencer' && n.data.type !== 'voice');

        const props = renderProps(node);
        const indentation = indent(level);
        let content = '';

        if (audioSources.length > 0) {
            audioSources.forEach(source => {
                content += '\n' + renderNode(source, level + 1, visitedIds, usedVoiceIds);
            });
        }

        let nodeJsx = '';
        if (content) {
            nodeJsx = `${indentation}<${componentName}${props}>${content}\n${indentation}</${componentName}>`;
        } else {
            nodeJsx = `${indentation}<${componentName}${props} />`;
        }

        if (controllingVoices.length > 0 && node.data.type !== 'voice') {
            const voice = controllingVoices[0];
            usedVoiceIds.add(voice.id);
            const voiceProps = renderProps(voice);

            const voiceSequencerEdges = edges.filter(e => e.target === voice.id && e.targetHandle === 'trigger');
            const voiceSequencers = voiceSequencerEdges
                .map(e => nodes.find(n => n.id === e.source))
                .filter((n): n is Node<AudioNodeData> => !!n && n.data.type === 'stepSequencer');

            let wrappedJsx = `${indentation}<Voice${voiceProps}>\n` +
                nodeJsx.split('\n').map(l => indent(1) + l).join('\n') + '\n' +
                `${indentation}</Voice>`;

            if (voiceSequencers.length > 0) {
                const seq = voiceSequencers[0];
                const seqData = seq.data as any;
                const activeSteps = seqData.activeSteps || Array(seqData.steps || 16).fill(false);
                const velocities = seqData.pattern || Array(seqData.steps || 16).fill(0.8);
                const pattern = activeSteps.map((on: boolean, i: number) => on ? (velocities[i] ?? 1) : 0);
                const patternStr = `[${pattern.join(', ')}]`;

                return `${indentation}<Track steps={${seqData.steps}} pattern={${patternStr}}>\n` +
                    wrappedJsx.split('\n').map(l => indent(1) + l).join('\n') + '\n' +
                    `${indentation}</Track>`;
            }

            return wrappedJsx;
        }

        if (sequencers.length > 0) {
            const seq = sequencers[0];
            const seqData = seq.data as any;

            const activeSteps = seqData.activeSteps || Array(seqData.steps || 16).fill(false);
            const velocities = seqData.pattern || Array(seqData.steps || 16).fill(0.8);

            const pattern = activeSteps.map((on: boolean, i: number) => on ? (velocities[i] ?? 1) : 0);
            const patternStr = `[${pattern.join(', ')}]`;

            return `${indentation}<Track steps={${seqData.steps}} pattern={${patternStr}}>\n` +
                nodeJsx.split('\n').map(l => indent(1) + l).join('\n') + '\n' +
                `${indentation}</Track>`;
        }

        return nodeJsx;
    };

    const usedTypes = new Set(nodes.map(n => getComponentName(n.data.type)).filter(Boolean));
    if (includeProvider) {
        usedTypes.add('AudioProvider');
        usedTypes.add('TransportProvider');
    }

    const transportNode = nodes.find(n => n.data.type === 'transport');
    if (transportNode) {
        usedTypes.add('useTransport');
    }

    const hasSequencer = nodes.some(n => n.data.type === 'stepSequencer');
    if (hasSequencer) {
        usedTypes.add('Sequencer');
        usedTypes.add('Track');
    }

    let code = `import { ${Array.from(usedTypes).join(', ')} } from 'react-din';\n\n`;

    const generateInnerContent = (level: number) => {
        let content = '';

        if (transportNode) {
            const params = ['bpm', 'playing', 'beatsPerBar', 'beatUnit', 'stepsPerBeat', 'barsPerPhrase', 'swing'];
            content += `${indent(level)}const { ${params.join(', ')}, toggle } = useTransport();\n\n`;
        }

        content += `${indent(level)}return (\n`;

        let innerLevel = level;
        if (hasSequencer) {
            content += `${indent(level + 1)}<Sequencer steps={16}>\n`;
            innerLevel++;
        }

        let nodesContent = '';
        rootNodes.forEach(root => {
            if (root.data.type !== 'transport' && root.data.type !== 'stepSequencer') {
                nodesContent += renderNode(root, innerLevel + 1) + '\n';
            }
        });

        if (!nodesContent.trim()) {
            nodesContent = `${indent(innerLevel + 1)}null\n`;
        }

        content += nodesContent;

        if (hasSequencer) {
            content += `${indent(level + 1)}</Sequencer>\n`;
        }

        content += `${indent(level)});\n`;
        return content;
    };

    if (includeProvider) {
        code += `export const ${rootName} = () => {\n`;
        code += `${indent(1)}return (\n`;
        code += `${indent(2)}<AudioProvider>\n`;

        if (transportNode) {
            const tData = transportNode.data as any;
            const props: string[] = [];
            if (tData.bpm) props.push(`bpm={${tData.bpm}}`);
            if (tData.beatsPerBar) props.push(`beatsPerBar={${tData.beatsPerBar}}`);
            if (tData.beatUnit) props.push(`beatUnit={${tData.beatUnit}}`);
            if (tData.stepsPerBeat) props.push(`stepsPerBeat={${tData.stepsPerBeat}}`);
            if (tData.barsPerPhrase) props.push(`barsPerPhrase={${tData.barsPerPhrase}}`);
            if (tData.swing) props.push(`swing={${tData.swing}}`);

            code += `${indent(3)}<TransportProvider ${props.join(' ')}>\n`;
            code += `${indent(4)}<${componentName} />\n`;
            code += `${indent(3)}</TransportProvider>\n`;
        } else {
            code += `${indent(3)}<${componentName} />\n`;
        }

        code += `${indent(2)}</AudioProvider>\n`;
        code += `${indent(1)});\n`;
        code += `};\n\n`;

        code += `export const ${componentName} = () => {\n`;
        code += generateInnerContent(1);
        code += `};\n`;

    } else {
        code += `export const ${componentName} = () => {\n`;
        code += generateInnerContent(1);
        code += `};\n`;
    }

    return code;
}

function getComponentName(type: string): string | null {
    switch (type) {
        case 'osc': return 'Osc';
        case 'gain': return 'Gain';
        case 'filter': return 'Filter';
        case 'delay': return 'Delay';
        case 'reverb': return 'Reverb';
        case 'panner': return 'StereoPanner';
        case 'output': return 'Gain';
        case 'mixer': return 'Gain';
        case 'note': return 'ConstantSource';
        case 'noise': return 'Noise';
        case 'adsr': return 'ADSR';
        case 'voice': return 'Voice';
        case 'stepSequencer': return null;
        case 'input': return null;
        case 'transport': return null;
        default: return null;
    }
}
