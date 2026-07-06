import { ContactListApi } from '../../../src/Api/Addressbook/Contacts/ContactListApi';
import { ContactCreateApi } from '../../../src/Api/Addressbook/Contacts/ContactCreateApi';
import { ContactDetailApi } from '../../../src/Api/Addressbook/Contacts/ContactDetailApi';
import { ContactUpdateApi } from '../../../src/Api/Addressbook/Contacts/ContactUpdateApi';
import { ContactDeleteApi } from '../../../src/Api/Addressbook/Contacts/ContactDeleteApi';
import { ContactApiResponseDTO, ContactListApiResponseDTO } from '../../../src/Api/Addressbook/Contacts/dtos';
import { ContactModel } from '../../../src/Api/Addressbook/Contacts/models';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { ErrorResponseDTO } from '../../../src/Common/dtos';
import { IContactDetailArgs, IContactUpdateArgs, IContactDeleteArgs } from '../../../src/Api/Addressbook/interfaces';
import { expectNoLeakedConstructorArgs } from '../testHelpers';

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
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run();
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /List for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run();
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('/List');
        expect(result.Result).toBe('Success');
    });

    it('passes pagination params in query string', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ RecordsPerPage: 20, Page: 3 });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('recordsPerPage=20');
        expect(url).toContain('page=3');
    });

    it('honors an explicit Page: 0 instead of silently coercing it to the default', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ Page: 0 });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('page=0');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, TotalRecords: 1, Contacts: [{ ContactID: TEST_CONTACT_UUID }] });
        const api = new ContactListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
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
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ FirstName: 'John', LastName: 'Doe' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when EmailAddress is invalid', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ FirstName: 'John', EmailAddress: 'not-an-email' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/email/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('calls POST for a valid request without email', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ FirstName: 'John', LastName: 'Doe' });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('calls POST for a valid request with valid email', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ FirstName: 'Jane', EmailAddress: 'jane@example.com' });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toBe(BASE_URL);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ HttpStatusCode: 200, Contact: { ContactID: TEST_CONTACT_UUID, FirstName: 'John' } });
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ FirstName: 'John' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as ContactApiResponseDTO).Contact?.ContactID).toBe(TEST_CONTACT_UUID);
    });

    it('never leaks the constructor-only URL/AuthToken/httpClient into the very first Run payload', async () => {
        // Regression test: the entity used to be constructed as `new ContactApiRequestDTO(args)`
        // where `args` is the internal { URL, AuthToken, httpClient } bag, and both
        // ContactModel's Object.assign and the generic Mapper copy any own property of
        // their source unconditionally — so the first Run() call on a freshly constructed
        // instance shipped the real bearer token in the JSON body.
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success' });
        const api = new ContactCreateApi({ URL: BASE_URL, AuthToken: 'super-secret-token', httpClient });
        await api.Run({ FirstName: 'John', LastName: 'Doe' });
        expectNoLeakedConstructorArgs(httpClient.post.mock.calls[0][1] as Record<string, unknown>);
    });

});

// ─────────────────────────── ContactDetailApi ────────────────────────────

describe('ContactDetailApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDetailApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ ContactID: 'CNTID001' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({} as unknown as IContactDetailArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/ContactID/i);
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

    it('percent-encodes a ContactID containing reserved URL characters instead of splicing it into the path raw', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contact: { ContactID: 'a/b?c#d' } });
        const api = new ContactDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ ContactID: 'a/b?c#d' });
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/${encodeURIComponent('a/b?c#d')}`);
    });

});

// ─────────────────────────── ContactUpdateApi ────────────────────────────

describe('ContactUpdateApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ ContactID: 'CNTID001', FirstName: 'John' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ FirstName: 'John' } as unknown as IContactUpdateArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/ContactID/i);
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
        const result = await api.Run({ FirstName: 'John' } as unknown as IContactUpdateArgs);
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

    it('never leaks the constructor-only URL/AuthToken/httpClient into the very first Run payload', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ Result: 'Success', Contact: { ContactID: 'CNTID001' } });
        const api = new ContactUpdateApi({ URL: BASE_URL, AuthToken: 'super-secret-token', httpClient });
        await api.Run({ ContactID: 'CNTID001', FirstName: 'John' });
        expectNoLeakedConstructorArgs(httpClient.patch.mock.calls[0][1] as Record<string, unknown>);
    });

});

// ─────────────────────────── ContactDeleteApi ────────────────────────────

describe('ContactDeleteApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDeleteApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ ContactID: 'CNTID001' });
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.delete).not.toHaveBeenCalled();
    });

    it('rejects when ContactID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new ContactDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({} as unknown as IContactDeleteArgs);
        expect(result.Result).toBe('Error');
        expect((result as ErrorResponseDTO).ErrorMessage[0]).toMatch(/ContactID/i);
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

// ─────────────────────────── ContactModel ────────────────────────────

describe('ContactModel — construction', () => {

    it('maps supplied fields onto the instance', () => {
        const contact = new ContactModel({ FirstName: 'Jane', LastName: 'Doe', EmailAddress: 'jane@example.com' });
        expect(contact.FirstName).toBe('Jane');
        expect(contact.LastName).toBe('Doe');
        expect(contact.EmailAddress).toBe('jane@example.com');
    });

    it('leaves fields undefined when no data is passed', () => {
        const contact = new ContactModel();
        expect(contact.FirstName).toBeUndefined();
        expect(contact.ContactID).toBeUndefined();
    });

    it('never copies URL/AuthToken/httpClient even if present in the constructor data', () => {
        // Regression test: this constructor used to do a raw `Object.assign(this, data)`,
        // bypassing Mapper.ts's NEVER_COPY denylist entirely. It now routes through Map(),
        // so it inherits that protection like every other Model class.
        const contact = new ContactModel({
            FirstName: 'Jane',
            URL: 'https://api.tnz.co.nz/api/v3.00',
            AuthToken: 'super-secret-token',
            httpClient: { get: () => {}, post: () => {} },
        });
        expect(contact.FirstName).toBe('Jane');
        const contactAsRecord = contact as unknown as Record<string, unknown>;
        expect(contactAsRecord.URL).toBeUndefined();
        expect(contactAsRecord.AuthToken).toBeUndefined();
        expect(contactAsRecord.httpClient).toBeUndefined();
    });

});