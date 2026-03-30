import type { ReactNode } from 'react';

interface EditorShellProps {
    rail: ReactNode;
    leftPanel: ReactNode;
    topbar: ReactNode;
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
    topbar,
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
            className="ui-shell grid h-screen w-full overflow-hidden text-[var(--text)]"
            style={{
                gridTemplateColumns: `64px ${leftPanelCollapsed ? 0 : leftPanelWidth}px minmax(0, 1fr) ${rightPanelCollapsed ? 0 : rightPanelWidth}px`,
            }}
        >
            <div className="min-h-0 border-r border-[var(--panel-border)]">{rail}</div>
            <div className="min-h-0 overflow-hidden">{leftPanel}</div>
            <div className="min-h-0 grid overflow-hidden" style={{ gridTemplateRows: 'auto minmax(0, 1fr) auto' }}>
                {topbar}
                {canvas}
                {bottomDrawer}
            </div>
            <div className="min-h-0 overflow-hidden">{rightPanel}</div>
        </div>
    );
}
