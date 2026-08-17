import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { IsString } from 'class-validator';
import { SESSION_COOKIE_NAME, SessionTokenService } from '../common/session-token.service';

// No @IsNotEmpty() deliberately: an empty string must still reach the manual check below so
// it gets the exact contract error message, not NestJS's generic ValidationPipe 400. @IsString()
// alone still rejects a missing/non-string Token via the pipe, which is fine — the contract only
// promises this specific message for a present-but-empty-or-wrong-shape value.
class SetTokenDto {
    @IsString()
    Token!: string;
}

function isJwtShaped(token: string): boolean {
    return token.split('.').length === 3;
}

@Controller('api/auth')
export class AuthController {
    constructor(private readonly sessionTokenService: SessionTokenService) {}

    @Post('token')
    setToken(@Body() body: SetTokenDto, @Req() req: Request, @Res() res: Response): void {
        if (!body.Token || !isJwtShaped(body.Token)) {
            res.status(400).json({
                Result: 'Failed',
                ErrorMessage: ['Token must be a non-empty value with three dot-separated segments (a JWT shape).'],
            });
            return;
        }

        // Always mint a fresh session id rather than reusing any cookie the caller already
        // sent — trusting a caller-supplied id as the storage key would let an attacker plant a
        // known demo_session_id in a victim's browser ahead of time (session fixation), then
        // read the victim's real token back out under that same known id later.
        const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
        const oldSessionId = cookies?.[SESSION_COOKIE_NAME];
        // Carried over explicitly (not preserved by reusing the old session) so a user who
        // already set a custom API URL on this browser doesn't have it silently reset back to
        // default just because they also refreshed their token.
        const preservedApiUrl = this.sessionTokenService.resolveApiUrl(oldSessionId);
        this.sessionTokenService.clearSession(oldSessionId);

        const sessionId = this.sessionTokenService.mintSession(body.Token, preservedApiUrl);
        // secure reflects the protocol THIS request actually arrived over, not
        // TNZ_ALLOW_INSECURE_HTTP — that env var only controls the outbound TNZ_API_URL scheme
        // (see HttpRequest.ts) and has nothing to do with the demo's own browser-to-backend
        // connection. Marking the cookie Secure on a plain-HTTP request would make the browser
        // silently refuse to store it at all, so the pasted-in token override would never work.
        res.cookie(SESSION_COOKIE_NAME, sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: req.protocol === 'https',
        });
        res.status(200).json({ Status: 'ok' });
    }
}
