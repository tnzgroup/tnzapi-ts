import { TNZAPI } from '../../../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMobile = process.env.TNZ_TEST_MOBILE ?? '+64211111111';

describe('WhatsApp Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should send a WhatsApp message', async () => {
    const data = await client.Messaging.WhatsApp.SendMessage({
      Message: 'Test WhatsApp message',
      Destinations: [{ ToNumber: testMobile }],
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data).toMatchObject({ Result: expect.any(String) });
  });

});