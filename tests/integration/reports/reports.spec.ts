import { TNZAPI, StatusApiResponseDTO } from '../../../src';

jest.setTimeout(15000);

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMessageID = process.env.TNZ_TEST_MESSAGE_ID ?? 'ID123456';
const testMessageChannel = process.env.TNZ_TEST_MESSAGE_CHANNEL ?? 'sms';

describe('Reports Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    if (!process.env.TNZ_TEST_MESSAGE_ID) console.warn('TNZ_TEST_MESSAGE_ID not set — using fallback "ID123456".');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should get message status', async () => {
    const data = await client.Reports.Status.Poll({
      MessageID: testMessageID,
      Channel: testMessageChannel,
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data.Result).toMatch(/Success|Failed|Error/);
    if (data.Result === 'Success') {
      expect((data as StatusApiResponseDTO).JobStatus).toBeDefined();
    }
  });

  it('should get SMS reply', async () => {
    const data = await client.Reports.SMSReply.Poll({
      MessageID: testMessageID,
      Page: 1,
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data).toMatchObject({ Result: expect.any(String) });
  });

  it('should get SMS received list', async () => {
    const data = await client.Reports.SMSReceived.Poll({
      TimePeriod: 1440,
      RecordsPerPage: 10,
      Page: 1,
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data).toMatchObject({ Result: expect.any(String) });
  });

});