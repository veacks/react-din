/**
 * Vite dev: the published `dinAudioWorkletModuleUrl()` logic assumes this module lives under
 * `dist/` next to `runtime/wasm/`. With `@open-din/react` aliased to source, the loader is bundled
 * into an app chunk, so relative URLs break. Import the worklet with `?url` so Vite emits a
 * fetchable href (see Vite asset handling).
 */
import workletHref from '../../src/runtime/wasm/dinAudioRuntime.worklet.ts?url';
import { DIN_AUDIO_RUNTIME_PROCESSOR_NAME } from '../../src/runtime/wasm/dinAudioWorkletConstants';
import { createEnsureDinAudioWorkletLoaded } from '../../src/runtime/wasm/createEnsureDinAudioWorkletLoaded';

export function dinAudioWorkletModuleUrl(): string {
    return workletHref;
}

export const ensureDinAudioWorkletLoaded = createEnsureDinAudioWorkletLoaded(dinAudioWorkletModuleUrl);

export { DIN_AUDIO_RUNTIME_PROCESSOR_NAME };
