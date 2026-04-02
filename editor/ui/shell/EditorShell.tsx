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
        <div className="ui-shell relative h-full w-full overflow-hidden text-[var(--text)] flex flex-row">
            {/* Left Sidebar */}
            <aside 
                className="flex flex-none border-r border-[var(--panel-border)]/20 bg-[var(--panel-bg)] transition-all duration-300 z-10"
                style={{ width: leftPanelCollapsed ? SHELL_LAYOUT.railWidth : leftPanelWidth + SHELL_LAYOUT.railWidth }}
            >
                <div 
                    className="border-r border-[var(--panel-border)]/40 bg-[var(--panel-muted)]/20 overflow-hidden"
                    style={{ width: SHELL_LAYOUT.railWidth }}
                >
                    {rail}
                </div>
                <div 
                    className="min-w-0 transition-all duration-300 overflow-hidden" 
                    style={{ 
                        width: leftPanelCollapsed ? 0 : leftPanelWidth, 
                        opacity: leftPanelCollapsed ? 0 : 1,
                        visibility: leftPanelCollapsed ? 'hidden' : 'visible'
                    }}
                >
                    {leftPanel}
                </div>
            </aside>

            {/* Center Canvas */}
            <main className="flex-1 flex flex-col min-w-0 relative z-0">
                <div className="flex-1 relative min-h-0 bg-[var(--canvas-bg)]">
                    {canvas}
                </div>
                
                {/* Bottom Drawer */}
                <div className="flex-none pointer-events-auto w-full border-t border-[var(--panel-border)]/20 z-10 relative bg-[var(--panel-bg)]">
                    {bottomDrawer}
                </div>
            </main>

            {/* Right Sidebar */}
            <aside 
                className="flex-none border-l border-[var(--panel-border)]/20 bg-[var(--panel-bg)] transition-all duration-300 z-10 overflow-hidden"
                style={{ width: rightPanelCollapsed ? 0 : rightPanelWidth, opacity: rightPanelCollapsed ? 0 : 1 }}
            >
                <div className="w-full h-full min-h-0 overflow-hidden">
                    {rightPanel}
                </div>
            </aside>
        </div>
    );
}
