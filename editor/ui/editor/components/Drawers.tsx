import { type FC, useMemo, useRef, useState } from 'react';
import { useAudioGraphStore } from '../store';
import { addAssetFromFile, deleteAsset, listAssets, type AudioLibraryAsset } from '../audioLibrary';

// Custom SVG Icons
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const MusicIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
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

const PlayIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const SquareIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const CpuIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
    </svg>
);

const LayersIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export interface LibraryItem {
    id: string;
    name: string;
    sizeBytes: number;
    type: string;
    addedAt: number;
    durationSec: number;
}

export interface AudioPreviewState {
    activeId: string | null;
    playing: boolean;
}

export interface MissingLibraryReference {
    assetId: string;
    kind: 'sample' | 'impulse';
    nodeId: string;
    nodeLabel: string;
    assetPath: string;
}

interface LibraryDrawerContentProps {
    items: LibraryItem[];
    filter: string;
    onFilterChange: (v: string) => void;
    preview: AudioPreviewState;
    onPreviewChange: (p: AudioPreviewState) => void;
    onItemsChange: (items: LibraryItem[]) => void;
    repairItems: MissingLibraryReference[];
    onRepairAsset: (item: MissingLibraryReference, file: File) => Promise<void> | void;
}

const mapProjectAssetToLibraryItem = (asset: AudioLibraryAsset): LibraryItem => ({
    id: asset.id,
    name: asset.name,
    sizeBytes: asset.size,
    type: asset.mimeType,
    addedAt: asset.createdAt,
    durationSec: asset.durationSec ?? 0
});

