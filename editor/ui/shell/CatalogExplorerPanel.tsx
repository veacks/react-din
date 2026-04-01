import type { ReactNode } from 'react';

interface CatalogExplorerPanelProps {
    collapsed: boolean;
    title: string;
    onToggleCollapse: () => void;
    children: ReactNode;
}

export function CatalogExplorerPanel({
    collapsed,
    title,
    onToggleCollapse,
    children,
}: CatalogExplorerPanelProps) {
    if (collapsed) {
        return null;
    }

    return (
        <aside className="ui-panel flex h-full min-h-0 flex-col border-r border-[var(--panel-border)]" data-testid="left-drawer">
            <div className="ui-panel-header border-b border-[var(--panel-border)] px-3 py-2">
                <div className="min-w-0">
                    <div className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                        Left Drawer
                    </div>
                    <div className="truncate text-[13px] font-semibold text-[var(--text)]">{title}</div>
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
                {children}
            </div>
        </aside>
    );
}
