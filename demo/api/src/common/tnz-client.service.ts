import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { TNZAPI } from 'tnzapi-ts';
import { SESSION_COOKIE_NAME, SessionTokenService } from './session-token.service';

@Injectable()
export class TnzClientService {
    constructor(private readonly sessionTokenService: SessionTokenService) {}

    getClient(req: Request): TNZAPI {
        const sessionId = (req as Request & { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE_NAME];
        const authToken = this.sessionTokenService.resolveToken(sessionId);
        const apiUrl = this.sessionTokenService.resolveApiUrl(sessionId) ?? process.env.TNZ_API_URL;
        return new TNZAPI({ AuthToken: authToken, URL: apiUrl });
    }
}
