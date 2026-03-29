import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';

const cwd = process.cwd();
const patchPath = `${cwd}/tmp/breakbeat.graph.patch.json`;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const patchText = await readFile(patchPath, 'utf8');

const child = spawn('node', ['--enable-source-maps', 'editor/mcp-server/dist/index.cjs'], {
    cwd,
    env: {
        ...process.env,
        DIN_EDITOR_MCP_BRIDGE_PORT: '17373',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
});

let stdoutBuffer = Buffer.alloc(0);
let stderrText = '';
let nextRpcId = 1;
const pending = new Map();

child.stderr.on('data', (chunk) => {
    stderrText += chunk.toString();
});

child.stdout.on('data', (chunk) => {
    stdoutBuffer = Buffer.concat([stdoutBuffer, chunk]);

    while (true) {
        const headerEnd = stdoutBuffer.indexOf('\r\n\r\n');
        if (headerEnd < 0) return;

        const headerText = stdoutBuffer.slice(0, headerEnd).toString('utf8');
        const match = /content-length:\s*(\d+)/i.exec(headerText);
        if (!match) {
            throw new Error(`Invalid MCP header: ${headerText}`);
        }

        const contentLength = Number.parseInt(match[1], 10);
        const messageEnd = headerEnd + 4 + contentLength;
        if (stdoutBuffer.length < messageEnd) return;

        const body = stdoutBuffer.slice(headerEnd + 4, messageEnd).toString('utf8');
        stdoutBuffer = stdoutBuffer.slice(messageEnd);
        const message = JSON.parse(body);
        const pendingRequest = pending.get(message.id);
        if (!pendingRequest) continue;
        pending.delete(message.id);

        if (message.error) {
            pendingRequest.reject(new Error(`${message.error.message}${message.error.data ? ` ${JSON.stringify(message.error.data)}` : ''}`));
            continue;
        }

        pendingRequest.resolve(message.result);
    }
});

function sendRpc(payload) {
    const body = Buffer.from(JSON.stringify(payload), 'utf8');
    child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
    child.stdin.write(body);
}

function callRpc(method, params = {}) {
    const id = nextRpcId++;
    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        sendRpc({ jsonrpc: '2.0', id, method, params });
    });
}

function notifyRpc(method, params = {}) {
    sendRpc({ jsonrpc: '2.0', method, params });
}

try {
    const initialize = await callRpc('initialize', {
        protocolVersion: '2024-11-05',
        clientInfo: { name: 'codex-live-import', version: '1.0.0' },
    });
    notifyRpc('notifications/initialized', {});

    let sessions = [];
    for (let attempt = 0; attempt < 30; attempt += 1) {
        const response = await callRpc('tools/call', {
            name: 'editor_list_sessions',
            arguments: {},
        });
        sessions = response?.structuredContent?.sessions ?? [];
        if (sessions.length > 0) break;
        await delay(1000);
    }

    if (sessions.length === 0) {
        throw new Error(`No DIN Editor session connected after waiting.\n${stderrText}`);
    }

    const sessionId = sessions[0].sessionId;

    const importResult = await callRpc('tools/call', {
        name: 'editor_import_patch',
        arguments: {
            sessionId,
            text: patchText,
        },
    });

    if (importResult.isError) {
        throw new Error(`editor_import_patch failed: ${JSON.stringify(importResult)}`);
    }

    const graphResult = await callRpc('tools/call', {
        name: 'editor_get_graph',
        arguments: { sessionId },
    });

    if (graphResult.isError) {
        throw new Error(`editor_get_graph failed: ${JSON.stringify(graphResult)}`);
    }

    const graph = graphResult.structuredContent.graph;

    console.log(JSON.stringify({
        initialize: initialize.serverInfo,
        sessionId,
        importedGraph: {
            name: graph.name,
            nodeCount: graph.nodes.length,
            edgeCount: graph.edges.length,
        },
        importSummary: importResult.structuredContent.summary,
    }, null, 2));
} finally {
    child.kill('SIGINT');
    await once(child, 'exit');
}
