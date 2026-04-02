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
        <aside className="ui-panel flex h-full min-h-0 flex-col" data-testid="left-drawer">
            <div className="ui-panel-header border-b border-[var(--panel-border)] px-3 py-2">
                <div className="min-w-0">

                    <div className="truncate text-[13px] font-semibold text-[var(--text)]">{title}</div>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
                {children}
            </div>
        </aside>
    );
}
