import React, { useMemo, useState } from 'react';
import {
    useAudioGraphStore,
    type AudioNodeData,
    type DelayNodeData,
    type ADSRNodeData,
    type FilterNodeData,
    type GainNodeData,
    type InputNodeData,
    type LFONodeData,
    type NoiseNodeData,
    type NoteNodeData,
    type OscNodeData,
    type OutputNodeData,
    type PianoRollNodeData,
    type ReverbNodeData,
    type SamplerNodeData,
    type StepSequencerNodeData,
    type StereoPannerNodeData,
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
        <div className="flex h-full flex-col bg-[var(--panel-bg)] text-[var(--text)]">
            <div className="flex items-center justify-between border-b border-[var(--panel-border)] bg-[var(--panel-muted)] px-4 py-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                    Code Generator
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    <label className="flex items-center gap-1" title="Wrap in self-contained AudioContext logic">
                        <input
                            type="checkbox"
                            checked={includeProvider}
                            onChange={(e) => setIncludeProvider(e.target.checked)}
                            className="accent-[var(--accent)]"
                        />
                        Include Provider
                    </label>
                    <button
                        onClick={handleCopy}
                        className="rounded border border-[var(--panel-border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                        Copy
                    </button>
                </div>
            </div>
            <textarea
                className="flex-1 resize-none bg-transparent p-4 font-mono text-[10px] text-[var(--text)] outline-none"
                value={generatedCode}
                readOnly
                spellCheck={false}
            />
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

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const isAudioEdge = (edge: Edge) =>
        edge.sourceHandle === 'out' &&
        (edge.targetHandle === 'in' || edge.targetHandle?.startsWith('in'));

    const audioEdges = edges.filter(isAudioEdge);
    const controlEdges = edges.filter((edge) => !isAudioEdge(edge));

    const audioEdgesByTarget = new Map<string, Edge[]>();
    audioEdges.forEach((edge) => {
        const list = audioEdgesByTarget.get(edge.target) ?? [];
        list.push(edge);
        audioEdgesByTarget.set(edge.target, list);
    });

    const controlEdgesByTarget = new Map<string, Edge[]>();
    controlEdges.forEach((edge) => {
        const list = controlEdgesByTarget.get(edge.target) ?? [];
        list.push(edge);
        controlEdgesByTarget.set(edge.target, list);
    });

    const inputParamInfo = (() => {
        const paramInfoByHandle = new Map<string, ParamInfo>();
        const paramInfoByName = new Map<string, ParamInfo>();
        const usedNames = new Set<string>();
        const inputNodes = nodes.filter((node) => node.data.type === 'input') as Node<InputNodeData>[];

        inputNodes.forEach((node) => {
            const params = (node.data as InputNodeData).params || [];
            params.forEach((param, index) => {
                const rawName = param.label || param.name || `param${index + 1}`;
                const baseName = toSafeIdentifier(rawName, `param${index + 1}`);
                const name = ensureUniqueName(baseName, usedNames);
                usedNames.add(name);
                const defaultValue = Number.isFinite(param.defaultValue)
                    ? param.defaultValue
                    : Number.isFinite(param.value)
                        ? param.value
                        : 0;

                const info = { name, defaultValue };
                paramInfoByHandle.set(`${node.id}:param_${index}`, info);
                paramInfoByName.set(name, info);
            });
        });

        return { paramInfoByHandle, paramInfoByName };
    })();

    const usedParamNames = new Set<string>();
    controlEdges.forEach((edge) => {
        const sourceNode = nodeById.get(edge.source);
        if (sourceNode?.data.type !== 'input') return;
        const info = inputParamInfo.paramInfoByHandle.get(`${edge.source}:${edge.sourceHandle}`);
        if (info) {
            usedParamNames.add(info.name);
        }
    });

    const usedParamInfo = Array.from(usedParamNames)
        .map((name) => inputParamInfo.paramInfoByName.get(name))
        .filter((info): info is ParamInfo => !!info);

    const usedLfoIds = new Set<string>();
    controlEdges.forEach((edge) => {
        const sourceNode = nodeById.get(edge.source);
        if (sourceNode?.data.type === 'lfo') {
            usedLfoIds.add(edge.source);
        }
    });

    const lfoVarsById = new Map<string, string>();
    const usedLfoNames = new Set<string>();
    nodes.forEach((node, index) => {
        if (!usedLfoIds.has(node.id)) return;
        const lfoData = node.data as LFONodeData;
        const baseName = toSafeIdentifier(lfoData.label || `lfo${index + 1}`, `lfo${index + 1}`);
        const varName = ensureUniqueName(baseName, usedLfoNames);
        usedLfoNames.add(varName);
        lfoVarsById.set(node.id, varName);
    });

    const adsrTargets = new Map<string, Node<ADSRNodeData>>();
    controlEdges.forEach((edge) => {
        const sourceNode = nodeById.get(edge.source);
        if (sourceNode?.data.type === 'adsr' && edge.targetHandle === 'gain') {
            adsrTargets.set(edge.target, sourceNode as Node<ADSRNodeData>);
        }
    });

    const usedImports = new Set<string>();
    const trackSourcesUsed = new Set<string>();
    const trackInfoById = new Map<string, TrackInfo>();
    const buildContext = {
        controlEdgesByTarget,
        nodeById,
        inputParamInfo,
        lfoVarsById,
    };

    const getAudioSources = (nodeId: string) => {
        const edgesForTarget = audioEdgesByTarget.get(nodeId) ?? [];
        return edgesForTarget
            .map((edge) => nodeById.get(edge.source))
            .filter((node): node is Node<AudioNodeData> => !!node);
    };

    const getSequencerSource = (nodeId: string) => {
        const edgesForTarget = controlEdgesByTarget.get(nodeId) ?? [];
        const triggerEdge = edgesForTarget.find((edge) => edge.targetHandle === 'trigger' || edge.targetHandle === 'gate');
        if (!triggerEdge) return null;
        const sourceNode = nodeById.get(triggerEdge.source);
        if (!sourceNode) return null;
        if (sourceNode.data.type === 'stepSequencer' || sourceNode.data.type === 'pianoRoll') {
            return sourceNode;
        }
        return null;
    };

    const getTrackInfo = (node: Node<AudioNodeData>): TrackInfo => {
        if (trackInfoById.has(node.id)) {
            return trackInfoById.get(node.id)!;
        }

        let info: TrackInfo = { steps: 16, pattern: '[]' };
        if (node.data.type === 'stepSequencer') {
            const seq = node.data as StepSequencerNodeData;
            const steps = seq.steps || 16;
            const activeSteps = seq.activeSteps || Array(steps).fill(false);
            const velocities = seq.pattern || Array(steps).fill(0.8);
            const pattern = activeSteps.map((on, i) => (on ? (velocities[i] ?? 1) : 0));
            info = {
                steps,
                pattern: `[${pattern.map(formatNumber).join(', ')}]`,
            };
        } else if (node.data.type === 'pianoRoll') {
            const piano = node.data as PianoRollNodeData;
            const steps = piano.steps || 16;
            const notes = piano.notes || [];
            const pattern = Array.from({ length: steps }, () => 0);
            notes.forEach((note) => {
                const velocity = Math.max(0, Math.min(1, note.velocity ?? 0));
                pattern[note.step] = Math.max(pattern[note.step], velocity);
            });
            const pitches = Array.from(new Set(notes.map((note) => note.pitch)));
            info = {
                steps,
                pattern: `[${pattern.map(formatNumber).join(', ')}]`,
                note: pitches.length === 1 ? pitches[0] : undefined,
            };
        }

        trackInfoById.set(node.id, info);
        return info;
    };

    const renderNode = (node: Node<AudioNodeData>, level: number, visited: Set<string> = new Set()): string => {
        if (visited.has(node.id)) return '';
        visited.add(node.id);

        const componentName = getAudioComponentName(node.data.type);
        if (!componentName) return '';

        usedImports.add(componentName);

        const indentation = indent(level);
        const directVoiceEdges = (controlEdgesByTarget.get(node.id) ?? []).filter(
            (edge) => nodeById.get(edge.source)?.data.type === 'voice'
        );
        const adsrNode = adsrTargets.get(node.id);
        const adsrTrackSource = adsrNode ? getSequencerSource(adsrNode.id) : null;
        const adsrVoiceEdge = adsrNode
            ? (controlEdgesByTarget.get(adsrNode.id) ?? []).find(
                (edge) => nodeById.get(edge.source)?.data.type === 'voice' && edge.targetHandle === 'gate'
            )
            : null;

        const voiceNode = directVoiceEdges[0]
            ? nodeById.get(directVoiceEdges[0].source)
            : adsrVoiceEdge
                ? nodeById.get(adsrVoiceEdge.source)
                : null;

        const voiceVars = new Set<string>();
        const props = buildNodeProps(node, directVoiceEdges, voiceVars, buildContext);

        const sources = getAudioSources(node.id);
        const content = sources
            .map((source) => renderNode(source, level + 1, new Set(visited)))
            .filter(Boolean)
            .join('\n');

        let nodeJsx = '';
        const propsString = props.length ? ' ' + props.join(' ') : '';
        if (content) {
            nodeJsx = `${indentation}<${componentName}${propsString}>\n${content}\n${indentation}</${componentName}>`;
        } else {
            nodeJsx = `${indentation}<${componentName}${propsString} />`;
        }

        if (adsrNode) {
            const adsrData = adsrNode.data as ADSRNodeData;
            const adsrProps = buildAdsrProps(adsrData);
            const useEnvelope = !!adsrTrackSource;
            const adsrComponent = useEnvelope ? 'Envelope' : 'ADSR';

            usedImports.add(adsrComponent);

            if (!useEnvelope) {
                if (adsrVoiceEdge) {
                    voiceVars.add('gate');
                    voiceVars.add('velocity');
                    voiceVars.add('duration');
                    adsrProps.push('trigger={gate}');
                    adsrProps.push('velocity={velocity}');
                    adsrProps.push('duration={duration}');
                }
            }

            const adsrPropsString = adsrProps.length ? ' ' + adsrProps.join(' ') : '';
            nodeJsx = `${indentation}<${adsrComponent}${adsrPropsString}>\n${indentLines(nodeJsx, 1, indent)}\n${indentation}</${adsrComponent}>`;

            if (adsrTrackSource) {
                trackSourcesUsed.add(adsrTrackSource.id);
            }
        }

        if (voiceNode) {
            const voiceData = voiceNode.data as VoiceNodeData;
            const voiceProps: string[] = [];
            if (voiceData.portamento > 0) {
                voiceProps.push(`portamento={${formatNumber(voiceData.portamento)}}`);
            }
            usedImports.add('Voice');

            const renderArgs = Array.from(voiceVars);
            const renderSignature = renderArgs.length ? `{(${renderArgs.join(', ')}) => (` : '{() => (';
            nodeJsx = `${indentation}<Voice${voiceProps.length ? ' ' + voiceProps.join(' ') : ''}>\n` +
                `${indentation}  ${renderSignature}\n` +
                `${indentLines(nodeJsx, 2, indent)}\n` +
                `${indentation}  )}\n` +
                `${indentation}</Voice>`;

            const voiceTrackSource = getSequencerSource(voiceNode.id);
            if (voiceTrackSource) {
                trackSourcesUsed.add(voiceTrackSource.id);
            }
        }

        const directTrackSource = getSequencerSource(node.id);
        const trackSource = directTrackSource || (voiceNode ? getSequencerSource(voiceNode.id) : null) || adsrTrackSource;
        if (trackSource) {
            const trackInfo = getTrackInfo(trackSource);
            const trackProps = [
                `steps={${trackInfo.steps}}`,
                `pattern={${trackInfo.pattern}}`,
            ];
            if (trackInfo.note !== undefined) {
                trackProps.push(`note={${trackInfo.note}}`);
            }
            usedImports.add('Track');
            trackSourcesUsed.add(trackSource.id);
            nodeJsx = `${indentation}<Track ${trackProps.join(' ')}>\n${indentLines(nodeJsx, 1, indent)}\n${indentation}</Track>`;
        }

        return nodeJsx;
    };

    const renderableNodes = nodes.filter((node) => !!getAudioComponentName(node.data.type));
    const nodesWithOutputs = new Set(audioEdges.map((edge) => edge.source));
    const rootNodes = renderableNodes.filter((node) => !nodesWithOutputs.has(node.id));

    const transportNode = nodes.find((node) => node.data.type === 'transport');

    const renderGraphContent = (level: number) => {
        let content = `${indent(level)}return (\n`;

        const nodesContent = rootNodes
            .map((root) => renderNode(root, level + 1, new Set()))
            .filter(Boolean)
            .join('\n');

        const trimmedNodesContent = nodesContent.trim();
        const fallbackContent = `${indent(level + 1)}null`;

        const sequencerSteps = trackSourcesUsed.size > 0
            ? Math.max(...Array.from(trackSourcesUsed).map((id) => getTrackInfo(nodeById.get(id)!).steps))
            : 16;

        const sequencerProps: string[] = [];
        if (trackSourcesUsed.size > 0) {
            sequencerProps.push(`steps={${sequencerSteps}}`);
            if (transportNode?.data && 'bpm' in transportNode.data && transportNode.data.bpm) {
                const bpm = (transportNode.data as any).bpm;
                sequencerProps.push(`bpm={${formatNumber(bpm)}}`);
            }
            sequencerProps.push('autoStart');
        }

        if (trackSourcesUsed.size > 0) {
            content += `${indent(level + 1)}<Sequencer ${sequencerProps.join(' ')}>\n`;
            if (trimmedNodesContent) {
                content += `${indentLines(nodesContent, 1, indent)}\n`;
            } else {
                content += `${indentLines(fallbackContent, 1, indent)}\n`;
            }
            content += `${indent(level + 1)}</Sequencer>\n`;
        } else if (trimmedNodesContent) {
            content += `${nodesContent}\n`;
        } else {
            content += `${fallbackContent}\n`;
        }

        content += `${indent(level)});\n`;
        return content;
    };

    const graphContent = renderGraphContent(1);

    if (includeProvider) {
        usedImports.add('AudioProvider');
        if (transportNode) {
            usedImports.add('TransportProvider');
        }
    }

    if (trackSourcesUsed.size > 0) {
        usedImports.add('Sequencer');
    }

    if (lfoVarsById.size > 0) {
        usedImports.add('useLFO');
    }

    const importList = Array.from(usedImports).sort();
    let code = importList.length > 0
        ? `import { ${importList.join(', ')} } from 'react-din';\n\n`
        : '';

    if (usedParamInfo.length > 0) {
        code += `export interface ${componentName}Props {\n`;
        usedParamInfo.forEach((param) => {
            code += `${indent(1)}${param.name}?: number;\n`;
        });
        code += `}\n\n`;
    }

    const lfoDeclarations = Array.from(lfoVarsById.entries()).map(([id, varName]) => {
        const data = nodeById.get(id)?.data as LFONodeData | undefined;
        if (!data) return '';
        return `${indent(1)}const ${varName} = useLFO({ rate: ${formatNumber(data.rate)}, depth: ${formatNumber(data.depth)}, waveform: ${JSON.stringify(data.waveform)} });`;
    }).filter(Boolean);

    const propsType = usedParamInfo.length > 0 ? `${componentName}Props` : '';
    const propsParam = propsType ? `props: ${propsType}` : '';
    const hasProps = Boolean(propsType);

    if (includeProvider) {
        code += `export const ${rootName} = (${propsParam || ''}) => {\n`;
        code += `${indent(1)}return (\n`;
        code += `${indent(2)}<AudioProvider>\n`;

        if (transportNode) {
            const tData = transportNode.data as any;
            const transportProps: string[] = [];
            if (tData.bpm) transportProps.push(`bpm={${formatNumber(tData.bpm)}}`);
            if (tData.beatsPerBar) transportProps.push(`beatsPerBar={${formatNumber(tData.beatsPerBar)}}`);
            if (tData.beatUnit) transportProps.push(`beatUnit={${formatNumber(tData.beatUnit)}}`);
            if (tData.stepsPerBeat) transportProps.push(`stepsPerBeat={${formatNumber(tData.stepsPerBeat)}}`);
            if (tData.barsPerPhrase) transportProps.push(`barsPerPhrase={${formatNumber(tData.barsPerPhrase)}}`);
            if (tData.swing) transportProps.push(`swing={${formatNumber(tData.swing)}}`);

            code += `${indent(3)}<TransportProvider${transportProps.length ? ' ' + transportProps.join(' ') : ''}>\n`;
            code += `${indent(4)}<${componentName}${hasProps ? ' {...props}' : ''} />\n`;
            code += `${indent(3)}</TransportProvider>\n`;
        } else {
            code += `${indent(3)}<${componentName}${hasProps ? ' {...props}' : ''} />\n`;
        }

        code += `${indent(2)}</AudioProvider>\n`;
        code += `${indent(1)});\n`;
        code += `};\n\n`;
    }

    code += `export const ${componentName} = (${propsParam || ''}) => {\n`;
    if (hasProps) {
        const propLines = usedParamInfo.map((param) => `${param.name} = ${formatNumber(param.defaultValue)}`);
        code += `${indent(1)}const { ${propLines.join(', ')} } = props;\n\n`;
    }

    if (lfoDeclarations.length > 0) {
        code += `${lfoDeclarations.join('\n')}\n\n`;
    }

    code += graphContent;
    code += `};\n`;

    return code;
}

