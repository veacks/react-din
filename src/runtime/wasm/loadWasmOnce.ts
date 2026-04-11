let initPromise: Promise<void> | null = null;
let wasmModule: (typeof import('din-wasm')) | null = null;

/**
 * Loads and initializes the `din-wasm` module once per JS realm.
 * Rejects if the optional peer `din-wasm` is not installed or fails to load.
 */
export function ensureWasmInitialized(): Promise<void> {
    if (!initPromise) {
        initPromise = (async () => {
            const wasm = await import('din-wasm');
            await wasm.default();
            wasmModule = wasm;
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
