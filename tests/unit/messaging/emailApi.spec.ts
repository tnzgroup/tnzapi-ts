import { EmailApi } from '../../../src/Api/Messaging/EmailApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { WebhookCallbackFormat } from '../../../src/Common/enums/MessagingEnums';
import { expectNoLeakedConstructorArgs } from '../testHelpers';
import { ErrorResponseDTO, IEmailArgs } from '../../../src';

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

function makeApi(authToken = AUTH) {
    const httpClient = makeMockHttpClient();
    return { api: new EmailApi({ URL: BASE_URL, AuthToken: authToken, httpClient }), httpClient };
}

describe('EmailApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const { api, httpClient } = makeApi('');
        const result = await api.SendMessage({
            EmailSubject: 'Test', MessagePlain: 'body',
            Destinations: [{ EmailAddress: 'a@b.com' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when EmailSubject is missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            MessagePlain: 'body',
            Destinations: [{ EmailAddress: 'a@b.com' }],
        } as unknown as IEmailArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/EmailSubject/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when MessagePlain, MessageHTML and TemplateID are all missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            EmailSubject: 'Test',
            Destinations: [{ EmailAddress: 'a@b.com' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/MessagePlain|TemplateID/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts MessageHTML as the message body', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'e001' });
        const result = await api.SendMessage({
            EmailSubject: 'Test',
            MessageHTML: '<p>hello</p>',
            Destinations: [{ EmailAddress: 'a@b.com' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('accepts TemplateID in place of message body', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'e-tmpl' });
        const result = await api.SendMessage({
            EmailSubject: 'Template email',
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('rejects when Destinations is empty', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            EmailSubject: 'Test', MessagePlain: 'body', Destinations: [],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when EmailAddress is an invalid email address', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            EmailSubject: 'Test', MessagePlain: 'body',
            Destinations: [{ EmailAddress: 'not-an-email' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/EmailAddress/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Mode is not "Test"', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            EmailSubject: 'Test', MessagePlain: 'body',
            Mode: 'Production' as unknown as 'Test',
            Destinations: [{ EmailAddress: 'a@b.com' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Mode/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts WebhookCallbackFormat POST and GET', async () => {
        for (const fmt of [WebhookCallbackFormat.POST, WebhookCallbackFormat.GET]) {
            const { api, httpClient } = makeApi();
            httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'e-fmt' });
            const result = await api.SendMessage({
                EmailSubject: 'Test', MessagePlain: 'body',
                WebhookCallbackURL: 'https://example.com/hook',
                WebhookCallbackFormat: fmt,
                Destinations: [{ EmailAddress: 'a@b.com' }],
            });
            expect(result.Result).toBe('Success');
        }
    });

    it('sends FromEmail and ReplyTo correctly (not EmailFrom/EmailReplyTo)', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'e003' });
        await api.SendMessage({
            EmailSubject: 'Test', MessagePlain: 'body',
            Destinations: [{ EmailAddress: 'a@b.com' }],
            FromEmail: 'sender@company.com',
            ReplyTo: 'replies@company.com',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.FromEmail).toBe('sender@company.com');
        expect(payload.ReplyTo).toBe('replies@company.com');
        expect(payload.EmailFrom).toBeUndefined();
        expect(payload.EmailReplyTo).toBeUndefined();
    });

    it('sends inline destination personalisation fields in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'e004' });
        await api.SendMessage({
            EmailSubject: 'Hi [[FirstName]]', MessagePlain: 'body',
            Destinations: [{
                EmailAddress: 'jane@example.com',
                FirstName: 'Jane',
                LastName: 'Smith',
                Company: 'Acme',
            }],
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations[0].EmailAddress).toBe('jane@example.com');
        expect(payload.Destinations[0].FirstName).toBe('Jane');
    });

    it('calls httpClient.post with POST to /email for a valid request', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'e002' });
        await api.SendMessage({
            EmailSubject: 'Hi', MessagePlain: 'body',
            Destinations: [{ EmailAddress: 'user@example.com' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toContain('/email');
    });

});

describe('EmailApi — single-destination shorthand', () => {

    it('accepts a single EmailAddress shorthand instead of Destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'email-short1' });
        const result = await api.SendMessage({
            EmailSubject: 'Hi',
            MessagePlain: 'Hello',
            EmailAddress: 'alice@example.com',
        });
        expect(result.Result).toBe('Success');
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(1);
        expect(payload.Destinations[0].EmailAddress).toBe('alice@example.com');
    });

    it('splits a comma-separated EmailAddress shorthand into multiple destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'email-short2' });
        await api.SendMessage({
            EmailSubject: 'Hi',
            MessagePlain: 'Hello',
            EmailAddress: 'alice@example.com,bob@example.com',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
        expect(payload.Destinations.map((d: any) => d.EmailAddress)).toEqual([
            'alice@example.com', 'bob@example.com',
        ]);
    });

    it('accepts GroupID and ContactID shorthand fields', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'email-short3' });
        await api.SendMessage({
            EmailSubject: 'Hi',
            MessagePlain: 'Hello',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

    it('merges the EmailAddress shorthand additively with an explicit Destinations array', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'email-short4' });
        await api.SendMessage({
            EmailSubject: 'Hi',
            MessagePlain: 'Hello',
            EmailAddress: 'alice@example.com',
            Destinations: [{ EmailAddress: 'bob@example.com' }],
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

    it('rejects an invalid EmailAddress shorthand with the same error as an invalid Destinations entry', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            EmailSubject: 'Hi',
            MessagePlain: 'Hello',
            EmailAddress: 'not-an-email',
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/EmailAddress/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('never leaks the raw shorthand fields into the request payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'email-short5' });
        await api.SendMessage({
            EmailSubject: 'Hi',
            MessagePlain: 'Hello',
            EmailAddress: 'alice@example.com',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.EmailAddress).toBeUndefined();
        expect(payload.GroupID).toBeUndefined();
        expect(payload.ContactID).toBeUndefined();
    });

    it('never leaks the constructor-only URL/AuthToken/httpClient into the very first SendMessage payload', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'email-first1' });
        const api = new EmailApi({ URL: BASE_URL, AuthToken: 'super-secret-token', httpClient });
        await api.SendMessage({ EmailSubject: 'Hi', MessagePlain: 'Hello', EmailAddress: 'alice@example.com' });
        expectNoLeakedConstructorArgs(httpClient.post.mock.calls[0][1] as Record<string, unknown>);
    });

});