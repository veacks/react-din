export type LeftPanelView = 'explorer' | 'catalog' | 'library';
export type BottomDrawerTab = 'runtime' | 'diagnostics';
export type InspectorTab = 'inspect' | 'code';

export interface CommandPaletteAction {
    id: string;
    title: string;
    keywords?: string;
    section?: string;
    shortcut?: string;
    onSelect: () => void;
}
