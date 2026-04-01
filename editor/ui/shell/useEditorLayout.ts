import { useCallback, useEffect, useRef, useState } from 'react';
import type { BottomDrawerTab, InspectorTab, LeftPanelView } from './editor-shell.types';
import { SHELL_LAYOUT } from './shellTokens';

const STORAGE_KEYS = {
    theme: 'din-editor-theme',
    leftPanelCollapsed: 'din-editor-left-panel-collapsed',
    leftPanelView: 'din-editor-left-panel-view',
    rightPanelCollapsed: 'din-editor-right-panel-collapsed',
    bottomDrawerOpen: 'din-editor-bottom-drawer-open',
    bottomDrawerTab: 'din-editor-bottom-drawer-tab',
    bottomDrawerHeight: 'din-editor-bottom-drawer-height',
    inspectorTab: 'din-editor-inspector-tab',
} as const;

const getViewportWidth = () => (typeof window === 'undefined' ? 1440 : window.innerWidth);
const getViewportHeight = () => (typeof window === 'undefined' ? 900 : window.innerHeight);
const getDefaultLeftPanelCollapsed = (viewportWidth: number) => viewportWidth < 1240;
const getDefaultRightPanelCollapsed = (viewportWidth: number) => viewportWidth < 1100;

const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readBoolean = (key: string, fallback: boolean) => {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return fallback;
};

const readEnum = <T extends string>(key: string, values: readonly T[], fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    return values.includes(raw as T) ? (raw as T) : fallback;
};

const readNumber = (key: string, fallback: number) => {
    if (typeof window === 'undefined') return fallback;
    const raw = Number(window.localStorage.getItem(key));
    return Number.isFinite(raw) ? raw : fallback;
};

const clampBottomDrawerHeight = (value: number) => {
    const viewportHeight = getViewportHeight();
    const min = SHELL_LAYOUT.bottomDrawerMinHeight;
    const max = Math.max(min, viewportHeight - SHELL_LAYOUT.bottomDrawerViewportOffset);
    return Math.min(max, Math.max(min, Math.round(value)));
};

function readLegacyLibraryMigration() {
    if (typeof window === 'undefined') {
        return { migrateLibraryTab: false, storedLeftPanelView: null as LeftPanelView | null };
    }

    const storedBottomDrawerTab = window.localStorage.getItem(STORAGE_KEYS.bottomDrawerTab);
    const storedLeftPanelView = window.localStorage.getItem(STORAGE_KEYS.leftPanelView);
    const nextLeftPanelView = storedLeftPanelView === 'explorer'
        || storedLeftPanelView === 'catalog'
        || storedLeftPanelView === 'library'
        ? storedLeftPanelView
        : null;

    return {
        migrateLibraryTab: storedBottomDrawerTab === 'library',
        storedLeftPanelView: nextLeftPanelView,
    };
}

