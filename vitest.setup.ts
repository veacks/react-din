import '@testing-library/jest-dom/vitest';
import { installMockWebAudio } from './tests/helpers/mockWebAudio';

installMockWebAudio();

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}

if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback) =>
        setTimeout(() => callback(Date.now()), 16) as unknown as number;
}

if (!globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame = (id: number) => {
        clearTimeout(id);
    };
}

if (!globalThis.fetch) {
    globalThis.fetch = async () =>
        ({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(8),
        }) as Response;
}

if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
        value: {
            randomUUID: () => 'mock-uuid',
        },
    });
}
