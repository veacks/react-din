import type { ReactNode } from 'react';
import type { InspectorTab } from './editor-shell.types';

interface InspectorPaneProps {
    collapsed: boolean;
    tab: InspectorTab;
    onToggleCollapse: () => void;
    onTabChange: (tab: InspectorTab) => void;
    hasSelection: boolean;
    selectedNodeLabel: string | null;
    inspectContent: ReactNode;
    codeContent: ReactNode;
}

export function InspectorPane({
    collapsed,
    tab,
    onToggleCollapse,
    onTabChange,
    hasSelection,
    selectedNodeLabel,
    inspectContent,
    codeContent,
}: InspectorPaneProps) {
    if (collapsed) {
        return null;
    }

    return (
        <aside className="ui-panel flex h-full min-h-0 flex-col border-l border-[var(--panel-border)]">
            <div className="ui-panel-header border-b border-[var(--panel-border)] px-3 py-2">
                <div className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)] p-1">
                    {(['inspect', 'code'] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onTabChange(item)}
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] transition ${
                                tab === item
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
                    aria-pressed={!collapsed}
                    title="Collapse inspector"
                >
                    <span aria-hidden="true">&gt;</span>
                </button>
            </div>
            <div className="border-b border-[var(--panel-border)] px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                    {tab === 'inspect' ? 'Selection' : 'Code'}
                </div>
                <div className="mt-1 truncate text-[12px] font-semibold text-[var(--text)]">
                    {tab === 'inspect' ? (selectedNodeLabel ?? 'No node selected') : 'Live code preview'}
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
                {tab === 'inspect'
                    ? hasSelection
                        ? inspectContent
                        : (
                            <div className="flex h-full items-center justify-center px-4 text-center text-[11px] text-[var(--text-subtle)]">
                                Select a node to edit detailed properties.
                            </div>
                        )
                    : codeContent}
            </div>
        </aside>
    );
}
