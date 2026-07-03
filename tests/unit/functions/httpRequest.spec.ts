import * as https from 'https';
import * as http from 'http';
import { GetHostDetails, HttpRequest, HttpRequestAsync } from '../../../src/Functions/HttpRequest';

// Mock the transport modules so no real network calls are made.
// jest.mock is hoisted before imports, so HttpRequest.ts picks up the mocks
// when it reads `https.request` / `http.request` at call time.
jest.mock('https');
jest.mock('http');

describe('GetHostDetails', () => {

    it('parses a standard HTTPS URL', () => {
        const result = GetHostDetails('https://api.tnz.co.nz/api/v3.00');
        expect(result!.Host).toBe('api.tnz.co.nz');
        expect(result!.Port).toBe(443);
        expect(result!.Path).toBe('/api/v3.00');
        expect(result!.Protocol).toBe('https');
    });

    it('parses a standard HTTP URL', () => {
        const result = GetHostDetails('http://localhost/api');
        expect(result!.Host).toBe('localhost');
        expect(result!.Port).toBe(80);
        expect(result!.Path).toBe('/api');
        expect(result!.Protocol).toBe('http');
    });

    it('parses a URL with a custom port', () => {
        const result = GetHostDetails('https://staging.example.com:8443/api/v3.00');
        expect(result!.Host).toBe('staging.example.com');
        expect(result!.Port).toBe(8443);
        expect(result!.Path).toBe('/api/v3.00');
    });

    it('parses an HTTP URL with a non-standard port', () => {
        const result = GetHostDetails('http://localhost:3000/path');
        expect(result!.Host).toBe('localhost');
        expect(result!.Port).toBe(3000);
        expect(result!.Path).toBe('/path');
    });

    it('parses a URL with a query string', () => {
        const result = GetHostDetails('https://api.example.com/data?page=1&size=10');
        expect(result!.Path).toBe('/data?page=1&size=10');
    });

    it('returns undefined for a completely invalid URL', () => {
        expect(GetHostDetails('not-a-url')).toBeUndefined();
    });

    it('returns undefined for an empty string', () => {
        expect(GetHostDetails('')).toBeUndefined();
    });

    it('returns undefined for a non-http/https protocol', () => {
        expect(GetHostDetails('ftp://example.com/file')).toBeUndefined();
    });

    it('parses root path correctly when no path is given', () => {
        const result = GetHostDetails('https://api.example.com');
        expect(result!.Path).toBe('/');
    });

});

// ---------------------------------------------------------------------------
// Helpers for HttpRequest / HttpRequestAsync tests
// ---------------------------------------------------------------------------

interface MockResponse {
    statusCode: number;
    setEncoding: jest.Mock;
    on: jest.Mock;
    emit(event: string, ...args: unknown[]): void;
}

interface MockRequest {
    setTimeout: jest.Mock;
    write: jest.Mock;
    end: jest.Mock;
    destroy: jest.Mock;
    on: jest.Mock;
    emit(event: string, ...args: unknown[]): void;
}

function createMockResponse(statusCode: number): MockResponse {
    const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
    return {
        statusCode,
        setEncoding: jest.fn(),
        on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
            if (!handlers[event]) handlers[event] = [];
            handlers[event].push(cb);
        }),
        emit(event: string, ...args: unknown[]) {
            (handlers[event] ?? []).forEach(cb => cb(...args));
        },
    };
}

function createMockRequest(): MockRequest {
    const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
    return {
        setTimeout: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        destroy: jest.fn(),
        on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
            if (!handlers[event]) handlers[event] = [];
            handlers[event].push(cb);
        }),
        emit(event: string, ...args: unknown[]) {
            (handlers[event] ?? []).forEach(cb => cb(...args));
        },
    };
}

