
import { TNZAPI } from '../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMessageID = process.env.TNZ_TEST_MESSAGE_ID ?? 'ID123456';
const testMessageChannel = process.env.TNZ_TEST_MESSAGE_CHANNEL ?? 'sms';

describe('Reports API', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) {
      console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    }
    if (!process.env.TNZ_TEST_MESSAGE_ID) {
      console.warn('TNZ_TEST_MESSAGE_ID not set in .env.test — using fallback "ID123456".');
    }
    client = new TNZAPI({
      AuthToken: authToken,
    });
  });

  // These tests call the real API. The Result depends on whether the message exists
  // and is accessible to the test account. We verify the library returns a
  // structured response — Success when the message is found, Failed/Error otherwise.

  it('should get message status', (done) => {
    client.Reports.Status.Poll({
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

  it('should get SMS reply', (done) => {
    client.Reports.SMSReply.Poll({
      MessageID: testMessageID,
      Page: 1
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data).toMatchObject({ Result: expect.any(String) });
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should get SMS received list', (done) => {
    client.Reports.SMSReceived.Poll({
      TimePeriod: 1440,
      RecordsPerPage: 10,
      Page: 1
    }).then(data => {
      console.log("Response:", JSON.stringify(data, null, "  "));
      expect(data).toMatchObject({ Result: expect.any(String) });
      done();
    }).catch(err => {
      done(err);
    });
  });

});