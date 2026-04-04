/**
 * Test script: Create "East Coast San Andreas" G-Funk graph via MCP
 * Usage: node test-gfunk.cjs | node ../din-studio/targets/mcp/dist/index.cjs --dev --bridge-port 17374
 */
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

const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "editor_apply_operations",
    arguments: { operations },
  },
};

// Write the JSON-RPC request
process.stdout.write(JSON.stringify(request) + "\n");

// Listen for response on stderr (MCP server writes JSON-RPC responses to stdout, logs to stderr)
// Keep stdin open for 15 seconds to allow the async WebSocket roundtrip
setTimeout(() => {
  process.exit(0);
}, 15000);
