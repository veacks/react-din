import type { ReactNode } from 'react';
import { Boxes, FolderTree, LibraryBig, PlayCircle, GitBranch } from 'lucide-react';

interface ActivityRailItem {
    id: string;
    label: string;
    shortLabel: string;
    active: boolean;
    onSelect: () => void;
    badge?: ReactNode;
}

interface ActivityRailProps {
    items: ActivityRailItem[];
}

const ITEM_ICONS: Record<string, typeof FolderTree> = {
    explorer: FolderTree,
    catalog: Boxes,
    library: LibraryBig,
    runtime: PlayCircle,
    review: GitBranch,
};

export function ActivityRail({ items }: ActivityRailProps) {
    return (
        <nav
            className="flex h-full flex-col items-center gap-2 bg-[var(--panel-muted)]/60 px-2 py-3"
            aria-label="Editor activity rail"
            data-testid="activity-rail"
        >
            {items.map((item) => {
                const Icon = ITEM_ICONS[item.id] ?? FolderTree;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={item.onSelect}
                        className={`flex w-full flex-col items-center gap-1.5 rounded-2xl border px-2 py-2 text-center transition ${
                            item.active
                                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]'
                                : 'border-transparent text-[var(--text-subtle)] hover:border-[var(--panel-border)] hover:bg-[var(--panel-bg)] hover:text-[var(--text)]'
                        }`}
                        aria-pressed={item.active}
                        title={item.label}
                    >
                        <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">{item.shortLabel}</span>
                        <span className="text-[9px] font-medium uppercase tracking-[0.14em]">{item.label}</span>
                        {item.badge}
                    </button>
                );
            })}
        </nav>
    );
}