export function useEditorLayout() {
    const viewportWidth = getViewportWidth();
    const manualOverrideRef = useRef(false);
    const migrationRef = useRef(readLegacyLibraryMigration());
    const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme());
    const [currentViewportWidth, setCurrentViewportWidth] = useState(viewportWidth);
    const [leftPanelView, setLeftPanelView] = useState<LeftPanelView>(() =>
        migrationRef.current.migrateLibraryTab
            ? 'library'
            : readEnum(STORAGE_KEYS.leftPanelView, ['explorer', 'catalog', 'library'], 'explorer')
    );
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(() =>
        migrationRef.current.migrateLibraryTab
            ? false
            : readBoolean(STORAGE_KEYS.leftPanelCollapsed, getDefaultLeftPanelCollapsed(viewportWidth))
    );
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(() =>
        readBoolean(STORAGE_KEYS.rightPanelCollapsed, getDefaultRightPanelCollapsed(viewportWidth))
    );
    const [bottomDrawerOpen, setBottomDrawerOpen] = useState(() =>
        migrationRef.current.migrateLibraryTab
            ? true
            : readBoolean(STORAGE_KEYS.bottomDrawerOpen, true)
    );
    const [bottomDrawerTab, setBottomDrawerTab] = useState<BottomDrawerTab>(() =>
        migrationRef.current.migrateLibraryTab
            ? 'runtime'
            : readEnum(STORAGE_KEYS.bottomDrawerTab, ['runtime', 'diagnostics'], 'runtime')
    );
    const [bottomDrawerHeight, setBottomDrawerHeight] = useState(() =>
        clampBottomDrawerHeight(readNumber(STORAGE_KEYS.bottomDrawerHeight, SHELL_LAYOUT.bottomDrawerDefaultHeight))
    );
    const [inspectorTab, setInspectorTab] = useState<InspectorTab>(() =>
        readEnum(STORAGE_KEYS.inspectorTab, ['inspect', 'code'], 'inspect')
    );
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === 'dark';
        root.classList.toggle('dark', isDark);
        root.classList.toggle('light', !isDark);
        window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    }, [theme]);

    useEffect(() => {
        const onResize = () => {
            const nextWidth = getViewportWidth();
            setCurrentViewportWidth(nextWidth);

            if (!manualOverrideRef.current) {
                setLeftPanelCollapsed(getDefaultLeftPanelCollapsed(nextWidth));
                setRightPanelCollapsed(getDefaultRightPanelCollapsed(nextWidth));
            } else if (nextWidth < 900) {
                setRightPanelCollapsed(true);
            }

            setBottomDrawerHeight((current) => clampBottomDrawerHeight(current));
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEYS.leftPanelCollapsed, String(leftPanelCollapsed));
    }, [leftPanelCollapsed]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEYS.leftPanelView, leftPanelView);
    }, [leftPanelView]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEYS.rightPanelCollapsed, String(rightPanelCollapsed));
    }, [rightPanelCollapsed]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEYS.bottomDrawerOpen, String(bottomDrawerOpen));
    }, [bottomDrawerOpen]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEYS.bottomDrawerTab, bottomDrawerTab);
    }, [bottomDrawerTab]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEYS.bottomDrawerHeight, String(bottomDrawerHeight));
    }, [bottomDrawerHeight]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEYS.inspectorTab, inspectorTab);
    }, [inspectorTab]);

    const markManual = () => {
        manualOverrideRef.current = true;
    };

    const toggleLeftPanel = useCallback(() => {
        markManual();
        setLeftPanelCollapsed((current) => !current);
    }, []);

    const toggleRightPanel = useCallback(() => {
        markManual();
        setRightPanelCollapsed((current) => !current);
    }, []);

    const toggleBottomDrawer = useCallback(() => {
        markManual();
        setBottomDrawerOpen((current) => !current);
    }, []);

    const openLeftPanelView = useCallback((view: LeftPanelView) => {
        markManual();
        setLeftPanelView(view);
        setLeftPanelCollapsed(false);
    }, []);

    const openBottomDrawerTab = useCallback((tab: BottomDrawerTab) => {
        markManual();
        setBottomDrawerTab(tab);
        setBottomDrawerOpen(true);
    }, []);

    const openInspectorTab = useCallback((tab: InspectorTab) => {
        markManual();
        setInspectorTab(tab);
        setRightPanelCollapsed(false);
    }, []);

    const updateBottomDrawerHeight = useCallback((value: number) => {
        markManual();
        setBottomDrawerHeight(clampBottomDrawerHeight(value));
    }, []);

    return {
        theme,
        setTheme,
        isDark: theme === 'dark',
        viewportWidth: currentViewportWidth,
        leftPanelView,
        leftPanelCollapsed,
        rightPanelCollapsed,
        bottomDrawerOpen,
        bottomDrawerTab,
        bottomDrawerHeight,
        inspectorTab,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toggleLeftPanel,
        toggleRightPanel,
        toggleBottomDrawer,
        openLeftPanelView,
        openBottomDrawerTab,
        openInspectorTab,
        updateBottomDrawerHeight,
    };
}