const AUDIO_COMPONENTS: Record<string, string> = {
    osc: 'Osc',
    gain: 'Gain',
    filter: 'Filter',
    delay: 'Delay',
    reverb: 'Reverb',
    panner: 'StereoPanner',
    output: 'Gain',
    mixer: 'Gain',
    noise: 'Noise',
    sampler: 'Sampler',
};

function getAudioComponentName(type: string): string | null {
    return AUDIO_COMPONENTS[type] ?? null;
}

interface ParamInfo {
    name: string;
    defaultValue: number;
}

interface TrackInfo {
    steps: number;
    pattern: string;
    note?: number;
}

function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return '0';
    const rounded = Math.round(value * 10000) / 10000;
    return rounded.toString();
}

function toSafeIdentifier(value: string, fallback: string): string {
    const normalized = value.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
    if (!normalized) return fallback;
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return fallback;
    const [first, ...rest] = parts;
    let result = first.toLowerCase() + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    result = result.replace(/^[^a-zA-Z_]+/, '');
    if (!result || RESERVED_IDENTIFIERS.has(result)) {
        result = fallback;
    }
    if (/^\d/.test(result)) {
        result = `${fallback}${result}`;
    }
    return result;
}

function ensureUniqueName(base: string, usedNames: Set<string>): string {
    if (!usedNames.has(base)) return base;
    let counter = 2;
    let candidate = `${base}${counter}`;
    while (usedNames.has(candidate)) {
        counter += 1;
        candidate = `${base}${counter}`;
    }
    return candidate;
}

