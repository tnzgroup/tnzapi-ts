
/**
 * Integration smoke test: Send an SMS → poll Status until found.
 *
 * Prerequisites:
 *   - TNZ_AUTH_TOKEN set in .env.test
 *   - TNZ_TEST_MOBILE set to a real mobile number
 *   - TNZ_SMOKE_ENABLED=true explicitly opt in (prevents accidental sends)
 *
 * Run with:
 *   npx jest --selectProjects integration tests/smoke.spec.ts
 */

import { TNZAPI, MessagingApiSuccessResponseDTO, StatusApiResponseDTO } from '../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testMobile = process.env.TNZ_TEST_MOBILE ?? '+64211111111';
const smokeEnabled = process.env.TNZ_SMOKE_ENABLED === 'true';

const describeOrSkip = smokeEnabled ? describe : describe.skip;

describeOrSkip('Smoke test: Send → Poll Status', () => {
    let client: TNZAPI;
    let sentMessageID: string | undefined;

    beforeAll(() => {
        if (!authToken) {
            throw new Error('TNZ_AUTH_TOKEN must be set in .env.test to run smoke tests.');
        }
        client = new TNZAPI({ AuthToken: authToken });
    });

    it('should send an SMS and receive a MessageID', async () => {
        const data = await client.Messaging.SMS.SendMessage({
            Reference: 'smoke-test',
            Message: 'TNZ API smoke test — please ignore.',
            Destinations: [{ ToNumber: testMobile }],
        }) as MessagingApiSuccessResponseDTO;

        console.log('Send response:', JSON.stringify(data, null, 2));

        expect(data.Result).toBe('Success');
        expect(data.MessageID).toBeTruthy();

        sentMessageID = data.MessageID;
    });

    it('should poll Status and find the sent message', async () => {
        // sentMessageID is set by the previous test
        if (!sentMessageID) {
            console.warn('Skipping status poll — no MessageID from send step.');
            return;
        }

        // Give the API a moment to process
        await new Promise((r) => setTimeout(r, 2000));

        const data = await client.Reports.Status.Poll({
            MessageID: sentMessageID,
            Channel: 'sms',
        }) as StatusApiResponseDTO;

        console.log('Status response:', JSON.stringify(data, null, 2));

        expect(data).toMatchObject({ Result: expect.any(String) });
        expect(data.MessageID).toBe(sentMessageID);
    });
});