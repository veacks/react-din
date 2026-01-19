const AUDIO_CACHE_NAME = 'react-din-playground-audio';
const AUDIO_CACHE_PREFIX = '/__playground_audio__/';

const audioUrlCache = new Map<string, string>();

function getCacheKey(sampleId: string): string {
    return `${location.origin}${AUDIO_CACHE_PREFIX}${sampleId}`;
}

export async function saveAudioToCache(sampleId: string, file: Blob): Promise<void> {
    if (!('caches' in window)) return;

    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = new Response(file, {
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
        },
    });

    await cache.put(getCacheKey(sampleId), response);
}

export async function loadAudioFromCache(sampleId: string): Promise<Blob | null> {
    if (!('caches' in window)) return null;

    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(getCacheKey(sampleId));

    if (!response) return null;
    return response.blob();
}

export async function getAudioObjectUrl(sampleId: string): Promise<string | null> {
    if (audioUrlCache.has(sampleId)) {
        return audioUrlCache.get(sampleId) ?? null;
    }

    const blob = await loadAudioFromCache(sampleId);
    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    audioUrlCache.set(sampleId, url);
    return url;
}

export function releaseAudioObjectUrl(sampleId: string): void {
    const url = audioUrlCache.get(sampleId);
    if (url) {
        URL.revokeObjectURL(url);
        audioUrlCache.delete(sampleId);
    }
}

export async function deleteAudioFromCache(sampleId: string): Promise<void> {
    releaseAudioObjectUrl(sampleId);

    if (!('caches' in window)) return;

    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.delete(getCacheKey(sampleId));
}
