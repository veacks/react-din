import type { ProjectManifest } from '../project';
import type { InterruptedWorkSummary, ResumeIntent, ReviewState } from './phase3a.types';

const STORAGE_PREFIX = 'din-editor-phase3a';
const REVIEW_KEY = `${STORAGE_PREFIX}:review`;
const INTERRUPTED_KEY = `${STORAGE_PREFIX}:interrupted`;
const RESUME_INTENT_KEY = `${STORAGE_PREFIX}:resume-intent`;

function readJson<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function writeJson<T>(key: string, value: T | null) {
    if (typeof window === 'undefined') return;
    if (value == null) {
        window.localStorage.removeItem(key);
        return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
}

function getReviewKey(projectId: string) {
    return `${REVIEW_KEY}:${projectId}`;
}

function getInterruptedKey(projectId: string) {
    return `${INTERRUPTED_KEY}:${projectId}`;
}

function getResumeIntentKey(projectId: string) {
    return `${RESUME_INTENT_KEY}:${projectId}`;
}

export function readProjectReviewState(projectId: string): ReviewState | null {
    return readJson<ReviewState>(getReviewKey(projectId));
}

export function writeProjectReviewState(projectId: string, state: ReviewState | null): void {
    writeJson(getReviewKey(projectId), state);
}

export function readProjectInterruptedWork(projectId: string): InterruptedWorkSummary | null {
    return readJson<InterruptedWorkSummary>(getInterruptedKey(projectId));
}

export function writeProjectInterruptedWork(projectId: string, summary: InterruptedWorkSummary | null): void {
    writeJson(getInterruptedKey(projectId), summary);
}

export function listProjectInterruptedWork(projects: Pick<ProjectManifest, 'id'>[]): InterruptedWorkSummary[] {
    return projects
        .map((project) => readProjectInterruptedWork(project.id))
        .filter((entry): entry is InterruptedWorkSummary => Boolean(entry))
        .sort((left, right) => right.updatedAt - left.updatedAt);
}

export function writeProjectResumeIntent(projectId: string, intent: ResumeIntent | null): void {
    writeJson(getResumeIntentKey(projectId), intent);
}

export function consumeProjectResumeIntent(projectId: string): ResumeIntent | null {
    const intent = readJson<ResumeIntent>(getResumeIntentKey(projectId));
    writeJson(getResumeIntentKey(projectId), null);
    return intent;
}
