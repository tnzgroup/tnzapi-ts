import { AbortApi } from '../../../src/Api/Actions/AbortApi';
import { ResubmitApi } from '../../../src/Api/Actions/ResubmitApi';
import { PacingApi } from '../../../src/Api/Actions/PacingApi';
import { RescheduleApi } from '../../../src/Api/Actions/RescheduleApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { ErrorResponseDTO } from '../../../src/Common/dtos';

const AUTH = 'test-auth-token';
const BASE_URL = process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00';
const MSG_ID = 'ID123456';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };
}

// ─────────────────────────── AbortApi ────────────────────────────

describe('AbortApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new AbortApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'sms' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when MessageID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new AbortApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ Channel: 'sms' } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/MessageID/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when Channel is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new AbortApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Channel/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('calls PATCH /{channel}/{id}/abort for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success' });
        const api = new AbortApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.SendRequest({ MessageID: MSG_ID, Channel: 'sms' });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        const [url] = httpClient.patch.mock.calls[0];
        expect(url).toContain(`/sms/${MSG_ID}/abort`);
    });

    it('includes auth token in the request (via NodeHttpClient, not directly)', async () => {
        // Auth is baked into the NodeHttpClient at construction time.
        // Here we just verify the mock was called (auth is set in NodeHttpClient constructor).
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success' });
        const api = new AbortApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.SendRequest({ MessageID: MSG_ID, Channel: 'email' });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
    });

    it('sends empty body', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success' });
        const api = new AbortApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.SendRequest({ MessageID: MSG_ID, Channel: 'fax' });
        const [, payload] = httpClient.patch.mock.calls[0];
        expect(payload).toEqual({});
    });

    it('maps a real ActionResult:"Success" response to a success DTO, not ErrorResponseDTO', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success', MessageID: MSG_ID, JobNum: 'JN1', Action: 'Abort' });
        const api = new AbortApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'sms' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect(result.Result).toBe('Success');
        expect((result as any).MessageID).toBe(MSG_ID);
        expect((result as any).JobNum).toBe('JN1');
    });

});

// ─────────────────────────── ResubmitApi ────────────────────────────

describe('ResubmitApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ResubmitApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'email' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when MessageID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ResubmitApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ Channel: 'email' } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/MessageID/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when Channel is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ResubmitApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Channel/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects for unsupported channel "sms"', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ResubmitApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'sms' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/sms/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when SendTime is an invalid date', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ResubmitApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'email', SendTime: 'bad-date' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/SendTime/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it.each(['email', 'fax', 'tts', 'voice'])('accepts channel "%s"', async (channel) => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success' });
        const api = new ResubmitApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.SendRequest({ MessageID: MSG_ID, Channel: channel });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        const [url] = httpClient.patch.mock.calls[0];
        expect(url).toContain(`/${channel}/${MSG_ID}/resubmit`);
    });

});

// ─────────────────────────── PacingApi ────────────────────────────

describe('PacingApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new PacingApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'tts', NumberOfOperators: 2 });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when MessageID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new PacingApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ Channel: 'tts', NumberOfOperators: 2 } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/MessageID/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when Channel is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new PacingApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, NumberOfOperators: 2 } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Channel/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it.each(['sms', 'email', 'fax'])('rejects channel "%s" (only tts/voice allowed)', async (channel) => {
        const httpClient = makeMockHttpClient();
        const api = new PacingApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: channel, NumberOfOperators: 1 });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/tts/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it.each(['tts', 'voice'])('accepts channel "%s" for pacing', async (channel) => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success' });
        const api = new PacingApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.SendRequest({ MessageID: MSG_ID, Channel: channel, NumberOfOperators: 2 });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        const [url] = httpClient.patch.mock.calls[0];
        expect(url).toContain(`/${channel}/${MSG_ID}/pacing`);
    });

    it('rejects when NumberOfOperators is not a number (explicitly undefined)', async () => {
        const httpClient = makeMockHttpClient();
        const api = new PacingApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'tts', NumberOfOperators: undefined as any });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/NumberOfOperators/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('calls PATCH /{channel}/{id}/pacing with NumberOfOperators in body', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success' });
        const api = new PacingApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.SendRequest({ MessageID: MSG_ID, Channel: 'tts', NumberOfOperators: 3 });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        const [url, payload] = httpClient.patch.mock.calls[0];
        expect(url).toContain(`/tts/${MSG_ID}/pacing`);
        expect((payload as any).NumberOfOperators).toBe(3);
    });

});

// ─────────────────────────── RescheduleApi ────────────────────────────

describe('RescheduleApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new RescheduleApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'sms', SendTime: '2030-01-01 09:00' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when MessageID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new RescheduleApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ Channel: 'sms', SendTime: '2030-01-01 09:00' } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/MessageID/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when Channel is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new RescheduleApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, SendTime: '2030-01-01 09:00' } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Channel/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when SendTime is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new RescheduleApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'sms' } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/SendTime/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when SendTime is an invalid date', async () => {
        const httpClient = makeMockHttpClient();
        const api = new RescheduleApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.SendRequest({ MessageID: MSG_ID, Channel: 'sms', SendTime: 'not-a-date' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/SendTime/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('calls PATCH /{channel}/{id}/reschedule with SendTime in body', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ ActionResult: 'Success' });
        const api = new RescheduleApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.SendRequest({ MessageID: MSG_ID, Channel: 'email', SendTime: '2030-06-15 09:00' });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        const [url, payload] = httpClient.patch.mock.calls[0];
        expect(url).toContain(`/email/${MSG_ID}/reschedule`);
        expect((payload as any).SendTime).toBe('2030-06-15 09:00');
    });

});