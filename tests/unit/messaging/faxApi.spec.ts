import { FaxApi } from '../../../src/Api/Messaging/FaxApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { WebhookCallbackFormat, FaxResolution } from '../../../src/Common/enums/MessagingEnums';
import { FileHandler } from '../../../src/Functions';

const AUTH = 'test-auth-token';
const BASE_URL = process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
}

function makeApi(authToken = AUTH) {
    const httpClient = makeMockHttpClient();
    return { api: new FaxApi({ URL: BASE_URL, AuthToken: authToken, httpClient }), httpClient };
}

describe('FaxApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const { api, httpClient } = makeApi('');
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when no TemplateID and no Attachments provided', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({ Destinations: [{ ToNumber: '+6492345678' }] } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/TemplateID|Attachment/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Destinations is empty', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [],
        });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Mode is not "Test"', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Mode: 'Live' as any,
            Destinations: [{ ToNumber: '+6492345678' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Mode/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts WebhookCallbackFormat POST and GET', async () => {
        for (const fmt of [WebhookCallbackFormat.POST, WebhookCallbackFormat.GET]) {
            const { api, httpClient } = makeApi();
            httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-fmt' });
            const result = await api.SendMessage({
                TemplateID: '11111111-2222-3333-4444-555555555555',
                WebhookCallbackURL: 'https://example.com/hook',
                WebhookCallbackFormat: fmt,
                Destinations: [{ ToNumber: '+6492345678' }],
            });
            expect(result.Result).toBe('Success');
        }
    });

    it('sends Resolution enum value in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax001' });
        await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
            Resolution: FaxResolution.High,
        });
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.Resolution).toBe('High');
    });

    it('sends RetryAttempts and RetryPeriod in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax002' });
        await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
            RetryAttempts: 3,
            RetryPeriod: 5,
        });
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.RetryAttempts).toBe(3);
        expect(payload.RetryPeriod).toBe(5);
    });

    it('sends watermark fields in payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax003' });
        await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
            WatermarkFolder: 'Folder01',
            WatermarkFirstPage: 'Cover.ps',
            WatermarkAllPages: 'Stamp.docx',
        });
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.WatermarkFolder).toBe('Folder01');
        expect(payload.WatermarkFirstPage).toBe('Cover.ps');
        expect(payload.WatermarkAllPages).toBe('Stamp.docx');
    });

    it('calls httpClient.post to /fax for a valid request', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax004' });
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toContain('/fax');
        expect(result.Result).toBe('Success');
    });

    it('rejects when SendTime is an invalid date string', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            SendTime: 'not-a-date',
            Destinations: [{ ToNumber: '+6492345678' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/SendTime/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when WebhookCallbackURL is set but WebhookCallbackFormat is missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            WebhookCallbackURL: 'https://example.com/hook',
            Destinations: [{ ToNumber: '+6492345678' }],
        } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/WebhookCallbackFormat/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when ToNumber is not a valid phone number', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: 'not-a-number' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Invalid Recipient/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('returns Error when Attachments contains a non-existent file path', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
            Attachments: ['/non-existent/file.pdf'],
        });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/attachment/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

});

describe('FaxApi — AddAttachment', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('silently ignores a non-existent file path and returns the api instance', async () => {
        const { api, httpClient } = makeApi();
        jest.spyOn(FileHandler, 'fileExists').mockReturnValueOnce(false);
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-at1' });
        const returned = api.AddAttachment('/non-existent/file.pdf');
        expect(returned).toBe(api);
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
        });
        // File was not added (fileExists returned false) so no attachment processing error
        expect(result.Result).toBe('Success');
        expect(httpClient.post).toHaveBeenCalledTimes(1);
    });

    it('adds file to the request payload when the path exists', async () => {
        const { api, httpClient } = makeApi();
        jest.spyOn(FileHandler, 'fileExists').mockReturnValueOnce(true);
        jest.spyOn(FileHandler, 'getBaseName').mockReturnValue('document.pdf');
        jest.spyOn(FileHandler, 'getFileData').mockResolvedValue('ZmFrZWRhdGE=');
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-at2' });
        api.AddAttachment('/real/document.pdf');
        const result = await api.SendMessage({
            TemplateID: '11111111-2222-3333-4444-555555555555',
            Destinations: [{ ToNumber: '+6492345678' }],
        });
        expect(result.Result).toBe('Success');
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.Files).toBeDefined();
        expect(payload.Files[0].Name).toBe('document.pdf');
        expect(payload.Files[0].Data).toBe('ZmFrZWRhdGE=');
    });

});

describe('FaxApi — single-destination shorthand', () => {

    const TEMPLATE_ID = '11111111-2222-3333-4444-555555555555';

    it('accepts a single ToNumber shorthand instead of Destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-short1' });
        const result = await api.SendMessage({
            TemplateID: TEMPLATE_ID,
            ToNumber: '+6492345678',
        });
        expect(result.Result).toBe('Success');
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.Destinations).toHaveLength(1);
        expect(payload.Destinations[0].ToNumber).toBe('+6492345678');
    });

    it('splits a comma-separated ToNumber shorthand into multiple destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-short2' });
        await api.SendMessage({
            TemplateID: TEMPLATE_ID,
            ToNumber: '+6492345678,+6493456789',
        });
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.Destinations).toHaveLength(2);
    });

    it('accepts GroupID and ContactID shorthand fields', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-short3' });
        await api.SendMessage({
            TemplateID: TEMPLATE_ID,
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.Destinations).toHaveLength(2);
    });

    it('merges the ToNumber shorthand additively with an explicit Destinations array', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-short4' });
        await api.SendMessage({
            TemplateID: TEMPLATE_ID,
            ToNumber: '+6492345678',
            Destinations: [{ ToNumber: '+6493456789' }],
        });
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.Destinations).toHaveLength(2);
    });

    it('rejects an invalid ToNumber shorthand with the same error as an invalid Destinations entry', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            TemplateID: TEMPLATE_ID,
            ToNumber: 'not-a-number',
        });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/phone number/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('never leaks the raw shorthand fields into the request payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'fax-short5' });
        await api.SendMessage({
            TemplateID: TEMPLATE_ID,
            ToNumber: '+6492345678',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as any;
        expect(payload.ToNumber).toBeUndefined();
        expect(payload.GroupID).toBeUndefined();
        expect(payload.ContactID).toBeUndefined();
    });

});