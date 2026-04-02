import type { Page } from '@playwright/test';
import { createInitialGraphDocument } from '../../../ui/editor/defaultGraph';
import type { GraphDocument } from '../../../ui/editor/store';
import type { ProjectAssetKind, ProjectAssetRecord, ProjectManifest, ProjectWorkspaceSnapshot } from '../../../project';

export interface SeedAsset {
    asset: ProjectAssetRecord;
    bytes: number[];
}

export interface SeedProject {
    snapshot: ProjectWorkspaceSnapshot;
    assetBytes: Record<string, number[]>;
}

export interface LegacySeedWorkspace {
    graphs: GraphDocument[];
    activeGraphId: string | null;
    assets: Array<ProjectAssetRecord & { bytes: number[] }>;
}

export interface ElectronBridgeSeed {
    bootstrap: { windowKind: 'launcher' | 'project'; projectId: string | null };
    projects: SeedProject[];
    localStorage?: Record<string, string>;
    legacyWorkspace?: LegacySeedWorkspace;
}

const FAKE_AUDIO_BYTES = [82, 73, 70, 70, 1, 0, 0, 0, 87, 65, 86, 69];

function summarizeGraphs(graphs: GraphDocument[]): ProjectManifest['graphs'] {
    return graphs.map((graph) => ({
        id: graph.id,
        name: graph.name,
        file: `graphs/${graph.id}.patch.json`,
        order: graph.order ?? 0,
        createdAt: graph.createdAt,
        updatedAt: graph.updatedAt,
    }));
}

export function createSeedAsset(
    id: string,
    name: string,
    kind: ProjectAssetKind = 'sample',
    overrides: Partial<ProjectAssetRecord> = {},
): SeedAsset {
    const now = Date.now();
    const relativePath = overrides.relativePath
        ?? (kind === 'impulse' ? `impulses/${name}` : `samples/${name}`);
    return {
        asset: {
            id,
            name,
            fileName: overrides.fileName ?? name,
            kind,
            relativePath,
            mimeType: overrides.mimeType ?? 'audio/wav',
            size: overrides.size ?? FAKE_AUDIO_BYTES.length,
            durationSec: overrides.durationSec ?? 1.2,
            createdAt: overrides.createdAt ?? now,
            updatedAt: overrides.updatedAt ?? now,
        },
        bytes: FAKE_AUDIO_BYTES,
    };
}

export function createSeedProject(options: {
    id: string;
    name: string;
    graphs?: GraphDocument[];
    activeGraphId?: string | null;
    accentColor?: string;
    storageKind?: ProjectManifest['storageKind'];
    assets?: SeedAsset[];
    path?: string;
}): SeedProject {
    const now = Date.now();
    const graphs = options.graphs ?? [createInitialGraphDocument(`${options.id}-graph-1`, 'Graph 1', 0)];
    const assets = options.assets ?? [];
    const project: ProjectManifest = {
        id: options.id,
        name: options.name,
        accentColor: options.accentColor ?? '#68a5ff',
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
        storageKind: options.storageKind ?? 'electron-fs',
        graphs: summarizeGraphs(graphs),
        assets: assets.map((entry) => entry.asset),
        path: options.path ?? `/tmp/${options.id}`,
    };

    return {
        snapshot: {
            project,
            graphs,
            activeGraphId: options.activeGraphId ?? graphs[0]?.id ?? null,
        },
        assetBytes: Object.fromEntries(assets.map((entry) => [entry.asset.id, entry.bytes])),
    };
}

export function buildReviewStorageEntry(projectId: string, value: unknown) {
    return [`din-editor-phase3a:review:${projectId}`, JSON.stringify(value)] as const;
}

export function buildInterruptedStorageEntry(projectId: string, value: unknown) {
    return [`din-editor-phase3a:interrupted:${projectId}`, JSON.stringify(value)] as const;
}

