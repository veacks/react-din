import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { once } from 'node:events';
import https from 'node:https';
import WebSocket from 'ws';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const cwd = process.cwd();
const port = Number.parseInt(process.env.DIN_EDITOR_MCP_TEST_PORT ?? '18476', 10);
const exportPath = process.env.DIN_EDITOR_MCP_TEST_EXPORT_PATH ?? 'tmp/breakbeat.graph.patch.json';
const bridgeInfoUrl = `https://127.0.0.1:${port}/bridge-info`;

const audioNodeTypes = new Set([
    'osc',
    'gain',
    'filter',
    'delay',
    'reverb',
    'compressor',
    'phaser',
    'flanger',
    'tremolo',
    'eq3',
    'distortion',
    'chorus',
    'noiseBurst',
    'waveShaper',
    'convolver',
    'analyzer',
    'panner3d',
    'panner',
    'mixer',
    'auxSend',
    'auxReturn',
    'matrixMixer',
    'noise',
    'constantSource',
    'mediaStream',
    'sampler',
    'output',
]);

const patch = {
    version: 1,
    name: 'Amen Breakbeat Sketch',
    nodes: [
        {
            id: 'transport-1',
            type: 'transport',
            position: { x: -120, y: 40 },
            data: {
                type: 'transport',
                bpm: 168,
                playing: false,
                beatsPerBar: 4,
                beatUnit: 4,
                stepsPerBeat: 4,
                barsPerPhrase: 4,
                swing: 0.18,
                label: 'Transport',
            },
        },
        {
            id: 'seq-kick',
            type: 'stepSequencer',
            position: { x: 120, y: -110 },
            data: {
                type: 'stepSequencer',
                steps: 16,
                pattern: [1, 0, 0, 0, 0.82, 0, 0.64, 0, 0.92, 0, 0.72, 0, 0.82, 0.36, 0.68, 0],
                activeSteps: [true, false, false, false, true, false, true, false, true, false, true, false, true, true, true, false],
                label: 'Kick Seq',
            },
        },
        {
            id: 'seq-snare',
            type: 'stepSequencer',
            position: { x: 120, y: 60 },
            data: {
                type: 'stepSequencer',
                steps: 16,
                pattern: [0, 0, 0, 0, 0.95, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.28, 0],
                activeSteps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false],
                label: 'Snare Seq',
            },
        },
        {
            id: 'seq-hat',
            type: 'stepSequencer',
            position: { x: 120, y: 230 },
            data: {
                type: 'stepSequencer',
                steps: 16,
                pattern: [0.55, 0.22, 0.62, 0.18, 0.55, 0.22, 0.7, 0.18, 0.55, 0.28, 0.64, 0.18, 0.55, 0.22, 0.74, 0.24],
                activeSteps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
                label: 'Hat Seq',
            },
        },
        {
            id: 'seq-ghost',
            type: 'stepSequencer',
            position: { x: 120, y: 400 },
            data: {
                type: 'stepSequencer',
                steps: 16,
                pattern: [0, 0, 0.32, 0, 0, 0.25, 0, 0.18, 0, 0.22, 0, 0.3, 0, 0.18, 0, 0.26],
                activeSteps: [false, false, true, false, false, true, false, true, false, true, false, true, false, true, false, true],
                label: 'Ghost Seq',
            },
        },
        {
            id: 'sampler-kick',
            type: 'sampler',
            position: { x: 420, y: -110 },
            data: {
                type: 'sampler',
                assetPath: '/samples/amen-kick.wav',
                fileName: 'amen-kick.wav',
                src: '',
                loop: false,
                playbackRate: 1,
                detune: 0,
                loaded: false,
                label: 'Kick',
            },
        },
        {
            id: 'sampler-snare',
            type: 'sampler',
            position: { x: 420, y: 60 },
            data: {
                type: 'sampler',
                assetPath: '/samples/amen-snare.wav',
                fileName: 'amen-snare.wav',
                src: '',
                loop: false,
                playbackRate: 1,
                detune: 0,
                loaded: false,
                label: 'Snare',
            },
        },
        {
            id: 'sampler-hat',
            type: 'sampler',
            position: { x: 420, y: 230 },
            data: {
                type: 'sampler',
                assetPath: '/samples/amen-hat.wav',
                fileName: 'amen-hat.wav',
                src: '',
                loop: false,
                playbackRate: 1.08,
                detune: 0,
                loaded: false,
                label: 'Hat',
            },
        },
        {
            id: 'sampler-ghost',
            type: 'sampler',
            position: { x: 420, y: 400 },
            data: {
                type: 'sampler',
                assetPath: '/samples/amen-ghost.wav',
                fileName: 'amen-ghost.wav',
                src: '',
                loop: false,
                playbackRate: 0.98,
                detune: -30,
                loaded: false,
                label: 'Ghost',
            },
        },
        {
            id: 'mixer-1',
            type: 'mixer',
            position: { x: 740, y: 135 },
            data: {
                type: 'mixer',
                inputs: 4,
                label: 'Drum Bus',
            },
        },
        {
            id: 'compressor-1',
            type: 'compressor',
            position: { x: 980, y: 135 },
            data: {
                type: 'compressor',
                threshold: -22,
                knee: 12,
                ratio: 6,
                attack: 0.005,
                release: 0.18,
                sidechainStrength: 0.55,
                label: 'Bus Compressor',
            },
        },
        {
            id: 'eq3-1',
            type: 'eq3',
            position: { x: 1210, y: 135 },
            data: {
                type: 'eq3',
                low: 2,
                mid: -1.5,
                high: 3,
                lowFrequency: 180,
                highFrequency: 4200,
                mix: 1,
                label: 'Breakbeat EQ',
            },
        },
        {
            id: 'output-1',
            type: 'output',
            position: { x: 1440, y: 135 },
            data: {
                type: 'output',
                playing: false,
                masterGain: 0.72,
                label: 'Output',
            },
        },
    ],
    connections: [
        { id: 'transport-kick', source: 'transport-1', sourceHandle: 'out', target: 'seq-kick', targetHandle: 'transport' },
        { id: 'transport-snare', source: 'transport-1', sourceHandle: 'out', target: 'seq-snare', targetHandle: 'transport' },
        { id: 'transport-hat', source: 'transport-1', sourceHandle: 'out', target: 'seq-hat', targetHandle: 'transport' },
        { id: 'transport-ghost', source: 'transport-1', sourceHandle: 'out', target: 'seq-ghost', targetHandle: 'transport' },
        { id: 'kick-trigger', source: 'seq-kick', sourceHandle: 'trigger', target: 'sampler-kick', targetHandle: 'trigger' },
        { id: 'snare-trigger', source: 'seq-snare', sourceHandle: 'trigger', target: 'sampler-snare', targetHandle: 'trigger' },
        { id: 'hat-trigger', source: 'seq-hat', sourceHandle: 'trigger', target: 'sampler-hat', targetHandle: 'trigger' },
        { id: 'ghost-trigger', source: 'seq-ghost', sourceHandle: 'trigger', target: 'sampler-ghost', targetHandle: 'trigger' },
        { id: 'kick-bus', source: 'sampler-kick', sourceHandle: 'out', target: 'mixer-1', targetHandle: 'in' },
        { id: 'snare-bus', source: 'sampler-snare', sourceHandle: 'out', target: 'mixer-1', targetHandle: 'in' },
        { id: 'hat-bus', source: 'sampler-hat', sourceHandle: 'out', target: 'mixer-1', targetHandle: 'in' },
        { id: 'ghost-bus', source: 'sampler-ghost', sourceHandle: 'out', target: 'mixer-1', targetHandle: 'in' },
        { id: 'bus-compressor', source: 'mixer-1', sourceHandle: 'out', target: 'compressor-1', targetHandle: 'in' },
        { id: 'compressor-eq', source: 'compressor-1', sourceHandle: 'out', target: 'eq3-1', targetHandle: 'in' },
        { id: 'eq-output', source: 'eq3-1', sourceHandle: 'out', target: 'output-1', targetHandle: 'in' },
    ],
    interface: {
        inputs: [],
        events: [],
        midiInputs: [],
        midiOutputs: [],
    },
};