// ---------------------------------------------------------------------------
describe('HttpRequest', () => {

    const TEST_URL = 'https://api.example.com/api/v3.00/sms';
    const AUTH_TOKEN = 'test-bearer-token';

    beforeEach(() => {
        jest.resetAllMocks();
        delete process.env['TNZ_IGNORE_SSL'];
    });

    it('resolves with parsed JSON body and HttpStatusCode for a 2xx response', async () => {
        const res = createMockResponse(200);
        const req = createMockRequest();
        (https.request as jest.Mock).mockImplementation(
            (_opts: unknown, cb: (res: MockResponse) => void) => { cb(res); return req; }
        );

        const promise = new Promise<any>(resolve => {
            HttpRequest(TEST_URL, { Message: 'Hi' }, AUTH_TOKEN, 'POST', resolve);
        });

        res.emit('data', '{"Result":"Success","MessageID":"msg-abc-123"}');
        res.emit('end');

        const result = await promise;
        expect(result.HttpStatusCode).toBe(200);
        expect(result.Result).toBe('Success');
        expect(result.MessageID).toBe('msg-abc-123');
    });

    it('resolves with HttpStatusCode and Result:"Success" for a 2xx empty body (e.g. 204)', async () => {
        const res = createMockResponse(204);
        const req = createMockRequest();
        (https.request as jest.Mock).mockImplementation(
            (_opts: unknown, cb: (res: MockResponse) => void) => { cb(res); return req; }
        );

        const promise = new Promise<any>(resolve => {
            HttpRequest(TEST_URL, null, AUTH_TOKEN, 'DELETE', resolve);
        });

        // No data chunk — body accumulates as empty string
        res.emit('end');

        const result = await promise;
        expect(result.HttpStatusCode).toBe(204);
        expect(result.Result).toBe('Success');
    });

    it('resolves with HttpStatusCode and parsed JSON body for a non-2xx response with valid JSON', async () => {
        const res = createMockResponse(400);
        const req = createMockRequest();
        (https.request as jest.Mock).mockImplementation(
            (_opts: unknown, cb: (res: MockResponse) => void) => { cb(res); return req; }
        );

        const promise = new Promise<any>(resolve => {
            HttpRequest(TEST_URL, {}, AUTH_TOKEN, 'POST', resolve);
        });

        res.emit('data', '{"Result":"Failed","ErrorMessage":["Recipient is required"]}');
        res.emit('end');

        const result = await promise;
        expect(result.HttpStatusCode).toBe(400);
        expect(result.Result).toBe('Failed');
        expect(result.ErrorMessage).toContain('Recipient is required');
    });

    it('resolves with Result:"Error" and an ErrorMessage for a non-2xx response with non-JSON body', async () => {
        const res = createMockResponse(500);
        const req = createMockRequest();
        (https.request as jest.Mock).mockImplementation(
            (_opts: unknown, cb: (res: MockResponse) => void) => { cb(res); return req; }
        );

        const promise = new Promise<any>(resolve => {
            HttpRequest(TEST_URL, {}, AUTH_TOKEN, 'POST', resolve);
        });

        res.emit('data', 'Internal Server Error');
        res.emit('end');

        const result = await promise;
        expect(result.HttpStatusCode).toBe(500);
        expect(result.Result).toBe('Error');
        expect(result.ErrorMessage[0]).toMatch(/Request failed with status code 500/);
    });

    it('resolves with Result:"Error" when req.on("error") fires', async () => {
        const req = createMockRequest();
        // Return req without calling cb(res) — the error fires on the request object
        (https.request as jest.Mock).mockImplementation(
            (_opts: unknown, _cb: unknown) => req
        );

        const promise = new Promise<any>(resolve => {
            HttpRequest(TEST_URL, {}, AUTH_TOKEN, 'POST', resolve);
        });

        // By the time HttpRequest returns, req.on('error', ...) is already registered
        req.emit('error', new Error('connection refused'));

        const result = await promise;
        expect(result.Result).toBe('Error');
        expect(result.ErrorMessage[0]).toBe('connection refused');
    });

    it('calls back synchronously with Result:"Error" and ErrorMessage:["Invalid URL"] for an invalid URL', () => {
        let received: any;
        HttpRequest('not-a-valid-url', {}, AUTH_TOKEN, 'POST', data => { received = data; });
        expect(received.Result).toBe('Error');
        expect(received.ErrorMessage).toEqual(['Invalid URL']);
        // GetHostDetails returned undefined — no network call should be made
        expect(https.request).not.toHaveBeenCalled();
    });

    it('sets the Authorization: Bearer header with the provided auth token', async () => {
        const res = createMockResponse(200);
        const req = createMockRequest();
        let capturedOptions: any;
        (https.request as jest.Mock).mockImplementation(
            (opts: unknown, cb: (res: MockResponse) => void) => {
                capturedOptions = opts;
                cb(res);
                return req;
            }
        );

        const promise = new Promise<any>(resolve => {
            HttpRequest(TEST_URL, null, 'my-secret-token', 'GET', resolve);
        });

        res.emit('data', '{"Result":"Success"}');
        res.emit('end');

        await promise;
        expect((capturedOptions as any).headers['Authorization']).toBe('Bearer my-secret-token');
    });

    it('does not include Content-Length or call req.write for GET requests', async () => {
        const res = createMockResponse(200);
        const req = createMockRequest();
        let capturedOptions: any;
        (https.request as jest.Mock).mockImplementation(
            (opts: unknown, cb: (res: MockResponse) => void) => {
                capturedOptions = opts;
                cb(res);
                return req;
            }
        );

        const promise = new Promise<any>(resolve => {
            HttpRequest(TEST_URL, null, AUTH_TOKEN, 'GET', resolve);
        });

        res.emit('data', '{"Result":"Success"}');
        res.emit('end');

        await promise;
        expect((capturedOptions as any).headers['Content-Length']).toBeUndefined();
        expect(req.write).not.toHaveBeenCalled();
    });

});

// ---------------------------------------------------------------------------
describe('HttpRequestAsync', () => {

    const TEST_URL = 'https://api.example.com/api/v3.00/email';
    const AUTH_TOKEN = 'async-bearer-token';

    beforeEach(() => {
        jest.resetAllMocks();
        delete process.env['TNZ_IGNORE_SSL'];
    });

    it('resolves with the same data that HttpRequest would pass to its callback', async () => {
        const res = createMockResponse(200);
        const req = createMockRequest();
        (https.request as jest.Mock).mockImplementation(
            (_opts: unknown, cb: (res: MockResponse) => void) => { cb(res); return req; }
        );

        const promise = HttpRequestAsync(TEST_URL, { Subject: 'Hello' }, AUTH_TOKEN, 'POST');

        res.emit('data', '{"Result":"Success","MessageID":"email-xyz"}');
        res.emit('end');

        const result = await promise;
        expect(result.HttpStatusCode).toBe(200);
        expect(result.Result).toBe('Success');
        expect(result.MessageID).toBe('email-xyz');
    });

    it('resolves (not rejects) even when the server returns a non-2xx response', async () => {
        const res = createMockResponse(401);
        const req = createMockRequest();
        (https.request as jest.Mock).mockImplementation(
            (_opts: unknown, cb: (res: MockResponse) => void) => { cb(res); return req; }
        );

        const promise = HttpRequestAsync(TEST_URL, {}, AUTH_TOKEN, 'POST');

        res.emit('data', '{"Result":"Unauthorized","ErrorMessage":["Token invalid"]}');
        res.emit('end');

        const result = await promise;
        expect(result.HttpStatusCode).toBe(401);
        expect(result.Result).toBe('Unauthorized');
    });

});