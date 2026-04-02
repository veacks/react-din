import { expect, test } from '@playwright/test';
import { buildReviewStorageEntry, createSeedProject, installElectronBridge } from './support/fixtures';

function buildInspectorSeed() {
    const project = createSeedProject({ id: 'inspector-lab', name: 'Inspector Lab' });
    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

test('F08-S01 inspector falls back to graph defaults when nothing is selected', async ({ page }) => {
    await installElectronBridge(page, buildInspectorSeed());
    await page.goto('/');

    await expect(page.getByTestId('graph-defaults-panel')).toBeVisible();
    await expect(page.getByText('No node selected')).toBeVisible();
});

test('F08-S02 generated code refreshes after graph metadata edits', async ({ page }) => {
    await installElectronBridge(page, buildInspectorSeed());
    await page.goto('/');

    await page.getByPlaceholder('Graph name').fill('Bass Lab');
    await page.getByPlaceholder('Graph name').press('Enter');
    await page.getByRole('button', { name: 'Code' }).click();

    await expect(page.locator('textarea')).toContainText('BassLab');
});

test('F08-S03 long-running generation work stays acknowledged in the shell', async ({ page }) => {
    const seed = buildInspectorSeed();
    seed.localStorage = Object.fromEntries([
        buildReviewStorageEntry(seed.projects[0]!.snapshot.project.id, {
            phase: 'generating',
            summary: 'Preparing a review summary for the active graph.',
            changedFiles: [],
            commitMessage: 'Refine inspector flow',
            updatedAt: Date.now(),
        }),
    ]);

    await installElectronBridge(page, seed);
    await page.goto('/');

    await expect(page.getByTestId('topbar-chip-review-progress')).toBeVisible();
    await page.getByTestId('topbar-chip-review-progress').click();
    await expect(page.getByTestId('review-drawer')).toContainText('Preparing a review summary');
});