const patchText = `${JSON.stringify(patch, null, 2)}\n`;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function fileNameFromPath(value, fallback) {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    const parts = value.split(/[\\/]/);
    return parts[parts.length - 1] || fallback;
}

function hydrateGraphData(data) {
    const next = { ...data };

    if (next.type === 'sampler') {
        const assetPath = typeof next.assetPath === 'string' && next.assetPath.trim()
            ? next.assetPath.trim()
            : (typeof next.src === 'string' && next.src.trim() ? next.src.trim() : '/samples/sample.wav');
        next.assetPath = assetPath;
        next.src = '';
        next.sampleId = '';
        next.fileName = typeof next.fileName === 'string' && next.fileName.trim()
            ? next.fileName.trim()
            : fileNameFromPath(assetPath, 'sample.wav');
        next.loaded = false;
    }

    if (next.type === 'output' || next.type === 'transport') {
        next.playing = false;
    }

    return next;
}

function isAudioConnection(connection, nodeById) {
    const sourceNode = nodeById.get(connection.source);
    if (!sourceNode || !audioNodeTypes.has(sourceNode.type)) return false;
    const sourceHandle = connection.sourceHandle ?? '';
    const targetHandle = connection.targetHandle ?? '';
    return (sourceHandle === 'out' || /^out\d+$/.test(sourceHandle))
        && (targetHandle === 'in' || /^in\d+$/.test(targetHandle));
}

