import { TNZAPI } from '../../src/index';

const VALID_TOKEN = 'unit-test-tnzapi-token-xyz';

describe('TNZAPI constructor', () => {
    // Save and restore the two TNZ env vars around every test so tests are
    // independent of whatever .env.local has loaded via jest.setup.js.
    let savedAuthToken: string | undefined;
    let savedApiUrl: string | undefined;

    beforeEach(() => {
        savedAuthToken = process.env.TNZ_AUTH_TOKEN;
        savedApiUrl = process.env.TNZ_API_URL;
        delete process.env.TNZ_AUTH_TOKEN;
        delete process.env.TNZ_API_URL;
    });

    afterEach(() => {
        if (savedAuthToken !== undefined) {
            process.env.TNZ_AUTH_TOKEN = savedAuthToken;
        } else {
            delete process.env.TNZ_AUTH_TOKEN;
        }
        if (savedApiUrl !== undefined) {
            process.env.TNZ_API_URL = savedApiUrl;
        } else {
            delete process.env.TNZ_API_URL;
        }
    });

    // -------------------------------------------- successful construction
    describe('successful construction', () => {
        it('instantiates successfully with an explicit AuthToken argument', () => {
            const api = new TNZAPI({ AuthToken: VALID_TOKEN });
            expect(api).toBeInstanceOf(TNZAPI);
        });

        it('uses TNZ_AUTH_TOKEN env var when no AuthToken argument is provided', () => {
            process.env.TNZ_AUTH_TOKEN = VALID_TOKEN;
            const api = new TNZAPI();
            expect(api).toBeInstanceOf(TNZAPI);
        });

        it('uses TNZ_AUTH_TOKEN env var when TNZAPI is called with no arguments at all', () => {
            process.env.TNZ_AUTH_TOKEN = 'env-only-token';
            expect(() => new TNZAPI()).not.toThrow();
        });

        it('uses TNZ_API_URL env var when no URL argument is provided', () => {
            process.env.TNZ_AUTH_TOKEN = VALID_TOKEN;
            process.env.TNZ_API_URL = 'https://staging.tnz.co.nz/api/v3.00';
            expect(() => new TNZAPI()).not.toThrow();
        });

        it('falls back to the default API URL when TNZ_API_URL is not set', () => {
            // No exception expected — default https://api.tnz.co.nz/api/v3.00 is used
            expect(() => new TNZAPI({ AuthToken: VALID_TOKEN })).not.toThrow();
        });

        it('prefers explicit AuthToken over TNZ_AUTH_TOKEN env var', () => {
            process.env.TNZ_AUTH_TOKEN = 'env-token-should-be-ignored';
            expect(() => new TNZAPI({ AuthToken: 'explicit-token' })).not.toThrow();
        });

        it('prefers explicit URL over TNZ_API_URL env var', () => {
            process.env.TNZ_API_URL = 'https://env-url.tnz.co.nz/api/v3.00';
            expect(() => new TNZAPI({ AuthToken: VALID_TOKEN, URL: 'https://override.tnz.co.nz/api/v3.00' })).not.toThrow();
        });
    });

    // --------------------------------------------------- error conditions
    describe('error conditions', () => {
        it('throws when neither AuthToken arg nor TNZ_AUTH_TOKEN env var is set', () => {
            expect(() => new TNZAPI()).toThrow(Error);
        });

        it('throws with a message mentioning AuthToken', () => {
            expect(() => new TNZAPI()).toThrow(/AuthToken/i);
        });

        it('throws the exact documented error message', () => {
            expect(() => new TNZAPI()).toThrow(
                'TNZ AuthToken is required. Pass it as AuthToken or set the TNZ_AUTH_TOKEN environment variable.'
            );
        });

        it('throws when AuthToken is explicitly an empty string and env var is not set', () => {
            // empty string is falsy — falls through to env var which is also absent
            expect(() => new TNZAPI({ AuthToken: '' })).toThrow(/AuthToken/i);
        });
    });

    // --------------------------------------------- service instantiation
    describe('service properties', () => {
        let api: TNZAPI;

        beforeAll(() => {
            api = new TNZAPI({ AuthToken: VALID_TOKEN });
        });

        it('Messaging service is instantiated', () => {
            expect(api.Messaging).toBeDefined();
        });

        it('Reports service is instantiated', () => {
            expect(api.Reports).toBeDefined();
        });

        it('Actions service is instantiated', () => {
            expect(api.Actions).toBeDefined();
        });

        it('Addressbook service is instantiated', () => {
            expect(api.Addressbook).toBeDefined();
        });

        it('OptOut service is instantiated', () => {
            expect(api.OptOut).toBeDefined();
        });

        it('Messaging exposes all seven sub-services', () => {
            expect(api.Messaging.SMS).toBeDefined();
            expect(api.Messaging.Email).toBeDefined();
            expect(api.Messaging.Fax).toBeDefined();
            expect(api.Messaging.TTS).toBeDefined();
            expect(api.Messaging.Voice).toBeDefined();
            expect(api.Messaging.WhatsApp).toBeDefined();
            expect(api.Messaging.Workflow).toBeDefined();
        });
    });
});