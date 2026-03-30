import type { ChangeEventHandler, KeyboardEventHandler, ReactNode } from 'react';

interface ProjectMeta {
    name: string;
    accentColor: string;
}

interface EditorTopbarProps {
    project?: ProjectMeta;
    activeGraphName: string;
    componentName: string;
    nameDraft: string;
    onNameDraftChange: ChangeEventHandler<HTMLInputElement>;
    onNameKeyDown: KeyboardEventHandler<HTMLInputElement>;
    onNameBlur: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
    onOpenCommandPalette: () => void;
    onAutoArrange: () => void;
    onFitCanvas: () => void;
    mcpBadge: ReactNode;
}

export function EditorTopbar({
    project,
    activeGraphName,
    componentName,
    nameDraft,
    onNameDraftChange,
    onNameKeyDown,
    onNameBlur,
    isDark,
    onToggleTheme,
    onOpenCommandPalette,
    onAutoArrange,
    onFitCanvas,
    mcpBadge,
}: EditorTopbarProps) {
    return (
        <div className="ui-topbar flex flex-wrap items-center justify-between gap-3 border-b border-[var(--panel-border)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
                {project ? (
                    <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2">
                        <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.accentColor }} />
                        <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-[var(--text)]">{project.name}</div>
                            <div className="truncate text-[10px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                                Active graph: {activeGraphName}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-[18px] border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Workspace</div>
                        <div className="text-[13px] font-semibold text-[var(--text)]">{activeGraphName}</div>
                    </div>
                )}

                <div className="flex min-w-0 items-center gap-2 rounded-[18px] border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-subtle)]">Graph</span>
                    <input
                        type="text"
                        value={nameDraft}
                        onChange={onNameDraftChange}
                        onKeyDown={onNameKeyDown}
                        onBlur={onNameBlur}
                        placeholder="Graph name"
                        className="h-8 w-40 rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                    <span className="font-mono text-[10px] text-[var(--text-subtle)]">{componentName}</span>
                </div>
            </div>

            <div className="ui-topbar-actions flex flex-wrap items-center justify-end gap-2">
                {mcpBadge}
                <button
                    type="button"
                    onClick={onAutoArrange}
                    className="rounded-xl border border-[var(--panel-border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                    Arrange
                </button>
                <button
                    type="button"
                    onClick={onFitCanvas}
                    className="rounded-xl border border-[var(--panel-border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                    Fit
                </button>
                <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text)] transition hover:bg-[var(--panel-bg)]"
                    title="Open command palette"
                >
                    Command
                </button>
                <button
                    type="button"
                    onClick={onToggleTheme}
                    className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)] transition hover:border-[var(--accent)]"
                    aria-pressed={isDark}
                    title="Toggle theme"
                >
                    <span className="relative inline-flex h-4 w-8 items-center rounded-full bg-[var(--panel-border)]">
                        <span
                            className={`h-3 w-3 rounded-full bg-[var(--panel-bg)] shadow-sm transition-transform ${isDark ? 'translate-x-4' : 'translate-x-1'}`}
                        />
                    </span>
                    <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
                </button>
            </div>
        </div>
    );
}
