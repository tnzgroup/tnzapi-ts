import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { IsBoolean, IsString } from 'class-validator';
import { SESSION_COOKIE_NAME, SessionTokenService } from '../common/session-token.service';

class SetApiUrlDto {
    @IsString()
    ApiUrl!: string;
}

class SetBooleanSettingDto {
    @IsBoolean()
    Enabled!: boolean;
}

function isValidHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

@Controller('api/settings')
export class SettingsController {
    constructor(private readonly sessionTokenService: SessionTokenService) {}

    private readSessionId(req: Request): string | undefined {
        return (req as Request & { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE_NAME];
    }

    // ApiUrl is scoped per-browser-session (like the auth token): TNZAPI's constructor takes URL
    // as a plain argument, so TnzClientService can apply a session-specific override with no SDK
    // changes needed. Two concurrent users of the same demo instance changing api-url no longer
    // affect each other.
    @Get('api-url')
    getApiUrl(@Req() req: Request): { ApiUrl: string } {
        const sessionApiUrl = this.sessionTokenService.resolveApiUrl(this.readSessionId(req));
        return { ApiUrl: sessionApiUrl ?? process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00' };
    }

    @Post('api-url')
    setApiUrl(@Body() body: SetApiUrlDto, @Req() req: Request, @Res() res: Response): void {
        if (!body.ApiUrl || !isValidHttpUrl(body.ApiUrl)) {
            res.status(400).json({ Result: 'Failed', ErrorMessage: [`Invalid ApiUrl: '${body.ApiUrl}'`] });
            return;
        }
        if (new URL(body.ApiUrl).protocol === 'http:' && process.env.TNZ_ALLOW_INSECURE_HTTP !== 'true') {
            res.status(400).json({
                Result: 'Failed',
                ErrorMessage: ['ApiUrl must use https:// unless TNZ_ALLOW_INSECURE_HTTP=true is set.'],
            });
            return;
        }

        const sessionId = this.sessionTokenService.ensureSession(this.readSessionId(req));
        this.sessionTokenService.setApiUrl(sessionId, body.ApiUrl);
        res.cookie(SESSION_COOKIE_NAME, sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: req.protocol === 'https',
        });
        res.status(200).json({ Status: 'ok', ApiUrl: body.ApiUrl });
    }

    // allow-insecure-http and ssl-verification stay process-wide, unlike ApiUrl above — not an
    // oversight. tnzapi-ts's HttpRequest.ts reads TNZ_ALLOW_INSECURE_HTTP and
    // TNZ_UNSAFE_IGNORE_SSL straight from process.env at request time (src/Functions/
    // HttpRequest.ts), with no per-client or per-request override hook the way URL/AuthToken are
    // constructor arguments — so there is nothing in this demo app to scope them by session
    // without changing the SDK itself. Documented in demo/README.md's "Known tradeoffs".
    @Get('allow-insecure-http')
    getAllowInsecureHttp(): { Enabled: boolean } {
        return { Enabled: process.env.TNZ_ALLOW_INSECURE_HTTP === 'true' };
    }

    @Post('allow-insecure-http')
    setAllowInsecureHttp(@Body() body: SetBooleanSettingDto, @Res() res: Response): void {
        process.env.TNZ_ALLOW_INSECURE_HTTP = body.Enabled ? 'true' : 'false';
        res.status(200).json({ Status: 'ok', Enabled: body.Enabled });
    }

    // Real implementation, unlike the Python reference demo (which 501s here — tnzapi-python's
    // HttpClient has no SSL verification toggle). tnzapi-ts's HttpRequest.ts does, via
    // TNZ_UNSAFE_IGNORE_SSL — this setting's "Enabled" means "verify SSL" (the safe default),
    // the inverse of that env var's polarity, so it's negated on both read and write.
    @Get('ssl-verification')
    getSslVerification(): { Enabled: boolean } {
        return { Enabled: process.env.TNZ_UNSAFE_IGNORE_SSL !== 'true' };
    }

    @Post('ssl-verification')
    setSslVerification(@Body() body: SetBooleanSettingDto, @Res() res: Response): void {
        process.env.TNZ_UNSAFE_IGNORE_SSL = body.Enabled ? 'false' : 'true';
        res.status(200).json({ Status: 'ok', Enabled: body.Enabled });
    }
}
