import { NodeHttpClient } from '../../../src/Common/NodeHttpClient';
import { HttpRequest } from '../../../src/Functions/HttpRequest';

jest.mock('../../../src/Functions/HttpRequest', () => ({
    HttpRequest: jest.fn(),
}));

const MockedHttpRequest = HttpRequest as jest.Mock;

const AUTH_TOKEN = 'unit-test-token-abc';
const BASE_URL = 'https://api.tnz.co.nz/api/v3.00';

describe('NodeHttpClient', () => {
    let client: NodeHttpClient;

    beforeEach(() => {
        jest.clearAllMocks();
        client = new NodeHttpClient(AUTH_TOKEN);
    });

    // ------------------------------------------------------------------ get()
    describe('get()', () => {
        it('calls HttpRequest with method GET and resolves with the response', async () => {
            const expected = { Result: 'Success', MessageID: 'msg-get-001' };
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback(expected);
                }
            );

            const result = await client.get(`${BASE_URL}/sms/msg-get-001`);

            expect(MockedHttpRequest).toHaveBeenCalledTimes(1);
            const [url, , token, method] = MockedHttpRequest.mock.calls[0];
            expect(url).toBe(`${BASE_URL}/sms/msg-get-001`);
            expect(method).toBe('GET');
            expect(token).toBe(AUTH_TOKEN);
            expect(result).toEqual(expected);
        });

        it('passes an empty default payload to HttpRequest', async () => {
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback({ Result: 'Success' });
                }
            );

            await client.get(`${BASE_URL}/sms/msg-get-002`);

            const [, payload] = MockedHttpRequest.mock.calls[0];
            // request() defaults payload to {} when not supplied
            expect(payload).toEqual({});
        });
    });

    // ----------------------------------------------------------------- post()
    describe('post()', () => {
        it('calls HttpRequest with method POST and resolves with the response', async () => {
            const body = { Message: 'Hello', Destinations: [{ ToNumber: '+64211111111' }] };
            const expected = { Result: 'Success', MessageID: 'msg-post-001' };
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback(expected);
                }
            );

            const result = await client.post(`${BASE_URL}/sms`, body);

            expect(MockedHttpRequest).toHaveBeenCalledTimes(1);
            const [url, payload, token, method] = MockedHttpRequest.mock.calls[0];
            expect(url).toBe(`${BASE_URL}/sms`);
            expect(method).toBe('POST');
            expect(token).toBe(AUTH_TOKEN);
            expect(payload).toEqual(body);
            expect(result).toEqual(expected);
        });
    });

    // ---------------------------------------------------------------- patch()
    describe('patch()', () => {
        it('calls HttpRequest with method PATCH and resolves with the response', async () => {
            const body = { SendTime: '2025-06-01 09:00' };
            const expected = { Result: 'Success' };
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback(expected);
                }
            );

            const result = await client.patch(`${BASE_URL}/sms/msg-patch-001/reschedule`, body);

            expect(MockedHttpRequest).toHaveBeenCalledTimes(1);
            const [url, payload, token, method] = MockedHttpRequest.mock.calls[0];
            expect(url).toBe(`${BASE_URL}/sms/msg-patch-001/reschedule`);
            expect(method).toBe('PATCH');
            expect(token).toBe(AUTH_TOKEN);
            expect(payload).toEqual(body);
            expect(result).toEqual(expected);
        });
    });

    // --------------------------------------------------------------- delete()
    describe('delete()', () => {
        it('calls HttpRequest with method DELETE and resolves with the response', async () => {
            const expected = { Result: 'Success' };
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback(expected);
                }
            );

            const result = await client.delete(`${BASE_URL}/optout/%2B64211111111`);

            expect(MockedHttpRequest).toHaveBeenCalledTimes(1);
            const [url, payload, token, method] = MockedHttpRequest.mock.calls[0];
            expect(url).toBe(`${BASE_URL}/optout/%2B64211111111`);
            expect(payload).toEqual({});
            expect(method).toBe('DELETE');
            expect(token).toBe(AUTH_TOKEN);
            expect(result).toEqual(expected);
        });

        it('forwards an optional payload to HttpRequest', async () => {
            const body = { Reason: 'opted-out' };
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback({ Result: 'Success' });
                }
            );

            await client.delete(`${BASE_URL}/optout/%2B64211111111`, body);

            const [, payload] = MockedHttpRequest.mock.calls[0];
            expect(payload).toEqual(body);
        });
    });

    // -------------------------------------------------------- error handling
    describe('error handling', () => {
        it('resolves (does not reject) when HttpRequest returns an error result object', async () => {
            const errorResult = { Result: 'Error', ErrorMessage: ['Unauthorized'] };
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback(errorResult);
                }
            );

            const result = await client.get(`${BASE_URL}/sms/bad-id`);

            // NodeHttpClient wraps the callback in resolve — an error DTO is a resolution, not a rejection
            expect(result).toEqual(errorResult);
        });

        it('resolves with an Unauthorized error result from HttpRequest', async () => {
            const errorResult = { Result: 'Error', ErrorMessage: ['Request failed with status code 401'] };
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback(errorResult);
                }
            );

            const result = await client.post(`${BASE_URL}/sms`, {});

            expect((result as any).Result).toBe('Error');
        });

        it('rejects when HttpRequest throws synchronously', async () => {
            MockedHttpRequest.mockImplementation(() => {
                throw new Error('Socket connection refused');
            });

            await expect(client.get(`${BASE_URL}/sms/error`)).rejects.toThrow('Socket connection refused');
        });

        it('passes authToken to every HTTP method', async () => {
            const specialToken = 'special-auth-xyz-999';
            const tokenClient = new NodeHttpClient(specialToken);
            MockedHttpRequest.mockImplementation(
                (_url: string, _payload: any, _token: string, _method: string, callback: (data: any) => void) => {
                    callback({ Result: 'Success' });
                }
            );

            await tokenClient.post(`${BASE_URL}/email`, {});

            const [, , token] = MockedHttpRequest.mock.calls[0];
            expect(token).toBe(specialToken);
        });
    });
});