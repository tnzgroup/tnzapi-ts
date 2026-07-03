import { OptOutListApi } from '../../../src/Api/OptOut/OptOutListApi';
import { OptOutCreateApi } from '../../../src/Api/OptOut/OptOutCreateApi';
import { OptOutDetailApi } from '../../../src/Api/OptOut/OptOutDetailApi';
import { OptOutDeleteApi } from '../../../src/Api/OptOut/OptOutDeleteApi';
import { OptOut } from '../../../src/Api/OptOut';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { ErrorResponseDTO } from '../../../src/Common/dtos';

const AUTH = 'test-auth-token';
const BASE_URL = process.env.TNZ_API_URL ?? 'https://api.tnz.co.nz/api/v3.00';
const DESTINATION = '+64211234567';
const OPTOUT_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };
}

// ─────────────────────────── OptOutListApi ────────────────────────────

describe('OptOutListApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run();
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /optout/list for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', OptOuts: [] });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run();
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('/optout/list');
        expect(result.Result).toBe('Success');
    });

    it('passes pagination params in query string', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', OptOuts: [] });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ RecordsPerPage: 50, Page: 2 });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('recordsPerPage=50');
        expect(url).toContain('page=2');
    });

    it('passes optional destType filter in query string', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', OptOuts: [] });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ DestType: 'SMS' });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('destType=SMS');
    });

    it('passes optional timePeriod and contactID filters in query string', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', OptOuts: [] });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({ TimePeriod: 5, ContactID: 'contact-1' });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain('timePeriod=5');
        expect(url).toContain('contactID=contact-1');
    });

    it('maps the response array from the wire key "OptOuts" onto OptOuts', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({
            Result: 'Success',
            TotalRecords: 1,
            OptOuts: [{ ID: 'a1', Destination: '+64211111111', DestType: 'SMS' }],
        });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run();
        if (result instanceof ErrorResponseDTO) {
            throw new Error('expected a success response');
        }
        expect(result.TotalRecords).toBe(1);
        expect(Array.isArray(result.OptOuts)).toBe(true);
        expect(result.OptOuts[0].ID).toBe('a1');
        expect(result.OptOuts[0].Destination).toBe('+64211111111');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, TotalRecords: 0, OptOuts: [] });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run();
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
    });

    it('falls back to the legacy wire key "Data" when the server has not yet deployed the OptOuts rename', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({
            Result: 'Success',
            TotalRecords: 1,
            Data: [{ ID: 'a1', Destination: '+64211111111', DestType: 'SMS' }],
        });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run();
        if (result instanceof ErrorResponseDTO) {
            throw new Error('expected a success response');
        }
        expect(Array.isArray(result.OptOuts)).toBe(true);
        expect(result.OptOuts[0].ID).toBe('a1');
    });

    it('trusts a genuinely empty OptOuts: [] from a fixed server, even if a stale Data key is also present', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({
            Result: 'Success',
            TotalRecords: 0,
            OptOuts: [],
            Data: [{ ID: 'stale', Destination: '+64211111111', DestType: 'SMS' }],
        });
        const api = new OptOutListApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run();
        if (result instanceof ErrorResponseDTO) {
            throw new Error('expected a success response');
        }
        expect(result.OptOuts).toEqual([]);
    });

});

// ─────────────────────────── OptOutCreateApi ────────────────────────────

describe('OptOutCreateApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutCreateApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ Destination: DESTINATION, DestType: 'SMS' });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when Destination is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ DestType: 'SMS' } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/Destination/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('rejects when DestType is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ Destination: DESTINATION } as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/DestType/i);
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it('calls POST /optout for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', Destination: DESTINATION, DestType: 'SMS' });
        const api = new OptOutCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ Destination: DESTINATION, DestType: 'SMS' });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [url] = httpClient.post.mock.calls[0];
        expect(url).toContain('/optout');
        expect(result.Result).toBe('Success');
    });

    it('includes ContactID, StopMessage, and Notes in the request payload when provided', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', Destination: DESTINATION, DestType: 'SMS' });
        const api = new OptOutCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        await api.Run({
            Destination: DESTINATION,
            DestType: 'SMS',
            ContactID: 'contact-1',
            StopMessage: 'STOP',
            Notes: 'Requested via SMS reply',
        });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const [, payload] = httpClient.post.mock.calls[0];
        expect((payload as any).ContactID).toBe('contact-1');
        expect((payload as any).StopMessage).toBe('STOP');
        expect((payload as any).Notes).toBe('Requested via SMS reply');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ HttpStatusCode: 200, Destination: DESTINATION, DestType: 'SMS' });
        const api = new OptOutCreateApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ Destination: DESTINATION, DestType: 'SMS' });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
    });

});