const RESERVED_IDENTIFIERS = new Set([
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
]);

function indentLines(text: string, level: number, indent: (level: number) => string): string {
    const prefix = indent(level);
    return text
        .split('\n')
        .map((line) => (line.length > 0 ? prefix + line : line))
        .join('\n');
}

function buildAdsrProps(adsr: ADSRNodeData): string[] {
    const props: string[] = [];
    if (adsr.attack !== undefined) props.push(`attack={${formatNumber(adsr.attack)}}`);
    if (adsr.decay !== undefined) props.push(`decay={${formatNumber(adsr.decay)}}`);
    if (adsr.sustain !== undefined) props.push(`sustain={${formatNumber(adsr.sustain)}}`);
    if (adsr.release !== undefined) props.push(`release={${formatNumber(adsr.release)}}`);
    return props;
}

function buildNodeProps(
    node: Node<AudioNodeData>,
    voiceEdges: Edge[],
    voiceVars: Set<string>,
    context: {
        controlEdgesByTarget: Map<string, Edge[]>;
        nodeById: Map<string, Node<AudioNodeData>>;
        inputParamInfo: { paramInfoByHandle: Map<string, ParamInfo> };
        lfoVarsById: Map<string, string>;
    }
): string[] {
    const props: string[] = [];

    const nodeData = node.data;
    const controlEdges = context.controlEdgesByTarget.get(node.id) ?? [];
    const addBooleanProp = (name: string, value: boolean) => {
        if (value) props.push(name);
    };
    const addValueProp = (name: string, value: string | number) => {
        props.push(`${name}={${value}}`);
    };
    const addStringProp = (name: string, value: string) => {
        props.push(`${name}=${JSON.stringify(value)}`);
    };
    const addNodeRef = (name: string, refName: string) => {
        props.push(`${name}={${refName}}`);
        voiceVars.add(refName);
    };

    const resolveHandleValue = (
        handle: string,
        options: {
            baseValue?: number;
            modulatable?: boolean;
            numericGate?: boolean;
        }
    ) => {
        const voiceEdge = voiceEdges.find((edge) => edge.targetHandle === handle);
        if (voiceEdge) {
            if (voiceEdge.sourceHandle === 'note') {
                voiceVars.add('frequency');
                return { value: 'frequency' };
            }
            if (voiceEdge.sourceHandle === 'velocity') {
                voiceVars.add('velocity');
                return { value: 'velocity' };
            }
            if (voiceEdge.sourceHandle === 'gate') {
                voiceVars.add('gate');
                return { value: options.numericGate ? '(gate ? 1 : 0)' : 'gate' };
            }
        }

        const edgesForHandle = controlEdges.filter((edge) => edge.targetHandle === handle);
        const noteEdge = edgesForHandle.find(
            (edge) => context.nodeById.get(edge.source)?.data.type === 'note'
        );
        if (noteEdge) {
            const noteNode = context.nodeById.get(noteEdge.source);
            const noteData = noteNode?.data as NoteNodeData | undefined;
            if (noteData?.frequency !== undefined) {
                return { value: formatNumber(noteData.frequency) };
            }
        }

        const inputEdge = edgesForHandle.find(
            (edge) => context.nodeById.get(edge.source)?.data.type === 'input'
        );
        const inputInfo = inputEdge
            ? context.inputParamInfo.paramInfoByHandle.get(`${inputEdge.source}:${inputEdge.sourceHandle}`)
            : undefined;
        const inputValue = inputInfo?.name;

        const lfoEdge = edgesForHandle.find(
            (edge) => context.nodeById.get(edge.source)?.data.type === 'lfo'
        );
        const lfoVar = lfoEdge ? context.lfoVarsById.get(lfoEdge.source) : undefined;
        if (lfoVar && options.modulatable) {
            const baseValue = inputValue ?? (options.baseValue !== undefined ? formatNumber(options.baseValue) : undefined);
            return { value: lfoVar, base: baseValue };
        }

        if (inputValue) {
            return { value: inputValue };
        }

        if (options.baseValue !== undefined) {
            return { value: formatNumber(options.baseValue) };
        }

        return { value: undefined };
    };

    switch (nodeData.type) {
        case 'osc': {
            const osc = nodeData as OscNodeData;
            addStringProp('type', osc.waveform);
            addBooleanProp('autoStart', true);
            const frequency = resolveHandleValue('frequency', { baseValue: osc.frequency, modulatable: true });
            if (frequency.value !== undefined) addValueProp('frequency', frequency.value);
            if (frequency.base !== undefined) addValueProp('frequencyBase', frequency.base);
            const detune = resolveHandleValue('detune', { baseValue: osc.detune, modulatable: true });
            if (detune.value !== undefined) addValueProp('detune', detune.value);
            if (detune.base !== undefined) addValueProp('detuneBase', detune.base);
            const hasVoiceFrequency = voiceEdges.some((edge) => edge.targetHandle === 'frequency');
            if (hasVoiceFrequency) {
                addNodeRef('nodeRef', 'oscRef');
            }
            break;
        }
        case 'gain': {
            const gain = nodeData as GainNodeData;
            const gainValue = resolveHandleValue('gain', {
                baseValue: gain.gain,
                modulatable: true,
                numericGate: true,
            });
            if (gainValue.value !== undefined) addValueProp('gain', gainValue.value);
            if (gainValue.base !== undefined) addValueProp('gainBase', gainValue.base);
            if (voiceEdges.some((edge) => edge.targetHandle === 'gain')) {
                addNodeRef('nodeRef', 'gainRef');
            }
            break;
        }
        case 'output': {
            const output = nodeData as OutputNodeData;
            addValueProp('gain', formatNumber(output.masterGain));
            break;
        }
        case 'filter': {
            const filter = nodeData as FilterNodeData;
            addStringProp('type', filter.filterType);
            const frequency = resolveHandleValue('frequency', { baseValue: filter.frequency, modulatable: true });
            if (frequency.value !== undefined) addValueProp('frequency', frequency.value);
            if (frequency.base !== undefined) addValueProp('frequencyBase', frequency.base);
            const qValue = resolveHandleValue('q', { baseValue: filter.q, modulatable: true });
            if (qValue.value !== undefined) addValueProp('Q', qValue.value);
            if (qValue.base !== undefined) addValueProp('QBase', qValue.base);
            const detune = resolveHandleValue('detune', { baseValue: filter.detune });
            if (detune.value !== undefined) addValueProp('detune', detune.value);
            const gainValue = resolveHandleValue('gain', { baseValue: filter.gain });
            if (gainValue.value !== undefined) addValueProp('gain', gainValue.value);
            if (voiceEdges.some((edge) => edge.targetHandle === 'frequency' || edge.targetHandle === 'q')) {
                addNodeRef('nodeRef', 'filterRef');
            }
            break;
        }
        case 'delay': {
            const delay = nodeData as DelayNodeData;
            if (delay.delayTime !== undefined) addValueProp('delayTime', formatNumber(delay.delayTime));
            break;
        }
        case 'reverb': {
            const reverb = nodeData as ReverbNodeData;
            addValueProp('decay', formatNumber(reverb.decay));
            addValueProp('mix', formatNumber(reverb.mix));
            break;
        }
        case 'panner': {
            const pan = nodeData as StereoPannerNodeData;
            addValueProp('pan', formatNumber(pan.pan));
            break;
        }
        case 'noise': {
            const noise = nodeData as NoiseNodeData;
            addStringProp('type', noise.noiseType);
            addBooleanProp('autoStart', true);
            break;
        }
        case 'sampler': {
            const sampler = nodeData as SamplerNodeData;
            const src = sampler.src && !sampler.src.startsWith('blob:') ? sampler.src : '/path/to/sample.wav';
            props.push(`src=${JSON.stringify(src)}`);
            addBooleanProp('loop', sampler.loop);
            if (sampler.playbackRate !== undefined && sampler.playbackRate !== 1) {
                addValueProp('playbackRate', formatNumber(sampler.playbackRate));
            }
            if (sampler.detune !== undefined && sampler.detune !== 0) {
                addValueProp('detune', formatNumber(sampler.detune));
            }
            const hasTrigger = controlEdges.some((edge) => edge.targetHandle === 'trigger');
            if (!hasTrigger) {
                addBooleanProp('autoStart', true);
            }
            break;
        }
        case 'mixer': {
            break;
        }
        default:
            break;
    }

    return props;
}
