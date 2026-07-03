import { TNZAPI } from '../../../src';
import fs from 'fs';
import path from 'path';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMobile = process.env.TNZ_TEST_MOBILE ?? '+64211111111';

describe('Voice Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should make a Voice call', async () => {
    // Unique per process: this file is also re-imported (and re-run concurrently)
    // by tests/messaging.spec.ts, so a fixed filename races on write/unlink.
    const filePath = path.join(__dirname, `test-${process.pid}.wav`);
    fs.writeFileSync(filePath, 'dummy content');
    try {
      const data = await client.Messaging.Voice.SendMessage({
        Destinations: [{ MainPhone: testMobile }],
        VoiceFiles: [{ Name: 'MessageToPeople', File: filePath }],
      });
      console.log('Response:', JSON.stringify(data, null, '  '));
      expect(data).toMatchObject({ Result: expect.any(String) });
    } finally {
      fs.unlinkSync(filePath);
    }
  });

});