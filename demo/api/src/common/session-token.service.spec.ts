import { SessionTokenService } from './session-token.service';

describe('SessionTokenService', () => {
    // No injected dependencies — direct instantiation is not a DI violation here, since there's
    // nothing to mock or override. Test.createTestingModule() would just wrap this same call.
    let service: SessionTokenService;
    const originalEnvToken = process.env.TNZ_AUTH_TOKEN;

    beforeEach(() => {
        service = new SessionTokenService();
    });

    afterEach(() => {
        process.env.TNZ_AUTH_TOKEN = originalEnvToken;
    });

    it('resolves a minted session id back to its token', () => {
        const sessionId = service.mintSession('token-abc');
        expect(service.resolveToken(sessionId)).toBe('token-abc');
    });

    it('falls back to TNZ_AUTH_TOKEN when the session id is unknown', () => {
        process.env.TNZ_AUTH_TOKEN = 'env-token';
        expect(service.resolveToken('not-a-real-session')).toBe('env-token');
    });

    it('falls back to an empty string when neither a session nor TNZ_AUTH_TOKEN exists', () => {
        delete process.env.TNZ_AUTH_TOKEN;
        expect(service.resolveToken(undefined)).toBe('');
    });

    it('forgets a cleared session', () => {
        const sessionId = service.mintSession('token-xyz');
        service.clearSession(sessionId);
        process.env.TNZ_AUTH_TOKEN = 'fallback';
        expect(service.resolveToken(sessionId)).toBe('fallback');
    });

    it('mints a fresh, unique session id on every call', () => {
        const a = service.mintSession('token-1');
        const b = service.mintSession('token-1');
        expect(a).not.toBe(b);
    });

    it('resolveApiUrl returns undefined for a session with no override, and undefined for an unknown session', () => {
        const sessionId = service.mintSession('token-abc');
        expect(service.resolveApiUrl(sessionId)).toBeUndefined();
        expect(service.resolveApiUrl('not-a-real-session')).toBeUndefined();
        expect(service.resolveApiUrl(undefined)).toBeUndefined();
    });

    it('setApiUrl stores an override that resolveApiUrl returns back, without touching the token', () => {
        const sessionId = service.mintSession('token-abc');
        service.setApiUrl(sessionId, 'https://example.com/api');
        expect(service.resolveApiUrl(sessionId)).toBe('https://example.com/api');
        expect(service.resolveToken(sessionId)).toBe('token-abc');
    });

    it('a session token of "" (created via ensureSession, never given a real token) still falls back to TNZ_AUTH_TOKEN', () => {
        process.env.TNZ_AUTH_TOKEN = 'env-token';
        const sessionId = service.ensureSession(undefined);
        service.setApiUrl(sessionId, 'https://example.com/api');
        expect(service.resolveToken(sessionId)).toBe('env-token');
        expect(service.resolveApiUrl(sessionId)).toBe('https://example.com/api');
    });

    it('ensureSession returns the same id when called again with a still-valid session', () => {
        const sessionId = service.mintSession('token-abc');
        expect(service.ensureSession(sessionId)).toBe(sessionId);
    });

    it('ensureSession mints a new session when given undefined or an unknown id', () => {
        const fresh = service.ensureSession(undefined);
        expect(fresh).toBeTruthy();
        expect(service.ensureSession('not-a-real-session')).not.toBe('not-a-real-session');
    });

    it('mintSession carries an explicit apiUrl through to the new session (used by AuthController to preserve it across a token refresh)', () => {
        const sessionId = service.mintSession('token-abc', 'https://carried-over.example.com');
        expect(service.resolveApiUrl(sessionId)).toBe('https://carried-over.example.com');
    });
});