function toGraphEdge(connection, nodeById) {
    const base = {
        id: connection.id,
        source: connection.source,
        sourceHandle: connection.sourceHandle ?? undefined,
        target: connection.target,
        targetHandle: connection.targetHandle ?? undefined,
    };

    if (isAudioConnection(connection, nodeById)) {
        return {
            ...base,
            animated: false,
            style: { stroke: '#44cc44', strokeWidth: 3 },
        };
    }

    if (connection.targetHandle === 'trigger' || connection.targetHandle === 'gate') {
        return {
            ...base,
            animated: true,
            style: { stroke: '#ff4466', strokeWidth: 2, strokeDasharray: '6,4' },
        };
    }

    return {
        ...base,
        animated: true,
        style: { stroke: '#4488ff', strokeWidth: 2, strokeDasharray: '5,5' },
    };
}

function patchToGraphDocument(nextPatch, targetGraph) {
    const nodeById = new Map(nextPatch.nodes.map((node) => [node.id, node]));
    return {
        id: targetGraph.id,
        name: nextPatch.name,
        nodes: nextPatch.nodes.map((node) => ({
            id: node.id,
            type: `${node.type}Node`,
            position: node.position ?? { x: 0, y: 0 },
            dragHandle: '.node-header',
            data: hydrateGraphData(node.data),
        })),
        edges: nextPatch.connections.map((connection) => toGraphEdge(connection, nodeById)),
        createdAt: targetGraph.createdAt,
        updatedAt: Date.now(),
        order: targetGraph.order,
    };
}

function createInitialState() {
    return {
        graphs: [{
            id: 'graph-breakbeat-live',
            name: 'Scratch Graph',
            nodes: [],
            edges: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            order: 0,
        }],
        activeGraphId: 'graph-breakbeat-live',
        selectedNodeId: null,
        isHydrated: true,
        midi: {
            status: 'unsupported',
            defaultInputId: null,
            defaultOutputId: null,
            inputCount: 0,
            outputCount: 0,
            clockRunning: false,
            clockBpmEstimate: null,
        },
        audio: {
            activeGraphPlaying: false,
            playingGraphIds: [],
        },
    };
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, { rejectUnauthorized: false }, (response) => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                if ((response.statusCode ?? 500) >= 200 && (response.statusCode ?? 500) < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (error) {
                        reject(error);
                    }
                    return;
                }
                reject(new Error(`HTTP ${response.statusCode}: ${body}`));
            });
        });
        request.on('error', reject);
    });
}

async function waitForBridgeInfo() {
    let lastError = null;
    for (let attempt = 0; attempt < 80; attempt += 1) {
        try {
            return await fetchJson(bridgeInfoUrl);
        } catch (error) {
            lastError = error;
            await sleep(250);
        }
    }
    throw lastError ?? new Error('Bridge discovery timed out.');
}

