import { expect, test } from '@playwright/test';
import { createInitialGraphDocument } from '../../ui/editor/defaultGraph';
import { createSeedProject, installElectronBridge } from './support/fixtures';

function buildMultiGraphSeed() {
    const firstGraph = createInitialGraphDocument('graph-shell-1', 'Graph 1', 0);
    const secondGraph = createInitialGraphDocument('graph-shell-2', 'Drum Bus', 1);
    const project = createSeedProject({
        id: 'graph-lab',
        name: 'Graph Lab',
        graphs: [firstGraph, secondGraph],
        activeGraphId: firstGraph.id,
    });

    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

test('F06-S01 and F06-S03 graph explorer and tabs keep graph browsing explicit', async ({ page }) => {
    await installElectronBridge(page, buildMultiGraphSeed());
    await page.goto('/');

    await expect(page.getByText('Graph Explorer')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Graph 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Drum Bus' })).toBeVisible();

    await page.getByRole('button', { name: 'Drum Bus' }).click();
    await expect(page.getByPlaceholder('Graph name')).toHaveValue('Drum Bus');
  });

test('F06-S02 graph creation and renaming stay immediate', async ({ page }) => {
    await installElectronBridge(page, buildMultiGraphSeed());
    await page.goto('/');

    await page.getByTitle('New Graph').click();
    await expect(page.getByPlaceholder('Graph name')).toHaveValue('Graph 3');
    await expect(page.getByRole('button', { name: 'Graph 3' })).toBeVisible();

    await page.getByPlaceholder('Graph name').fill('Bass Lab');
    await page.getByPlaceholder('Graph name').press('Enter');

    await expect(page.getByRole('button', { name: 'Bass Lab' })).toBeVisible();
});
