import { expect, test } from '@playwright/test';
import { buildInterruptedStorageEntry, buildReviewStorageEntry, createSeedProject, installElectronBridge } from './support/fixtures';

function buildSystemSeed() {
    const project = createSeedProject({ id: 'system-lab', name: 'System Lab' });
    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

async function runCommand(page: import('@playwright/test').Page, query: string, actionName: string) {
    await page.getByRole('button', { name: 'Command' }).click();
    await page.getByLabel('Search commands').fill(query);
    await page.getByRole('button', { name: new RegExp(actionName, 'i') }).click();
}

async function callEditorStore(page: import('@playwright/test').Page, action: 'undo' | 'redo' | 'save') {
    await page.evaluate((nextAction) => {
        const nextWindow = window as typeof window & {
            __DIN_TEST_EDITOR_STORE__?: Record<string, () => void>;
        };
        nextWindow.__DIN_TEST_EDITOR_STORE__?.[nextAction]?.();
    }, action);
}

async function getEditorSnapshot(page: import('@playwright/test').Page) {
    return page.evaluate(() => {
        const nextWindow = window as typeof window & {
            __DIN_TEST_EDITOR_STORE__?: {
                snapshot?: () => {
                    activeGraphId: string | null;
                    activeGraphName: string | null;
                    canUndo: boolean;
                    canRedo: boolean;
                };
            };
        };
        return nextWindow.__DIN_TEST_EDITOR_STORE__?.snapshot?.() ?? null;
    });
}

test('F11-S01 undo and redo preserve graph intent', async ({ page }) => {
    await installElectronBridge(page, buildSystemSeed());
    await page.goto('/');
    await expect(page.getByTestId('editor-root')).toHaveAttribute('data-editor-ready', 'true');

    await page.getByTitle('Catalog').click();
    await page.getByRole('button', { name: 'Add ADSR' }).click();
    await expect(page.locator('.react-flow__node').filter({ hasText: 'ADSR' })).toHaveCount(1);
    await expect.poll(async () => (await getEditorSnapshot(page))?.canUndo).toBe(true);

    await callEditorStore(page, 'undo');
    await expect(page.locator('.react-flow__node').filter({ hasText: 'ADSR' })).toHaveCount(0);
    await expect(page.getByTestId('graph-defaults-panel')).toBeVisible();

    await callEditorStore(page, 'redo');
    await expect(page.locator('.react-flow__node').filter({ hasText: 'ADSR' })).toHaveCount(1);
});

test('F11-S02 saved graph state survives a reload', async ({ page }) => {
    await installElectronBridge(page, buildSystemSeed());
    await page.goto('/');
    await expect(page.getByTestId('editor-root')).toHaveAttribute('data-editor-ready', 'true');

    const graphNameInput = page.getByPlaceholder('Graph name');
    await graphNameInput.fill('Bass Lab');
    await graphNameInput.press('Enter');
    await page.getByTestId('canvas-panel').click({ position: { x: 24, y: 24 } });
    await expect(page.getByRole('button', { name: 'Bass Lab' })).toBeVisible();
    await callEditorStore(page, 'save');

    await page.reload();
    await expect(page.getByPlaceholder('Graph name')).toHaveValue('Bass Lab');
});

test('F11-S03 interrupted review work remains visible after a reload', async ({ page }) => {
    const seed = buildSystemSeed();
    const projectId = seed.projects[0]!.snapshot.project.id;
    const review = {
        phase: 'ready',
        summary: 'Review ready for the active graph.',
        changedFiles: [
            { path: 'graphs/main.patch.json', status: 'modified', detail: 'Active graph changed.' },
        ],
        commitMessage: 'Refine reload flow',
        updatedAt: Date.now(),
    };
    const interrupted = {
        projectId,
        kind: 'review',
        title: 'Review ready to commit',
        description: 'Changed files and commit framing are waiting in the review drawer.',
        actionLabel: 'Resume Review',
        severity: 'warning',
        updatedAt: Date.now(),
        railMode: 'review',
        phase: 'ready',
        graphId: seed.projects[0]!.snapshot.activeGraphId,
    };
    seed.localStorage = Object.fromEntries([
        buildReviewStorageEntry(projectId, review),
        buildInterruptedStorageEntry(projectId, interrupted),
    ]);

    await installElectronBridge(page, seed);
    await page.goto('/');

    await expect(page.getByTestId('topbar-chip-review-ready')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('topbar-chip-review-ready')).toBeVisible();
});