await mkdir(`${cwd}/tmp`, { recursive: true });

const child = spawn('node', ['--enable-source-maps', 'editor/mcp-server/dist/index.cjs'], {
    cwd,
    env: {
        ...process.env,
        DIN_EDITOR_MCP_BRIDGE_PORT: String(port),
    },
    stdio: ['pipe', 'pipe', 'pipe'],
});

let childExited = false;
let childStderr = '';

child.stderr.on('data', (chunk) => {
    childStderr += chunk.toString();
});

child.on('exit', () => {
    childExited = true;
});

let rpcBuffer = Buffer.alloc(0);
let rpcId = 0;
const pendingRpc = new Map();

function failPending(error) {
    for (const pending of pendingRpc.values()) {
        pending.reject(error);
    }
    pendingRpc.clear();
}

child.stdout.on('data', (chunk) => {
    rpcBuffer = Buffer.concat([rpcBuffer, chunk]);
    while (true) {
        const headerEnd = rpcBuffer.indexOf('\r\n\r\n');
        if (headerEnd < 0) return;
        const headerText = rpcBuffer.slice(0, headerEnd).toString('utf8');
        const match = /content-length:\s*(\d+)/i.exec(headerText);
        if (!match) {
            failPending(new Error(`Invalid MCP header: ${headerText}`));
            return;
        }
        const contentLength = Number.parseInt(match[1], 10);
        const messageEnd = headerEnd + 4 + contentLength;
        if (rpcBuffer.length < messageEnd) return;
        const body = rpcBuffer.slice(headerEnd + 4, messageEnd).toString('utf8');
        rpcBuffer = rpcBuffer.slice(messageEnd);
        const message = JSON.parse(body);
        const pending = pendingRpc.get(message.id);
        if (!pending) continue;
        pendingRpc.delete(message.id);
        if (message.error) {
            pending.reject(new Error(`${message.error.message}${message.error.data ? ` ${JSON.stringify(message.error.data)}` : ''}`));
        } else {
            pending.resolve(message.result);
        }
    }
});

child.stdin.on('error', (error) => {
    failPending(error);
});

function sendRpcPayload(payload) {
    const body = Buffer.from(JSON.stringify(payload), 'utf8');
    child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
    child.stdin.write(body);
}

function callRpc(method, params = {}) {
    if (childExited) {
        throw new Error(`MCP child exited early.\n${childStderr}`);
    }
    const id = ++rpcId;
    return new Promise((resolve, reject) => {
        pendingRpc.set(id, { resolve, reject });
        sendRpcPayload({ jsonrpc: '2.0', id, method, params });
    });
}

function notifyRpc(method, params = {}) {
    sendRpcPayload({ jsonrpc: '2.0', method, params });
}

let state = createInitialState();
let currentPatch = null;
let liveSessionId = null;
const bridgeRequestTypes = [];

let resolveHello;
let rejectHello;
const helloPromise = new Promise((resolve, reject) => {
    resolveHello = resolve;
    rejectHello = reject;
});

function sendBridge(ws, envelope) {
    ws.send(JSON.stringify(envelope));
}

function sendSnapshot(ws) {
    sendBridge(ws, {
        requestId: null,
        type: 'session.snapshot',
        sessionId: liveSessionId,
        ok: true,
        payload: state,
    });
}

function buildOperationResult(mode, ok, outcomes, issues, summary, nextState) {
    return {
        mode,
        ok,
        state: clone(nextState),
        outcomes,
        issues,
        summary,
    };
}

