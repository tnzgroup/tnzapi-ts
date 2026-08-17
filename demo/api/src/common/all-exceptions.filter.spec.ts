import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function mockHost(): { host: ArgumentsHost; res: { status: jest.Mock; json: jest.Mock } } {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    const req = { method: 'POST', url: '/api/sms/send' };
    const host = {
        switchToHttp: () => ({ getResponse: () => res, getRequest: () => req }),
    } as unknown as ArgumentsHost;
    return { host, res };
}

describe('AllExceptionsFilter', () => {
    const filter = new AllExceptionsFilter();
    let errorSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        // Logger writes to real stdout by default — spying on the prototype methods lets these
        // tests assert logging actually happens without polluting test output.
        errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('maps a missing-AuthToken error to 400 with the Result/ErrorMessage envelope, logged as a warning', () => {
        const { host, res } = mockHost();
        filter.catch(new Error('TNZ AuthToken is required. Pass it as AuthToken or set the TNZ_AUTH_TOKEN environment variable.'), host);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            Result: 'Failed',
            ErrorMessage: ['TNZ AuthToken is required. Pass it as AuthToken or set the TNZ_AUTH_TOKEN environment variable.'],
        });
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('POST /api/sms/send'));
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('maps an unexpected error to 500 with the same envelope shape, logged as an error with a stack trace', () => {
        const { host, res } = mockHost();
        const error = new Error('boom');
        filter.catch(error, host);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ Result: 'Failed', ErrorMessage: ['boom'] });
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('POST /api/sms/send'), error.stack);
    });

    it('passes an HttpException (e.g. ValidationPipe 400) through with its own status and body, without logging', () => {
        const { host, res } = mockHost();
        filter.catch(new HttpException({ statusCode: 400, message: ['ToNumber must be a string'], error: 'Bad Request' }, HttpStatus.BAD_REQUEST), host);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({ statusCode: 400, message: ['ToNumber must be a string'], error: 'Bad Request' });
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });
});
