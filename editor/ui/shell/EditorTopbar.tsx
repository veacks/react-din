import { SHELL_LAYOUT } from './shellTokens';

import { PanelLeft, PanelBottom, PanelRight, Search } from 'lucide-react';

interface ProjectMeta {
    name: string;
    accentColor: string;
    onRevealProject?: () => void | Promise<void>;
}

interface EditorTopbarProps {
    project?: ProjectMeta;
    isDark: boolean;
    leftPanelCollapsed: boolean;
    bottomDrawerOpen: boolean;
    inspectorCollapsed: boolean;
    statusChips?: Array<{
        id: string;
        label: string;
        tone: 'info' | 'success' | 'warning';
        onSelect?: () => void;
    }>;
    onToggleTheme: () => void;
    onToggleLeftPanel: () => void;
    onToggleBottomDrawer: () => void;
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
    leftPanelCollapsed,
    bottomDrawerOpen,
    inspectorCollapsed,
    statusChips = [],
    onToggleTheme,
    onToggleLeftPanel,
    onToggleBottomDrawer,
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
                    <div className="flex min-w-0 items-center gap-3 px-1 py-1">
                        <span className="inline-block h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: project.accentColor }} />
                        <div className="truncate text-[13px] font-bold tracking-wide text-[var(--text)]">
                            {project.name}
                        </div>
                    </div>
                ) : (
                    <div className="flex min-w-0 items-center px-1 py-1">
                        <div className="text-[13px] font-bold tracking-wide text-[var(--text)]">DIN Editor</div>
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
                <div className="flex items-center gap-1 border border-transparent mr-2">
                    <button
                        type="button"
                        onClick={onToggleLeftPanel}
                        className={`border border-[var(--panel-border)] p-1.5 transition ${!leftPanelCollapsed ? 'bg-[var(--panel-muted)] text-[var(--accent)]' : 'text-[var(--text-subtle)] hover:text-[var(--text)] hover:border-[var(--accent)]'}`}
                        title="Toggle left panel"
                    >
                        <PanelLeft size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={onToggleBottomDrawer}
                        className={`border border-[var(--panel-border)] p-1.5 transition ${bottomDrawerOpen ? 'bg-[var(--panel-muted)] text-[var(--accent)]' : 'text-[var(--text-subtle)] hover:text-[var(--text)] hover:border-[var(--accent)]'}`}
                        title="Toggle bottom drawer"
                    >
                        <PanelBottom size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={onToggleInspector}
                        className={`border border-[var(--panel-border)] p-1.5 transition ${!inspectorCollapsed ? 'bg-[var(--panel-muted)] text-[var(--accent)]' : 'text-[var(--text-subtle)] hover:text-[var(--text)] hover:border-[var(--accent)]'}`}
                        title="Toggle right panel"
                    >
                        <PanelRight size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={onOpenCommandPalette}
                        className="ml-2 border border-transparent p-1.5 text-[var(--text-subtle)] transition hover:text-[var(--text)] hover:bg-[var(--panel-muted)]"
                        title="Open command palette"
                    >
                        <Search size={16} strokeWidth={2.5} />
                    </button>
                </div>
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
