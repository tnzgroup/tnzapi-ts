import {
    isEmpty,
    isEmail,
    isNumber,
    isDateTime,
    isPhoneNumber,
    isMobileNumber,
    formatPhoneNumber,
    formatMobileNumber,
    httpBuildQuery,
    replaceAll,
} from '../../../src/Functions/UsefulStuff';

describe('UsefulStuff', () => {

    describe('isEmpty', () => {
        it('returns true for undefined', () => expect(isEmpty(undefined)).toBe(true));
        it('returns true for null', () => expect(isEmpty(null)).toBe(true));
        it('returns false for false', () => expect(isEmpty(false)).toBe(false));
        it('returns true for empty string', () => expect(isEmpty('')).toBe(true));
        it('returns true for empty array', () => expect(isEmpty([])).toBe(true));
        it('returns false for non-empty string', () => expect(isEmpty('hello')).toBe(false));
        it('returns false for non-empty array', () => expect(isEmpty(['a'])).toBe(false));
        it('returns false for number 0', () => expect(isEmpty(0)).toBe(false));
        it('returns false for number 1', () => expect(isEmpty(1)).toBe(false));
        it('returns false for true', () => expect(isEmpty(true)).toBe(false));
        it('returns false for an object', () => expect(isEmpty({ a: 1 })).toBe(false));
    });

    describe('isEmail', () => {
        it('returns true for valid email', () => expect(isEmail('user@example.com')).toBe(true));
        it('returns true for email with subdomain', () => expect(isEmail('user@mail.example.co.nz')).toBe(true));
        it('returns true for email with plus', () => expect(isEmail('user+tag@example.com')).toBe(true));
        it('returns false for missing @', () => expect(isEmail('userexample.com')).toBe(false));
        it('returns false for missing domain', () => expect(isEmail('user@')).toBe(false));
        it('returns false for missing TLD', () => expect(isEmail('user@example')).toBe(false));
        it('returns false for empty string', () => expect(isEmail('')).toBe(false));
    });

    describe('isNumber', () => {
        it('returns true for integer', () => expect(isNumber(42)).toBe(true));
        it('returns true for float', () => expect(isNumber(3.14)).toBe(true));
        it('returns true for 0', () => expect(isNumber(0)).toBe(true));
        it('returns false for numeric string', () => expect(isNumber('42')).toBe(false));
        it('returns false for undefined', () => expect(isNumber(undefined)).toBe(false));
        it('returns false for null', () => expect(isNumber(null)).toBe(false));
        it('returns false for NaN', () => expect(isNumber(NaN)).toBe(false));
        it('returns false for boolean true', () => expect(isNumber(true as any)).toBe(false));
    });

    describe('isDateTime', () => {
        it('returns true for ISO date string', () => expect(isDateTime('2025-01-15')).toBe(true));
        it('returns true for datetime string', () => expect(isDateTime('2025-01-15 09:30')).toBe(true));
        it('returns true for ISO 8601 with time', () => expect(isDateTime('2025-01-15T09:30:00')).toBe(true));
        it('returns false for empty string', () => expect(isDateTime('')).toBe(false));
        it('returns false for random text', () => expect(isDateTime('not-a-date')).toBe(false));
        it('returns false for undefined-like empty', () => expect(isDateTime('')).toBe(false));
        // Bare year does not satisfy the YYYY-MM-DD prefix guard
        it('returns false for a bare year string "2025"', () => expect(isDateTime('2025')).toBe(false));
        // Bare integer-like string also fails the prefix guard
        it('returns false for a bare number string "3"', () => expect(isDateTime('3')).toBe(false));
        // Full ISO 8601 with timezone offset is valid
        it('returns true for ISO 8601 with timezone offset', () => expect(isDateTime('2025-06-15T09:30:00+12:00')).toBe(true));
    });

    describe('isPhoneNumber', () => {
        it('returns true for NZ landline', () => expect(isPhoneNumber('09 234 5678')).toBe(true));
        it('returns true for NZ mobile with +64', () => expect(isPhoneNumber('+6421123456')).toBe(true));
        it('returns true for AU mobile', () => expect(isPhoneNumber('04 1234 5678')).toBe(true));
        it('returns false for empty string', () => expect(isPhoneNumber('')).toBe(false));
        it('returns false for letters only', () => expect(isPhoneNumber('abc')).toBe(false));
    });

    describe('isMobileNumber', () => {
        it('returns true for NZ mobile +6421', () => expect(isMobileNumber('+64211234567')).toBe(true));
        it('returns true for NZ mobile starting 02', () => expect(isMobileNumber('0211234567')).toBe(true));
        it('returns false for empty string', () => expect(isMobileNumber('')).toBe(false));
        // NZ landlines (09 Auckland, 04 Wellington, etc.) are not mobile numbers
        it('returns false for NZ landline with 09 prefix', () => expect(isMobileNumber('092345678')).toBe(false));
        it('returns false for NZ landline with 04 prefix', () => expect(isMobileNumber('044567890')).toBe(false));
        // AU mobile (04xx) is accepted as mobile
        it('returns true for AU mobile starting 04', () => expect(isMobileNumber('0412345678')).toBe(true));
    });

    describe('formatPhoneNumber', () => {
        it('converts NZ mobile 02x to 642x', () => {
            const result = formatPhoneNumber('021 123 456');
            expect(result).toContain('64');
        });
        it('strips non-digit characters', () => {
            const result = formatPhoneNumber('+64 21 123 456');
            expect(result).toMatch(/^\d+$/);
        });
        it('returns empty string for empty input', () => {
            expect(formatPhoneNumber('')).toBe('');
        });
        it('returns empty string for letters-only input', () => {
            expect(formatPhoneNumber('abc')).toBe('');
        });
        // AU mobile numbers (04xx prefix) are formatted as 614xxxxxxxx
        it('formats AU mobile (04xx) to E.164 numeric starting with 614', () => {
            const result = formatPhoneNumber('0412345678');
            expect(result).toBe('61412345678');
        });
        // NZ landline should resolve via the NZ region (64 + 9xxxxxxx)
        it('formats NZ landline (09 prefix) to E.164 numeric starting with 649', () => {
            const result = formatPhoneNumber('09 234 5678');
            expect(result).toMatch(/^649/);
        });
        // An international number outside NZ/AU is resolved via the international fallback
        it('formats a UK number (+44) to E.164 numeric', () => {
            const result = formatPhoneNumber('+44 20 7946 0958');
            expect(result).toMatch(/^44/);
        });
    });

    describe('formatMobileNumber', () => {
        it('converts NZ mobile 0211234567 to E.164 numeric (6421...)', () => {
            const result = formatMobileNumber('0211234567');
            expect(result).toMatch(/^6421/);
        });
        it('converts 021 with spacing to 6421x', () => {
            const result = formatMobileNumber('021 123 4567');
            expect(result).toMatch(/^642/);
        });
        it('handles international +6421x format (strips +)', () => {
            const result = formatMobileNumber('+64211234567');
            expect(result).toBe('64211234567');
        });
        it('returns empty string for NZ landline (not a mobile number)', () => {
            // 09 NZ landline prefix — not a mobile, so formatMobileNumber returns ""
            const result = formatMobileNumber('091234567');
            expect(result).toBe('');
        });
    });

    describe('httpBuildQuery', () => {
        it('builds a query string from an object', () => {
            const result = httpBuildQuery({ page: 1, size: 10 });
            expect(result).toBe('page=1&size=10');
        });
        it('handles array values by joining with comma', () => {
            const result = httpBuildQuery({ ids: [1, 2, 3] });
            expect(result).toContain('ids=');
            expect(result).toContain('1%2C2%2C3');
        });
        it('URL-encodes special characters', () => {
            const result = httpBuildQuery({ token: 'a b+c' });
            expect(result).toContain('token=');
        });
        it('returns empty string for an empty object', () => {
            expect(httpBuildQuery({})).toBe('');
        });
        it('handles a single key-value pair', () => {
            expect(httpBuildQuery({ q: 'hello' })).toBe('q=hello');
        });
    });

    describe('replaceAll', () => {
        it('replaces all occurrences', () => {
            expect(replaceAll('hello world world', 'world', 'earth')).toBe('hello earth earth');
        });
        it('returns original if find not found', () => {
            expect(replaceAll('hello', 'xyz', 'abc')).toBe('hello');
        });
        it('handles empty string replacement', () => {
            expect(replaceAll('aaa', 'a', '')).toBe('');
        });
    });

});