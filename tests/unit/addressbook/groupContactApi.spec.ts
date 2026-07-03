import { GroupContactListApi } from '../../../src/Api/Addressbook/GroupContacts/GroupContactListApi';
import { GroupContactCreateApi } from '../../../src/Api/Addressbook/GroupContacts/GroupContactCreateApi';
import { GroupContactDetailApi } from '../../../src/Api/Addressbook/GroupContacts/GroupContactDetailApi';
import { GroupContactDeleteApi } from '../../../src/Api/Addressbook/GroupContacts/GroupContactDeleteApi';
import { GroupContactApiResponseDTO, GroupContactListApiResponseDTO } from '../../../src/Api/Addressbook/GroupContacts/dtos';
import { ErrorResponseDTO } from '../../../src/Common/dtos';

// Preserve real Map and UsefulStuff; replace only HttpRequestAsync so no real HTTP calls are made.
jest.mock('../../../src/Functions', () => {
    const actual = jest.requireActual('../../../src/Functions');
    return { ...actual, HttpRequestAsync: jest.fn() };
});

import { HttpRequestAsync } from '../../../src/Functions';

const mockHttp = HttpRequestAsync as jest.MockedFunction<typeof HttpRequestAsync>;

const AUTH = 'test-auth-token';
// Mirror the URL that GroupContact index.ts constructs: ${auth.URL}/group
const BASE_URL = `${process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00'}/addressbook/group`;
const GROUP_ID = 'test-group-id';
const GROUP_CODE = 'MY-GROUP';
const CONTACT_ID = 'test-contact-id';
const TEST_GROUP_UUID = 'b2c1d0e9-8f7a-4b6c-9d3e-1a2b3c4d5e6f';
const TEST_CONTACT_UUID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

beforeEach(() => {
    mockHttp.mockReset();
});

// ─────────────────────────── GroupContactListApi ────────────────────────────

describe('GroupContactListApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new GroupContactListApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when GroupID is missing', async () => {
        const api = new GroupContactListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({});
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage is not a number', async () => {
        const api = new GroupContactListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, RecordsPerPage: 'many' as any });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/RecordsPerPage/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('calls GET /addressbook/group/{GroupID}/contact/list with correct query params', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new GroupContactListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, RecordsPerPage: 20, Page: 2 });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttp.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/${GROUP_ID}/contact/list`);
        expect(url).toContain('recordsPerPage=20');
        expect(url).toContain('page=2');
        expect(result.Result).toBe('Success');
    });

    it('calls GET /addressbook/group/{GroupCode}/contact/list when only GroupCode is provided', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new GroupContactListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupCode: GROUP_CODE });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttp.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/${GROUP_CODE}/contact/list`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttp.mockResolvedValueOnce({ HttpStatusCode: 200, Contacts: [{ ContactID: TEST_CONTACT_UUID }] });
        const api = new GroupContactListApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as GroupContactListApiResponseDTO).Contacts?.[0].ContactID).toBe(TEST_CONTACT_UUID);
    });

});

// ─────────────────────────── GroupContactCreateApi ────────────────────────────

describe('GroupContactCreateApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new GroupContactCreateApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when GroupID is missing', async () => {
        const api = new GroupContactCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const api = new GroupContactCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('accepts .Group and .Contact object shorthand', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupContactCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({
            Group: { GroupID: GROUP_ID },
            Contact: { ContactID: CONTACT_ID },
        });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('calls PATCH /addressbook/contact/{ContactID}/group (contact-first URL, not group-first)', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupContactCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttp.mock.calls[0];
        expect(method).toBe('PATCH');
        expect(url).toContain(`/contact/${CONTACT_ID}/group`);
        expect(url).not.toContain(`/group/${GROUP_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('calls PATCH /addressbook/contact/{ContactID}/group when only GroupCode is provided, and sends GroupCode in the body', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupContactCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupCode: GROUP_CODE, ContactID: CONTACT_ID });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, payload, , method] = mockHttp.mock.calls[0];
        expect(method).toBe('PATCH');
        expect(url).toContain(`/contact/${CONTACT_ID}/group`);
        expect(JSON.parse(JSON.stringify(payload)).GroupCode).toBe(GROUP_CODE);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttp.mockResolvedValueOnce({ HttpStatusCode: 200 });
        const api = new GroupContactCreateApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(result).toBeInstanceOf(GroupContactApiResponseDTO);
    });

});

// ─────────────────────────── GroupContactDetailApi ────────────────────────────

describe('GroupContactDetailApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new GroupContactDetailApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when GroupID is missing', async () => {
        const api = new GroupContactDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const api = new GroupContactDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('calls GET /addressbook/contact/{ContactID}/group/{GroupID}', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupContactDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttp.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/contact/${CONTACT_ID}/group/${GROUP_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('calls GET /addressbook/contact/{ContactID}/group/{GroupCode} when only GroupCode is provided', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupContactDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupCode: GROUP_CODE, ContactID: CONTACT_ID });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttp.mock.calls[0];
        expect(method).toBe('GET');
        expect(url).toContain(`/contact/${CONTACT_ID}/group/${GROUP_CODE}`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttp.mockResolvedValueOnce({ HttpStatusCode: 200, Group: { GroupID: TEST_GROUP_UUID }, Contact: { ContactID: TEST_CONTACT_UUID } });
        const api = new GroupContactDetailApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as GroupContactApiResponseDTO).Group?.GroupID).toBe(TEST_GROUP_UUID);
        expect((result as GroupContactApiResponseDTO).Contact?.ContactID).toBe(TEST_CONTACT_UUID);
    });

});

// ─────────────────────────── GroupContactDeleteApi ────────────────────────────

describe('GroupContactDeleteApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const api = new GroupContactDeleteApi({ URL: BASE_URL, AuthToken: '' });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when GroupID is missing', async () => {
        const api = new GroupContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ ContactID: CONTACT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const api = new GroupContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(mockHttp).not.toHaveBeenCalled();
    });

    it('calls DELETE /addressbook/contact/{ContactID}/group/{GroupID}', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttp.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(url).toContain(`/contact/${CONTACT_ID}/group/${GROUP_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('calls DELETE /addressbook/contact/{ContactID}/group/{GroupCode} when only GroupCode is provided', async () => {
        mockHttp.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupCode: GROUP_CODE, ContactID: CONTACT_ID });
        expect(mockHttp).toHaveBeenCalledTimes(1);
        const [url, , , method] = mockHttp.mock.calls[0];
        expect(method).toBe('DELETE');
        expect(url).toContain(`/contact/${CONTACT_ID}/group/${GROUP_CODE}`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        mockHttp.mockResolvedValueOnce({ HttpStatusCode: 200 });
        const api = new GroupContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH });
        const result = await api.Run({ GroupID: GROUP_ID, ContactID: CONTACT_ID });
        expect(result).toBeInstanceOf(GroupContactApiResponseDTO);
    });

});
