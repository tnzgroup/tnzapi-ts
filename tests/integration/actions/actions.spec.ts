import { TNZAPI, ActionApiResponseDTO } from '../../../src';

jest.setTimeout(15000);

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMessageID = process.env.TNZ_TEST_MESSAGE_ID ?? 'ID123456';
const testMessageChannel = process.env.TNZ_TEST_MESSAGE_CHANNEL ?? 'sms';

describe('Actions Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    if (!process.env.TNZ_TEST_MESSAGE_ID) console.warn('TNZ_TEST_MESSAGE_ID not set — using fallback "ID123456". Actions require a PENDING/DELAYED message.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should call abort on a job', async () => {
    const data = await client.Actions.Abort.SendRequest({
      MessageID: testMessageID,
      Channel: testMessageChannel,
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data.Result).toMatch(/Success|Failed|Error/);
    if (data.Result === 'Success') {
      expect((data as ActionApiResponseDTO).MessageID).toBeDefined();
    }
  });

  it('should call resubmit on a job', async () => {
    const data = await client.Actions.Resubmit.SendRequest({
      MessageID: testMessageID,
      Channel: 'email',
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data.Result).toMatch(/Success|Failed|Error/);
    if (data.Result === 'Success') {
      expect((data as ActionApiResponseDTO).MessageID).toBeDefined();
    }
  });

  it('should call reschedule on a job', async () => {
    const data = await client.Actions.Reschedule.SendRequest({
      MessageID: testMessageID,
      Channel: testMessageChannel,
      SendTime: '2030-01-01 09:00',
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data.Result).toMatch(/Success|Failed|Error/);
    if (data.Result === 'Success') {
      expect((data as ActionApiResponseDTO).MessageID).toBeDefined();
    }
  });

  it('should call pacing on a TTS job', async () => {
    const data = await client.Actions.Pacing.SendRequest({
      MessageID: testMessageID,
      Channel: 'tts',
      NumberOfOperators: 1,
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data.Result).toMatch(/Success|Failed|Error/);
    if (data.Result === 'Success') {
      expect((data as ActionApiResponseDTO).MessageID).toBeDefined();
    }
  });

  it('should reject Resubmit for unsupported channel (sms)', async () => {
    const data = await client.Actions.Resubmit.SendRequest({
      MessageID: testMessageID,
      Channel: 'sms',
    });
    expect(data.Result).toBe('Error');
  });

  it('should reject Pacing for unsupported channel (email)', async () => {
    const data = await client.Actions.Pacing.SendRequest({
      MessageID: testMessageID,
      Channel: 'email',
      NumberOfOperators: 1,
    });
    expect(data.Result).toBe('Error');
  });

});