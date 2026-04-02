import { expect, test } from '@playwright/test';
import { createSeedProject, installElectronBridge } from './support/fixtures';

function buildWorkspaceSeed() {
    const project = createSeedProject({ id: 'workspace-shell', name: 'Shell Lab' });
    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

test('F05-S01 shell regions render with stable ownership', async ({ page }) => {
    await installElectronBridge(page, buildWorkspaceSeed());
    await page.goto('/');

    await expect(page.getByTestId('activity-rail')).toBeVisible();
    await expect(page.getByTestId('left-drawer')).toBeVisible();
    await expect(page.getByTestId('canvas-panel')).toBeVisible();
    await expect(page.getByTestId('graph-tabs')).toBeVisible();
    await expect(page.getByTestId('inspector-pane')).toBeVisible();
    await expect(page.getByTestId('editor-footer')).toBeVisible();
    await expect(page.getByTestId('graph-defaults-panel')).toBeVisible();
});

test('F05-S02 rail modes keep browse, runtime, and review responsibilities distinct', async ({ page }) => {
    await installElectronBridge(page, buildWorkspaceSeed());
    await page.goto('/');

    await page.getByTitle('Catalog').click();
    await expect(page.getByLabel('Search nodes')).toBeVisible();

    await page.getByTitle('Library').click();
    await expect(page.getByLabel('Search library files')).toBeVisible();

    await page.getByTitle('Review').click();
    await expect(page.getByTestId('review-drawer')).toBeVisible();

    await page.getByTitle('Runtime').click();
    await expect(page.getByTestId('bottom-drawer')).toBeVisible();
    await expect(page.getByTestId('bottom-drawer').getByRole('button', { name: 'Runtime' })).toBeVisible();
  });

test('F05-S03 footer stays quiet while the top bar carries review handoff chips', async ({ page }) => {
    await installElectronBridge(page, buildWorkspaceSeed());
    await page.goto('/');

    await page.getByTitle('Review').click();
    await page.getByRole('button', { name: 'Generate Review' }).click();

    await expect(page.getByTestId('editor-footer')).toContainText('git: linked workspace');
    await expect(page.getByTestId('topbar-chip-review-progress')).toBeVisible();
    await expect(page.getByTestId('topbar-chip-review-ready')).toBeVisible();

    await page.getByTestId('topbar-chip-review-ready').click();
    await expect(page.getByTestId('review-drawer')).toBeVisible();
});