// ─────────────────────────── OptOutDetailApi ────────────────────────────

describe('OptOutDetailApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutDetailApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ OptOutID: OPTOUT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('rejects when OptOutID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({} as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/OptOutID/i);
        expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('calls GET /optout/{id} for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', ID: OPTOUT_ID, Destination: DESTINATION, DestType: 'SMS' });
        const api = new OptOutDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ OptOutID: OPTOUT_ID });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toContain(`/optout/${OPTOUT_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ HttpStatusCode: 200, ID: OPTOUT_ID, Destination: DESTINATION, DestType: 'SMS' });
        const api = new OptOutDetailApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ OptOutID: OPTOUT_ID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
    });

});

// ─────────────────────────── OptOut facade ────────────────────────────
// Regression coverage for a bug where the facade assigned unbound `Run`
// method references, so calling client.OptOut.List(...) etc. crashed with
// "this.Validated is not a function" because `this` resolved to the facade
// instance instead of the underlying *Api instance.

describe('OptOut facade — method binding', () => {

    it('List() resolves without throwing and calls the http client', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', OptOuts: [] });
        const optout = new OptOut({ AuthToken: AUTH, URL: BASE_URL, httpClient } as any);
        const result = await optout.List();
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('Create() resolves without throwing and calls the http client', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.post.mockResolvedValueOnce({ Result: 'Success', Destination: DESTINATION, DestType: 'SMS' });
        const optout = new OptOut({ AuthToken: AUTH, URL: BASE_URL, httpClient } as any);
        const result = await optout.Create({ Destination: DESTINATION, DestType: 'SMS' });
        expect(httpClient.post).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('Detail() resolves without throwing and calls the http client', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', ID: OPTOUT_ID, Destination: DESTINATION, DestType: 'SMS' });
        const optout = new OptOut({ AuthToken: AUTH, URL: BASE_URL, httpClient } as any);
        const result = await optout.Detail({ OptOutID: OPTOUT_ID });
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

    it('Delete() resolves without throwing and calls the http client', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ Result: 'Success' });
        const optout = new OptOut({ AuthToken: AUTH, URL: BASE_URL, httpClient } as any);
        const result = await optout.Delete({ OptOutID: OPTOUT_ID });
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        expect(result.Result).toBe('Success');
    });

});

// ─────────────────────────── OptOutDeleteApi ────────────────────────────

describe('OptOutDeleteApi — validation', () => {

    it('rejects when AuthToken is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutDeleteApi({ URL: BASE_URL, AuthToken: '', httpClient });
        const result = await api.Run({ OptOutID: OPTOUT_ID });
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/AuthToken/i);
        expect(httpClient.delete).not.toHaveBeenCalled();
    });

    it('rejects when OptOutID is missing', async () => {
        const httpClient = makeMockHttpClient();
        const api = new OptOutDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({} as any);
        expect(result.Result).toBe('Error');
        expect((result as any).ErrorMessage[0]).toMatch(/OptOutID/i);
        expect(httpClient.delete).not.toHaveBeenCalled();
    });

    it('calls DELETE /optout/{id} for a valid request', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ Result: 'Success' });
        const api = new OptOutDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ OptOutID: OPTOUT_ID });
        expect(httpClient.delete).toHaveBeenCalledTimes(1);
        const [url] = httpClient.delete.mock.calls[0];
        expect(url).toContain(`/optout/${OPTOUT_ID}`);
        expect(result.Result).toBe('Success');
    });

    it('treats HttpStatusCode 200 as success even when the server omits Result (real server behavior)', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.delete.mockResolvedValueOnce({ HttpStatusCode: 200 });
        const api = new OptOutDeleteApi({ URL: BASE_URL, AuthToken: AUTH, httpClient });
        const result = await api.Run({ OptOutID: OPTOUT_ID });
        expect(result).not.toBeInstanceOf(ErrorResponseDTO);
    });

});