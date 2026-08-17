/**
 * Pacing Action Examples
 *
 * Demonstrates adjusting the number of simultaneous operators (call channels)
 * for an active TTS or voice blast via the TNZ API.
 * Supported channels: tts, voice.
 *
 * Run: npx ts-node samples/actions/pacing.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: Reduce operators to slow down a live blast ────────────────────

async function reduceOperators() {
  const result = await client.Actions.Pacing.SendRequest({
    MessageID: 'ID123456',
    Channel: 'tts',
    NumberOfOperators: 2,
  });

  console.log('Reduce operators:', result);
}

// ─── Example 2: Increase operators to speed up a live blast ──────────────────

async function increaseOperators() {
  const result = await client.Actions.Pacing.SendRequest({
    MessageID: 'ID123456',
    Channel: 'tts',
    NumberOfOperators: 10,
  });

  console.log('Increase operators:', result);
}

// ─── Example 3: Pacing with error handling ───────────────────────────────────

async function pacingWithErrorHandling() {
  const result = await client.Actions.Pacing.SendRequest({
    MessageID: 'ID123456',
    Channel: 'tts',
    NumberOfOperators: 5,
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Pacing updated for message ${result.MessageID}.`);
  } else {
    console.error('Could not update pacing:', result.ErrorMessage);
  }
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await reduceOperators();
  await increaseOperators();
  await pacingWithErrorHandling();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});