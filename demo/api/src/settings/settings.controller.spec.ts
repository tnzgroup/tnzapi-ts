import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { SettingsController } from './settings.controller';
import { SESSION_COOKIE_NAME, SessionTokenService } from '../common/session-token.service';

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;
}

function reqWithSession(sessionId?: string): Request {
    return { cookies: sessionId ? { [SESSION_COOKIE_NAME]: sessionId } : {}, protocol: 'http' } as unknown as Request;
}

describe('SettingsController', () => {
    let controller: SettingsController;
    let sessionTokenService: SessionTokenService;
    const originalEnv = { ...process.env };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SettingsController],
            providers: [SessionTokenService],
        }).compile();

        controller = module.get(SettingsController);
        sessionTokenService = module.get(SessionTokenService);
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('GET api-url defaults to the real TNZ API when unset and no session override exists', () => {
        delete process.env.TNZ_API_URL;
        expect(controller.getApiUrl(reqWithSession())).toEqual({ ApiUrl: 'https://api.tnz.co.nz/api/v3.00' });
    });

    it('POST api-url rejects an invalid URL', () => {
        const res = mockRes();
        controller.setApiUrl({ ApiUrl: 'not-a-url' }, reqWithSession(), res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ Result: 'Failed', ErrorMessage: ["Invalid ApiUrl: 'not-a-url'"] });
    });

    it('POST api-url rejects http:// unless TNZ_ALLOW_INSECURE_HTTP=true', () => {
        delete process.env.TNZ_ALLOW_INSECURE_HTTP;
        const res = mockRes();
        controller.setApiUrl({ ApiUrl: 'http://example.com' }, reqWithSession(), res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            Result: 'Failed',
            ErrorMessage: ['ApiUrl must use https:// unless TNZ_ALLOW_INSECURE_HTTP=true is set.'],
        });
    });

    it('POST api-url accepts a valid https URL, stores it per-session (not on process.env), and mints a session cookie', () => {
        const res = mockRes();
        controller.setApiUrl({ ApiUrl: 'https://example.com/api' }, reqWithSession(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ Status: 'ok', ApiUrl: 'https://example.com/api' });
        expect(res.cookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, expect.any(String), expect.objectContaining({ httpOnly: true }));
        // Not written to process.env — a global write here would leak this change to every other
        // concurrent user of the same demo instance, which is exactly the bug being fixed.
        expect(process.env.TNZ_API_URL).toBeUndefined();

        const sessionId = (res.cookie as jest.Mock).mock.calls[0][1] as string;
        expect(controller.getApiUrl(reqWithSession(sessionId))).toEqual({ ApiUrl: 'https://example.com/api' });
    });

    it('a session with an ApiUrl override does not affect a different session', () => {
        const resA = mockRes();
        controller.setApiUrl({ ApiUrl: 'https://a.example.com/api' }, reqWithSession(), resA);
        const sessionIdA = (resA.cookie as jest.Mock).mock.calls[0][1] as string;

        // A second, unrelated session sees no override — the whole point of this fix.
        expect(controller.getApiUrl(reqWithSession())).toEqual({ ApiUrl: 'https://api.tnz.co.nz/api/v3.00' });
        expect(controller.getApiUrl(reqWithSession(sessionIdA))).toEqual({ ApiUrl: 'https://a.example.com/api' });
    });

    it('reuses an existing session id on a second api-url change rather than minting a new one each time', () => {
        const res1 = mockRes();
        controller.setApiUrl({ ApiUrl: 'https://first.example.com' }, reqWithSession(), res1);
        const sessionId = (res1.cookie as jest.Mock).mock.calls[0][1] as string;

        const res2 = mockRes();
        controller.setApiUrl({ ApiUrl: 'https://second.example.com' }, reqWithSession(sessionId), res2);

        expect((res2.cookie as jest.Mock).mock.calls[0][1]).toBe(sessionId);
        expect(sessionTokenService.resolveApiUrl(sessionId)).toBe('https://second.example.com');
    });

    it('round-trips allow-insecure-http', () => {
        const res = mockRes();
        controller.setAllowInsecureHttp({ Enabled: true }, res);
        expect(process.env.TNZ_ALLOW_INSECURE_HTTP).toBe('true');
        expect(controller.getAllowInsecureHttp()).toEqual({ Enabled: true });
    });

    it('round-trips ssl-verification with a real implementation (unlike the Python reference demo)', () => {
        const res = mockRes();
        controller.setSslVerification({ Enabled: false }, res);
        expect(process.env.TNZ_UNSAFE_IGNORE_SSL).toBe('true');
        expect(controller.getSslVerification()).toEqual({ Enabled: false });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
