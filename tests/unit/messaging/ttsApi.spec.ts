import { TTSApi } from '../../../src/Api/Messaging/TTSApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { WebhookCallbackFormat, TTSVoice, AnswerPhoneMode } from '../../../src/Common/enums/MessagingEnums';
import { ErrorResponseDTO } from '../../../src';

const AUTH = 'test-auth-token';
const BASE_URL = process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
}

function makeApi(authToken = AUTH) {
    const httpClient = makeMockHttpClient();
    return { api: new TTSApi({ URL: BASE_URL, AuthToken: authToken, httpClient }), httpClient };
}

describe('TTSApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const { api, httpClient } = makeApi('');
        const result = await api.SendMessage({
            MessageToPeople: 'Hello',
            Destinations: [{ MainPhone: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when both MessageToPeople and TemplateID are missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({ Destinations: [{ MainPhone: '+64211111111' }] });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/MessageToPeople|TemplateID/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts TemplateID in place of MessageToPeople', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts-tmpl' });
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('rejects when Destinations is empty', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({ MessageToPeople: 'Hello', Destinations: [] });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Mode is not "Test"', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            MessageToPeople: 'Hello',
            Mode: 'Live' as unknown as 'Test',
            Destinations: [{ MainPhone: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Mode/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when WebhookCallbackURL is set but WebhookCallbackFormat is missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            MessageToPeople: 'Hello',
            WebhookCallbackURL: 'https://example.com/hook',
            Destinations: [{ MainPhone: '+64211111111' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/WebhookCallbackFormat/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts WebhookCallbackFormat POST and GET', async () => {
        for (const fmt of [WebhookCallbackFormat.POST, WebhookCallbackFormat.GET]) {
            const { api, httpClient } = makeApi();
            httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts-fmt' });
            const result = await api.SendMessage({
                MessageToPeople: 'Hello',
                WebhookCallbackURL: 'https://example.com/hook',
                WebhookCallbackFormat: fmt,
                Destinations: [{ MainPhone: '+64211111111' }],
            });
            expect(result.Result).toBe('Success');
        }
    });

    it('sends Voice enum value in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts001' });
        await api.SendMessage({
            MessageToPeople: 'Hello',
            Destinations: [{ MainPhone: '+64211111111' }],
            Voice: TTSVoice.Nicole,
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Voice).toBe('Nicole');
    });

    it('sends MessageToAnswerPhones and AnswerPhoneMode in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts002' });
        await api.SendMessage({
            MessageToPeople: 'Hello',
            MessageToAnswerPhones: 'Leave a message.',
            Destinations: [{ MainPhone: '+64211111111' }],
            AnswerPhoneMode: AnswerPhoneMode.DAS,
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.MessageToAnswerPhones).toBe('Leave a message.');
        expect(payload.AnswerPhoneMode).toBe('DAS');
    });

    it('sends Keypads with numeric Tone in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts003' });
        await api.SendMessage({
            MessageToPeople: 'Press 1 for sales.',
            Destinations: [{ MainPhone: '+64211111111' }],
            Keypads: [{ Tone: 1, RouteNumber: '+6491000001', Play: 'Connecting.' }],
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Keypads[0].Tone).toBe(1);
        expect(payload.Keypads[0].RouteNumber).toBe('+6491000001');
    });

    it('sends KeypadOptionRequired and CallRoute fields in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts004' });
        await api.SendMessage({
            MessageToPeople: 'Press 1.',
            Destinations: [{ MainPhone: '+64211111111' }],
            KeypadOptionRequired: true,
            CallRouteMessageOnWrongKey: 'Invalid key.',
            CallRouteMessageToPeople: 'Connecting.',
            CallRouteMessageToOperators: 'Incoming call.',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.KeypadOptionRequired).toBe(true);
        expect(payload.CallRouteMessageOnWrongKey).toBe('Invalid key.');
        expect(payload.CallRouteMessageToPeople).toBe('Connecting.');
        expect(payload.CallRouteMessageToOperators).toBe('Incoming call.');
    });

    it('calls httpClient.post to /tts for a valid request', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts005' });
        const result = await api.SendMessage({
            MessageToPeople: 'Hello there',
            Destinations: [{ MainPhone: '+64211111111' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toContain('/tts');
        expect(result.Result).toBe('Success');
    });

});

describe('TTSApi — single-destination shorthand', () => {

    it('accepts a single ToNumber shorthand, which resolves to a MainPhone destination', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts-short1' });
        const result = await api.SendMessage({
            MessageToPeople: 'Hi',
            ToNumber: '+64211111111',
        });
        expect(result.Result).toBe('Success');
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(1);
        expect(payload.Destinations[0].MainPhone).toBe('+64211111111');
        expect(payload.Destinations[0].ToNumber).toBeUndefined();
    });

    it('splits a comma-separated ToNumber shorthand into multiple MainPhone destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts-short2' });
        await api.SendMessage({
            MessageToPeople: 'Hi',
            ToNumber: '+64211111111,+64221111111',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
        expect(payload.Destinations.map((d: any) => d.MainPhone)).toEqual([
            '+64211111111', '+64221111111',
        ]);
    });

    it('accepts GroupID and ContactID shorthand fields', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts-short3' });
        await api.SendMessage({
            MessageToPeople: 'Hi',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

    it('merges the ToNumber shorthand additively with an explicit Destinations array', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts-short4' });
        await api.SendMessage({
            MessageToPeople: 'Hi',
            ToNumber: '+64211111111',
            Destinations: [{ MainPhone: '+64221111111' }],
        });
        const payload = httpClient.post.mock.calls[0][1];
        expect(payload.Destinations).toHaveLength(2);
    });

    it('rejects an invalid ToNumber shorthand with the same phone-format error as an invalid Destinations entry', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            MessageToPeople: 'Hi',
            ToNumber: 'not-a-number',
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/phone number/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('never leaks the raw shorthand fields into the request payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'tts-short5' });
        await api.SendMessage({
            MessageToPeople: 'Hi',
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
