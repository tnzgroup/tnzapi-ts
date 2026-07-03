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

    describe('early-return guards', () => {

        it('returns early without throwing when data is null', () => {
            const dest = { name: 'original' };
            expect(() => Map(dest, null as any)).not.toThrow();
            expect(dest.name).toBe('original');
        });

        it('returns early without throwing when data is undefined', () => {
            const dest = { name: 'original' };
            expect(() => Map(dest, undefined as any)).not.toThrow();
            expect(dest.name).toBe('original');
        });

        it('returns early without throwing when data is an empty string', () => {
            const dest = { name: 'original' };
            expect(() => Map(dest, '' as any)).not.toThrow();
            expect(dest.name).toBe('original');
        });

        it('returns early without throwing when obj is null', () => {
            expect(() => Map(null as any, { name: 'Alice' })).not.toThrow();
        });

        it('does not mutate destination when data is an empty object', () => {
            const dest: Record<string, unknown> = { value: 42 };
            Map(dest, {});
            expect(dest['value']).toBe(42);
        });

    });

});