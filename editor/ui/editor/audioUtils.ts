export const SAFE_AUDIO_EXTENSIONS = new Set([
    'mp3',
    'wav',
    'wave',
    'm4a',
    'aac',
    'flac',
    'ogg',
    'oga',
    'opus',
    'webm',
    'mp4',
]);

export const EXTENSION_TO_MIME_CANDIDATES: Record<string, string[]> = {
    mp3: ['audio/mpeg'],
    wav: ['audio/wav', 'audio/x-wav', 'audio/wave'],
    wave: ['audio/wav', 'audio/x-wav', 'audio/wave'],
    m4a: ['audio/mp4', 'audio/x-m4a', 'audio/aac'],
    aac: ['audio/aac', 'audio/mp4'],
    flac: ['audio/flac', 'audio/x-flac'],
    ogg: ['audio/ogg'],
    oga: ['audio/ogg'],
    opus: ['audio/ogg; codecs=opus', 'audio/opus'],
    webm: ['audio/webm'],
    mp4: ['audio/mp4'],
};

export const MAINSTREAM_CROSS_BROWSER_HINT = 'Use MP3, WAV, or M4A/AAC for best cross-browser compatibility.';

export const getFileExtension = (name: string): string => {
    const trimmed = name.trim();
    const lastDot = trimmed.lastIndexOf('.');
    if (lastDot < 0 || lastDot === trimmed.length - 1) return '';
    return trimmed.slice(lastDot + 1).toLowerCase();
};

export const isLikelyAudioFile = (file: File): boolean => {
    if (file.type.startsWith('audio/')) return true;
    return SAFE_AUDIO_EXTENSIONS.has(getFileExtension(file.name));
};

export const canCurrentBrowserPlayFile = (file: File): boolean => {
    if (typeof document === 'undefined') return true;
    const audio = document.createElement('audio');
    if (typeof audio.canPlayType !== 'function') return true;

    const mimeCandidates = new Set<string>();
    if (file.type) {
        mimeCandidates.add(file.type);
    }

    const extension = getFileExtension(file.name);
    (EXTENSION_TO_MIME_CANDIDATES[extension] ?? []).forEach((value) => mimeCandidates.add(value));

    if (mimeCandidates.size === 0) return false;
    for (const mime of mimeCandidates) {
        const support = audio.canPlayType(mime).toLowerCase();
        if (support === 'probably' || support === 'maybe') {
            return true;
        }
    }
    return false;
};

export const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDuration = (durationSec?: number): string => {
    if (!Number.isFinite(durationSec) || !durationSec || durationSec <= 0) {
        return '--:--';
    }
    const totalSeconds = Math.max(0, Math.round(durationSec));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export async function dataUrlToBlob(dataUrl: string): Promise<Blob | null> {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) return null;
        return response.blob();
    } catch {
        return null;
    }
}
