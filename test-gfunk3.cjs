/**
 * Create "East Coast San Andreas" G-Funk graph via MCP server subprocess.
 * Uses proper MCP Content-Length framing (like LSP).
 */
const { spawn } = require('child_process');

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
  { type: "connect", source: "lead-osc", sourceHandle: "out", target: "lead-env", targetHandle: "gate" },
  { type: "connect", source: "lead-env", sourceHandle: "envelope", target: "master-gain", targetHandle: "in" },
  { type: "connect", source: "sub-bass", sourceHandle: "out", target: "bass-filter", targetHandle: "in" },
  { type: "connect", source: "bass-filter", sourceHandle: "out", target: "master-gain", targetHandle: "in" },
];

const mcp = spawn('node', [
  '/Users/veacks/Sites/din-studio/targets/mcp/dist/index.cjs',
  '--dev',
  '--bridge-port', '17374',
], { stdio: ['pipe', 'pipe', 'pipe'] });

// MCP Content-Length framing parser
let stdoutBuffer = Buffer.alloc(0);
const responses = {};

mcp.stdout.on('data', (chunk) => {
  stdoutBuffer = Buffer.concat([stdoutBuffer, chunk]);
  
  while (true) {
    const headerEnd = stdoutBuffer.indexOf('\r\n\r\n');
    if (headerEnd < 0) break;
    
    const headerText = stdoutBuffer.slice(0, headerEnd).toString('utf8');
    const match = headerText.match(/content-length:\s*(\d+)/i);
    if (!match) break;
    
    const contentLength = parseInt(match[1], 10);
    const messageStart = headerEnd + 4;
    const messageEnd = messageStart + contentLength;
    
    if (stdoutBuffer.length < messageEnd) break;
    
    const body = stdoutBuffer.slice(messageStart, messageEnd).toString('utf8');
    stdoutBuffer = stdoutBuffer.slice(messageEnd);
    
    try {
      const msg = JSON.parse(body);
      console.error('[response] id=' + msg.id + ': ' + JSON.stringify(msg.result || msg.error).slice(0, 300));
      if (msg.id != null) responses[msg.id] = msg;
    } catch (e) {
      console.error('[response] parse error: ' + body.slice(0, 200));
    }
  }
});

mcp.stderr.on('data', (chunk) => {
  console.error('[server] ' + chunk.toString().trim());
});

function send(id, method, params) {
  const obj = { jsonrpc: "2.0", id, method, params };
  const body = Buffer.from(JSON.stringify(obj), 'utf8');
  const frame = `Content-Length: ${body.length}\r\n\r\n`;
  mcp.stdin.write(frame);
  mcp.stdin.write(body);
  console.error('[client] Sent ' + method + ' id=' + id);
}

async function waitFor(id, ms = 15000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (responses[id]) return responses[id];
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Timeout waiting for response id=' + id);
}

async function main() {
  console.error('[client] Waiting 10s for bridge + browser reconnect...');
  await new Promise(r => setTimeout(r, 10000));

  // 1. Initialize (MCP handshake)
  send(0, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } });
  const initResp = await waitFor(0);
  console.error('[client] Initialized: ' + JSON.stringify(initResp.result?.serverInfo));

  // 2. List sessions
  send(1, 'tools/call', { name: 'editor_list_sessions', arguments: {} });
  const listResp = await waitFor(1);

  let sessionId = null;
  // Check structuredContent first (MCP 2024-11-05)
  const sc = listResp.result?.structuredContent;
  if (sc?.sessions?.length > 0) {
    sessionId = sc.sessions[0].sessionId;
  }
  // Fallback: parse from text content
  if (!sessionId && listResp.result?.content) {
    for (const item of listResp.result.content) {
      if (item.type === 'text') {
        try {
          const data = JSON.parse(item.text);
          if (data.sessions?.length > 0) sessionId = data.sessions[0].sessionId;
        } catch {}
      }
    }
  }

  if (!sessionId) {
    console.error('[client] ❌ No session found! Is DIN Studio open at localhost:5173?');
    mcp.kill();
    process.exit(1);
  }

  console.error('[client] Session: ' + sessionId);

  // 3. Apply operations
  send(2, 'tools/call', { name: 'editor_apply_operations', arguments: { sessionId, operations } });
  const result = await waitFor(2, 20000);

  if (result.result && !result.result.isError) {
    for (const item of (result.result.content || [])) {
      if (item.type === 'text') console.log(item.text);
    }
    console.error('[client] ✅ G-Funk graph created successfully!');
  } else {
    console.error('[client] ❌ Error applying operations:');
    console.error(JSON.stringify(result.result || result.error, null, 2));
  }

  mcp.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('[client] FATAL: ' + err.message);
  mcp.kill();
  process.exit(1);
});
