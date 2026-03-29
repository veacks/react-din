import { resolve as resolvePath } from 'node:path';

export interface ServerConfig {
    bridgeHost: string;
    bridgePort: number;
    readOnly: boolean;
    requestTimeoutMs: number;
    serverVersion: string;
    tlsDirectory: string;
}

function parseBoolean(value: string | undefined): boolean {
    if (!value) return false;
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function parseInteger(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function loadServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
    return {
        bridgeHost: '127.0.0.1',
        bridgePort: parseInteger(env.DIN_EDITOR_MCP_BRIDGE_PORT, 17373),
        readOnly: parseBoolean(env.DIN_EDITOR_MCP_READ_ONLY),
        requestTimeoutMs: parseInteger(env.DIN_EDITOR_MCP_REQUEST_TIMEOUT_MS, 10_000),
        serverVersion: env.DIN_EDITOR_MCP_VERSION?.trim() || '0.1.0',
        tlsDirectory: resolvePath(
            process.cwd(),
            env.DIN_EDITOR_MCP_TLS_DIR?.trim() || '.din-editor-mcp/tls',
        ),
    };
}
