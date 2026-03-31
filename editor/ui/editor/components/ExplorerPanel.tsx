import { type FC } from 'react';
import { useAudioGraphStore } from '../store';

interface ExplorerPanelProps {
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

export const ExplorerPanel: FC<ExplorerPanelProps> = ({ onLoadGraph, onLoadTemplate }) => {
    const graphs = useAudioGraphStore((s) => s.graphs);
    const activeGraphId = useAudioGraphStore((s) => s.activeGraphId);
    
    return (
        <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                    <FolderOpenIcon className="w-4 h-4" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">Explorer</h3>
                </div>
                <button className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-zinc-200" title="New Graph">
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
 
            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="px-2 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Graphs</h4>
                        {graphs.map(graph => (
                            <div 
                                key={graph.id}
                                onClick={() => onLoadGraph(graph.id)}
                                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                    activeGraphId === graph.id 
                                        ? 'bg-blue-500/10 border border-blue-500/20' 
                                        : 'hover:bg-zinc-800 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded ${activeGraphId === graph.id ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <FileCodeIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-semibold ${activeGraphId === graph.id ? 'text-blue-400' : 'text-zinc-300'}`}>
                                            {graph.name}
                                        </span>
                                        <span className="text-[10px] text-zinc-600 font-mono">
                                            {new Date(graph.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                        title="Reveal in list"
                                    >
                                        Reveal
                                    </button>
                                    <button className="p-1.5 hover:bg-red-500/20 rounded-md transition-all text-zinc-500 hover:text-red-400">
                                        <Trash2Icon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
 
                    <div className="space-y-1 mt-6">
                        <h4 className="px-2 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Templates</h4>
                        <div className="px-2 space-y-1">
                            <button 
                                onClick={() => onLoadTemplate?.('voice-synth')}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-all border border-transparent"
                            >
                                <div className="p-1.5 rounded bg-purple-500/20 text-purple-400">
                                    <FileCodeIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-semibold">Voice Synth</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
