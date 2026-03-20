import { checkAudioSupport, clientOnly, getAudioContext, isSSR } from '../../src/utils/ssr';

describe('SSR helpers', () => {
    it('reports browser audio support in the jsdom test environment', () => {
        expect(isSSR()).toBe(false);
        expect(getAudioContext()).not.toBeNull();
        expect(clientOnly(() => 42)).toBe(42);
        expect(checkAudioSupport().audioContext).toBe(true);
    });
});
