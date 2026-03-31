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
        <div className="flex flex-col h-full bg-zinc-900 shadow-inner">
            <div className="p-4 border-b border-zinc-800">
                <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                    <input 
                        type="text"
                        id="node-search"
                        aria-label="Search nodes"
                        placeholder="Search nodes..."
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {CATEGORIES.map(cat => (
                    <div key={cat.id} className="space-y-3">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 px-1">{cat.label}</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {filteredNodes.filter(n => n.category === cat.id).map(node => (
                                <button
                                    key={node.type}
                                    className="group relative cursor-grab active:cursor-grabbing w-full text-left"
                                    onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, node.type)}
                                    draggable
                                    aria-label={`Add ${node.label}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent rounded-lg transition-all duration-300" />
                                    <div className="relative flex items-center gap-3 p-2.5 rounded-lg border border-zinc-800/50 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all">
                                        <div className={`w-8 h-8 rounded-md ${cat.bg} flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors`}>
                                            <div className={`w-2 h-2 rounded-full ${cat.color} group-hover:scale-125 transition-transform`} />
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">{node.label}</span>
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
