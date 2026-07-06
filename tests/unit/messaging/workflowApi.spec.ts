import { WorkflowApi } from '../../../src/Api/Messaging/WorkflowApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { WebhookCallbackFormat } from '../../../src/Common/enums/MessagingEnums';
import { WorkflowApiRequestDTO } from '../../../src/Api/Messaging/dtos';
import { ErrorResponseDTO, IWorkflowArgs } from '../../../src';

const AUTH = 'test-auth-token';
const BASE_URL = process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00';
const TEMPLATE_ID = '11111111-2222-3333-4444-555555555555';

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
    return { api: new WorkflowApi({ URL: BASE_URL, AuthToken: authToken, httpClient }), httpClient };
}

describe('WorkflowApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new WorkflowApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when WorkflowTemplateID is missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        } as unknown as IWorkflowArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/WorkflowTemplateID/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Destinations is empty', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            Destinations: [],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Mode is not "Test"', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            Mode: 'Live' as unknown as IWorkflowArgs['Mode'],
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Mode/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('accepts WebhookCallbackFormat POST and GET', async () => {
        for (const fmt of [WebhookCallbackFormat.POST, WebhookCallbackFormat.GET]) {
            const { api, httpClient } = makeApi();
            httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-fmt' });
            const result = await api.SendMessage({
                WorkflowTemplateID: TEMPLATE_ID,
                WebhookCallbackURL: 'https://example.com/hook',
                WebhookCallbackFormat: fmt,
                Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
            });
            expect(result.Result).toBe('Success');
        }
    });

    it('does not send NotificationType in payload (field removed from Workflow API)', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf002' });
        await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.NotificationType).toBeUndefined();
    });

    it('maps Custom5–Custom9 on destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf003' });
        await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001', Custom5: 'v5', Custom7: 'v7', Custom9: 'v9' }],
        });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations[0].Custom5).toBe('v5');
        expect(payload.Destinations[0].Custom7).toBe('v7');
        expect(payload.Destinations[0].Custom9).toBe('v9');
    });

    it('calls httpClient.post to /workflow for a valid request', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf001' });
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toContain('/workflow');
        expect(result.Result).toBe('Success');
    });

    it('accepts an inline destination with ToNumber, EmailAddress, and MainPhone (new contact creation)', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf004' });
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            Destinations: [{
                ToNumber: '+6421000001',
                EmailAddress: 'alice@example.com',
                MainPhone: '+6491000001',
                FirstName: 'Alice',
            }],
        });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations[0].ToNumber).toBe('+6421000001');
        expect(payload.Destinations[0].EmailAddress).toBe('alice@example.com');
        expect(payload.Destinations[0].MainPhone).toBe('+6491000001');
        expect(result.Result).toBe('Success');
    });

    it('rejects when WebhookCallbackURL is set but WebhookCallbackFormat is missing', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            WebhookCallbackURL: 'https://example.com/hook',
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/WebhookCallbackFormat/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when SendTime is an invalid date string', async () => {
        const { api, httpClient } = makeApi();
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            SendTime: 'not-a-date',
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
        });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/SendTime/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

});

describe('WorkflowApi — AddRecipient', () => {

    it('accepts a string value and returns the api instance', () => {
        const { api } = makeApi();
        const result = api.AddRecipient('00000000-0000-0000-0000-000000000001');
        expect(result).toBe(api);
    });

    it('accepts an object with ContactID without throwing', () => {
        const { api } = makeApi();
        expect(() => api.AddRecipient({ ContactID: '00000000-0000-0000-0000-000000000001' })).not.toThrow();
    });

    it('accumulates destinations added via AddRecipient', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-ar' });
        api.AddRecipient({ ContactID: '00000000-0000-0000-0000-000000000001' });
        api.AddRecipient({ ContactID: '00000000-0000-0000-0000-000000000002' });
        await api.SendMessage({ WorkflowTemplateID: TEMPLATE_ID });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations).toHaveLength(2);
    });

});

describe('WorkflowApi — single-destination shorthand', () => {

    it('accepts a single ToNumber shorthand instead of Destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-short1' });
        const result = await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            ToNumber: '+6421000001',
        });
        expect(result.Result).toBe('Success');
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations).toHaveLength(1);
        expect(payload.Destinations[0].ToNumber).toBe('+6421000001');
    });

    it('accepts a single MainPhone shorthand independently of ToNumber', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-short2' });
        await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            MainPhone: '+6491000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations).toHaveLength(1);
        expect(payload.Destinations[0].MainPhone).toBe('+6491000001');
    });

    it('combines ToNumber and MainPhone shorthand fields into two separate destinations', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-short3' });
        await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            ToNumber: '+6421000001',
            MainPhone: '+6491000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations).toHaveLength(2);
        expect(payload.Destinations[0].ToNumber).toBe('+6421000001');
        expect(payload.Destinations[1].MainPhone).toBe('+6491000001');
    });

    it('accepts GroupID and ContactID shorthand fields', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-short4' });
        await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations).toHaveLength(2);
    });

    it('merges the ToNumber shorthand additively with an explicit Destinations array', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-short5' });
        await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            ToNumber: '+6421000001',
            Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000002' }],
        });
        const payload = httpClient.post.mock.calls[0][1] as WorkflowApiRequestDTO;
        expect(payload.Destinations).toHaveLength(2);
    });

    it('never leaks the raw shorthand fields into the request payload', async () => {
        const { api, httpClient } = makeApi();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', MessageID: 'wf-short6' });
        await api.SendMessage({
            WorkflowTemplateID: TEMPLATE_ID,
            ToNumber: '+6421000001',
            MainPhone: '+6491000001',
            GroupID: '4000000b-f002-4007-b00a-c00000000005',
            ContactID: '00000000-0000-0000-0000-000000000001',
        });
        const payload = httpClient.post.mock.calls[0][1] as Record<string, unknown>;
        expect(payload.ToNumber).toBeUndefined();
        expect(payload.MainPhone).toBeUndefined();
        expect(payload.GroupID).toBeUndefined();
        expect(payload.ContactID).toBeUndefined();
    });

});