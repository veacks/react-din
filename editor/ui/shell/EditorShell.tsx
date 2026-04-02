import { useCallback, useState, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
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
    onLeftPanelWidthChange: (value: number) => void;
    onRightPanelWidthChange: (value: number) => void;
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
    onLeftPanelWidthChange,
    onRightPanelWidthChange,
}: EditorShellProps) {
    const [isResizing, setIsResizing] = useState(false);

    const startLeftResize = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = leftPanelWidth;
        setIsResizing(true);

        const handleMove = (moveEvent: MouseEvent) => {
            onLeftPanelWidthChange(startWidth + (moveEvent.clientX - startX));
        };

        const handleUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    }, [leftPanelWidth, onLeftPanelWidthChange]);

    const startRightResize = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = rightPanelWidth;
        setIsResizing(true);

        const handleMove = (moveEvent: MouseEvent) => {
            onRightPanelWidthChange(startWidth + (startX - moveEvent.clientX));
        };

        const handleUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    }, [rightPanelWidth, onRightPanelWidthChange]);

    const transitionClass = isResizing ? '' : 'transition-all duration-300';

    return (
        <div className="ui-shell relative h-full w-full overflow-hidden text-[var(--text)] flex flex-row">
            {/* Left Sidebar */}
            <aside 
                className={`flex flex-none border-r border-[var(--panel-border)] bg-[var(--panel-bg)] z-10 relative ${transitionClass}`}
                style={{ width: leftPanelCollapsed ? SHELL_LAYOUT.railWidth : leftPanelWidth + SHELL_LAYOUT.railWidth }}
            >
                <div 
                    className="border-r border-[var(--panel-border)] bg-[var(--panel-muted)]/20 overflow-hidden"
                    style={{ width: SHELL_LAYOUT.railWidth }}
                >
                    {rail}
                </div>
                <div 
                    className={`min-w-0 overflow-hidden ${transitionClass}`} 
                    style={{ 
                        width: leftPanelCollapsed ? 0 : leftPanelWidth, 
                        opacity: leftPanelCollapsed ? 0 : 1,
                        visibility: leftPanelCollapsed ? 'hidden' : 'visible'
                    }}
                >
                    {leftPanel}
                </div>
                {/* Drag handle */}
                {!leftPanelCollapsed && (
                    <div 
                        className="absolute right-[-4px] top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-[var(--accent)]/50 transition-colors"
                        onMouseDown={startLeftResize}
                        aria-hidden="true"
                    />
                )}
            </aside>

            {/* Center Canvas */}
            <main className="flex-1 flex flex-col min-w-0 relative z-0">
                <div className="flex-1 relative min-h-0 bg-[var(--canvas-bg)]">
                    {canvas}
                </div>
                
                {/* Bottom Drawer */}
                <div className="flex-none pointer-events-auto w-full z-10 relative">
                    {bottomDrawer}
                </div>
            </main>

            {/* Right Sidebar */}
            <aside 
                className={`flex-none border-l border-[var(--panel-border)] bg-[var(--panel-bg)] z-10 overflow-hidden relative ${transitionClass}`}
                style={{ width: rightPanelCollapsed ? 0 : rightPanelWidth, opacity: rightPanelCollapsed ? 0 : 1 }}
            >
                {/* Drag handle */}
                {!rightPanelCollapsed && (
                    <div 
                        className="absolute left-[-2px] top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-[var(--accent)]/50 transition-colors"
                        onMouseDown={startRightResize}
                        aria-hidden="true"
                    />
                )}
                <div className="w-full h-full min-h-0 overflow-hidden">
                    {rightPanel}
                </div>
            </aside>
        </div>
    );
}
