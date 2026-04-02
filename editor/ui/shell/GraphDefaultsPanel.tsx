import type { ChangeEventHandler, KeyboardEventHandler } from 'react';

interface GraphDefaultsPanelProps {
    projectName?: string;
    activeGraphId?: string | null;
    nameDraft: string;
    onNameDraftChange: ChangeEventHandler<HTMLInputElement>;
    onNameKeyDown: KeyboardEventHandler<HTMLInputElement>;
    onNameBlur: () => void;
    transportBpm?: number | null;
    onTransportBpmChange: (value: number) => void;
    onRevealProject?: () => void | Promise<void>;
}

export function GraphDefaultsPanel({
    projectName,
    activeGraphId,
    nameDraft,
    onNameDraftChange,
    onNameKeyDown,
    onNameBlur,
    transportBpm,
    onTransportBpmChange,
    onRevealProject,
}: GraphDefaultsPanelProps) {
    return (
        <div className="h-full overflow-y-auto px-4 py-4" data-testid="graph-defaults-panel">
            <div className="space-y-4">
                <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
                    <div className="border-b border-[var(--panel-border)] px-4 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                            Graph Defaults
                        </div>
                        <div className="mt-1 text-[12px] font-semibold text-[var(--text)]">
                            No node selected
                        </div>
                        <div className="mt-1 text-[10px] leading-4 text-[var(--text-subtle)]">
                            Selection is empty. Graph-level metadata stays available here until you pick a node.
                        </div>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                        <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/60 px-3 py-2">
                            <span className="text-[11px] text-[var(--text)]">Graph name</span>
                            <input
                                type="text"
                                value={nameDraft}
                                placeholder="Graph name"
                                onChange={onNameDraftChange}
                                onKeyDown={onNameKeyDown}
                                onBlur={onNameBlur}
                                className="min-w-0 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2 py-1 text-[11px] text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
                            />
                        </label>
                        <div className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/60 px-3 py-2">
                            <span className="text-[11px] text-[var(--text)]">Graph id</span>
                            <span className="font-mono text-[10px] text-[var(--text-subtle)]">
                                {activeGraphId ?? 'Unavailable'}
                            </span>
                        </div>
                        {transportBpm != null ? (
                            <label className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/60 px-3 py-2">
                                <span className="text-[11px] text-[var(--text)]">Tempo</span>
                                <input
                                    type="number"
                                    value={transportBpm}
                                    min={20}
                                    max={300}
                                    step={1}
                                    onChange={(event) => onTransportBpmChange(Number(event.target.value))}
                                    className="w-24 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2 py-1 text-right text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </label>
                        ) : (
                            <div className="rounded-xl border border-dashed border-[var(--panel-border)] px-3 py-3 text-[10px] text-[var(--text-subtle)]">
                                Add a transport node to expose graph tempo here.
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
                    <div className="border-b border-[var(--panel-border)] px-4 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                            Workspace
                        </div>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                        <div className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/60 px-3 py-2">
                            <span className="text-[11px] text-[var(--text)]">Project</span>
                            <span className="text-[11px] text-[var(--text-subtle)]">
                                {projectName ?? 'Workspace'}
                            </span>
                        </div>
                        {onRevealProject ? (
                            <button
                                type="button"
                                onClick={() => void onRevealProject()}
                                className="w-full rounded-xl border border-[var(--panel-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            >
                                Reveal Project
                            </button>
                        ) : null}
                    </div>
                </section>
            </div>
        </div>
    );
}
