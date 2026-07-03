import { ContactListApi } from '../../../src/Api/Addressbook/Contacts/ContactListApi';
import { ContactCreateApi } from '../../../src/Api/Addressbook/Contacts/ContactCreateApi';
import { ContactDetailApi } from '../../../src/Api/Addressbook/Contacts/ContactDetailApi';
import { ContactUpdateApi } from '../../../src/Api/Addressbook/Contacts/ContactUpdateApi';
import { ContactDeleteApi } from '../../../src/Api/Addressbook/Contacts/ContactDeleteApi';
import { ContactApiResponseDTO, ContactListApiResponseDTO } from '../../../src/Api/Addressbook/Contacts/dtos';
import { ContactModel } from '../../../src/Api/Addressbook/Contacts/models';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { ErrorResponseDTO } from '../../../src/Common/dtos';

const AUTH = 'test-auth-token';
const BASE_URL = `${process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00'}/addressbook/contact`;
const TEST_CONTACT_UUID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };
}

// ─────────────────────────── ContactListApi ────────────────────────────

describe('ContactListApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: '', httpClient } as any);
        const result = await api.Run();
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /List for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run();
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('/List');
        expect(result.Result).toBe('Success');
    });

    it('passes pagination params in query string', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        await api.Run({ RecordsPerPage: 20, Page: 3 });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('recordsPerPage=20');
        expect(url).toContain('page=3');
    });

    it('honors an explicit Page: 0 instead of silently coercing it to the default', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        await api.Run({ Page: 0 });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('page=0');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, TotalRecords: 1, Contacts: [{ ContactID: TEST_CONTACT_UUID }] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run();
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as ContactListApiResponseDTO).TotalRecords).toBe(1);
        expect((result as ContactListApiResponseDTO).Contacts[0].ContactID).toBe(TEST_CONTACT_UUID);
    });

});

// ─────────────────────────── ContactCreateApi ────────────────────────────

describe('ContactCreateApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: '', httpClient } as any);
        const result = await api.Run({ FirstName: 'John', LastName: 'Doe' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when EmailAddress is invalid', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ FirstName: 'John', EmailAddress: 'not-an-email' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/email/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('calls POST for a valid request without email', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ FirstName: 'John', LastName: 'Doe' });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('calls POST for a valid request with valid email', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ FirstName: 'Jane', EmailAddress: 'jane@example.com' });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toBe(BASE_URL);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ HttpStatusCode: 200, Contact: { ContactID: TEST_CONTACT_UUID, FirstName: 'John' } });
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ FirstName: 'John' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as ContactApiResponseDTO).Contact?.ContactID).toBe(TEST_CONTACT_UUID);
    });

});

// ─────────────────────────── ContactDetailApi ────────────────────────────

describe('ContactDetailApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDetailApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ ContactID: 'CNTID001' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({} as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /addressbook/contact/{id} for a valid request and returns Success', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contact: { ContactID: 'CNTID001' } });
        const api = new ContactDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ ContactID: 'CNTID001' });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/CNTID001`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, Contact: { ContactID: TEST_CONTACT_UUID } });
        const api = new ContactDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ ContactID: TEST_CONTACT_UUID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as ContactApiResponseDTO).Contact?.ContactID).toBe(TEST_CONTACT_UUID);
    });

});

// ─────────────────────────── ContactUpdateApi ────────────────────────────

describe('ContactUpdateApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ ContactID: 'CNTID001', FirstName: 'John' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ FirstName: 'John' } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('calls PATCH /addressbook/contact/{id} for a valid request with payload', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ Result: 'Success', Contact: { ContactID: 'CNTID001', FirstName: 'John' } });
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ ContactID: 'CNTID001', FirstName: 'John' });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        const [url] = httpClient.patch.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/CNTID001`);
    });

    it('returns Success response', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ Result: 'Success', Contact: { ContactID: 'CNTID001', FirstName: 'Updated' } });
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ ContactID: 'CNTID001', FirstName: 'Updated' });
        expect(result.Result).toBe('Success');
    });

    it('wraps a successful response in a real ContactApiResponseDTO with Contact as a ContactModel', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ Result: 'Success', Contact: { ContactID: 'CNTID001', FirstName: 'Updated' } });
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ ContactID: 'CNTID001', FirstName: 'Updated' });
        expect(result).toBeInstanceOf(ContactApiResponseDTO);
        expect((result as ContactApiResponseDTO).Contact).toBeInstanceOf(ContactModel);
    });

    it('wraps a failed validation response in a real ErrorResponseDTO', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ FirstName: 'John' } as any);
        expect(result).toBeInstanceOf(ErrorResponseDTO);
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ HttpStatusCode: 200, Contact: { ContactID: TEST_CONTACT_UUID, FirstName: 'Updated' } });
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ ContactID: TEST_CONTACT_UUID, FirstName: 'Updated' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as ContactApiResponseDTO).Contact?.ContactID).toBe(TEST_CONTACT_UUID);
    });

});

// ─────────────────────────── ContactDeleteApi ────────────────────────────

describe('ContactDeleteApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDeleteApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ ContactID: 'CNTID001' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.delete).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({} as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/ContactID/i);
        expect(httpClient.delete).not.toHaveBeenCalled();
    });

    it('calls DELETE /addressbook/contact/{id} for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ ContactID: 'CNTID001' });
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        const [url] = httpClient.delete.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/CNTID001`);
    });

    it('returns Success response', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ ContactID: 'CNTID001' });
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ HttpStatusCode: 200 });
        const api = new ContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ ContactID: TEST_CONTACT_UUID });
        expect(result).toBeInstanceOf(ContactApiResponseDTO);
    });

});