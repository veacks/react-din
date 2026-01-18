import type { Node, Edge } from '@xyflow/react';
import type { AudioNodeData, OscNodeData, GainNodeData, FilterNodeData, OutputNodeData } from './store';

/**
 * Generates react-din JSX code from the node graph
 */
export function generateCode(nodes: Node<AudioNodeData>[], edges: Edge[]): string {
    // Find the output node
    const outputNode = nodes.find((n) => n.data.type === 'output') as Node<OutputNodeData> | undefined;
    if (!outputNode) {
        return '// No output node found\n// Add an Output node to generate code';
    }

    // Build connection map (target -> source)
    const connectionMap = new Map<string, string>();
    edges.forEach((edge) => {
        connectionMap.set(edge.target, edge.source);
    });

    // Recursively build the component tree working backwards from output
    function buildTree(nodeId: string, indent = 2): string {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return '';

        const spaces = ' '.repeat(indent);
        const data = node.data;

        // Find what's connected to this node's input
        const sourceId = connectionMap.get(nodeId);
        const childCode = sourceId ? buildTree(sourceId, indent + 2) : '';

        switch (data.type) {
            case 'osc': {
                const oscData = data as OscNodeData;
                return `${spaces}<Osc frequency={${oscData.frequency}} type="${oscData.waveform}" autoStart />\n`;
            }
            case 'gain': {
                const gainData = data as GainNodeData;
                if (childCode) {
                    return `${spaces}<Gain gain={${gainData.gain}}>\n${childCode}${spaces}</Gain>\n`;
                }
                return `${spaces}<Gain gain={${gainData.gain}} />\n`;
            }
            case 'filter': {
                const filterData = data as FilterNodeData;
                if (childCode) {
                    return `${spaces}<Filter type="${filterData.filterType}" frequency={${filterData.frequency}} q={${filterData.q}}>\n${childCode}${spaces}</Filter>\n`;
                }
                return `${spaces}<Filter type="${filterData.filterType}" frequency={${filterData.frequency}} q={${filterData.q}} />\n`;
            }
            case 'output': {
                const outputData = data as OutputNodeData;
                if (childCode) {
                    return `${spaces}<Gain gain={${outputData.masterGain}}>\n${childCode}${spaces}</Gain>\n`;
                }
                return `${spaces}{/* No audio source connected */}\n`;
            }
            default:
                return '';
        }
    }

    // Start from the output node's input source
    const sourceId = connectionMap.get(outputNode.id);
    const audioTree = sourceId
        ? buildTree(sourceId, 4)
        : '    {/* Connect audio nodes to Output */}\n';

    const masterGain = (outputNode.data as OutputNodeData).masterGain;

    return `import { AudioProvider, Osc, Gain, Filter } from 'react-din';

export default function App() {
  return (
    <AudioProvider>
      <Gain gain={${masterGain}}>
${audioTree.trimEnd()}
      </Gain>
    </AudioProvider>
  );
}`;
}
