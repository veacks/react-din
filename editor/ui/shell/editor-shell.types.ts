import type { DensityMode, LauncherSection, RailMode, SourceControlPhase, StatusSeverity } from '../phase3a.types';

export type LeftPanelView = Exclude<RailMode, 'runtime'>;
export type BottomDrawerTab = 'runtime' | 'diagnostics';
export type InspectorTab = 'inspect' | 'code';
export type { DensityMode, LauncherSection, RailMode, SourceControlPhase, StatusSeverity };

export interface CommandPaletteAction {
    id: string;
    title: string;
    keywords?: string;
    section?: string;
    shortcut?: string;
    onSelect: () => void;
}