function applyOperations(operations, mode) {
    const workingState = clone(state);
    const outcomes = [];
    const issues = [];
    const summary = {
        graphIds: workingState.graphs.map((graph) => graph.id),
        activeGraphId: workingState.activeGraphId,
        graphsCreated: 0,
        graphsDeleted: 0,
        graphsRenamed: 0,
        nodesCreated: 0,
        nodesUpdated: 0,
        nodesDeleted: 0,
        edgesCreated: 0,
        edgesDeleted: 0,
        patchesImported: 0,
        assetsBound: 0,
        playbackChanges: 0,
    };

    operations.forEach((operation, index) => {
        if (operation.type !== 'import_patch_into_active_graph' || !operation.patch) {
            const message = `Unsupported synthetic operation type "${String(operation.type)}".`;
            issues.push({ index, code: 'INVALID_OPERATION', message });
            outcomes.push({ index, type: operation.type, ok: false, graphId: operation.graphId, message });
            return;
        }

        const targetGraphId = operation.graphId ?? workingState.activeGraphId;
        const graphIndex = workingState.graphs.findIndex((graph) => graph.id === targetGraphId);
        if (graphIndex < 0) {
            const message = `Graph "${String(targetGraphId)}" was not found.`;
            issues.push({ index, code: 'GRAPH_NOT_FOUND', message });
            outcomes.push({ index, type: operation.type, ok: false, graphId: operation.graphId, message });
            return;
        }

        const nextPatch = clone(operation.patch);
        const targetGraph = workingState.graphs[graphIndex];
        const nextGraph = patchToGraphDocument(nextPatch, targetGraph);
        workingState.graphs[graphIndex] = nextGraph;
        workingState.activeGraphId = nextGraph.id;
        workingState.audio.activeGraphPlaying = false;
        workingState.audio.playingGraphIds = [];
        currentPatch = nextPatch;
        summary.nodesCreated += nextPatch.nodes.length;
        summary.edgesCreated += nextPatch.connections.length;
        summary.patchesImported += 1;
        outcomes.push({
            index,
            type: operation.type,
            ok: true,
            graphId: nextGraph.id,
            message: `Imported patch into graph "${nextGraph.name}".`,
        });
    });

    summary.graphIds = workingState.graphs.map((graph) => graph.id);
    summary.activeGraphId = workingState.activeGraphId;

    if (mode === 'apply' && issues.length === 0) {
        state = workingState;
    }

    return buildOperationResult(
        mode,
        issues.length === 0,
        outcomes,
        issues,
        summary,
        issues.length === 0 ? (mode === 'apply' ? state : workingState) : state,
    );
}

const bridgeInfo = await waitForBridgeInfo();
const ws = new WebSocket(bridgeInfo.bridgeUrl, { rejectUnauthorized: false });

ws.on('message', (raw) => {
    const envelope = JSON.parse(String(raw));
    bridgeRequestTypes.push(envelope.type);

    if (envelope.type === 'session.hello') {
        if (envelope.ok) {
            liveSessionId = envelope.payload.sessionId;
            resolveHello(envelope.payload);
        } else {
            rejectHello(new Error(envelope.error?.message ?? 'Session hello failed.'));
        }
        return;
    }

    if (envelope.type === 'graph.apply_operations' || envelope.type === 'graph.preview_operations') {
        const mode = envelope.type === 'graph.apply_operations' ? 'apply' : 'preview';
        const result = applyOperations(envelope.payload?.operations ?? [], mode);
        sendBridge(ws, {
            requestId: envelope.requestId,
            type: envelope.type,
            sessionId: liveSessionId,
            ok: result.ok,
            payload: result,
        });
        if (mode === 'apply' && result.ok) {
            sendSnapshot(ws);
        }
        return;
    }

    if (envelope.type === 'patch.export') {
        if (!currentPatch) {
            sendBridge(ws, {
                requestId: envelope.requestId,
                type: 'session.error',
                sessionId: liveSessionId,
                ok: false,
                error: {
                    code: 'GRAPH_NOT_FOUND',
                    message: 'No imported patch is available to export.',
                },
            });
            return;
        }

        sendBridge(ws, {
            requestId: envelope.requestId,
            type: 'patch.export',
            sessionId: liveSessionId,
            ok: true,
            payload: {
                patch: currentPatch,
                text: `${JSON.stringify(currentPatch, null, 2)}\n`,
            },
        });
        return;
    }

    sendBridge(ws, {
        requestId: envelope.requestId,
        type: 'session.error',
        sessionId: liveSessionId,
        ok: false,
        error: {
            code: 'UNSUPPORTED',
            message: `Synthetic client does not implement bridge request "${String(envelope.type)}".`,
        },
    });
});

ws.on('error', (error) => {
    rejectHello(error);
});

await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
});

