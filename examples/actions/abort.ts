/**
 * Abort Action Examples
 *
 * Demonstrates aborting a scheduled or queued message via the TNZ API.
 * Supports channels: sms, email, fax, tts, voice.
 *
 * Run: npx ts-node examples/actions/abort.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: Abort an SMS message ─────────────────────────────────────────

async function abortSMS() {
  const result = await client.Actions.Abort.SendRequest({
    MessageID: 'ID123456',
    Channel: 'sms',
  });

  console.log('Abort SMS:', result);
}

// ─── Example 2: Abort an email message ───────────────────────────────────────

async function abortEmail() {
  const result = await client.Actions.Abort.SendRequest({
    MessageID: 'ID123456',
    Channel: 'email',
  });

  console.log('Abort email:', result);
}

// ─── Example 3: Abort a fax ───────────────────────────────────────────────────

async function abortFax() {
  const result = await client.Actions.Abort.SendRequest({
    MessageID: 'ID123456',
    Channel: 'fax',
  });

  console.log('Abort fax:', result);
}

// ─── Example 4: Abort with error handling ────────────────────────────────────

async function abortWithErrorHandling() {
  const result = await client.Actions.Abort.SendRequest({
    MessageID: 'ID123456',
    Channel: 'tts',
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Message ${result.MessageID} successfully aborted.`);
  } else {
    console.error('Could not abort message:', result.ErrorMessage);
  }
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await abortSMS();
  await abortEmail();
  await abortFax();
  await abortWithErrorHandling();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});