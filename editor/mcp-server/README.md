# DIN Editor MCP Server

## Purpose

`@din/editor-mcp-server` exposes a local MCP server for DIN Editor.
It supports:

- live control of an open DIN Editor tab through a local secure WebSocket bridge
- offline patch validation, export, and code generation from `.json` patch files
- guarded mutations through preview and apply flows

## Running

Build and start the server from the repository root:

```bash
npm --prefix editor/mcp-server run build
npm --prefix editor/mcp-server run start
```

For local development:

```bash
npm --prefix editor/mcp-server run dev
```

## Environment

- `DIN_EDITOR_MCP_BRIDGE_PORT`
  Default: `17373`
- `DIN_EDITOR_MCP_READ_ONLY`
  Set to `1`, `true`, `yes`, or `on` to reject live mutations
- `DIN_EDITOR_MCP_REQUEST_TIMEOUT_MS`
  Default: `10000`
- `DIN_EDITOR_MCP_TLS_DIR`
  Default: `.din-editor-mcp/tls` relative to the MCP server working directory

The bridge listens on `127.0.0.1` only.
On first start, the server auto-generates a local certificate authority and a localhost server certificate in the TLS directory.
The browser must trust that local CA once before DIN Editor can connect over HTTPS/WSS without certificate errors.

## MCP Surface

Resources:

- `din-editor://sessions`
- `din-editor://session/{sessionId}/state`
- `din-editor://session/{sessionId}/graphs`
- `din-editor://session/{sessionId}/graphs/{graphId}`
- `din-editor://offline/patch/{encodedPath}`

Tools:

- `editor_list_sessions`
- `editor_get_state`
- `editor_list_graphs`
- `editor_get_graph`
- `editor_preview_operations`
- `editor_apply_operations`
- `editor_import_patch`
- `editor_export_patch`
- `editor_validate_patch`
- `editor_generate_code`
- `editor_list_assets`
- `editor_ingest_asset_file`

## Browser Bridge

The DIN Editor front-end discovers the bridge through:

- `GET https://127.0.0.1:<port>/bridge-info`

The generated CA certificate is also exposed at:

- `GET https://127.0.0.1:<port>/bridge-ca`

It then connects to:

- `wss://127.0.0.1:<port>/bridge`

The bridge requires an ephemeral token returned by the discovery endpoint and validates it during `session.hello`.
