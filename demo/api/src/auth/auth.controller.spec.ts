import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { SessionTokenService } from '../common/session-token.service';

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;
}

describe('AuthController', () => {
    let controller: AuthController;
    let sessionTokenService: SessionTokenService;

    beforeEach(async () => {
        // Real SessionTokenService, not a mock — it's cheap and side-effect-free (in-memory
        // only), and this controller's whole job is exercising it correctly.
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [SessionTokenService],
        }).compile();

        controller = module.get(AuthController);
        sessionTokenService = module.get(SessionTokenService);
    });

    it('rejects a token with the wrong shape', () => {
        const res = mockRes();
        controller.setToken({ Token: 'not-a-jwt' }, { cookies: {} } as unknown as Request, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            Result: 'Failed',
            ErrorMessage: ['Token must be a non-empty value with three dot-separated segments (a JWT shape).'],
        });
    });

    it('rejects an empty token', () => {
        const res = mockRes();
        controller.setToken({ Token: '' }, { cookies: {} } as unknown as Request, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('mints a session and sets a cookie for a JWT-shaped token', () => {
        const res = mockRes();
        controller.setToken({ Token: 'a.b.c' }, { cookies: {}, protocol: 'http' } as unknown as Request, res);

        expect(res.cookie).toHaveBeenCalledWith(
            'demo_session_id',
            expect.any(String),
            expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ Status: 'ok' });

        const sessionId = (res.cookie as jest.Mock).mock.calls[0][1] as string;
        expect(sessionTokenService.resolveToken(sessionId)).toBe('a.b.c');
    });

    it('sets a non-Secure cookie for a plain-HTTP request, regardless of TNZ_ALLOW_INSECURE_HTTP', () => {
        const originalEnv = process.env.TNZ_ALLOW_INSECURE_HTTP;
        delete process.env.TNZ_ALLOW_INSECURE_HTTP;

        try {
            const res = mockRes();
            controller.setToken({ Token: 'a.b.c' }, { cookies: {}, protocol: 'http' } as unknown as Request, res);

            expect(res.cookie).toHaveBeenCalledWith('demo_session_id', expect.any(String), expect.objectContaining({ secure: false }));
        } finally {
            if (originalEnv === undefined) {
                delete process.env.TNZ_ALLOW_INSECURE_HTTP;
            } else {
                process.env.TNZ_ALLOW_INSECURE_HTTP = originalEnv;
            }
        }
    });

    it('sets a Secure cookie for an HTTPS request', () => {
        const res = mockRes();
        controller.setToken({ Token: 'a.b.c' }, { cookies: {}, protocol: 'https' } as unknown as Request, res);

        expect(res.cookie).toHaveBeenCalledWith('demo_session_id', expect.any(String), expect.objectContaining({ secure: true }));
    });

    it("preserves the old session's ApiUrl override onto the new session, so refreshing the token doesn't reset it", () => {
        const firstRes = mockRes();
        controller.setToken({ Token: 'a.b.c' }, { cookies: {}, protocol: 'http' } as unknown as Request, firstRes);
        const firstSessionId = (firstRes.cookie as jest.Mock).mock.calls[0][1] as string;
        sessionTokenService.setApiUrl(firstSessionId, 'https://custom.example.com/api');

        const secondRes = mockRes();
        controller.setToken(
            { Token: 'd.e.f' },
            { cookies: { demo_session_id: firstSessionId }, protocol: 'http' } as unknown as Request,
            secondRes,
        );
        const secondSessionId = (secondRes.cookie as jest.Mock).mock.calls[0][1] as string;

        expect(secondSessionId).not.toBe(firstSessionId);
        expect(sessionTokenService.resolveToken(secondSessionId)).toBe('d.e.f');
        expect(sessionTokenService.resolveApiUrl(secondSessionId)).toBe('https://custom.example.com/api');
    });
});
