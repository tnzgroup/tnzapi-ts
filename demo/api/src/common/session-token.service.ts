import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export const SESSION_COOKIE_NAME = 'demo_session_id';

interface SessionState {
    token: string;
    apiUrl?: string;
}

// Server-side only, keyed by an opaque per-browser session id — never the real TNZ bearer token
// itself leaves this process via a client-readable value. Single-process only, by design: this
// is a singleton NestJS provider (default scope), so it only works correctly with a single Nest
// instance (matching the Dockerfile's plain `node dist/main.js`, no cluster mode). A
// multi-worker or multi-replica deployment would need a shared store instead — out of scope for
// a local dev demo, same limitation both sibling demos (tnzapi-dotnet, tnzapi-python) already
// document.
//
// Holds more than the auth token: SettingsController's ApiUrl override lives here too, so a
// change on one browser tab doesn't leak into every other concurrent user of the same demo
// instance (process.env would). allow-insecure-http/ssl-verification stay process-wide by
// necessity, not by this class's design — see SettingsController's comment on those two.
@Injectable()
export class SessionTokenService {
    private readonly maxSessions = 1000;
    private readonly sessions = new Map<string, SessionState>();

    // apiUrl is an explicit param (not read from an old session internally) so callers control
    // exactly what carries over: AuthController passes through whatever ApiUrl override the
    // caller's previous session had, so setting a new token doesn't silently reset it; nothing
    // else needs to preserve anything across a mint.
    mintSession(token: string, apiUrl?: string): string {
        const sessionId = randomBytes(32).toString('base64url');
        if (this.sessions.size >= this.maxSessions) {
            const oldestKey = this.sessions.keys().next().value;
            if (oldestKey !== undefined) {
                this.sessions.delete(oldestKey);
            }
        }
        this.sessions.set(sessionId, { token, apiUrl });
        return sessionId;
    }

    // Returns the existing session id unchanged if it's still valid, otherwise mints a fresh
    // (empty-token) one — for SettingsController, which needs somewhere to attach a per-session
    // ApiUrl override even for a caller who has never set an auth token through the UI at all
    // (the common case: TNZ_AUTH_TOKEN comes from `.env`, and only ApiUrl is ever changed here).
    ensureSession(sessionId: string | undefined): string {
        if (sessionId && this.sessions.has(sessionId)) {
            return sessionId;
        }
        return this.mintSession('');
    }

    resolveToken(sessionId: string | undefined): string {
        const sessionToken = sessionId ? this.sessions.get(sessionId)?.token : undefined;
        // `|| `, not `??`: a session created via ensureSession() (no explicit token yet) stores
        // token as '' — that must still fall through to TNZ_AUTH_TOKEN, not be treated as "this
        // session deliberately has no token."
        return sessionToken || process.env.TNZ_AUTH_TOKEN || '';
    }

    resolveApiUrl(sessionId: string | undefined): string | undefined {
        return sessionId ? this.sessions.get(sessionId)?.apiUrl : undefined;
    }

    setApiUrl(sessionId: string, apiUrl: string): void {
        const existing = this.sessions.get(sessionId);
        this.sessions.set(sessionId, { token: existing?.token ?? '', apiUrl });
    }

    clearSession(sessionId: string | undefined): void {
        if (sessionId) {
            this.sessions.delete(sessionId);
        }
    }
}
