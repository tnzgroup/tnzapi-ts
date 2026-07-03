/**
 * Reschedule Action Examples
 *
 * Demonstrates rescheduling a pending message to a new send time via the TNZ API.
 * Supports channels: sms, email, fax, tts, voice.
 *
 * Run: npx ts-node examples/actions/reschedule.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: Reschedule an SMS ─────────────────────────────────────────────

async function rescheduleSMS() {
  const result = await client.Actions.Reschedule.SendRequest({
    MessageID: 'ID123456',
    Channel: 'sms',
    SendTime: '2025-12-05 10:00',
  });

  console.log('Reschedule SMS:', result);
}

// ─── Example 2: Reschedule an email ───────────────────────────────────────────

async function rescheduleEmail() {
  const result = await client.Actions.Reschedule.SendRequest({
    MessageID: 'ID123456',
    Channel: 'email',
    SendTime: '2025-12-10 08:30',
  });

  console.log('Reschedule email:', result);
}

// ─── Example 3: Reschedule a TTS call ────────────────────────────────────────

async function rescheduleTTS() {
  const result = await client.Actions.Reschedule.SendRequest({
    MessageID: 'ID123456',
    Channel: 'tts',
    SendTime: '2025-12-01 09:00',
  });

  console.log('Reschedule TTS:', result);
}

// ─── Example 4: Reschedule with error handling ────────────────────────────────

async function rescheduleWithErrorHandling() {
  const result = await client.Actions.Reschedule.SendRequest({
    MessageID: 'ID123456',
    Channel: 'fax',
    SendTime: '2025-12-15 14:00',
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Message ${result.MessageID} rescheduled successfully.`);
  } else {
    console.error('Could not reschedule:', result.ErrorMessage);
  }
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await rescheduleSMS();
  await rescheduleEmail();
  await rescheduleTTS();
  await rescheduleWithErrorHandling();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});