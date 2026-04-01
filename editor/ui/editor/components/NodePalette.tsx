import { type FC } from 'react';

interface NodePaletteProps {
    filter: string;
    onFilterChange: (value: string) => void;
}

const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const CATEGORIES = [
    { id: 'source', label: 'Sources', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'effect', label: 'Effects', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'mix', label: 'Mixing', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'control', label: 'Control', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const NODES = [
    { type: 'oscNode', label: 'Oscillator', category: 'source' },
    { type: 'noiseNode', label: 'Noise', category: 'source' },
    { type: 'gainNode', label: 'Gain', category: 'mix' },
    { type: 'filterNode', label: 'Filter', category: 'effect' },
    { type: 'delayNode', label: 'Delay', category: 'effect' },
    { type: 'reverbNode', label: 'Reverb', category: 'effect' },
    { type: 'lfoNode', label: 'LFO', category: 'control' },
    { type: 'adsrNode', label: 'ADSR', category: 'control' },
];

export const NodePalette: FC<NodePaletteProps> = ({ filter, onFilterChange }) => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const filteredNodes = NODES.filter(n => 
        n.label.toLowerCase().includes(filter.toLowerCase()) ||
        n.type.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex h-full flex-col bg-transparent">
            <div className="border-b border-[var(--panel-border)] p-4">
                <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)] transition-colors group-focus-within:text-[var(--accent)]" />
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
                {CATEGORIES.map(cat => (
                    <div key={cat.id} className="space-y-3">
                        <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">{cat.label}</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {filteredNodes.filter(n => n.category === cat.id).map(node => (
                                <button
                                    key={node.type}
                                    className="group relative cursor-grab active:cursor-grabbing w-full text-left"
                                    onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, node.type)}
                                    draggable
                                    aria-label={`Add ${node.label}`}
                                >
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[var(--accent-soft)]/0 to-[var(--accent-soft)]/0 transition-all duration-300 group-hover:from-[var(--accent-soft)] group-hover:to-transparent" />
                                    <div className="relative flex items-center gap-3 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] p-2.5 transition-all hover:bg-[var(--panel-muted)]/60">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] ${cat.bg} transition-colors`}>
                                            <div className={`w-2 h-2 rounded-full ${cat.color} group-hover:scale-125 transition-transform`} />
                                        </div>
                                        <span className="text-xs font-semibold text-[var(--text)] transition-colors">{node.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
