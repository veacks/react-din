import { expect, test } from '@playwright/test';
import { createSeedProject, installElectronBridge } from './support/fixtures';

function buildCanvasSeed() {
    const project = createSeedProject({ id: 'canvas-lab', name: 'Canvas Lab' });
    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

test('F07-S01 node placement from the catalog stays direct', async ({ page }) => {
    await installElectronBridge(page, buildCanvasSeed());
    await page.goto('/');

    await page.getByTitle('Catalog').click();
    await page.getByRole('button', { name: 'Add ADSR' }).click();

    await expect(page.locator('.react-flow__node').filter({ hasText: 'ADSR' })).toHaveCount(1);
});

test('F07-S02 compatible handle assist stays visible during a drag', async ({ page }) => {
    await installElectronBridge(page, buildCanvasSeed());
    await page.goto('/');

    const oscOut = page.locator('.react-flow__handle[data-nodeid="osc_1"][data-handleid="out"]').first();
    const canvas = page.getByTestId('canvas-panel');
    await expect(oscOut).toBeVisible();
    const oscBox = await oscOut.boundingBox();
    const canvasBox = await canvas.boundingBox();

    if (!oscBox || !canvasBox) {
        throw new Error('Expected handles and canvas bounds to exist.');
    }

    await page.mouse.move(oscBox.x + (oscBox.width / 2), oscBox.y + (oscBox.height / 2));
    await page.mouse.down();
    await page.mouse.move(oscBox.x + (oscBox.width / 2) + 36, oscBox.y + (oscBox.height / 2) + 12);
    await expect(page.locator('.react-flow__handle.connection-assist-handle[data-nodeid="gain_1"][data-handleid="in"]').first()).toBeVisible();

    await page.mouse.move(canvasBox.x + (canvasBox.width * 0.7), canvasBox.y + (canvasBox.height * 0.55));
    await page.mouse.up();

    await expect(page.getByLabel('Search nodes')).toBeVisible();
    await page.getByLabel('Search nodes').fill('filter');
    await page.getByRole('option', { name: /Filter -> In/i }).click();

    await expect(page.locator('.react-flow__node').filter({ hasText: 'Filter' })).toHaveCount(1);
});

test('F07-S03 inspector focus follows the current dominant selection target', async ({ page }) => {
    await installElectronBridge(page, buildCanvasSeed());
    await page.goto('/');

    await page.locator('.react-flow__node').filter({ hasText: 'Gain' }).click();
    await expect(page.getByRole('heading', { name: 'Gain' })).toBeVisible();

    await page.getByTestId('canvas-panel').click({ position: { x: 30, y: 30 } });
    await expect(page.getByTestId('graph-defaults-panel')).toBeVisible();
});
