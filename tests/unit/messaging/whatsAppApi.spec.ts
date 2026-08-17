import { WhatsAppApi } from '../../../src/Api/Messaging/WhatsAppApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { WebhookCallbackFormat, WhatsAppFallbackMode } from '../../../src/Common/enums/MessagingEnums';
import { ErrorResponseDTO } from '../../../src';

const AUTH = 'test-auth-token';
const BASE_URL = process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
}

function makeApi(authToken = AUTH) {
    const httpClient = makeMockHttpClient();
    return { api: new WhatsAppApi({ URL: BASE_URL, AuthToken: authToken, httpClient }), httpClient };
}

describe('WhatsAppApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const { api, httpClient } = makeApi('');
        const result = await api.SendMessage({
            Message: 'Hello',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when both Message and TemplateID are missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({ Destinations: [{ ToNumber: '+64211111111' }] });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Message|TemplateID/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts TemplateID in place of Message', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-tmpl' });
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('rejects when Destinations is empty', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({ Message: 'Hello', Destinations: [] });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Mode is not "Test"', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hello',
            Mode: 'Live' as unknown as 'Test',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Mode/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts WebhookCallbackFormat POST and GET', async () => {
        for (const fmt of [WebhookCallbackFormat.POST, WebhookCallbackFormat.GET]) {
            const { api, httpClient } = makeApi();
            httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-fmt' });
            const result = await api.SendMessage({
                Message: 'Hi',
                WebhookCallbackURL: 'https://example.com/hook',
                WebhookCallbackFormat: fmt,
                Destinations: [{ ToNumber: '+64211111111' }],
            });
            expect(result.Result).toBe('Success');
        }
    });

    it('sends FallbackMode in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa001' });
        await api.SendMessage({
            Message: 'Hi',
            Destinations: [{ ToNumber: '+64211111111' }],
            FallbackMode: WhatsAppFallbackMode.SMS,
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.FallbackMode).toBe('SMS');
    });

    it('joins a multi-value FallbackMode into a comma-separated string in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa003' });
        await api.SendMessage({
            Message: 'Hi',
            Destinations: [{ ToNumber: '+64211111111' }],
            FallbackMode: [WhatsAppFallbackMode.SMS, WhatsAppFallbackMode.Voice],
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.FallbackMode).toBe('SMS, Voice');
    });

    it('sends Message (not MessageText) in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa002' });
        await api.SendMessage({
            Message: 'Hello WhatsApp',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Message).toBe('Hello WhatsApp');
        expect(payload.MessageText).toBeUndefined();
    });

    it('calls httpClient.post to /whatsapp for a valid request', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa003' });
        const result = await api.SendMessage({
            Message: 'Hello WhatsApp',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toContain('/whatsapp');
        expect(result.Result).toBe('Success');
    });

    it('rejects when WebhookCallbackURL is set but WebhookCallbackFormat is missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hello',
            WebhookCallbackURL: 'https://example.com/hook',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/WebhookCallbackFormat/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when SendTime is an invalid date string', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hello',
            SendTime: 'not-a-date',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/SendTime/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when ToNumber is an invalid phone number', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hello',
            Destinations: [{ ToNumber: 'not-a-number' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/ToNumber/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

});

describe('WhatsAppApi — AddRecipient', () => {

    it('accepts a string phone number and returns the api instance', () => {
        const { api } = makeApi();
        const result = api.AddRecipient('+64211111111');
        expect(result).toBe(api);
    });

    it('accepts an object with ToNumber without throwing', () => {
        const { api } = makeApi();
        expect(() => api.AddRecipient({ ToNumber: '+64211111111' })).not.toThrow();
    });

    it('accumulates destinations added via AddRecipient', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-ar' });
        api.AddRecipient('+64211111111');
        api.AddRecipient({ ToNumber: '+64221111111' });
        await api.SendMessage({ Message: 'Hello' });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

});

describe('WhatsAppApi — single-destination shorthand', () => {

    it('accepts a single ToNumber shorthand instead of Destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-short1' });
        const result = await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111',
        });
        expect(result.Result).toBe('Success');
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(1);
        expect(payload.Destinations[0].ToNumber).toBe('+64211111111');
    });

    it('splits a comma-separated ToNumber shorthand into multiple destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-short2' });
        await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111,+64221111111',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

    it('accepts GroupID and ContactID shorthand fields', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-short3' });
        await api.SendMessage({
            Message: 'Hi',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

    it('merges the ToNumber shorthand additively with an explicit Destinations array', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-short4' });
        await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111',
            Destinations: [{ ToNumber: '+64221111111' }],
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

    it('rejects an invalid ToNumber shorthand with the same error as an invalid Destinations entry', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hi',
            ToNumber: 'not-a-number',
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/ToNumber/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('never leaks the raw shorthand fields into the request payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wa-short5' });
        await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.ToNumber).toBeUndefined();
        expect(payload.GroupID).toBeUndefined();
        expect(payload.ContactID).toBeUndefined();
    });

});
