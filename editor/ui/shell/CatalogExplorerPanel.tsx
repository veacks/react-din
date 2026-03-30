import type { ReactNode } from 'react';
import type { LeftPanelView } from './editor-shell.types';

interface CatalogExplorerPanelProps {
    collapsed: boolean;
    view: LeftPanelView;
    onToggleCollapse: () => void;
    onViewChange: (view: LeftPanelView) => void;
    catalogContent: ReactNode;
    explorerContent: ReactNode;
}

export function CatalogExplorerPanel({
    collapsed,
    view,
    onToggleCollapse,
    onViewChange,
    catalogContent,
    explorerContent,
}: CatalogExplorerPanelProps) {
    if (collapsed) {
        return null;
    }

    return (
        <aside className="ui-panel flex h-full min-h-0 flex-col border-r border-[var(--panel-border)]">
            <div className="ui-panel-header border-b border-[var(--panel-border)] px-3 py-2">
                <div className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] p-1">
                    {(['catalog', 'explorer'] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onViewChange(item)}
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] transition ${
                                view === item
                                    ? 'bg-[var(--accent-soft)] text-[var(--text)]'
                                    : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="ui-collapse-button rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--text-subtle)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
                    title="Collapse left panel"
                    aria-label="Collapse left panel"
                >
                    <span aria-hidden="true">&lt;</span>
                </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
                {view === 'catalog' ? catalogContent : explorerContent}
            </div>
        </aside>
    );
}
