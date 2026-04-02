import { type FC } from 'react';
import { useAudioGraphStore } from '../store';

interface ExplorerPanelProps {
    onCreateGraph?: () => void;
    onLoadGraph: (id: string) => void;
    onLoadTemplate?: (templateId: string) => void;
}

const FileCodeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m10 13-2 2 2 2" />
        <path d="m14 17 2-2-2-2" />
    </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const Trash2Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const FolderOpenIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
    </svg>
);

export const ExplorerPanel: FC<ExplorerPanelProps> = ({ onCreateGraph, onLoadGraph, onLoadTemplate }) => {
    const graphs = useAudioGraphStore((s) => s.graphs);
    const activeGraphId = useAudioGraphStore((s) => s.activeGraphId);
    
    return (
        <div className="flex h-full flex-col bg-transparent">
            <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                            <FolderOpenIcon className="h-4 w-4" />
                            <span>Graphs</span>
                        </div>
                        {graphs.map(graph => (
                            <div 
                                key={graph.id}
                                onClick={() => onLoadGraph(graph.id)}
                                className={`group flex cursor-pointer items-center justify-between rounded-xl border p-2 transition-all ${
                                    activeGraphId === graph.id 
                                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]' 
                                        : 'border-transparent hover:border-[var(--panel-border)] hover:bg-[var(--panel-muted)]/60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`rounded p-1.5 ${activeGraphId === graph.id ? 'bg-[var(--accent)] text-[var(--panel-bg)]' : 'bg-[var(--panel-muted)] text-[var(--text-subtle)]'}`}>
                                        <FileCodeIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-semibold ${activeGraphId === graph.id ? 'text-[var(--text)]' : 'text-[var(--text)]'}`}>
                                            {graph.name}
                                        </span>
                                        <span className="font-mono text-[10px] text-[var(--text-subtle)]">
                                            {new Date(graph.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        className="rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
                                        title="Reveal in list"
                                    >
                                        Reveal
                                    </button>
                                    <button className="rounded-md p-1.5 text-[var(--text-subtle)] transition-all hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]">
                                        <Trash2Icon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
 
                    <div className="space-y-1 mt-6">
                        <div className="flex items-center justify-between px-2 py-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Templates</h4>
                            <button
                                type="button"
                                onClick={() => onCreateGraph?.()}
                                className="rounded p-1 text-[var(--text-subtle)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--text)]"
                                title="New Graph"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="px-2 space-y-1">
                            <button 
                                onClick={() => onLoadTemplate?.('atmospheric-breakbeat-arc')}
                                className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-[var(--text)] transition-all hover:border-[var(--panel-border)] hover:bg-[var(--panel-muted)]/60"
                            >
                                <div className="rounded bg-[var(--accent-soft)] p-1.5 text-[var(--accent)]">
                                    <FileCodeIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-semibold">Atmospheric Breakbeat Arc</span>
                            </button>
                            <button 
                                onClick={() => onLoadTemplate?.('medieval-strategy-longform')}
                                className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-[var(--text)] transition-all hover:border-[var(--panel-border)] hover:bg-[var(--panel-muted)]/60"
                            >
                                <div className="rounded bg-[var(--accent-soft)] p-1.5 text-[var(--accent)]">
                                    <FileCodeIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-semibold">Medieval Strategy Longform</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
