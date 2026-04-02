import { useCallback } from 'react';
import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import type { BottomDrawerTab } from './editor-shell.types';

interface BottomDrawerProps {
    open: boolean;
    activeTab: BottomDrawerTab;
    height: number;
    onToggle: () => void;
    onTabChange: (tab: BottomDrawerTab) => void;
    onHeightChange: (height: number) => void;
    runtimeContent: ReactNode;
    diagnosticsContent: ReactNode;
}

const DRAWER_TABS: Array<{ id: BottomDrawerTab; label: string }> = [
    { id: 'runtime', label: 'Runtime' },
    { id: 'diagnostics', label: 'Diagnostics' },
];

export function BottomDrawer({
    open,
    activeTab,
    height,
    onToggle,
    onTabChange,
    onHeightChange,
    runtimeContent,
    diagnosticsContent,
}: BottomDrawerProps) {
    const startResize = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startY = event.clientY;
        const startHeight = height;

        const handleMove = (moveEvent: MouseEvent) => {
            onHeightChange(startHeight + (startY - moveEvent.clientY));
        };

        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    }, [height, onHeightChange]);

    if (!open) {
        return null;
    }

    const content = activeTab === 'runtime'
        ? runtimeContent
        : diagnosticsContent;

    return (
        <section
            className="ui-panel bg-[var(--panel-bg)] border-t border-[var(--panel-border)]"
            style={{ height: `${height}px` }}
            data-testid="bottom-drawer"
        >
            <div
                className="h-2 cursor-row-resize border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/40"
                onMouseDown={startResize}
                aria-hidden="true"
            />
            <div className="flex items-center justify-between gap-3 px-4 py-2">
                <div className="flex items-center gap-2 border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1">
                    {DRAWER_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
                                activeTab === tab.id
                                    ? 'bg-[var(--accent-soft)] text-[var(--text)]'
                                    : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="min-h-0 overflow-hidden px-4 pb-4">{content}</div>
        </section>
    );
}
