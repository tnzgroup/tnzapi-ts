import { TNZAPI } from '../../../src';
import fs from 'fs';
import path from 'path';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testFax = process.env.TNZ_TEST_FAX ?? '+6491111111';

describe('Fax Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should send a Fax', async () => {
    if (!process.env.TNZ_TEST_FAX) {
      console.warn('TNZ_TEST_FAX not set — skipping fax test (default number is an unallocated NZ range).');
      return;
    }
const filePath = path.join(__dirname, 'test.pdf');
    fs.writeFileSync(filePath, 'dummy content');
    try {
      const data = await client.Messaging.Fax.SendMessage({
        Reference: 'Test',
        Destinations: [{ Recipient: testFax }],
        Attachments: [filePath],
      });
      console.log('Response:', JSON.stringify(data, null, '  '));
      expect(data).toMatchObject({ Result: expect.any(String) });
    } finally {
      fs.unlinkSync(filePath);
    }
  });

});