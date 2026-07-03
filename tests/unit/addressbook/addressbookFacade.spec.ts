import { Addressbook } from '../../../src/Api/Addressbook';
import { IHttpClient } from '../../../src/Common/IHttpClient';
import { ITNZAuthArgs } from '../../../src/interfaces';

function makeMockHttpClient(): jest.Mocked<IHttpClient> {
    return {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    };
}

// ITNZAuthArgs doesn't declare httpClient, but Addressbook and every sub-facade
// forward it through untouched via `{ ...auth, URL: ... }`, so a real IHttpClient
// here is honoured all the way down to the leaf Api classes.
interface IAddressbookTestArgs extends ITNZAuthArgs {
    httpClient: IHttpClient;
}

// Regression coverage for the facade's base-path composition: every
// tests/unit/addressbook/*.spec.ts file instantiates its Api class directly
// with a hand-built URL, bypassing `Addressbook` entirely, so a wrong
// segment here (e.g. `/address-book` vs `/addressbook`) previously went
// undetected — see 29e8c93.
describe('Addressbook facade — URL composition', () => {

    const AUTH_URL = 'https://api.tnz.co.nz/api/v3.00';
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    it('composes /addressbook/contact for Contact sub-API calls', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Contacts: [] });

        const authArgs: IAddressbookTestArgs = { AuthToken: 'test-auth-token', URL: AUTH_URL, httpClient };
        const addressbook = new Addressbook(authArgs);
        await addressbook.Contact.List();

        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toMatch(new RegExp(`^${escapeRegExp(AUTH_URL)}/addressbook/contact(?:[/?]|$)`));
    });

    it('composes /addressbook/group for Group sub-API calls', async () => {
        const httpClient = makeMockHttpClient();
        httpClient.get.mockResolvedValueOnce({ Result: 'Success', Groups: [] });

        const authArgs: IAddressbookTestArgs = { AuthToken: 'test-auth-token', URL: AUTH_URL, httpClient };
        const addressbook = new Addressbook(authArgs);
        await addressbook.Group.List();

        expect(httpClient.get).toHaveBeenCalledTimes(1);
        const [url] = httpClient.get.mock.calls[0];
        expect(url).toMatch(new RegExp(`^${escapeRegExp(AUTH_URL)}/addressbook/group(?:[/?]|$)`));
    });
});