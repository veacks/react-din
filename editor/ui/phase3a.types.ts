export type LauncherSection = 'recent' | 'templates' | 'import' | 'recover';
export type RailMode = 'explorer' | 'catalog' | 'library' | 'runtime' | 'review';
export type SourceControlPhase = 'idle' | 'generating' | 'ready' | 'committing' | 'success';
export type StatusSeverity = 'info' | 'success' | 'warning' | 'danger';
export type DensityMode = 'compact' | 'comfortable';

export type ChangedFileStatus = 'added' | 'modified' | 'deleted';
export type InterruptedWorkKind = 'review' | 'generation' | 'asset-repair';

export interface ChangedFileSummary {
    path: string;
    status: ChangedFileStatus;
    detail?: string;
}

export interface ReviewState {
    phase: SourceControlPhase;
    summary: string;
    changedFiles: ChangedFileSummary[];
    commitMessage: string;
    updatedAt: number;
    lastCompletedAt?: number;
}

export interface InterruptedWorkSummary {
    projectId: string;
    kind: InterruptedWorkKind;
    title: string;
    description: string;
    actionLabel: string;
    severity: StatusSeverity;
    updatedAt: number;
    railMode: RailMode;
    phase?: SourceControlPhase;
    graphId?: string | null;
}

export interface ResumeIntent {
    railMode: RailMode;
    graphId?: string | null;
    createdAt: number;
}
