let initPromise: Promise<void> | null = null;
let wasmModule: (typeof import('din-wasm')) | null = null;

type DinWasmDebugState = {
    initStarted: number;
    initSucceeded: number;
    initFailed: number;
    moduleLoaded: boolean;
    lastError: string | null;
    lastUpdatedAt: number | null;
    audioRuntimeCreated: number;
    patchRuntimeCreated: number;
    transportRuntimeCreated: number;
    sequencerRuntimeCreated: number;
    renderBlockCalls: number;
    transportAdvanceCalls: number;
    sequencerAdvanceCalls: number;
};

const DEBUG_KEY = '__DIN_WASM_DEBUG__';

function getDebugHost(): Record<string, unknown> | null {
    if (typeof globalThis !== 'object' || !globalThis) return null;
    return globalThis as unknown as Record<string, unknown>;
}

function createDebugState(): DinWasmDebugState {
    return {
        initStarted: 0,
        initSucceeded: 0,
        initFailed: 0,
        moduleLoaded: false,
        lastError: null,
        lastUpdatedAt: null,
        audioRuntimeCreated: 0,
        patchRuntimeCreated: 0,
        transportRuntimeCreated: 0,
        sequencerRuntimeCreated: 0,
        renderBlockCalls: 0,
        transportAdvanceCalls: 0,
        sequencerAdvanceCalls: 0,
    };
}

export function getWasmDebugState(): DinWasmDebugState {
    const host = getDebugHost();
    if (!host) return createDebugState();
    const existing = host[DEBUG_KEY];
    if (!existing || typeof existing !== 'object') {
        const next = createDebugState();
        host[DEBUG_KEY] = next;
        return next;
    }
    return existing as DinWasmDebugState;
}

function touchDebugState(state: DinWasmDebugState): void {
    state.lastUpdatedAt = Date.now();
}

// Expose the debug object as soon as this module is evaluated so Chrome can
// distinguish "bundle not updated" from "WASM path not exercised yet".
touchDebugState(getWasmDebugState());

export function bumpWasmDebugCounter(key: keyof DinWasmDebugState, amount = 1): void {
    const state = getWasmDebugState();
    const current = state[key];
    if (typeof current !== 'number') return;
    const mutable = state as Record<keyof DinWasmDebugState, DinWasmDebugState[keyof DinWasmDebugState]>;
    mutable[key] = (current + amount) as DinWasmDebugState[typeof key];
    touchDebugState(state);
}

export function setWasmDebugFlag(key: keyof DinWasmDebugState, value: boolean | string | null): void {
    const state = getWasmDebugState();
    const current = state[key];
    const mutable = state as Record<keyof DinWasmDebugState, DinWasmDebugState[keyof DinWasmDebugState]>;
    if (typeof current === 'boolean' && typeof value === 'boolean') {
        mutable[key] = value;
        touchDebugState(state);
        return;
    }
    if ((typeof current === 'string' || current === null) && (typeof value === 'string' || value === null)) {
        mutable[key] = value;
        touchDebugState(state);
    }
}

/**
 * Loads and initializes the `din-wasm` module once per JS realm.
 * Rejects if the optional peer `din-wasm` is not installed or fails to load.
 */
export function ensureWasmInitialized(): Promise<void> {
    if (!initPromise) {
        initPromise = (async () => {
            bumpWasmDebugCounter('initStarted');
            try {
                const wasm = await import('din-wasm');
                await wasm.default();
                wasmModule = wasm;
                setWasmDebugFlag('moduleLoaded', true);
                setWasmDebugFlag('lastError', null);
                bumpWasmDebugCounter('initSucceeded');
            } catch (error) {
                setWasmDebugFlag('moduleLoaded', false);
                setWasmDebugFlag(
                    'lastError',
                    error instanceof Error ? `${error.name}: ${error.message}` : String(error)
                );
                bumpWasmDebugCounter('initFailed');
                throw error;
            }
        })();
    }
    return initPromise;
}

export function getWasmModuleSync(): (typeof import('din-wasm')) | null {
    return wasmModule;
}

export function isWasmReady(): boolean {
    return wasmModule !== null;
}
