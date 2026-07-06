import { Map } from '../../../src/Functions/Mapper';

describe('Map', () => {

    describe('flat property mapping', () => {

        it('copies source property values onto the destination object', () => {
            const dest: Record<string, unknown> = { name: '', age: 0 };
            Map(dest, { name: 'Alice', age: 30 });
            expect(dest['name']).toBe('Alice');
            expect(dest['age']).toBe(30);
        });

        it('sets source keys onto the destination even when the key did not previously exist on destination', () => {
            // Mapper does NOT gate on dest having the key — it assigns all source keys unconditionally
            const dest: Record<string, unknown> = { name: '' };
            Map(dest, { name: 'Bob', extra: 'injected' });
            expect(dest['name']).toBe('Bob');
            expect(dest['extra']).toBe('injected');
        });

        it('overwrites an existing destination value with the source value', () => {
            const dest: Record<string, unknown> = { status: 'pending' };
            Map(dest, { status: 'active' });
            expect(dest['status']).toBe('active');
        });

        it('leaves destination properties that are absent from source untouched', () => {
            const dest: Record<string, unknown> = { a: 1, b: 2 };
            Map(dest, { a: 99 });
            expect(dest['a']).toBe(99);
            expect(dest['b']).toBe(2);
        });

    });

    describe('nested object merging', () => {

        it('recursively merges when both source and destination have a plain object at the same key', () => {
            const dest = { address: { city: 'Wellington', country: 'NZ' } };
            Map(dest, { address: { city: 'Auckland' } });
            expect(dest.address.city).toBe('Auckland');
            expect(dest.address.country).toBe('NZ'); // unchanged
        });

        it('preserves untouched nested properties during a recursive merge', () => {
            const dest = { config: { debug: false, timeout: 30, retries: 3 } };
            Map(dest, { config: { debug: true } });
            expect(dest.config.debug).toBe(true);
            expect(dest.config.timeout).toBe(30);
            expect(dest.config.retries).toBe(3);
        });

        it('merges multiple levels deep', () => {
            const dest: Record<string, any> = { a: { b: { c: 'original', d: 'keep' } } };
            Map(dest, { a: { b: { c: 'updated' } } });
            expect(dest['a']['b']['c']).toBe('updated');
            expect(dest['a']['b']['d']).toBe('keep');
        });

    });

    describe('array handling', () => {

        it('assigns a source array as-is without recursing into it', () => {
            const dest: Record<string, unknown> = { tags: ['a', 'b'] };
            Map(dest, { tags: ['x', 'y', 'z'] });
            expect(dest['tags']).toEqual(['x', 'y', 'z']);
        });

        it('replaces a destination object with a source array (no recursion when source is array)', () => {
            const dest: Record<string, unknown> = { items: { foo: 'bar' } };
            Map(dest, { items: [1, 2, 3] });
            expect(dest['items']).toEqual([1, 2, 3]);
        });

        it('replaces a destination array with a source object (no recursion when dest is array)', () => {
            const dest: Record<string, unknown> = { items: [1, 2, 3] };
            Map(dest, { items: { foo: 'bar' } });
            expect(dest['items']).toEqual({ foo: 'bar' });
        });

        it('assigns an empty array as-is', () => {
            const dest: Record<string, unknown> = { tags: ['keep'] };
            Map(dest, { tags: [] });
            expect(dest['tags']).toEqual([]);
        });

    });

    describe('dangerous key denylist', () => {

        // Regression tests for the root cause behind the constructor-args leak fixed
        // across ~36 Api classes this session: Map() has no concept of which fields a
        // destination class actually declares (most are `field?: string` with no
        // default, so a fresh instance has no own properties to whitelist against), so
        // URL/AuthToken/httpClient are denylisted directly in Map() as a shared,
        // future-proof choke point rather than relying on every call site remembering
        // never to pass the { URL, AuthToken, httpClient } auth/config bag in.

        it('never copies URL, even onto a destination that does not already have it', () => {
            const dest: Record<string, unknown> = { Message: '' };
            Map(dest, { Message: 'hi', URL: 'https://api.tnz.co.nz/api/v3.00' });
            expect(dest['URL']).toBeUndefined();
        });

        it('never copies AuthToken', () => {
            const dest: Record<string, unknown> = {};
            Map(dest, { AuthToken: 'super-secret-token' });
            expect(dest['AuthToken']).toBeUndefined();
        });

        it('never copies httpClient', () => {
            const dest: Record<string, unknown> = {};
            const fakeClient = { get: () => {}, post: () => {} };
            Map(dest, { httpClient: fakeClient });
            expect(dest['httpClient']).toBeUndefined();
        });

        it('still copies every other field when URL/AuthToken/httpClient are mixed in with real data', () => {
            const dest: Record<string, unknown> = {};
            Map(dest, { Message: 'hi', URL: 'https://x', AuthToken: 'secret', httpClient: {}, Destinations: [{ ToNumber: '+64211111111' }] });
            expect(dest['Message']).toBe('hi');
            expect(dest['Destinations']).toEqual([{ ToNumber: '+64211111111' }]);
            expect(dest['URL']).toBeUndefined();
            expect(dest['AuthToken']).toBeUndefined();
            expect(dest['httpClient']).toBeUndefined();
        });

    });

    describe('early-return guards', () => {

        it('returns early without throwing when data is null', () => {
            const dest = { name: 'original' };
            expect(() => Map(dest, null as unknown as object)).not.toThrow();
            expect(dest.name).toBe('original');
        });

        it('returns early without throwing when data is undefined', () => {
            const dest = { name: 'original' };
            expect(() => Map(dest, undefined as unknown as object)).not.toThrow();
            expect(dest.name).toBe('original');
        });

        it('returns early without throwing when data is an empty string', () => {
            const dest = { name: 'original' };
            expect(() => Map(dest, '' as unknown as object)).not.toThrow();
            expect(dest.name).toBe('original');
        });

        it('returns early without throwing when obj is null', () => {
            expect(() => Map(null as unknown as object, { name: 'Alice' })).not.toThrow();
        });

        it('does not mutate destination when data is an empty object', () => {
            const dest: Record<string, unknown> = { value: 42 };
            Map(dest, {});
            expect(dest['value']).toBe(42);
        });

    });

});