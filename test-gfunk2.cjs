/**
 * Create "East Coast San Andreas" G-Funk graph via MCP.
 * This script sends JSON-RPC over stdin to the MCP server on stdout.
 * Usage: node test-gfunk2.cjs | node ../din-studio/targets/mcp/dist/index.cjs --dev --bridge-port 17374
 */

const readline = require('readline');

const operations = [
  { type: "create_graph", name: "East Coast San Andreas", activate: true },
  { type: "add_node", nodeType: "osc", nodeId: "lead-osc", position: { x: 100, y: 100 } },
  { type: "update_node_data", nodeId: "lead-osc", data: { type: "sine", frequency: 2200, autoStart: true } },
  { type: "add_node", nodeType: "adsr", nodeId: "lead-env", position: { x: 400, y: 100 } },
  { type: "update_node_data", nodeId: "lead-env", data: { attack: 0.15, decay: 0.2, sustain: 0.8, release: 1.2 } },
  { type: "add_node", nodeType: "osc", nodeId: "sub-bass", position: { x: 100, y: 350 } },
  { type: "update_node_data", nodeId: "sub-bass", data: { type: "sawtooth", frequency: 55, autoStart: true } },
  { type: "add_node", nodeType: "filter", nodeId: "bass-filter", position: { x: 400, y: 350 } },
  { type: "update_node_data", nodeId: "bass-filter", data: { type: "lowpass", frequency: 180, Q: 5 } },
  { type: "add_node", nodeType: "gain", nodeId: "master-gain", position: { x: 800, y: 225 } },
  { type: "update_node_data", nodeId: "master-gain", data: { gain: 0.7 } },
  { type: "connect", source: "lead-osc", target: "lead-env" },
  { type: "connect", source: "lead-env", target: "master-gain" },
  { type: "connect", source: "sub-bass", target: "bass-filter" },
  { type: "connect", source: "bass-filter", target: "master-gain" },
];

// Step 1: Wait 8s for the DIN Studio browser session to re-connect to bridge
// Step 2: List sessions to get active sessionId
// Step 3: Apply operations using that sessionId

const rl = readline.createInterface({ input: process.stdin });
const responses = [];

rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line);
    responses.push(msg);
    process.stderr.write('[client] Got response: ' + JSON.stringify(msg).slice(0, 200) + '\n');
  } catch {}
});

function send(id, method, params) {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params });
  process.stdout.write(msg + "\n");
  process.stderr.write('[client] Sent: ' + method + '\n');
}

async function waitForResponse(id, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = responses.find(r => r.id === id);
    if (found) return found;
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`Timeout waiting for response id=${id}`);
}

async function main() {
  // Wait for session to connect
  process.stderr.write('[client] Waiting 8s for browser session to connect...\n');
  await new Promise(r => setTimeout(r, 8000));

  // List sessions
  send(1, "tools/call", { name: "editor_list_sessions", arguments: {} });
  const listResp = await waitForResponse(1);
  process.stderr.write('[client] Sessions: ' + JSON.stringify(listResp).slice(0, 500) + '\n');

  // Extract sessionId from the response
  let sessionId = null;
  if (listResp.result && listResp.result.content) {
    for (const item of listResp.result.content) {
      if (item.type === 'text') {
        try {
          const data = JSON.parse(item.text);
          if (data.sessions && data.sessions.length > 0) {
            sessionId = data.sessions[0].sessionId;
          }
        } catch {}
      }
    }
  }

  if (!sessionId) {
    process.stderr.write('[client] ERROR: No session found!\n');
    process.exit(1);
  }

  process.stderr.write('[client] Using session: ' + sessionId + '\n');

  // Apply operations
  send(2, "tools/call", {
    name: "editor_apply_operations",
    arguments: { sessionId, operations }
  });

  const applyResp = await waitForResponse(2, 15000);
  process.stderr.write('[client] Apply result: ' + JSON.stringify(applyResp).slice(0, 1000) + '\n');

  process.exit(0);
}

main().catch(err => {
  process.stderr.write('[client] ERROR: ' + err.message + '\n');
  process.exit(1);
});
