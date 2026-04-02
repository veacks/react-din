import type { ChangedFileSummary, SourceControlPhase } from '../phase3a.types';

interface SourceControlPanelProps {
    phase: SourceControlPhase;
    changedFiles: ChangedFileSummary[];
    summary: string;
    commitMessage: string;
    onCommitMessageChange: (value: string) => void;
    onGenerate: () => void;
    onCommit: () => void;
    onReset: () => void;
    onReturnToExplorer: () => void;
}

function getPhaseTone(phase: SourceControlPhase) {
    switch (phase) {
        case 'success':
            return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100';
        case 'committing':
            return 'border-amber-400/30 bg-amber-500/10 text-amber-50';
        case 'ready':
            return 'border-blue-400/30 bg-blue-500/10 text-blue-50';
        case 'generating':
            return 'border-violet-400/30 bg-violet-500/10 text-violet-50';
        case 'idle':
        default:
            return 'border-white/10 bg-[rgba(255,255,255,0.05)] text-[var(--text-subtle)]';
    }
}

function getPhaseLabel(phase: SourceControlPhase) {
    switch (phase) {
        case 'generating':
            return 'Generating';
        case 'ready':
            return 'Ready';
        case 'committing':
            return 'Committing';
        case 'success':
            return 'Success';
        case 'idle':
        default:
            return 'Idle';
    }
}

function getFileStatusTone(status: ChangedFileSummary['status']) {
    switch (status) {
        case 'added':
            return 'text-emerald-300';
        case 'deleted':
            return 'text-rose-300';
        case 'modified':
        default:
            return 'text-blue-200';
    }
}

export function SourceControlPanel({
    phase,
    changedFiles,
    summary,
    commitMessage,
    onCommitMessageChange,
    onGenerate,
    onCommit,
    onReset,
    onReturnToExplorer,
}: SourceControlPanelProps) {
    const commitDisabled = phase !== 'ready' || commitMessage.trim().length === 0;
    const isBusy = phase === 'generating' || phase === 'committing';

    return (
        <div className="flex h-full min-h-0 flex-col bg-transparent" data-testid="review-drawer">
            <div className="border-b border-[var(--panel-border)] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                            Source Control
                        </div>
                        <div className="mt-1 text-[14px] font-semibold text-[var(--text)]">
                            Review and publish handoff
                        </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getPhaseTone(phase)}`}>
                        {getPhaseLabel(phase)}
                    </span>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                        Next action
                    </div>
                    <div className="mt-2 text-[13px] leading-6 text-[var(--text)]">
                        {summary}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onGenerate}
                            disabled={isBusy}
                            className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--panel-bg)] disabled:cursor-wait disabled:opacity-70"
                        >
                            {phase === 'idle' ? 'Generate Review' : phase === 'generating' ? 'Generating…' : 'Refresh Review'}
                        </button>
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isBusy}
                            className="rounded-xl border border-[var(--panel-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)] transition hover:border-[var(--accent)] hover:text-[var(--text)] disabled:opacity-70"
                        >
                            Reset
                        </button>
                        {phase === 'success' ? (
                            <button
                                type="button"
                                onClick={onReturnToExplorer}
                                className="rounded-xl border border-[var(--panel-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
                            >
                                Return to Explorer
                            </button>
                        ) : null}
                    </div>
                </section>

                <section className="mt-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                            Changed files
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                            {changedFiles.length} files
                        </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                        {changedFiles.map((file) => (
                            <div
                                key={`${file.status}:${file.path}`}
                                className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/50 px-3 py-3"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="truncate text-[12px] font-medium text-[var(--text)]">{file.path}</span>
                                    <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] ${getFileStatusTone(file.status)}`}>
                                        {file.status}
                                    </span>
                                </div>
                                {file.detail ? (
                                    <div className="mt-1 text-[11px] leading-5 text-[var(--text-subtle)]">
                                        {file.detail}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                        Commit
                    </div>
                    <label className="mt-4 flex flex-col gap-2 text-[11px] font-medium text-[var(--text)]">
                        Commit message
                        <textarea
                            value={commitMessage}
                            onChange={(event) => onCommitMessageChange(event.target.value)}
                            rows={4}
                            disabled={phase === 'success'}
                            className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)]/40 px-3 py-3 text-[12px] text-[var(--text)] outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                            placeholder="Refine graph authoring flow"
                            aria-label="Commit message"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={onCommit}
                        disabled={commitDisabled || isBusy}
                        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-transparent bg-[linear-gradient(135deg,#68a5ff_0%,#8b7dff_100%)] px-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {phase === 'committing' ? 'Committing…' : phase === 'success' ? 'Commit Recorded' : 'Commit Changes'}
                    </button>
                </section>
            </div>
        </div>
    );
}

export default SourceControlPanel;
