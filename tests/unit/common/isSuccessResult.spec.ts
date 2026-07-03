import { isSuccessResult } from '../../../src/Common/isSuccessResult';

describe('isSuccessResult', () => {

    it('returns true for the exact Pascal-case "Success" value', () => {
        expect(isSuccessResult('Success')).toBe(true);
    });

    it('returns false for other casings, since the API contract guarantees Pascal-case', () => {
        expect(isSuccessResult('SUCCESS')).toBe(false);
        expect(isSuccessResult('success')).toBe(false);
    });

    it('returns false for other Result values', () => {
        expect(isSuccessResult('Failed')).toBe(false);
        expect(isSuccessResult('Error')).toBe(false);
        expect(isSuccessResult('Unauthorized')).toBe(false);
    });

    it('returns false for undefined, null, or empty string', () => {
        expect(isSuccessResult(undefined)).toBe(false);
        expect(isSuccessResult(null)).toBe(false);
        expect(isSuccessResult('')).toBe(false);
    });

});