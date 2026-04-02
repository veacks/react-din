import { type DragEvent, type FC } from 'react';
import { AudioLines, BarChart3, Piano, Route, Search, Sigma } from 'lucide-react';
import { EDITOR_NODE_CATALOG, type PaletteCategory } from '../nodeCatalog';
import { EditorNodeIcon } from './EditorIcons';

interface NodePaletteProps {
    filter: string;
    onFilterChange: (value: string) => void;
    onAddNode?: (nodeType: string) => void;
}

const CATEGORY_META: Record<PaletteCategory, { color: string; bg: string }> = {
    Sources: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
    MIDI: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    Effects: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
    Routing: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
    Math: { color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

const CATEGORY_ORDER: PaletteCategory[] = ['Sources', 'MIDI', 'Effects', 'Routing', 'Math'];
const CATEGORY_ICONS: Record<PaletteCategory, typeof AudioLines> = {
    Sources: AudioLines,
    MIDI: Piano,
    Effects: BarChart3,
    Routing: Route,
    Math: Sigma,
};

export const NodePalette: FC<NodePaletteProps> = ({ filter, onFilterChange, onAddNode }) => {
    const onDragStart = (event: DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const query = filter.trim().toLowerCase();
    const filteredNodes = EDITOR_NODE_CATALOG.filter((node) =>
        query.length === 0
            || node.label.toLowerCase().includes(query)
            || node.type.toLowerCase().includes(query)
            || node.category.toLowerCase().includes(query)
    );

    return (
        <div className="flex h-full flex-col bg-transparent">
            <div className="border-b border-[var(--panel-border)] p-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)] transition-colors group-focus-within:text-[var(--accent)]" strokeWidth={1.9} aria-hidden="true" />
                    <input 
                        type="text"
                        id="node-search"
                        aria-label="Search nodes"
                        placeholder="Search nodes..."
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] py-2 pl-9 pr-4 text-sm font-medium text-[var(--text)] placeholder:text-[var(--text-subtle)] transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-soft)]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {CATEGORY_ORDER.map((category) => {
                    const categoryNodes = filteredNodes.filter((node) => node.category === category);
                    if (categoryNodes.length === 0) {
                        return null;
                    }

                    const categoryMeta = CATEGORY_META[category];
                    const CategoryIcon = CATEGORY_ICONS[category];
                    return (
                    <div key={category} className="space-y-3">
                        <h3 className="flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                            <CategoryIcon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                            <span>{category}</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {categoryNodes.map((node) => (
                                <button
                                    key={node.type}
                                    className="group relative cursor-grab active:cursor-grabbing w-full text-left"
                                    onClick={() => onAddNode?.(node.type)}
                                    onDragStart={(event) => onDragStart(event, node.type)}
                                    draggable
                                    aria-label={`Add ${node.label}`}
                                >
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--accent-soft)]/0 to-[var(--accent-soft)]/0 transition-all duration-300 group-hover:from-[var(--accent-soft)] group-hover:to-transparent" />
                                    <div className="relative flex items-center gap-3 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] p-2.5 transition-all hover:bg-[var(--panel-muted)]/60">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] ${categoryMeta.bg} transition-colors`}>
                                            <EditorNodeIcon type={node.type} className={`${categoryMeta.color} h-4 w-4 transition-transform group-hover:scale-110`} />
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--text)] transition-colors">{node.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
};
