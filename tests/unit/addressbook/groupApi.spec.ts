import { GroupListApi }   from '../../../src/Api/Addressbook/Groups/GroupListApi';
import { GroupCreateApi } from '../../../src/Api/Addressbook/Groups/GroupCreateApi';
import { GroupDetailApi } from '../../../src/Api/Addressbook/Groups/GroupDetailApi';
import { GroupUpdateApi } from '../../../src/Api/Addressbook/Groups/GroupUpdateApi';
import { GroupDeleteApi } from '../../../src/Api/Addressbook/Groups/GroupDeleteApi';
import { GroupApiResponseDTO, GroupListApiResponseDTO } from '../../../src/Api/Addressbook/Groups/dtos';
import { IHttpClient }    from '../../../src/Common/IHttpClient';
import { ErrorResponseDTO } from '../../../src/Common/dtos';

const AUTH     = 'test-auth-token';
const BASE_URL = `${process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00'}/addressbook/group`;
const TEST_GROUP_UUID = 'b2c1d0e9-8f7a-4b6c-9d3e-1a2b3c4d5e6f';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return {
        get:    jest.fn(),
        post:   jest.fn(),
        patch:  jest.fn(),
        delete: jest.fn(),
    };
}

// ─────────────────────────── GroupListApi ─────────────────────────────────

describe('GroupListApi', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupListApi({ URL: BASE_URL, AuthToken: '', httpClient } as any);
        const result = await api.Run();
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when RecordsPerPage is not a number', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ RecordsPerPage: 'ten' as any });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/RecordPerPage must be a number/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when Page is not a number', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ Page: 'first' as any });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Page must be a number/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET with correct URL and query params for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Groups: [] });
        const api = new GroupListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ RecordsPerPage: 25, Page: 2 });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('/List');
        expect(url).toContain('recordsPerPage=25');
        expect(url).toContain('page=2');
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, TotalRecords: 1, Groups: [{ GroupID: TEST_GROUP_UUID }] });
        const api = new GroupListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run();
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as GroupListApiResponseDTO).TotalRecords).toBe(1);
        expect((result as GroupListApiResponseDTO).Groups?.[0].GroupID).toBe(TEST_GROUP_UUID);
    });

});

// ─────────────────────────── GroupCreateApi ───────────────────────────────

describe('GroupCreateApi', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupCreateApi({ URL: BASE_URL, AuthToken: '', httpClient } as any);
        const result = await api.Run({ GroupName: 'My Group' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when GroupName is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({});
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupName/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('calls POST for a valid request and returns Success', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupName: 'My Group' });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toBe(BASE_URL);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ HttpStatusCode: 200, Group: { GroupID: TEST_GROUP_UUID, GroupName: 'My Group' } });
        const api = new GroupCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupName: 'My Group' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as GroupApiResponseDTO).Group?.GroupID).toBe(TEST_GROUP_UUID);
    });

});

// ─────────────────────────── GroupDetailApi ───────────────────────────────

describe('GroupDetailApi', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupDetailApi({ URL: BASE_URL, AuthToken: '', httpClient } as any);
        const result = await api.Run({ GroupID: 'GRP001' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when both GroupID and GroupCode are missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({});
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID or GroupCode/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /{GroupID} when GroupID is provided', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupID: 'GRP001' });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/GRP001`);
        expect(result.Result).toBe('Success');
    });

    it('calls GET /{GroupCode} when only GroupCode is provided', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupCode: 'my-group' });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/my-group`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, Group: { GroupID: TEST_GROUP_UUID } });
        const api = new GroupDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupID: TEST_GROUP_UUID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as GroupApiResponseDTO).Group?.GroupID).toBe(TEST_GROUP_UUID);
    });

});

// ─────────────────────────── GroupUpdateApi ───────────────────────────────

describe('GroupUpdateApi', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupUpdateApi({ URL: BASE_URL, AuthToken: '', httpClient } as any);
        const result = await api.Run({ GroupID: 'GRP001', GroupName: 'Updated' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('rejects when both GroupID and GroupCode are missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupName: 'Updated' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID or GroupCode/i);
        expect(httpClient.patch).not.toHaveBeenCalled();
    });

    it('calls PATCH /{GroupID} for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupID: 'GRP001', GroupName: 'Updated Name' });
        expect(httpClient.patch).toHaveBeenCalledTimes(1);
        const [url] = httpClient.patch.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/GRP001`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.patch.mockResolvedValueOnce({ HttpStatusCode: 200, Group: { GroupID: TEST_GROUP_UUID, GroupName: 'Updated Name' } });
        const api = new GroupUpdateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupID: TEST_GROUP_UUID, GroupName: 'Updated Name' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
        expect((result as GroupApiResponseDTO).Group?.GroupID).toBe(TEST_GROUP_UUID);
    });

});

// ─────────────────────────── GroupDeleteApi ───────────────────────────────

describe('GroupDeleteApi', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupDeleteApi({ URL: BASE_URL, AuthToken: '', httpClient } as any);
        const result = await api.Run({ GroupID: 'GRP001' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.delete).not.toHaveBeenCalled();
    });

    it('rejects when both GroupID and GroupCode are missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new GroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({});
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/GroupID or GroupCode/i);
        expect(httpClient.delete).not.toHaveBeenCalled();
    });

    it('calls DELETE /{GroupID} for a valid request with GroupID', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupID: 'GRP001' });
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        const [url] = httpClient.delete.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/GRP001`);
        expect(result.Result).toBe('Success');
    });

    it('calls DELETE /{GroupCode} for a valid request with only GroupCode', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ Result: 'Success' });
        const api = new GroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupCode: 'my-group' });
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        const [url] = httpClient.delete.mock.calls[0];
        expect(url).toBe(`${BASE_URL}/my-group`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ HttpStatusCode: 200 });
        const api = new GroupDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient } as any);
        const result = await api.Run({ GroupID: TEST_GROUP_UUID });
        expect(result).toBeInstanceOf(GroupApiResponseDTO);
    });

});
