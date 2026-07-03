import { ContactGroupListApi } from '../../../src/Api/Addressbook/ContactGroups/ContactGroupListApi';
import { ContactGroupCreateApi } from '../../../src/Api/Addressbook/ContactGroups/ContactGroupCreateApi';
import { ContactGroupDetailApi } from '../../../src/Api/Addressbook/ContactGroups/ContactGroupDetailApi';
import { ContactGroupDeleteApi } from '../../../src/Api/Addressbook/ContactGroups/ContactGroupDeleteApi';
import { ContactGroupApiResponseDTO, ContactGroupListApiResponseDTO } from '../../../src/Api/Addressbook/ContactGroups/dtos';
import { ErrorResponseDTO } from '../../../src/Common/dtos';

// HttpRequestAsync is called directly (no IHttpClient injection) — mock the module.
jest.mock('../../../src/Functions', () => {
    const actual = jest.requireActual('../../../src/Functions');
    return {
        ...actual,
        HttpRequestAsync: jest.fn(),
    };
});

import { HttpRequestAsync } from '../../../src/Functions';

const mockHttpRequest = HttpRequestAsync as jest.Mock;

const AUTH = 'test-auth-token';
const BASE_URL = `${process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00'}/addressbook/contact`;
const CONTACT_ID = 'contact-abc-123';
const GROUP_ID = 'group-xyz-456';
const TEST_CONTACT_UUID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const TEST_GROUP_UUID = 'b2c1d0e9-8f7a-4b6c-9d3e-1a2b3c4d5e6f';
const GROUP_CODE = 'MY-GROUP';

beforeEach(() => {
    mockHttpRequest.mockReset();
});

// ─────────────────────────── ContactGroupListApi ────────────────────────────

describe('ContactGroupListApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new ContactGroupListApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const api = new ContactGroupListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({});
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage is provided but not a number', async () => {
        const api = new ContactGroupListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, RecordsPerPage: 'ten' as any });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/must be a number/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('calls GET with correct URL and default query params', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success', Groups: [] });
        const api = new ContactGroupListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/${CONTACT_ID}/Group/List`);
        expect(url).toContain('recordsPerPage=100');
        expect(url).toContain('page=1');
        expect(result.Result).toBe('Success');
    });

    it('passes custom pagination params in query string', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success', Groups: [] });
        const api = new ContactGroupListApi({ URL: BASE_URL, AuthToken: AUTH });
        await api.Run({ ContactID: CONTACT_ID, RecordsPerPage: 25, Page: 3 });
        const [url] = mockHttpRequest.mock.calls[0];
        expect(url).toContain('recordsPerPage=25');
        expect(url).toContain('page=3');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttpRequest.mockResolvedValueOnce({ HttpStatusCode: 200, Groups: [{ GroupID: TEST_GROUP_UUID }] });
        const api = new ContactGroupListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as ContactGroupListApiResponseDTO).Groups?.[0].GroupID).toBe(TEST_GROUP_UUID);
    });

});

// ─────────────────────────── ContactGroupCreateApi ────────────────────────────

describe('ContactGroupCreateApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new ContactGroupCreateApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const api = new ContactGroupCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when GroupID is missing', async () => {
        const api = new ContactGroupCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('calls PATCH /contact/{ContactID}/group for a valid request', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactGroupCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('PATCH');
        expect(url).toContain(`/${CONTACT_ID}/group`);
        expect(result.Result).toBe('Success');
    });

    it('accepts .Contact and .Group object shorthand (entity normalisation)', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactGroupCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({
            Contact: { ContactID: CONTACT_ID },
            Group: { GroupID: GROUP_ID },
        });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('PATCH');
        expect(url).toContain(`/${CONTACT_ID}/group`);
        expect(result.Result).toBe('Success');
    });

    it('calls PATCH /contact/{ContactID}/group when only GroupCode is provided', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactGroupCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupCode: GROUP_CODE });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('PATCH');
        expect(url).toContain(`/${CONTACT_ID}/group`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttpRequest.mockResolvedValueOnce({ HttpStatusCode: 200 });
        const api = new ContactGroupCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(result).toBeInstanceOf(ContactGroupApiResponseDTO);
    });

});

// ─────────────────────────── ContactGroupDetailApi ────────────────────────────

describe('ContactGroupDetailApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new ContactGroupDetailApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const api = new ContactGroupDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when GroupID is missing', async () => {
        const api = new ContactGroupDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('calls GET /contact/{ContactID}/Group/{GroupID} for a valid request', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success', Contact: {}, Group: {} });
        const api = new ContactGroupDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/${CONTACT_ID}/Group/${GROUP_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('accepts .Contact and .Group object shorthand (entity normalisation)', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactGroupDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({
            Contact: { ContactID: CONTACT_ID },
            Group: { GroupID: GROUP_ID },
        });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/${CONTACT_ID}/Group/${GROUP_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('calls GET /contact/{ContactID}/Group/{GroupCode} when only GroupCode is provided', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success', Contact: {}, Group: {} });
        const api = new ContactGroupDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupCode: GROUP_CODE });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/${CONTACT_ID}/Group/${GROUP_CODE}`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttpRequest.mockResolvedValueOnce({ HttpStatusCode: 200, Contact: { ContactID: TEST_CONTACT_UUID }, Group: { GroupID: TEST_GROUP_UUID } });
        const api = new ContactGroupDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as ContactGroupApiResponseDTO).Contact?.ContactID).toBe(TEST_CONTACT_UUID);
        expect((result as ContactGroupApiResponseDTO).Group?.GroupID).toBe(TEST_GROUP_UUID);
    });

});

// ─────────────────────────── ContactGroupDeleteApi ────────────────────────────

describe('ContactGroupDeleteApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new ContactGroupDeleteApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const api = new ContactGroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('rejects when GroupID is missing', async () => {
        const api = new ContactGroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID/i);
        expect(mockHttpRequest).not.toHaveBeenCalled();
    });

    it('calls DELETE /contact/{ContactID}/group/{GroupID} for a valid request', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactGroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(url).toContain(`/${CONTACT_ID}/group/${GROUP_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('accepts .Contact and .Group object shorthand (entity normalisation)', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactGroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({
            Contact: { ContactID: CONTACT_ID },
            Group: { GroupID: GROUP_ID },
        });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(url).toContain(`/${CONTACT_ID}/group/${GROUP_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('calls DELETE /contact/{ContactID}/group/{GroupCode} when only GroupCode is provided', async () => {
        mockHttpRequest.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactGroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupCode: GROUP_CODE });
        expect(mockHttpRequest).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttpRequest.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(url).toContain(`/${CONTACT_ID}/group/${GROUP_CODE}`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttpRequest.mockResolvedValueOnce({ HttpStatusCode: 200 });
        const api = new ContactGroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID, GroupID: GROUP_ID });
        expect(result).toBeInstanceOf(ContactGroupApiResponseDTO);
    });

});