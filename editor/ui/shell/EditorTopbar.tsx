import { SHELL_LAYOUT } from './shellTokens';

interface ProjectMeta {
    name: string;
    accentColor: string;
    onRevealProject?: () => void | Promise<void>;
}

interface EditorTopbarProps {
    project?: ProjectMeta;
    isDark: boolean;
    inspectorCollapsed: boolean;
    statusChips?: Array<{
        id: string;
        label: string;
        tone: 'info' | 'success' | 'warning';
        onSelect?: () => void;
    }>;
    onToggleTheme: () => void;
    onToggleInspector: () => void;
    onOpenCommandPalette: () => void;
}

function getChipToneClass(tone: 'info' | 'success' | 'warning') {
    switch (tone) {
        case 'success':
            return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100';
        case 'warning':
            return 'border-amber-400/30 bg-amber-500/10 text-amber-50';
        case 'info':
        default:
            return 'border-blue-400/30 bg-blue-500/10 text-blue-50';
    }
}

export function EditorTopbar({
    project,
    isDark,
    inspectorCollapsed,
    statusChips = [],
    onToggleTheme,
    onToggleInspector,
    onOpenCommandPalette,
}: EditorTopbarProps) {
    return (
        <div
            className="ui-topbar flex flex-wrap items-center justify-between gap-3 border-b border-[var(--panel-border)] px-4 py-2"
            style={{ minHeight: `${SHELL_LAYOUT.topbarHeight}px` }}
        >
            <div className="flex min-w-0 items-center gap-3">
                {project ? (
                    <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2">
                        <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.accentColor }} />
                        <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-[var(--text)]">{project.name}</div>
                            <div className="truncate text-[10px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                                Desktop authoring workspace
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-[18px] border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">Workspace</div>
                        <div className="text-[13px] font-semibold text-[var(--text)]">DIN Editor</div>
                    </div>
                )}
                {statusChips.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {statusChips.map((chip) => (
                            <button
                                key={chip.id}
                                type="button"
                                onClick={() => chip.onSelect?.()}
                                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition hover:opacity-90 ${getChipToneClass(chip.tone)}`}
                                data-testid={`topbar-chip-${chip.id}`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="ui-topbar-actions flex flex-wrap items-center justify-end gap-2">
                {project?.onRevealProject ? (
                    <button
                        type="button"
                        onClick={() => void project.onRevealProject?.()}
                        className="rounded-xl border border-[var(--panel-border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                        Reveal
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={onToggleInspector}
                    className="rounded-xl border border-[var(--panel-border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    aria-pressed={!inspectorCollapsed}
                >
                    Inspector
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
