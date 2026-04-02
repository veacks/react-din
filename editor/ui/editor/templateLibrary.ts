import type { Edge, Node } from '@xyflow/react';
import type { AudioNodeData, GraphDocument } from './store';
import { createEditorGraphId } from './defaultGraph';
import { createAtmosphericBreakbeatArcTemplate } from './templates/atmosphericBreakbeatArcTemplate';
import { createMedievalStrategyLongformTemplate } from './templates/feedbackTemplates';

interface TemplateGraph {
    nodes: Node<AudioNodeData>[];
    edges: Edge[];
}

export interface EditorTemplateDefinition {
    id: string;
    name: string;
    description: string;
    accentColor: string;
    createGraph: () => TemplateGraph;
}

const cloneValue = <T>(value: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as T;
};

export const EDITOR_TEMPLATES: EditorTemplateDefinition[] = [
    {
        id: 'atmospheric-breakbeat-arc',
        name: 'Atmospheric Breakbeat Arc',
        description: 'Transport-led breakbeat arrangement with sequencing, routing, and sidechain structure.',
        accentColor: '#68a5ff',
        createGraph: () => createAtmosphericBreakbeatArcTemplate(),
    },
    {
        id: 'medieval-strategy-longform',
        name: 'Medieval Strategy Longform',
        description: 'Layered long-form cue with piano-roll voices, rhythm, and evolving mix automation.',
        accentColor: '#f6a623',
        createGraph: () => createMedievalStrategyLongformTemplate() as TemplateGraph,
    },
];

export function getEditorTemplateDefinition(templateId: string): EditorTemplateDefinition | null {
    return EDITOR_TEMPLATES.find((template) => template.id === templateId) ?? null;
}

export function createTemplateGraphDocument(templateId: string, order = 0): GraphDocument {
    const template = getEditorTemplateDefinition(templateId);
    if (!template) {
        throw new Error(`Unknown DIN editor template "${templateId}".`);
    }

    const now = Date.now();
    const graph = template.createGraph();
    return {
        id: createEditorGraphId(),
        name: template.name,
        nodes: cloneValue(graph.nodes),
        edges: cloneValue(graph.edges),
        createdAt: now,
        updatedAt: now,
        order,
    };
}
