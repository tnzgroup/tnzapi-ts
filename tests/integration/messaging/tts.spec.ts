import { TNZAPI } from '../../../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMobile = process.env.TNZ_TEST_MOBILE ?? '+64211111111';

describe('TTS Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should make a TTS call', async () => {
    const data = await client.Messaging.TTS.SendMessage({
      MessageToPeople: 'Hi there!',
      Destinations: [{ MainPhone: testMobile }],
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data).toMatchObject({ Result: expect.any(String) });
  });

});