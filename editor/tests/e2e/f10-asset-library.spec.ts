import { expect, test } from '@playwright/test';
import { createInitialGraphDocument } from '../../ui/editor/defaultGraph';
import { createSeedAsset, createSeedProject, installElectronBridge } from './support/fixtures';

function buildAssetSeed() {
    const asset = createSeedAsset('asset-kick', 'kick.wav', 'sample');
    const project = createSeedProject({
        id: 'asset-lab',
        name: 'Asset Lab',
        assets: [asset],
    });

    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

function buildMissingAssetSeed() {
    const graph = createInitialGraphDocument('missing-asset-graph', 'Broken Asset Graph', 0);
    graph.nodes.push({
        id: 'sampler_missing',
        type: 'samplerNode',
        position: { x: 200, y: 340 },
        dragHandle: '.node-header',
        data: {
            type: 'sampler',
            src: '',
            loop: false,
            playbackRate: 1,
            detune: 0,
            loaded: false,
            label: 'Broken Sample',
            sampleId: 'missing-kick',
            assetPath: 'samples/missing-kick.wav',
            fileName: 'missing-kick.wav',
        },
    });

    const project = createSeedProject({
        id: 'missing-assets',
        name: 'Missing Assets',
        graphs: [graph],
        activeGraphId: graph.id,
    });

    return {
        bootstrap: { windowKind: 'project' as const, projectId: project.snapshot.project.id },
        projects: [project],
    };
}

test('F10-S01 asset search and import reduce the visible decision set', async ({ page }) => {
    await installElectronBridge(page, buildAssetSeed());
    await page.goto('/');

    await page.getByTitle('Library').click();
    await page.getByLabel('Search library files').fill('kick');
    await expect(page.getByText('kick.wav')).toBeVisible();

    await page.getByLabel('Import library files').setInputFiles({
        name: 'snare.wav',
        mimeType: 'audio/wav',
        buffer: Buffer.from([82, 73, 70, 70, 1, 0, 0, 0, 87, 65, 86, 69]),
    });

    await page.getByLabel('Search library files').fill('');
    await expect(page.getByText('snare.wav')).toBeVisible();
});

test('F10-S02 and F10-S03 missing asset repair stays in the library and ends clearly', async ({ page }) => {
    await installElectronBridge(page, buildMissingAssetSeed());
    await page.goto('/');

    await page.getByTitle('Library').click();
    await expect(page.getByText('Missing asset repair')).toBeVisible();
    await page.getByLabel('Repair Broken Sample').setInputFiles({
        name: 'fixed-kick.wav',
        mimeType: 'audio/wav',
        buffer: Buffer.from([82, 73, 70, 70, 1, 0, 0, 0, 87, 65, 86, 69]),
    });

    await expect(page.getByText('Missing asset repair')).not.toBeVisible();
});
