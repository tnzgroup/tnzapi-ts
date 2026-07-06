import { SMSReplyApi } from '../../../src/Api/Reports/SMSReplyApi';
import { SMSReplyApiResponseDTO, SMSReplyRecipientDTO, SMSReplyRecipientSMSReplyDTO } from '../../../src/Api/Reports/dtos';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { ErrorResponseDTO, ISMSReplyArgs } from '../../../src';

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

// ─────────────────────────── SMSReplyApi ────────────────────────────

describe('SMSReplyApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Poll({ MessageID: MSG_ID });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Auth/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when MessageID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({} as unknown as ISMSReplyArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/MessageID/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage is provided but is not a number', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, RecordsPerPage: 'abc' as unknown as number });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/RecordsPerPage/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage is 0 (below minimum of 1)', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, RecordsPerPage: 0 });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/RecordsPerPage/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage exceeds 999', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, RecordsPerPage: 1000 });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/RecordsPerPage/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when Page is provided but not a number', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Page: 'two' as unknown as number });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Page/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when Page is less than 1', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Page: 0 });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Page/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /sms/{messageId} for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Recipients: [] });
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ MessageID: MSG_ID });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain(`/sms/${MSG_ID}`);
    });

    it('percent-encodes a MessageID containing reserved URL characters instead of splicing it into the path raw', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Recipients: [] });
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ MessageID: 'a/b?c#d' });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain(`/sms/${encodeURIComponent('a/b?c#d')}`);
    });

    it('GET URL contains correct recordsPerPage and page query params when provided', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Recipients: [] });
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ MessageID: MSG_ID, RecordsPerPage: 25, Page: 3 });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('recordsPerPage=25');
        expect(url).toContain('page=3');
    });

    it('returns Success response when httpClient.get resolves with Result: Success', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({
            Result: 'Success',
            MessageID: MSG_ID,
            Status: 'Completed',
            Count: 1,
            Recipients: [
                {
                    Recipient: '+64211111111',
                    Status: 'Delivered',
                    SMSReplies: [
                        {
                            ReceivedID: 'r1',
                            ReceivedTimeLocal: '2025-01-01T12:00:00',
                            From: '+64211111111',
                            MessageText: 'Hello back',
                        },
                    ],
                },
            ],
        });
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID }) as SMSReplyApiResponseDTO;
        expect(result.Result).toBe('Success');
        expect(result.MessageID).toBe(MSG_ID);
        expect(Array.isArray(result.Recipients)).toBe(true);
        expect(result.Recipients[0].SMSReplies[0].ReceivedID).toBe('r1');
        expect(result.Recipients[0].SMSReplies[0].MessageText).toBe('Hello back');
    });

    it('maps JobStatus from the real wire field name', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', MessageID: MSG_ID, JobStatus: 'Completed', Recipients: [] });
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID });
        if (result instanceof ErrorResponseDTO) {
            throw new Error('expected a success response');
        }
        expect(result.JobStatus).toBe('Completed');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, Recipients: [] });
        const api = new SMSReplyApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
    });

});

describe('SMSReplyApiResponseDTO — self-wrapping', () => {

    it('wraps Recipients and SMSReplies into real DTO instances when constructed directly', () => {
        const dto = new SMSReplyApiResponseDTO({
            Result: 'Success',
            Recipients: [
                {
                    Recipient: '+64211111111',
                    SMSReplies: [
                        { ReceivedID: 'r1', From: '+64211111111', MessageText: 'Hi' },
                    ],
                },
            ],
        });
        expect(dto.Recipients[0]).toBeInstanceOf(SMSReplyRecipientDTO);
        expect(dto.Recipients[0].SMSReplies[0]).toBeInstanceOf(SMSReplyRecipientSMSReplyDTO);
    });

});