sendBridge(ws, {
    requestId: 'hello-1',
    type: 'session.hello',
    sessionId: null,
    ok: true,
    payload: {
        token: bridgeInfo.bridgeToken,
        desiredSessionId: 'codex-breakbeat-session',
        appVersion: 'codex-test',
        capabilities: {
            previewOperations: true,
            applyOperations: true,
            patchImportExport: true,
            codegen: false,
            assetLibrary: false,
            offlinePatch: true,
        },
        snapshot: state,
    },
});

await helloPromise;

const initializeResult = await callRpc('initialize', {
    protocolVersion: '2024-11-05',
    clientInfo: { name: 'codex', version: '1.0.0' },
});
notifyRpc('notifications/initialized', {});

const validateResult = await callRpc('tools/call', {
    name: 'editor_validate_patch',
    arguments: { text: patchText },
});
const offlineCodegenResult = await callRpc('tools/call', {
    name: 'editor_generate_code',
    arguments: { text: patchText, includeProvider: true },
});
const sessionsResult = await callRpc('tools/call', {
    name: 'editor_list_sessions',
    arguments: {},
});
const importResult = await callRpc('tools/call', {
    name: 'editor_import_patch',
    arguments: { sessionId: liveSessionId, text: patchText },
});
if (importResult.isError || !currentPatch) {
    console.log(JSON.stringify({
        stage: 'import',
        bridgeRequestTypes,
        currentPatchPresent: Boolean(currentPatch),
        importResult,
        childStderr,
    }, null, 2));
    ws.close();
    child.kill('SIGINT');
    await once(child, 'exit');
    process.exit(1);
}
const graphsResult = await callRpc('tools/call', {
    name: 'editor_list_graphs',
    arguments: { sessionId: liveSessionId },
});
const graphResult = await callRpc('tools/call', {
    name: 'editor_get_graph',
    arguments: { sessionId: liveSessionId },
});
const resourceResult = await callRpc('resources/read', {
    uri: `din-editor://session/${liveSessionId}/graphs/${state.activeGraphId}`,
});
const exportResult = await callRpc('tools/call', {
    name: 'editor_export_patch',
    arguments: { sessionId: liveSessionId },
});

if (exportResult.isError) {
    throw new Error(`editor_export_patch failed: ${JSON.stringify(exportResult)}`);
}

await writeFile(`${cwd}/${exportPath}`, exportResult.structuredContent.text, 'utf8');
const exportedFile = JSON.parse(await readFile(`${cwd}/${exportPath}`, 'utf8'));

console.log(JSON.stringify({
    initialize: initializeResult.serverInfo,
    sessionId: liveSessionId,
    validateSummary: validateResult.structuredContent.summary,
    offlineCodegen: {
        containsSequencer: offlineCodegenResult.structuredContent.code.includes('<Sequencer'),
        containsTriggeredSampler: offlineCodegenResult.structuredContent.code.includes('TriggeredSampler'),
        containsAudioProvider: offlineCodegenResult.structuredContent.code.includes('AudioProvider'),
    },
    liveSessions: sessionsResult.structuredContent.sessions.length,
    import: {
        ok: !importResult.isError,
        patchesImported: importResult.structuredContent.summary.patchesImported,
        nodesCreated: importResult.structuredContent.summary.nodesCreated,
        edgesCreated: importResult.structuredContent.summary.edgesCreated,
    },
    graph: {
        name: graphResult.structuredContent.graph.name,
        nodeCount: graphResult.structuredContent.graph.nodes.length,
        edgeCount: graphResult.structuredContent.graph.edges.length,
        listedNodeCount: graphsResult.structuredContent.graphs[0].nodeCount,
        listedEdgeCount: graphsResult.structuredContent.graphs[0].edgeCount,
    },
    resources: {
        graphResourceBytes: resourceResult.contents[0].text.length,
    },
    export: {
        outputPath: `${cwd}/${exportPath}`,
        version: exportedFile.version,
        name: exportedFile.name,
        nodeCount: exportedFile.nodes.length,
        connectionCount: exportedFile.connections.length,
    },
}, null, 2));

ws.close();
child.kill('SIGINT');
await once(child, 'exit');
