import { TNZAPI } from '../../../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMobile = process.env.TNZ_TEST_MOBILE;

const describeSuite = authToken && testMobile ? describe : describe.skip;

describeSuite('RCS Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should send an RCS message', async () => {
    const data = await client.Messaging.RCS.SendMessage({
      Message: 'Test RCS message',
      Destinations: [{ ToNumber: testMobile! }],
      Mode: 'Test',
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data).toMatchObject({ Result: expect.any(String) });
  });

});