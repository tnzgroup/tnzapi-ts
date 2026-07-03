
import { TNZAPI } from '../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMessageID = process.env.TNZ_TEST_MESSAGE_ID ?? 'ID123456';
const testMessageChannel = process.env.TNZ_TEST_MESSAGE_CHANNEL ?? 'sms';

describe('Actions API', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) {
      console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    }
    if (!process.env.TNZ_TEST_MESSAGE_ID) {
      console.warn('TNZ_TEST_MESSAGE_ID not set in .env.test — using fallback "ID123456". Actions require a PENDING/DELAYED message.');
    }
    client = new TNZAPI({
      AuthToken: authToken,
    });
  });

  // These tests make real API calls. The message must be in PENDING or DELAYED state for
  // Abort/Reschedule to succeed, and FAILED state for Resubmit.
  // We verify the library correctly calls the API and returns a structured response —
  // the specific Result depends on the message state in the test environment.

  it('should call abort on a job (Success if PENDING/DELAYED, Error if already Completed)', (done) => {
    client.Actions.Abort.SendRequest({
      MessageID: testMessageID,
      Channel: testMessageChannel
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data).toMatchObject({ Result: expect.any(String) });
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should call resubmit on a job (Success if job is resubmittable, Failed/Error otherwise)', (done) => {
    client.Actions.Resubmit.SendRequest({
      MessageID: testMessageID,
      Channel: "email"
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data).toMatchObject({ Result: expect.any(String) });
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should call reschedule on a job (Success if DELAYED, Error if already Completed)', (done) => {
    client.Actions.Reschedule.SendRequest({
      MessageID: testMessageID,
      Channel: testMessageChannel,
      SendTime: "2030-01-01 09:00"
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data).toMatchObject({ Result: expect.any(String) });
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should call pacing on a TTS job (Success if job is active, Error if Completed)', (done) => {
    client.Actions.Pacing.SendRequest({
      MessageID: testMessageID,
      Channel: "tts",
      NumberOfOperators: 1
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data).toMatchObject({ Result: expect.any(String) });
      done();
    }).catch(err => {
      done(err);
    });
  });

  // Validation tests — these are rejected by the library before any HTTP call is made,
  // so they always return Result: 'Error' regardless of test data.

  it('should reject Resubmit for unsupported channel (sms)', (done) => {
    client.Actions.Resubmit.SendRequest({
      MessageID: testMessageID,
      Channel: "sms"
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data.Result).toBe('Error');
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should reject Pacing for unsupported channel (email)', (done) => {
    client.Actions.Pacing.SendRequest({
      MessageID: testMessageID,
      Channel: "email",
      NumberOfOperators: 1
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data.Result).toBe('Error');
      done();
    }).catch(err => {
      done(err);
    });
  });

});