import type { ProjectManifest } from '../project';

export const APP_COPY = {
    loadingProjects: 'Loading projects',
    importedPatchBaseName: 'Imported Patch',
    importedPatchProjectSuffix: 'Project',
    errors: {
        openProject: 'Failed to open the project.',
        bootstrapLauncher: 'Failed to bootstrap the project launcher.',
        openProjectWindow: 'Failed to open the project window.',
        createProject: 'Failed to create the project.',
        createProjectFromTemplate: 'Failed to create the project from template.',
        missingPatchTarget: 'No project target available for the patch import.',
        importPatch: 'Failed to import the patch.',
        recoverLegacyWorkspace: 'Failed to recover the legacy workspace.',
    },
} as const;

function formatStorageKind(storageKind: ProjectManifest['storageKind']): string {
    switch (storageKind) {
        case 'electron-fs':
            return 'Desktop folder';
        case 'browser-fs-handle':
            return 'Browser folder';
        case 'browser-indexeddb':
        default:
            return 'Browser IndexedDB';
    }
}

export const LAUNCHER_COPY = {
    defaults: {
        untitledProjectName: 'Untitled Project',
        projectSuffix: 'Project',
        importedPatchProjectName: 'Imported Patch Project',
        newProjectPlaceholder: 'Atmospheric Breakbeat Lab',
    },
    errors: {
        validatePatchFile: 'Failed to validate the patch file.',
    },
    hero: {
        badge: 'DIN Phase 3A',
        title: 'Open the right project, starter, import, or recovery path without losing context.',
        description:
            'The launcher is now the owner of entry flows. Reopen recent work, start from a graph template, import an existing patch into a dedicated project, or resume unfinished review and repair tasks.',
        dedicatedProjectWindows: 'Dedicated project windows',
        singleWindowWorkspace: 'Single-window workspace',
        localFoldersEnabled: 'Local folders enabled',
        indexedDbProjectStorage: 'IndexedDB project storage',
        trackedProjects: (count: number) => `${count} tracked projects`,
        resumableTasks: (count: number) => `${count} resumable tasks`,
    },
    summary: {
        template: 'Template Summary',
        import: 'Import Summary',
        recovery: 'Recovery Summary',
        nextActions: 'Next Actions',
        nodes: 'Nodes',
        connections: 'Connections',
        graphs: 'Graphs',
        assets: 'Assets',
        lastOpened: (value: string) => `Last opened ${value}`,
        interruptedWork: 'Interrupted work',
        newProject: 'New Project',
        legacyWorkspaceDetected: 'Legacy workspace detected',
        legacyWorkspaceDetectedDescription:
            'Recover older global graphs and cached assets into one dedicated DIN project.',
        noRecoveryNeeded: 'No unfinished work or legacy workspace needs recovery right now.',
        emptySelectedProject:
            'Create a first DIN project or recover a previous workspace to start tracking isolated graphs and assets.',
    },
    entrySurface: {
        badge: 'Entry Surface',
        title: 'Phase 3A launcher sections',
        tabs: {
            recent: 'Recent',
            templates: 'Templates',
            import: 'Import',
            recover: 'Recover',
        },
    },
    recent: {
        badge: 'Recent work',
        title: 'Search, scan, and reopen the right project fast',
        searchPlaceholder: 'Search projects',
        searchLabel: 'Search projects',
        emptyNoProjects: 'No project yet.',
        emptyNoMatches: 'No project matches this search.',
        emptyDescription: 'Create a project, start from a template, or import an existing patch to begin.',
        projectRowSummary: (graphCount: number, assetCount: number, openedAt: string) =>
            `${graphCount} graphs, ${assetCount} assets, opened ${openedAt}`,
        open: 'Open',
        openWindow: 'Open Window',
    },
    templates: {
        createFromTemplate: 'Create From Template',
    },
    actions: {
        createProject: 'Create Project',
    },
    import: {
        patchFile: 'Patch file',
        validateBeforeImporting: 'Validate before importing',
        selectPatch: 'Select Patch',
        fileInputLabel: 'Import patch file',
        description:
            'Import keeps the launcher in charge of project entry. Validate a patch, then either add it to an existing project or create a new dedicated project for it.',
        destination: 'Import destination',
        existingProject: 'Existing project',
        newProject: 'New project',
        targetProject: 'Target project',
        newProjectName: 'New project name',
        importPatch: 'Import Patch',
        emptySummary:
            'Select a patch file first. The launcher validates the patch before the import action stays available.',
        importOutcome:
            'The launcher validates the patch, preserves its graph name, and lands you inside the project with that imported graph active.',
    },
    recover: {
        recover: 'Recover',
        legacyWorkspaceHandoff: 'Legacy workspace handoff',
        legacyWorkspaceDescription:
            'Recover previous global graphs and cached assets into a dedicated project without reopening the old editor state first.',
        recoverLegacyWorkspace: 'Recover Legacy Workspace',
        interruptedWork: 'Interrupted work',
        noInterruptedWork: 'No unfinished review, generation, or repair tasks are waiting.',
    },
    fields: {
        projectName: 'Project name',
    },
    helpers: {
        storageKind: formatStorageKind,
    },
} as const;
