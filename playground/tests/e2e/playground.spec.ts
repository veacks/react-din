import { expect, test } from '@playwright/test';

test('persists graph edits and refreshes generated code', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Sources')).toBeVisible();
    await expect(page.getByPlaceholder('Graph name')).toBeVisible();

    await page.getByPlaceholder('Graph name').fill('Bass Lab');
    await page.getByPlaceholder('Graph name').press('Enter');

    await expect(page.locator('textarea')).toContainText('BassLab');

    await page.getByRole('button', { name: 'Voice Synth' }).click();
    await expect(page.getByText('Transport').first()).toBeVisible();
    await expect(page.getByText('Step Sequencer').first()).toBeVisible();
    await expect(page.locator('textarea')).toContainText('Sequencer');
    await expect(page.locator('textarea')).toContainText('Track');

    await page.getByLabel('Include Provider').check();
    await expect(page.locator('textarea')).toContainText('TransportProvider');

    await page.waitForTimeout(500);
    await page.reload();

    await expect(page.getByPlaceholder('Graph name')).toHaveValue('Bass Lab');
    await expect(page.locator('textarea')).toContainText('BassLab');
});
