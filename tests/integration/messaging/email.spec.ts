import { TNZAPI } from '../../../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testEmail = process.env.TNZ_TEST_EMAIL ?? 'test@example.com';

describe('Email Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should send an Email', async () => {
    const data = await client.Messaging.Email.SendMessage({
      FromEmail: 'from@test.com',
      EmailSubject: 'Test Email',
      MessagePlain: 'Test Email Body',
      Destinations: [{ EmailAddress: testEmail }],
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data).toMatchObject({ Result: expect.any(String) });
  });

});