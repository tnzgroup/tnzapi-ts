import { isEmpty, isEmail } from './UsefulStuff';

describe('UsefulStuff', () => {
  describe('isEmpty', () => {
    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for an empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return false for a non-empty string', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    it('should return false for a number', () => {
      expect(isEmpty(123)).toBe(false);
    });

    it('should return false for an object', () => {
      expect(isEmpty({})).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('should return true for a valid email', () => {
      expect(isEmail('test@example.com')).toBe(true);
    });

    it('should return false for an invalid email', () => {
      expect(isEmail('invalid-email')).toBe(false);
    });

    it('should return false for an empty string', () => {
      expect(isEmail('')).toBe(false);
    });
  });
});
