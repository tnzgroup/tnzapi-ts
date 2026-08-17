import { stripUndefined } from './strip-undefined';

describe('stripUndefined', () => {
    it('removes keys whose value is undefined', () => {
        expect(stripUndefined({ a: 1, b: undefined, c: 'x' })).toEqual({ a: 1, c: 'x' });
    });

    it('keeps falsy-but-defined values (0, "", false, null)', () => {
        expect(stripUndefined({ a: 0, b: '', c: false, d: null })).toEqual({ a: 0, b: '', c: false, d: null });
    });

    it('returns an empty object when given one', () => {
        expect(stripUndefined({})).toEqual({});
    });
});
