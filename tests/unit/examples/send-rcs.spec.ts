// Smoke test for examples/messaging/send-rcs.ts.
//
// The example is a self-executing script that hits the live TNZ API, so this
// test mocks the transport layer (HttpRequest) instead of the real network,
// then verifies the script runs to completion without throwing.

import { isolateAndRequire } from './isolateAndRequire';

jest.mock('../../../src/Functions/HttpRequest', () => ({
    HttpRequest: jest.fn((_url, _payload, _authToken, _method, callback) => {
        callback({ Result: 'Success', MessageID: 'test-msg-id', JobNum: '1', Status: 'Queued' });
    }),
}));

describe('examples/messaging/send-rcs.ts', () => {

    const originalAuthToken = process.env.TNZ_AUTH_TOKEN;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        process.env.TNZ_AUTH_TOKEN = 'test-auth-token';
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        if (originalAuthToken === undefined) {
            delete process.env.TNZ_AUTH_TOKEN;
        } else {
            process.env.TNZ_AUTH_TOKEN = originalAuthToken;
        }
        jest.restoreAllMocks();
    });

    it('runs to completion without throwing, sending 5 RCS messages', async () => {
        // send-rcs.ts's IIFE only runs on the module's first require — isolateModules
        // gives it a fresh registry (and a fresh mock, from the jest.mock factory
        // above) so the script actually re-executes instead of returning cached
        // exports from a previous test/watch-mode run.
        const [httpRequestModule] = isolateAndRequire([
            '../../../src/Functions/HttpRequest',
            '../../../examples/messaging/send-rcs',
        ] as const);
        const mockHttpRequest = (httpRequestModule as { HttpRequest: jest.Mock }).HttpRequest;

        // Flush the microtask queue so the script's chained `await` calls resolve
        // (the mocked HttpRequest calls back synchronously, so one macrotask tick
        // is enough to drain the whole chain).
        await new Promise((resolve) => setImmediate(resolve));

        expect(mockHttpRequest).toHaveBeenCalledTimes(5);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

});