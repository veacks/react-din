import { expect, test } from '@playwright/test';
import { createSeedProject, installElectronBridge } from './support/fixtures';

function buildReviewSeed() {
    const project = createSeedProject({ id: 'review-lab', name: 'Review Lab' });
    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

test('F09-S01 through F09-S04 review and commit states stay explicit', async ({ page }) => {
    await installElectronBridge(page, buildReviewSeed());
    await page.goto('/');

    await page.getByTitle('Review').click();
    await expect(page.getByTestId('review-drawer')).toContainText('Review and publish handoff');
    await expect(page.getByText('Generate a review packet')).toBeVisible();

    await page.getByRole('button', { name: 'Generate Review' }).click();
    await expect(page.getByTestId('review-drawer').getByText('Generating', { exact: true })).toBeVisible();
    await expect(page.getByTestId('topbar-chip-review-progress')).toBeVisible();

    await expect(page.getByText(/Review ready for/i)).toBeVisible();
    await page.getByLabel('Commit message').fill('Refine review drawer handoff');
    await page.getByRole('button', { name: 'Commit Changes' }).click();

    await expect(page.getByTestId('review-drawer').getByText('Committing', { exact: true })).toBeVisible();
    await expect(page.getByTestId('topbar-chip-review-commit')).toBeVisible();
    await expect(page.getByText('Commit Saved')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Return to Explorer' })).toBeVisible();
});