export const LibraryDrawerContent: FC<LibraryDrawerContentProps> = ({ 
    items, filter, onFilterChange, preview, onPreviewChange, onItemsChange, repairItems, onRepairAsset
}) => {
    const [error, setError] = useState<string | null>(null);
    const [repairingAssetId, setRepairingAssetId] = useState<string | null>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
        return `${(bytes/(1024*1024)).toFixed(1)} MB`;
    };

    const filteredItems = useMemo(() => 
        items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())),
    [items, filter]);

    const handleTogglePreview = (id: string) => {
        if (preview.activeId === id) {
            onPreviewChange({ ...preview, playing: !preview.playing });
        } else {
            onPreviewChange({ activeId: id, playing: true });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this audio file? This will clear references in all graphs.')) {
            return;
        }
        try {
            await deleteAsset(id);
            // Clear references in the graph nodes
            useAudioGraphStore.getState().clearAssetReferences(id);
            
            const assets = await listAssets();
            onItemsChange(assets.map(mapProjectAssetToLibraryItem));
        } catch (err) {
            setError('Failed to delete audio file.');
        }
    };

    const refreshItems = async () => {
        const assets = await listAssets();
        onItemsChange(assets.map(mapProjectAssetToLibraryItem));
    };

    const importFiles = async (files: File[]) => {
        setError(null);
        if (files.length === 0) return;

        const hasNonAudio = files.some(file => !file.type.startsWith('audio/'));

        if (hasNonAudio) {
            setError('Only audio files are accepted.');
            return;
        }

        try {
            await Promise.all(files.map(file => addAssetFromFile(file)));
            await refreshItems();
        } catch (err) {
            setError('Failed to upload audio files.');
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        await importFiles(Array.from(e.dataTransfer.files));
    };

    const handleImportInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextFiles = Array.from(event.target.files ?? []);
        await importFiles(nextFiles);
        if (uploadInputRef.current) {
            uploadInputRef.current.value = '';
        }
    };

    const handleRepairInputChange = async (item: MissingLibraryReference, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setRepairingAssetId(item.assetId);
        setError(null);
        try {
            await onRepairAsset(item, file);
            await refreshItems();
        } catch (err) {
            setError('Failed to repair the missing asset reference.');
        } finally {
            setRepairingAssetId(null);
            event.target.value = '';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#080912]">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-white/5">
                <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search audio library..."
                        aria-label="Search library files"
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-full pl-9 pr-4 py-2 text-[13px] text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                    />
                </div>
                <input
                    ref={uploadInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleImportInputChange}
                    className="sr-only"
                    aria-label="Import library files"
                />
                <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all active:scale-95"
                >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    <span>IMPORT</span>
                </button>
            </div>

            {error && (
                <div className="mx-4 mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium flex items-center gap-2">
                    <AlertTriangleIcon className="w-3.5 h-3.5" />
                    {error}
                </div>
            )}

            <div 
                className="flex-1 overflow-y-auto p-4 ui-library-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {repairItems.length > 0 ? (
                    <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4">
                        <div className="flex items-center gap-2 text-amber-300">
                            <AlertTriangleIcon className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Missing asset repair</span>
                        </div>
                        <div className="mt-2 text-[12px] leading-6 text-amber-50/90">
                            Repair missing sample or impulse references directly from the library without leaving the current drawer context.
                        </div>
                        <div className="mt-3 grid gap-3">
                            {repairItems.map((item) => (
                                <label
                                    key={`${item.nodeId}:${item.assetId}`}
                                    className="rounded-2xl border border-amber-500/20 bg-black/20 px-4 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[13px] font-semibold text-zinc-100">{item.nodeLabel}</div>
                                            <div className="mt-1 text-[11px] text-amber-50/80">{item.assetPath || item.assetId}</div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                                            {repairingAssetId === item.assetId ? 'Repairing…' : item.kind}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        aria-label={`Repair ${item.nodeLabel}`}
                                        onChange={(event) => void handleRepairInputChange(item, event)}
                                        className="mt-3 block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] text-zinc-200 file:mr-3 file:rounded-full file:border-0 file:bg-amber-500/20 file:px-3 file:py-1 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.18em] file:text-amber-50"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                ) : null}

                {filteredItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-zinc-600 gap-3">
                        <MusicIcon className="w-8 h-8 opacity-20" />
                        <span className="text-xs uppercase tracking-widest font-bold opacity-40">No audio files found.</span>
                        <p className="text-[10px] text-zinc-500">Drag and drop audio files here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {filteredItems.map(item => (
                            <div key={item.id} className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => handleTogglePreview(item.id)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 ${
                                            preview.activeId === item.id && preview.playing 
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {preview.activeId === item.id && preview.playing ? <SquareIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-semibold text-zinc-200">{item.name}</span>
                                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                            <span>{formatSize(item.sizeBytes)}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span>{item.durationSec.toFixed(1)}s</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                        title="Delete file from library"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const RuntimeDrawerContent: FC = () => {
    return (
        <div className="h-full p-6 bg-[#080912] overflow-y-auto">
            <div className="grid grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <ActivityIcon className="w-5 h-5" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">Engine Latency</h4>
                    </div>
                    <div className="text-3xl font-mono text-zinc-100">12.4ms</div>
                    <div className="mt-2 text-[10px] text-zinc-500 uppercase font-bold">Stable @ 44.1kHz</div>
                </div>
                
                <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-4 text-blue-400">
                        <CpuIcon className="w-5 h-5" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">CPU Load</h4>
                    </div>
                    <div className="text-3xl font-mono text-zinc-100">8.2%</div>
                    <div className="mt-2 text-[10px] text-zinc-500 uppercase font-bold">42 active voices</div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                        <LayersIcon className="w-5 h-5" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.18em]">Active Nodes</h4>
                    </div>
                    <div className="text-3xl font-mono text-zinc-100">154</div>
                    <div className="mt-2 text-[10px] text-zinc-500 uppercase font-bold">Graph depth: 8</div>
                </div>
            </div>

            <div className="mt-6 p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <SettingsIcon className="w-5 h-5" />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.18em]">Configuration</h4>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    {[
                        { label: 'Oversampling', value: '4x (Linear)' },
                        { label: 'Buffer Size', value: '512 samples' },
                        { label: 'WASAPI Mode', value: 'Shared' },
                        { label: 'Precision', value: 'Float32' }
                    ].map(opt => (
                        <div key={opt.label} className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{opt.label}</span>
                            <span className="text-xs font-bold text-zinc-300">{opt.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const DiagnosticsDrawerContent: FC = () => {
    return (
        <div className="h-full bg-black">
            <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50 bg-zinc-950/50">
                <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">System Logs</h4>
            </div>
            <div className="p-4 font-mono text-[11px] space-y-2 text-zinc-400 selection:bg-blue-500/30">
                <div className="flex gap-4">
                    <span className="text-zinc-600">[0.000s]</span>
                    <span className="text-emerald-500">AudioContext started successfully (state: running)</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-zinc-600">[0.124s]</span>
                    <span className="text-blue-500">MidiRuntime: initializing WebMIDI interface...</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-zinc-600">[0.145s]</span>
                    <span className="text-zinc-300">Graph: active composition 'atmospheric-breakbeat-arc' loaded</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-zinc-600">[0.210s]</span>
                    <span className="text-amber-500">Warning: VoiceNode (id: voice-2) has long release time (8.5s)</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-zinc-600">[0.354s]</span>
                    <span className="text-white">Sampler: buffer for 'snare-808' loaded (245kB)</span>
                </div>
                <div className="flex gap-4 animate-pulse">
                    <span className="text-zinc-600">[0.412s]</span>
                    <span className="text-blue-400">_</span>
                </div>
            </div>
        </div>
    );
};
