/**
 * Shared loader for `audioWorklet.addModule` with one in-flight promise per `AudioContext`.
 */
export function createEnsureDinAudioWorkletLoaded(getModuleUrl: () => string) {
    const loadedContexts = new WeakMap<BaseAudioContext, Promise<void>>();

    return async function ensureDinAudioWorkletLoaded(context: BaseAudioContext): Promise<void> {
        let p = loadedContexts.get(context);
        if (!p) {
            p = context.audioWorklet.addModule(getModuleUrl()).catch((error) => {
                loadedContexts.delete(context);
                throw error;
            });
            loadedContexts.set(context, p);
        }
        return p;
    };
}
