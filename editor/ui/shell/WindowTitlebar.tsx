import { SHELL_LAYOUT } from './shellTokens';

interface WindowTitlebarProps {
    projectName?: string;
    activeGraphName: string;
}

export function WindowTitlebar({ projectName, activeGraphName }: WindowTitlebarProps) {
    const segments = ['DIN Editor', projectName ?? 'project', activeGraphName || 'graph'];

    return (
        <div
            className="flex items-center justify-between border-b border-[var(--panel-border)] bg-[color-mix(in_oklab,var(--panel-bg)_88%,transparent)] px-3 text-[var(--text-subtle)]"
            style={{ height: `${SHELL_LAYOUT.titlebarHeight}px` }}
        >
            <div className="truncate text-[11px] font-medium">
                {segments.join(' / ')}
            </div>
            <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--panel-border)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--panel-border)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--panel-border)]" />
            </div>
        </div>
    );
}
