import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { CommandPaletteAction } from './editor-shell.types';

interface CommandPaletteProps {
    open: boolean;
    actions: CommandPaletteAction[];
    onClose: () => void;
}

export function CommandPalette({ open, actions, onClose }: CommandPaletteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!open) return;
        setQuery('');
        setActiveIndex(0);
        window.requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        });
    }, [open]);

    const filteredActions = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return actions;
        return actions.filter((action) => {
            const haystack = `${action.title} ${action.keywords ?? ''} ${action.section ?? ''}`.toLowerCase();
            return haystack.includes(normalized);
        });
    }, [actions, query]);

    useEffect(() => {
        if (activeIndex >= filteredActions.length) {
            setActiveIndex(0);
        }
    }, [activeIndex, filteredActions.length]);

    if (!open) {
        return null;
    }

    const execute = (action: CommandPaletteAction | undefined) => {
        if (!action) return;
        onClose();
        action.onSelect();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((current) => (filteredActions.length === 0 ? 0 : (current + 1) % filteredActions.length));
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => (filteredActions.length === 0 ? 0 : (current - 1 + filteredActions.length) % filteredActions.length));
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            execute(filteredActions[activeIndex]);
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(2,6,20,0.58)] px-4 py-[12vh]" onMouseDown={onClose}>
            <div
                className="w-full max-w-[640px] rounded-[20px] border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[0_28px_90px_rgba(2,6,20,0.45)]"
                role="dialog"
                aria-label="Command palette"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-[var(--panel-border)] px-4 py-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search commands"
                        aria-label="Search commands"
                        className="h-11 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                    {filteredActions.length === 0 ? (
                        <div className="px-3 py-8 text-center text-[12px] text-[var(--text-subtle)]">No command found.</div>
                    ) : (
                        filteredActions.map((action, index) => (
                            <button
                                key={action.id}
                                type="button"
                                onClick={() => execute(action)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                                    activeIndex === index
                                        ? 'bg-[var(--accent-soft)] text-[var(--text)]'
                                        : 'text-[var(--text)] hover:bg-[var(--panel-muted)]'
                                }`}
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-[12px] font-semibold">{action.title}</div>
                                    {action.section ? (
                                        <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">{action.section}</div>
                                    ) : null}
                                </div>
                                {action.shortcut ? (
                                    <span className="ml-4 shrink-0 rounded-md border border-[var(--panel-border)] px-2 py-1 font-mono text-[10px] text-[var(--text-subtle)]">
                                        {action.shortcut}
                                    </span>
                                ) : null}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