export async function installElectronBridge(page: Page, seed: ElectronBridgeSeed) {
    await page.addInitScript((bridgeSeed: ElectronBridgeSeed) => {
        const SNAPSHOTS_KEY = '__DIN_TEST_SNAPSHOTS__';
        const ASSET_BYTES_KEY = '__DIN_TEST_ASSET_BYTES__';
        const BRIDGE_STATE_KEY = '__DIN_TEST_BRIDGE_STATE__';
        const BOOTSTRAP_KEY = '__DIN_TEST_BOOTSTRAP__';
        const COUNTERS_KEY = '__DIN_TEST_COUNTERS__';
        const LEGACY_WORKSPACE_KEY = '__DIN_TEST_LEGACY_WORKSPACE__';
        const LOCAL_STORAGE_INIT_KEY = '__DIN_TEST_LOCAL_STORAGE_INIT__';

        const clone = <T,>(value: T): T => {
            if (typeof structuredClone === 'function') {
                return structuredClone(value);
            }
            return JSON.parse(JSON.stringify(value)) as T;
        };

        const readSessionJson = <T,>(key: string): T | null => {
            try {
                const raw = window.sessionStorage.getItem(key);
                if (!raw) return null;
                return JSON.parse(raw) as T;
            } catch {
                return null;
            }
        };

        const writeSessionJson = (key: string, value: unknown) => {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        };

        const buildGraphSummaries = (graphs: GraphDocument[]) => graphs.map((graph) => ({
            id: graph.id,
            name: graph.name,
            file: `graphs/${graph.id}.patch.json`,
            order: graph.order ?? 0,
            createdAt: graph.createdAt,
            updatedAt: graph.updatedAt,
        }));

        const syncSnapshot = (snapshot: ProjectWorkspaceSnapshot): ProjectWorkspaceSnapshot => {
            const now = Date.now();
            return {
                ...snapshot,
                project: {
                    ...snapshot.project,
                    graphs: buildGraphSummaries(snapshot.graphs),
                    assets: [...snapshot.project.assets].sort((left, right) => right.updatedAt - left.updatedAt),
                    updatedAt: now,
                    lastOpenedAt: now,
                },
            };
        };

        const createStarterGraph = (graphId = `graph-${Date.now()}-${Math.random().toString(16).slice(2)}`, name = 'Graph 1', order = 0): GraphDocument => {
            const now = Date.now();
            return {
                id: graphId,
                name,
                nodes: [
                    {
                        id: 'osc_1',
                        type: 'oscNode',
                        position: { x: 50, y: 150 },
                        dragHandle: '.node-header',
                        data: { type: 'osc', frequency: 440, detune: 0, waveform: 'sine', label: 'Oscillator' },
                    },
                    {
                        id: 'gain_1',
                        type: 'gainNode',
                        position: { x: 300, y: 150 },
                        dragHandle: '.node-header',
                        data: { type: 'gain', gain: 0.5, label: 'Gain' },
                    },
                    {
                        id: 'output_1',
                        type: 'outputNode',
                        position: { x: 520, y: 150 },
                        dragHandle: '.node-header',
                        data: { type: 'output', masterGain: 0.5, playing: false, label: 'Output' },
                    },
                ],
                edges: [
                    { id: 'e1-2', source: 'osc_1', target: 'gain_1', sourceHandle: 'out', targetHandle: 'in' },
                    { id: 'e2-3', source: 'gain_1', target: 'output_1', sourceHandle: 'out', targetHandle: 'in' },
                ],
                createdAt: now,
                updatedAt: now,
                order,
            };
        };

        const seededSnapshots = bridgeSeed.projects.map((project) => {
            const snapshot = syncSnapshot(clone(project.snapshot));
            return [snapshot.project.id, snapshot] as const;
        });
        const seededAssetBytes = bridgeSeed.projects.flatMap((project) =>
            Object.entries(project.assetBytes).map(([assetId, bytes]) => [`${project.snapshot.project.id}:${assetId}`, [...bytes]] as const)
        );

        const snapshots = new Map<string, ProjectWorkspaceSnapshot>(
            readSessionJson<Array<[string, ProjectWorkspaceSnapshot]>>(SNAPSHOTS_KEY) ?? seededSnapshots
        );
        const assetBytes = new Map<string, number[]>(
            readSessionJson<Array<[string, number[]]>>(ASSET_BYTES_KEY) ?? seededAssetBytes
        );
        const bridgeState = readSessionJson<{ openProjectWindowCalls: string[]; revealProjectCalls: string[] }>(BRIDGE_STATE_KEY) ?? {
            openProjectWindowCalls: [],
            revealProjectCalls: [],
        };
        const bootstrapState = readSessionJson<ElectronBridgeSeed['bootstrap']>(BOOTSTRAP_KEY) ?? clone(bridgeSeed.bootstrap);
        const counterState = readSessionJson<{ projectCounter: number; assetCounter: number }>(COUNTERS_KEY) ?? {
            projectCounter: snapshots.size,
            assetCounter: 0,
        };

        const persistSnapshots = () => writeSessionJson(SNAPSHOTS_KEY, Array.from(snapshots.entries()));
        const persistAssetBytes = () => writeSessionJson(ASSET_BYTES_KEY, Array.from(assetBytes.entries()));
        const persistBridgeState = () => writeSessionJson(BRIDGE_STATE_KEY, bridgeState);
        const persistCounters = () => writeSessionJson(COUNTERS_KEY, counterState);

        Object.defineProperty(window, '__DIN_TEST_BRIDGE_STATE__', {
            configurable: true,
            writable: true,
            value: bridgeState,
        });

        const persistedLegacyWorkspace = readSessionJson<LegacySeedWorkspace>(LEGACY_WORKSPACE_KEY) ?? bridgeSeed.legacyWorkspace ?? null;
        if (persistedLegacyWorkspace) {
            Object.defineProperty(window, '__DIN_EDITOR_TEST_LEGACY_WORKSPACE__', {
                configurable: true,
                writable: true,
                value: clone(persistedLegacyWorkspace),
            });
            writeSessionJson(LEGACY_WORKSPACE_KEY, persistedLegacyWorkspace);
        }

        if (window.sessionStorage.getItem(LOCAL_STORAGE_INIT_KEY) !== '1') {
            window.localStorage.clear();
            Object.entries(bridgeSeed.localStorage ?? {}).forEach(([key, value]) => {
                window.localStorage.setItem(key, value);
            });
            window.sessionStorage.setItem(LOCAL_STORAGE_INIT_KEY, '1');
        }

        writeSessionJson(BOOTSTRAP_KEY, bootstrapState);
        persistSnapshots();
        persistAssetBytes();
        persistBridgeState();
        persistCounters();

        window.dinEditorApp = {
            runtime: 'electron',
            platform: 'darwin',
            getBootstrapState: () => clone(bootstrapState),
            async listProjects() {
                return Array.from(snapshots.values())
                    .map((snapshot) => clone(snapshot.project))
                    .sort((left, right) => right.lastOpenedAt - left.lastOpenedAt || right.updatedAt - left.updatedAt);
            },
            async createProject(options) {
                counterState.projectCounter += 1;
                const projectId = `project-${counterState.projectCounter}`;
                const now = Date.now();
                const initialGraph = createStarterGraph(`${projectId}-graph-1`, 'Graph 1', 0);
                const snapshot = syncSnapshot({
                    project: {
                        id: projectId,
                        name: options.name,
                        accentColor: options.accentColor ?? '#68a5ff',
                        createdAt: now,
                        updatedAt: now,
                        lastOpenedAt: now,
                        storageKind: 'electron-fs',
                        graphs: [],
                        assets: [],
                        path: `/tmp/${projectId}`,
                    },
                    graphs: [initialGraph],
                    activeGraphId: initialGraph.id,
                });
                snapshots.set(projectId, snapshot);
                persistSnapshots();
                persistCounters();
                return clone(snapshot.project);
            },
            async loadProject(projectId) {
                const snapshot = snapshots.get(projectId);
                if (!snapshot) {
                    throw new Error(`Missing project ${projectId}`);
                }
                return clone(snapshot);
            },
            async saveProject(projectId, snapshot) {
                const nextSnapshot = syncSnapshot(clone(snapshot));
                snapshots.set(projectId, nextSnapshot);
                 persistSnapshots();
                return clone(nextSnapshot.project);
            },
            async writeProjectAsset(projectId, payload) {
                const snapshot = snapshots.get(projectId);
                if (!snapshot) {
                    throw new Error(`Missing project ${projectId}`);
                }

                counterState.assetCounter += 1;
                const assetId = payload.assetId ?? `asset-${counterState.assetCounter}`;
                const now = Date.now();
                const relativePath = payload.kind === 'impulse'
                    ? `impulses/${payload.fileName}`
                    : `samples/${payload.fileName}`;
                const asset: ProjectAssetRecord = {
                    id: assetId,
                    name: payload.fileName,
                    fileName: payload.fileName,
                    kind: payload.kind,
                    relativePath,
                    mimeType: payload.mimeType,
                    size: payload.bytes.length,
                    createdAt: snapshot.project.assets.find((entry) => entry.id === assetId)?.createdAt ?? now,
                    updatedAt: now,
                };
                assetBytes.set(`${projectId}:${assetId}`, [...payload.bytes]);
                persistAssetBytes();
                const nextSnapshot = syncSnapshot({
                    ...snapshot,
                    project: {
                        ...snapshot.project,
                        assets: [
                            ...snapshot.project.assets.filter((entry) => entry.id !== assetId),
                            asset,
                        ],
                    },
                });
                snapshots.set(projectId, nextSnapshot);
                persistSnapshots();
                persistCounters();
                return clone(asset);
            },
            async readProjectAsset(projectId, assetId) {
                const snapshot = snapshots.get(projectId);
                const asset = snapshot?.project.assets.find((entry) => entry.id === assetId);
                const bytes = assetBytes.get(`${projectId}:${assetId}`);
                if (!snapshot || !asset || !bytes) {
                    return null;
                }
                return { asset: clone(asset), bytes: [...bytes] };
            },
            async deleteProjectAsset(projectId, assetId) {
                const snapshot = snapshots.get(projectId);
                if (!snapshot) return;
                assetBytes.delete(`${projectId}:${assetId}`);
                persistAssetBytes();
                snapshots.set(projectId, syncSnapshot({
                    ...snapshot,
                    project: {
                        ...snapshot.project,
                        assets: snapshot.project.assets.filter((entry) => entry.id !== assetId),
                    },
                }));
                persistSnapshots();
            },
            async openProjectWindow(projectId) {
                const alreadyOpened = bridgeState.openProjectWindowCalls.includes(projectId);
                bridgeState.openProjectWindowCalls.push(projectId);
                persistBridgeState();
                return {
                    projectId,
                    focusedExisting: alreadyOpened,
                };
            },
            async revealProject(projectId) {
                bridgeState.revealProjectCalls.push(projectId);
                persistBridgeState();
            },
        };
    }, seed);
}

export async function readBridgeState<T = { openProjectWindowCalls: string[]; revealProjectCalls: string[] }>(page: Page): Promise<T> {
    return page.evaluate(() => (window as typeof window & { __DIN_TEST_BRIDGE_STATE__: T }).__DIN_TEST_BRIDGE_STATE__);
}
