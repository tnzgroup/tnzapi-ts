import { StatusApi } from '../../../src/Api/Reports/StatusApi';
import { SMSReceivedApi } from '../../../src/Api/Reports/SMSReceivedApi';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { ErrorResponseDTO } from '../../../src/Common/dtos';
import { StatusApiResponseDTO, SMSReplyRecipientDTO, SMSReplyRecipientSMSReplyDTO } from '../../../src/Api/Reports/dtos';
import { IStatusArgs, ISMSReceivedArgs } from '../../../src/Api/Reports/interfaces';

// The real wire payload includes a `ReplyID` field that SMSReplyRecipientSMSReplyDTO does not
// (yet) declare — Mapper.ts copies it through onto the instance regardless (see Mapper.ts:
// it copies every source field, not just ones pre-declared on the destination). This local
// type documents that extra runtime field without resorting to `any`.
type SMSReplyRecipientSMSReplyWithReplyID = SMSReplyRecipientSMSReplyDTO & { ReplyID: string };

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

// ─────────────────────────── StatusApi ────────────────────────────

describe('StatusApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new StatusApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'sms' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/Auth/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when MessageID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ Channel: 'sms' } as unknown as IStatusArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/MessageID/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage is 0', async () => {
        const httpClient = makeMockHttpClient();
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'sms', RecordsPerPage: 0 });
        expect(result.Result).toBe('Error');
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage exceeds 999', async () => {
        const httpClient = makeMockHttpClient();
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'sms', RecordsPerPage: 1000 });
        expect(result.Result).toBe('Error');
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when Page is less than 1', async () => {
        const httpClient = makeMockHttpClient();
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'sms', Page: 0 });
        expect(result.Result).toBe('Error');
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /{channel}/{id} for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Recipients: [] });
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ MessageID: MSG_ID, Channel: 'email' });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain(`/email/${MSG_ID}`);
    });

    it('defaults to "sms" channel when Channel is not supplied', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Recipients: [] });
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ MessageID: MSG_ID });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('/sms/');
    });

    it('percent-encodes a MessageID containing reserved URL characters instead of splicing it into the path raw', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Recipients: [] });
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ MessageID: 'a/b?c#d', Channel: 'email' });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain(`/email/${encodeURIComponent('a/b?c#d')}`);
    });

    it('uses RecipientDTO for non-SMS channels', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({
            Result: 'Success',
            Recipients: [{ Recipient: '+64211111111', Status: 'Delivered', DateSent: '2025-01-01' }],
        });
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });

        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'email' }) as StatusApiResponseDTO;
        expect(result.Recipients[0]).toBeDefined();
        expect((result.Recipients[0] as SMSReplyRecipientDTO).SMSReplies).toBeUndefined();
    });

    it('uses SMSReplyRecipientDTO (with SMSReplies) for SMS channel', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({
            Result: 'Success',
            Recipients: [{
                Recipient: '+64211111111',
                Status: 'Delivered',
                SMSReplies: [{ ReplyID: 'r1', Account: 'acc', SubAccount: 'sub', DateReceived: '2025-01-01', MobileNumber: '+64211111111', MessageText: 'hello' }],
            }],
        });
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'sms' }) as StatusApiResponseDTO;
        const recipient = result.Recipients[0] as SMSReplyRecipientDTO;
        expect(Array.isArray(recipient.SMSReplies)).toBe(true);
        expect((recipient.SMSReplies[0] as SMSReplyRecipientSMSReplyWithReplyID).ReplyID).toBe('r1');
    });

    it('maps JobStatus from the real wire field name', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', JobStatus: 'Completed', Recipients: [] });
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'sms' });
        if (result instanceof ErrorResponseDTO) {
            throw new Error('expected a success response');
        }
        expect(result.JobStatus).toBe('Completed');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, Recipients: [] });
        const api = new StatusApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ MessageID: MSG_ID, Channel: 'sms' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
    });

});

// ─────────────────────────── SMSReceivedApi ────────────────────────────

describe('SMSReceivedApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Poll({ TimePeriod: 60 });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when TimePeriod is explicitly cleared (null) and no DateFrom/DateTo', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ TimePeriod: null, DateFrom: null, DateTo: null } as unknown as ISMSReceivedArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/TimePeriod/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when TimePeriod is 0', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ TimePeriod: 0 });
        expect(result.Result).toBe('Error');
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when TimePeriod exceeds 1440', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ TimePeriod: 1441 });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/1440/);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('accepts TimePeriod of 1 (minimum)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Messages: [] });
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ TimePeriod: 1 });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
    });

    it('accepts TimePeriod of 1440 (maximum)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Messages: [] });
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ TimePeriod: 1440 });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
    });

    it('rejects when RecordsPerPage exceeds 999', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ TimePeriod: 60, RecordsPerPage: 1000 });
        expect(result.Result).toBe('Error');
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when Page is less than 1', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ TimePeriod: 60, Page: 0 });
        expect(result.Result).toBe('Error');
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /sms/received with timePeriod query param', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Messages: [] });
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ TimePeriod: 60, RecordsPerPage: 10, Page: 1 });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('/sms/received');
        expect(url).toContain('timePeriod=60');
    });

    it('uses dateFrom/dateTo query params when supplied', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Messages: [] });
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Poll({ DateFrom: '2025-01-01', DateTo: '2025-01-31' });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('dateFrom=');
        expect(url).toContain('dateTo=');
        expect(url).not.toContain('timePeriod=');
    });

    it('rejects DateFrom supplied without DateTo instead of silently falling back to the default TimePeriod', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ DateFrom: '2025-01-01' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/DateFrom and DateTo must be supplied together/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects DateTo supplied without DateFrom instead of silently falling back to the default TimePeriod', async () => {
        const httpClient = makeMockHttpClient();
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ DateTo: '2025-01-31' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/DateFrom and DateTo must be supplied together/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, Messages: [] });
        const api = new SMSReceivedApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Poll({ TimePeriod: 60 });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
    });

});
