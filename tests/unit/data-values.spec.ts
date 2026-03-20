import { clamp, compare, math, mix, switchValue } from '../../src/data/values';

describe('data value helpers', () => {
    it('evaluates math operations safely', () => {
        expect(math('add', 2, 3)).toBe(5);
        expect(math('divide', 10, 0)).toBe(0);
        expect(math('smoothMax', 2, 4, 1)).toBeGreaterThan(3);
    });

    it('evaluates compare, mix, clamp, and switch operations', () => {
        expect(compare('gte', 4, 4)).toBe(1);
        expect(mix(0, 10, 0.5, true)).toBe(5);
        expect(clamp(3, 5, 1, 'range')).toBe(3);
        expect(switchValue(1, [10, 20, 30], 99)).toBe(20);
    });
});
