export type LeftPanelView = 'catalog' | 'explorer';
export type BottomDrawerTab = 'library' | 'runtime' | 'diagnostics';
export type InspectorTab = 'inspect' | 'code';

export interface CommandPaletteAction {
    id: string;
    title: string;
    keywords?: string;
    section?: string;
    shortcut?: string;
    onSelect: () => void;
}
