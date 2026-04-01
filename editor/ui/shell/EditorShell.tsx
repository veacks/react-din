import type { ReactNode } from 'react';
import { SHELL_LAYOUT } from './shellTokens';

interface EditorShellProps {
    rail: ReactNode;
    leftPanel: ReactNode;
    canvas: ReactNode;
    bottomDrawer: ReactNode;
    rightPanel: ReactNode;
    leftPanelCollapsed: boolean;
    rightPanelCollapsed: boolean;
    leftPanelWidth: number;
    rightPanelWidth: number;
}

export function EditorShell({
    rail,
    leftPanel,
    canvas,
    bottomDrawer,
    rightPanel,
    leftPanelCollapsed,
    rightPanelCollapsed,
    leftPanelWidth,
    rightPanelWidth,
}: EditorShellProps) {
    return (
        <div
            className="ui-shell grid h-full w-full overflow-hidden text-[var(--text)]"
            style={{
                gridTemplateColumns: `${SHELL_LAYOUT.railWidth}px ${leftPanelCollapsed ? 0 : leftPanelWidth}px minmax(0, 1fr) ${rightPanelCollapsed ? 0 : rightPanelWidth}px`,
            }}
        >
            <div className="min-h-0 border-r border-[var(--panel-border)]">{rail}</div>
            <div className="min-h-0 overflow-hidden">{leftPanel}</div>
            <div className="min-h-0 grid overflow-hidden" style={{ gridTemplateRows: 'minmax(0, 1fr) auto' }}>
                {canvas}
                {bottomDrawer}
            </div>
            <div className="min-h-0 overflow-hidden">{rightPanel}</div>
        </div>
    );
}
