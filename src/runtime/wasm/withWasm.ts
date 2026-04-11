import { isSSR } from '../../utils/ssr';
import { getWasmModuleSync } from './loadWasmOnce';

export function withWasm<T>(
    wasmFn: (wasm: typeof import('din-wasm')) => T,
    fallback: () => T
): T {
    if (isSSR()) return fallback();
    const wasm = getWasmModuleSync();
    if (!wasm) return fallback();
    try {
        return wasmFn(wasm);
    } catch {
        return fallback();
    }
}
