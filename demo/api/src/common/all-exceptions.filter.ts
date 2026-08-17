import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    // Instantiated directly, not constructor-injected: this filter is registered via
    // app.useGlobalFilters() in main.ts (before the Nest DI container has anything else to hand
    // it), not via an APP_FILTER provider — constructor injection isn't available there. A
    // directly-instantiated Logger still produces the same structured NestJS log output.
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        if (exception instanceof HttpException) {
            res.status(exception.getStatus()).json(exception.getResponse());
            return;
        }

        const message = exception instanceof Error ? exception.message : 'Unknown error';
        // new TNZAPI(...) throws synchronously when no Auth Token is resolvable (no session
        // override and TNZ_AUTH_TOKEN unset) — a client-actionable configuration problem, not a
        // server crash, so it gets the same 400 Result/ErrorMessage envelope as every other
        // failure instead of falling through to 500.
        const status = message.includes('AuthToken is required') ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;

        // Unexpected (500) errors previously vanished with zero server-side trace — log every
        // caught exception, with the stack for genuine 500s so it's actually debuggable.
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`${req.method} ${req.url} — ${message}`, exception instanceof Error ? exception.stack : undefined);
        } else {
            this.logger.warn(`${req.method} ${req.url} — ${message}`);
        }

        res.status(status).json({ Result: 'Failed', ErrorMessage: [message] });
    }
}
