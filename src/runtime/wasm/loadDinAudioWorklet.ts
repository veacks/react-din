import { createEnsureDinAudioWorkletLoaded } from './createEnsureDinAudioWorkletLoaded';
import { DIN_AUDIO_RUNTIME_PROCESSOR_NAME } from './dinAudioWorkletConstants';

/**
 * Resolves the worklet script URL for `audioWorklet.addModule`.
 *
 * tsup splits this module into `dist/chunk-*.js` at the package `dist/` root, so
 * `import.meta.url` is often `.../dist/chunk-XXXX.js` and the worklet lives at
 * `dist/runtime/wasm/dinAudioRuntime.worklet.js` → use `./runtime/wasm/...` from that chunk.
 *
 * When this file is bundled as `dist/runtime/wasm/loadDinAudioWorklet.js`, the worklet is in the
 * same directory → `./dinAudioRuntime.worklet.js`.
 *
 * Vite dev with `@open-din/react` aliased to `src/` often hoists this module into an app chunk
 * where the relative URLs above do not match a served asset. The example app aliases this module
 * to `example/shims/loadDinAudioWorklet.ts`, which uses Vite's `?url` import for a correct href.
 */
export function dinAudioWorkletModuleUrl(): string {
    const base = import.meta.url;
    if (base.includes('/runtime/wasm/')) {
        return new URL('./dinAudioRuntime.worklet.js', base).href;
    }
    return new URL('./runtime/wasm/dinAudioRuntime.worklet.js', base).href;
}

export const ensureDinAudioWorkletLoaded = createEnsureDinAudioWorkletLoaded(dinAudioWorkletModuleUrl);

export { DIN_AUDIO_RUNTIME_PROCESSOR_NAME };
