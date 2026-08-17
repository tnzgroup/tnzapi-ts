/**
 * Resubmit Action Examples
 *
 * Demonstrates resubmitting a failed message via the TNZ API.
 * Supported channels: email, fax, tts, voice  (NOT sms).
 *
 * Run: npx ts-node samples/actions/resubmit.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: Resubmit a failed email immediately ───────────────────────────

async function resubmitEmail() {
  const result = await client.Actions.Resubmit.SendRequest({
    MessageID: 'ID123456',
    Channel: 'email',
  });

  console.log('Resubmit email:', result);
}

// ─── Example 2: Resubmit a TTS call at a new time ────────────────────────────

async function resubmitTTS() {
  const result = await client.Actions.Resubmit.SendRequest({
    MessageID: 'ID123456',
    Channel: 'tts',
    SendTime: '2025-12-01 10:00',
  });

  console.log('Resubmit TTS:', result);
}

// ─── Example 3: Resubmit a voice call ────────────────────────────────────────

async function resubmitVoice() {
  const result = await client.Actions.Resubmit.SendRequest({
    MessageID: 'ID123456',
    Channel: 'voice',
  });

  console.log('Resubmit voice:', result);
}

// ─── Example 4: Resubmit with error handling ─────────────────────────────────

async function resubmitWithErrorHandling() {
  const result = await client.Actions.Resubmit.SendRequest({
    MessageID: 'ID123456',
    Channel: 'email',
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Message ${result.MessageID} resubmitted.`);
  } else {
    console.error('Could not resubmit:', result.ErrorMessage);
  }
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await resubmitEmail();
  await resubmitTTS();
  await resubmitVoice();
  await resubmitWithErrorHandling();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});