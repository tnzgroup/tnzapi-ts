import { SMSApi } from '../../../src/Api/Messaging/SMSApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { WebhookCallbackFormat, SMSFallbackMode, NotificationType } from '../../../src/Common/enums/MessagingEnums';
import { expectNoLeakedConstructorArgs } from '../testHelpers';
import { ErrorResponseDTO } from '../../../src';
import { SMSApiRequestDTO } from '../../../src/Api/Messaging/dtos';

const AUTH = 'test-auth-token';
const BASE_URL = process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };
}

function makeApi(authToken = AUTH, mockHttpClient?: jest.Mocked<IHttpClient>) {
    const httpClient = mockHttpClient ?? makeMockHttpClient();
    return { api: new SMSApi({ URL: BASE_URL, AuthToken: authToken, httpClient }), httpClient };
}

describe('SMSApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const { api, httpClient } = makeApi('');
        const result = await api.SendMessage({ Message: 'Hi', Destinations: [{ ToNumber: '+64211111111' }] });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when both Message and TemplateID are missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({ Destinations: [{ ToNumber: '+64211111111' }] });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Message/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts TemplateID in place of Message', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-tmpl' });
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('rejects when Destinations is empty', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({ Message: 'Hi', Destinations: [] });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when ToNumber is an invalid mobile number', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hi',
            Destinations: [{ ToNumber: 'not-a-number' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/ToNumber/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when SendTime is an invalid date format', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hi',
            SendTime: 'not-a-date',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/SendTime/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when WebhookCallbackURL is set but WebhookCallbackFormat is missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hi',
            WebhookCallbackURL: 'https://example.com/hook',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/WebhookCallbackFormat/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts WebhookCallbackFormat POST', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-post' });
        const result = await api.SendMessage({
            Message: 'Hi',
            WebhookCallbackURL: 'https://example.com/hook',
            WebhookCallbackFormat: WebhookCallbackFormat.POST,
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('accepts WebhookCallbackFormat GET', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-get' });
        const result = await api.SendMessage({
            Message: 'Hi',
            WebhookCallbackURL: 'https://example.com/hook',
            WebhookCallbackFormat: WebhookCallbackFormat.GET,
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('rejects when Mode is not "Test"', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hi',
            Mode: 'Live' as unknown as 'Test',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Mode/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('calls httpClient.post when all fields are valid', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg001' });
        const result = await api.SendMessage({
            Message: 'Hello',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toContain('/sms');
        expect(result.Result).toBe('Success');
    });

    it('sends FallbackMode and NotificationType in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg002' });
        await api.SendMessage({
            Message: 'Hi',
            Destinations: [{ ToNumber: '+64211111111' }],
            FallbackMode: SMSFallbackMode.Voice,
            NotificationType: NotificationType.Webhook,
            WebhookCallbackURL: 'https://example.com/hook',
            WebhookCallbackFormat: WebhookCallbackFormat.JSON,
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
        expect(payload.FallbackMode).toBe('Voice');
        expect(payload.NotificationType).toBe('Webhook');
    });

    it('sends inline destination personalisation fields in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg003' });
        await api.SendMessage({
            Message: 'Hi [[FirstName]]',
            Destinations: [{
                ToNumber: '+64211111111',
                FirstName: 'Jane',
                LastName: 'Smith',
                Company: 'Acme',
                Custom1: 'val1',
            }],
        });
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
        expect(payload.Destinations[0].ToNumber).toBe('+64211111111');
        expect(payload.Destinations[0].FirstName).toBe('Jane');
        expect(payload.Destinations[0].Custom1).toBe('val1');
    });

    it('calls httpClient.post with Mode=Test without error', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg004' });
        await api.SendMessage({
            Message: 'Test msg',
            Mode: 'Test',
            Destinations: [{ ToNumber: '+64211111111' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
    });

    it('returns Error when Attachments contains a non-existent file path', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hi',
            Destinations: [{ ToNumber: '+64211111111' }],
            Attachments: ['/non-existent/file.pdf'],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/attachment/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

});

describe('SMSApi — AddRecipient', () => {

    it('accepts a string phone number', () => {
        const { api } = makeApi();
        api.AddRecipient('+64211111111');
        // No throw expected — verify by calling SendMessage
    });

    it('accepts a ToNumber destination object without throwing', () => {
        const { api } = makeApi();
        expect(() => api.AddRecipient({ ToNumber: '+64211111111' })).not.toThrow();
    });

    it('accumulates destinations added via AddRecipient', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-ar' });
        api.AddRecipient({ ToNumber: '+64211111111' });
        api.AddRecipient({ ToNumber: '+64221111111' });
        await api.SendMessage({ Message: 'Hi' });
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
        expect(payload.Destinations).toHaveLength(2);
    });

    it('accepts an array of destination objects without throwing', () => {
        const { api } = makeApi();
        expect(() => api.AddRecipient([
            { ToNumber: '+64211111111' },
            { ToNumber: '+64221111111' },
        ])).not.toThrow();
    });

});

describe('SMSApi — single-destination shorthand', () => {

    it('accepts a single ToNumber shorthand instead of Destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-short1' });
        const result = await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111',
        });
        expect(result.Result).toBe('Success');
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
        expect(payload.Destinations).toHaveLength(1);
        expect(payload.Destinations[0].ToNumber).toBe('+64211111111');
    });

    it('splits a comma-separated ToNumber shorthand into multiple destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-short2' });
        await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111, +64221111111,+64271111111',
        });
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
        expect(payload.Destinations).toHaveLength(3);
        expect(payload.Destinations.map((d: any) => d.ToNumber)).toEqual([
            '+64211111111', '+64221111111', '+64271111111',
        ]);
    });

    it('drops empty and whitespace-only segments from a comma-separated ToNumber shorthand', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-short2b' });
        await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111,,  ,+64221111111,',
        });
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
        expect(payload.Destinations).toHaveLength(2);
        expect(payload.Destinations.map((d: any) => d.ToNumber)).toEqual([
            '+64211111111', '+64221111111',
        ]);
    });

    it('treats a comma/whitespace-only ToNumber shorthand as empty (no destinations produced)', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Message: 'Hi',
            ToNumber: ' , , ',
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts GroupID and ContactID shorthand fields', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-short3' });
        await api.SendMessage({
            Message: 'Hi',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
        expect(payload.Destinations).toHaveLength(2);
        expect(payload.Destinations[0].GroupID).toBe('4000000b-f002-4007-b00a-c00000000005');
        expect(payload.Destinations[1].ContactID).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('merges the ToNumber shorthand additively with an explicit Destinations array', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-short4' });
        await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111',
            Destinations: [{ ToNumber: '+64221111111' }],
        });
        const payload = httpClient.post.mock.calls[0][1] as SMSApiRequestDTO;
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
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-short5' });
        await api.SendMessage({
            Message: 'Hi',
            ToNumber: '+64211111111',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as Record<string, unknown>;
        expect(payload.ToNumber).toBeUndefined();
        expect(payload.GroupID).toBeUndefined();
        expect(payload.ContactID).toBeUndefined();
    });

    it('never leaks the constructor-only URL/AuthToken/httpClient into the very first SendMessage payload', async () => {
        // Regression test: the entity used to be constructed as `new SMSModel(args)` where
        // `args` is the internal { URL, AuthToken, httpClient } bag, and the generic Mapper
        // copies any own property of its source onto the destination regardless of whether
        // the destination declares it — so the first SendMessage() call on a freshly
        // constructed instance shipped the real bearer token in the JSON body.
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'msg-first1' });
        const api = new SMSApi({ URL: BASE_URL, AuthToken: 'super-secret-token', httpClient });
        await api.SendMessage({ Message: 'Hi', Destinations: [{ ToNumber: '+64211111111' }] });
        expectNoLeakedConstructorArgs(httpClient.post.mock.calls[0][1] as Record<string, unknown>);
    });

});
