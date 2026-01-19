import React, { useMemo, useState } from 'react';
import { useAudioGraphStore, type AudioNodeData, type OscNodeData, type GainNodeData, type FilterNodeData, type DelayNodeData, type ReverbNodeData, type StereoPannerNodeData, type NoteNodeData, type InputNodeData } from './store';
import { type Node, type Edge } from '@xyflow/react';

export const CodeGenerator: React.FC = () => {
    const nodes = useAudioGraphStore((s) => s.nodes);
    const edges = useAudioGraphStore((s) => s.edges);
    const [includeProvider, setIncludeProvider] = useState(false);

    const generatedCode = useMemo(() => {
        return generateCode(nodes, edges, includeProvider);
    }, [nodes, edges, includeProvider]);

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

export function generateCode(nodes: Node<AudioNodeData>[], edges: Edge[], includeProvider: boolean = false): string {
    const indent = (level: number) => '    '.repeat(level);

    // 1. Identify Modulations (Param connections) & Audio Connections
    const audioEdges = edges.filter(e => !e.targetHandle || e.targetHandle === 'in');

    // 2. Identify Roots (Nodes that are Destinations or have no outgoing audio edges)
    // A node is a root if it has NO outgoing audio edges.
    const nodesWithOutputs = new Set(audioEdges.map(e => e.source));
    const rootNodes = nodes.filter(n => !nodesWithOutputs.has(n.id) || n.data.type === 'output');

    // Sort roots: Output nodes last (or first?), usually we want main output at top if wrapping
    // But in React nesting: Output is Parent. So Output is Root of Tree.
    // So we render Roots.

    // Helper to render props
    const renderProps = (node: Node<AudioNodeData>) => {
        const data = node.data;
        const props: string[] = [];

        switch (data.type) {
            case 'osc':
                const osc = data as OscNodeData;
                if (osc.type) props.push(`type="${osc.waveform}"`);
                if (osc.frequency !== undefined) props.push(`frequency={${osc.frequency}}`);
                if (osc.detune) props.push(`detune={${osc.detune}}`);
                // Only autoStart if NOT sequenced?
                // Using Sequencer usually means we want to trigger envelopes.
                // But for standard Osc, it plays continuously.
                // If we want gated notes, we usually need an Envelope node.
                // Assuming simple Playground usage: autoStart always for now.
                props.push('autoStart');
                break;
            case 'gain':
            case 'output': // Output is essentially a gain before destination
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
                // Feedback is not a prop on simple Delay component usually, structure handles it?
                // No, DelayNode is simple. Feedback requires external loop.
                break;
            case 'panner':
                const pan = data as StereoPannerNodeData;
                if (pan.pan !== undefined) props.push(`pan={${pan.pan}}`);
                break;
            case 'reverb':
                // Reverb component might take impulse url
                props.push(`impulse="/ir/hall.wav"`); // Placeholder
                break;
            case 'note':
                const note = data as NoteNodeData;
                // NoteNode is a constant source usually used for modulation,
                // but if in audio path, it's a valid source.
                props.push(`offset={${note.frequency}}`);
                break;
            case 'noise':
                // Noise component props?
                break;
        }
        return props.length > 0 ? ' ' + props.join(' ') : '';
    };

    // Helper to render a node and its children (sources)
    const renderNode = (node: Node<AudioNodeData>, level: number): string => {
        const componentName = getComponentName(node.data.type);
        if (!componentName) return ''; // Skip unknown

        // Find sources connected TO this node
        const sources = audioEdges
            .filter(e => e.target === node.id)
            .map(e => nodes.find(n => n.id === e.source))
            .filter((n): n is Node<AudioNodeData> => !!n);

        // Separate Sequencers from Audio Sources
        const sequencers = sources.filter(n => n.data.type === 'sequencer');
        const audioSources = sources.filter(n => n.data.type !== 'sequencer');

        const props = renderProps(node);
        const indentation = indent(level);
        let content = '';

        if (audioSources.length > 0) {
            audioSources.forEach(source => {
                content += '\n' + renderNode(source, level + 1);
            });
        }

        let nodeJsx = '';
        if (content) {
            nodeJsx = `${indentation}<${componentName}${props}>${content}\n${indentation}</${componentName}>`;
        } else {
            nodeJsx = `${indentation}<${componentName}${props} />`;
        }

        // Wrap in Track if sequenced
        if (sequencers.length > 0) {
            const seq = sequencers[0]; // Determine primary sequencer
            const seqData = seq.data as any;

            // Construct pattern: activeSteps combines with velocities
            const activeSteps = seqData.activeSteps || Array(seqData.steps || 16).fill(false);
            const velocities = seqData.pattern || Array(seqData.steps || 16).fill(0.8);

            const pattern = activeSteps.map((on: boolean, i: number) => on ? (velocities[i] ?? 1) : 0);
            const patternStr = `[${pattern.join(', ')}]`;

            return `${indentation}<Track steps={${seqData.steps}} pattern={${patternStr}}>\n` +
                // Indent the internal node one more level
                nodeJsx.split('\n').map(l => indent(1) + l).join('\n') + '\n' +
                `${indentation}</Track>`;
        }

        return nodeJsx;
    };

    // Generate Imports
    const usedTypes = new Set(nodes.map(n => getComponentName(n.data.type)).filter(Boolean));
    if (includeProvider) {
        usedTypes.add('AudioProvider');
        usedTypes.add('TransportProvider');
    }

    // Check for Transport Node
    const transportNode = nodes.find(n => n.data.type === 'transport');
    if (transportNode) {
        usedTypes.add('useTransport');
    }

    const hasSequencer = nodes.some(n => n.data.type === 'sequencer');
    if (hasSequencer) {
        usedTypes.add('Sequencer');
        usedTypes.add('Track');
    }

    let code = `import { ${Array.from(usedTypes).join(', ')} } from 'react-din';\n\n`;

    // Helper functions for indentation
    const indentBlock = (text: string, level: number) => text.split('\n').map(line => line ? indent(level) + line : line).join('\n');

    // Generate the inner logic (nodes + hooks)
    const generateInnerContent = (level: number) => {
        let content = '';

        if (transportNode) {
            const tData = transportNode.data as any; // Cast to access extended props
            // Generate hook usage reading all values
            const params = ['bpm', 'playing', 'beatsPerBar', 'beatUnit', 'stepsPerBeat', 'barsPerPhrase', 'swing'];
            content += `${indent(level)}const { ${params.join(', ')}, toggle } = useTransport();\n\n`;
        }

        content += `${indent(level)}return (\n`;

        // Wrap with Sequencer if needed
        let innerLevel = level;
        if (hasSequencer) {
            content += `${indent(level + 1)}<Sequencer steps={16}>\n`;
            innerLevel++;
        }

        // Render roots
        let nodesContent = '';
        rootNodes.forEach(root => {
            if (root.data.type !== 'transport' && root.data.type !== 'sequencer') {
                nodesContent += renderNode(root, innerLevel + 1) + '\n';
            }
        });

        // If no nodes (only transport?), render empty fragment or null
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
        // Wrapper Component
        code += `export const AudioGraphRoot = () => {\n`;
        code += `${indent(1)}return (\n`;
        code += `${indent(2)}<AudioProvider>\n`;

        if (transportNode) {
            const tData = transportNode.data as any;
            const props: string[] = [];
            if (tData.bpm) props.push(`bpm={${tData.bpm}}`);
            if (tData.beatsPerBar) props.push(`beatsPerBar={${tData.beatsPerBar}}`);
            // ... (rest of transport props can be expanded if needed or rely on defaults)
            if (tData.beatUnit) props.push(`beatUnit={${tData.beatUnit}}`);
            if (tData.stepsPerBeat) props.push(`stepsPerBeat={${tData.stepsPerBeat}}`);
            if (tData.barsPerPhrase) props.push(`barsPerPhrase={${tData.barsPerPhrase}}`);
            if (tData.swing) props.push(`swing={${tData.swing}}`);

            code += `${indent(3)}<TransportProvider ${props.join(' ')}>\n`;
            code += `${indent(4)}<AudioGraph />\n`;
            code += `${indent(3)}</TransportProvider>\n`;
        } else {
            code += `${indent(3)}<AudioGraph />\n`;
        }

        code += `${indent(2)}</AudioProvider>\n`;
        code += `${indent(1)});\n`;
        code += `};\n\n`;

        // Inner Component
        code += `export const AudioGraph = () => {\n`;
        code += generateInnerContent(1);
        code += `};\n`;

    } else {
        // Single Component (assumes context provided)
        code += `export const AudioGraph = () => {\n`;
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
        case 'reverb': return 'Reverb'; // Assuming Reverb export available
        case 'panner': return 'StereoPanner';
        case 'output': return 'Gain'; // Use Gain for master output
        case 'mixer': return 'Gain'; // Mixer is just a summing Gain
        case 'note': return 'ConstantSource'; // Assuming ConstantSource export
        case 'noise': return 'Noise';
        case 'sequencer': return null; // Logic handled in renderNode wrap
        case 'input': return null; // Input node is usually UI specific, skip for audio graph code
        case 'transport': return null; // Handled in provider/hook logic
        default: return null;
    }
}

