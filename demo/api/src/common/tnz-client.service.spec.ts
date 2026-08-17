import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { TnzClientService } from './tnz-client.service';
import { SESSION_COOKIE_NAME, SessionTokenService } from './session-token.service';

describe('TnzClientService', () => {
    let service: TnzClientService;
    let sessionTokenService: SessionTokenService;
    const originalEnvToken = process.env.TNZ_AUTH_TOKEN;

    beforeEach(async () => {
        // Real SessionTokenService, not a mock — it's cheap and side-effect-free (in-memory
        // only), so exercising the real interaction is more useful here than faking it.
        const module: TestingModule = await Test.createTestingModule({
            providers: [TnzClientService, SessionTokenService],
        }).compile();

        service = module.get(TnzClientService);
        sessionTokenService = module.get(SessionTokenService);
    });

    afterEach(() => {
        process.env.TNZ_AUTH_TOKEN = originalEnvToken;
    });

    it('builds a client using the session-scoped token when a valid session cookie is present', () => {
        const sessionId = sessionTokenService.mintSession('session-token');
        const req = { cookies: { [SESSION_COOKIE_NAME]: sessionId } } as unknown as Request;

        const client = service.getClient(req);

        expect(client).toBeDefined();
    });

    it('falls back to TNZ_AUTH_TOKEN when there is no session cookie', () => {
        process.env.TNZ_AUTH_TOKEN = 'env-token';
        const req = { cookies: {} } as unknown as Request;

        const client = service.getClient(req);

        expect(client).toBeDefined();
    });

    it('throws when neither a session nor TNZ_AUTH_TOKEN is available', () => {
        delete process.env.TNZ_AUTH_TOKEN;
        const req = { cookies: {} } as unknown as Request;

        expect(() => service.getClient(req)).toThrow('TNZ AuthToken is required');
    });

    it("resolves the session's ApiUrl override and passes it as URL, ahead of TNZ_API_URL", () => {
        const originalApiUrl = process.env.TNZ_API_URL;
        process.env.TNZ_API_URL = 'https://env.example.com';

        const sessionId = sessionTokenService.mintSession('session-token');
        sessionTokenService.setApiUrl(sessionId, 'https://session-override.example.com');
        const req = { cookies: { [SESSION_COOKIE_NAME]: sessionId } } as unknown as Request;

        const resolveApiUrlSpy = jest.spyOn(sessionTokenService, 'resolveApiUrl');
        expect(() => service.getClient(req)).not.toThrow();
        expect(resolveApiUrlSpy).toHaveBeenCalledWith(sessionId);
        expect(resolveApiUrlSpy).toHaveReturnedWith('https://session-override.example.com');

        process.env.TNZ_API_URL = originalApiUrl;
    });

    it('falls back to TNZ_API_URL when the session has no ApiUrl override', () => {
        const originalApiUrl = process.env.TNZ_API_URL;
        process.env.TNZ_API_URL = 'https://env.example.com';

        const sessionId = sessionTokenService.mintSession('session-token');
        const req = { cookies: { [SESSION_COOKIE_NAME]: sessionId } } as unknown as Request;

        const resolveApiUrlSpy = jest.spyOn(sessionTokenService, 'resolveApiUrl');
        expect(() => service.getClient(req)).not.toThrow();
        expect(resolveApiUrlSpy).toHaveReturnedWith(undefined);

        process.env.TNZ_API_URL = originalApiUrl;
    });
});
