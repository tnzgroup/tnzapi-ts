/**
 * Voice (Audio File) Messaging Examples
 *
 * Demonstrates sending voice calls using pre-recorded audio files via the TNZ API.
 * Run: npx ts-node samples/messaging/send-voice.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI } from '../../src';
import { AnswerPhoneMode, WebhookCallbackFormat } from '../../src/Common/enums/MessagingEnums';
import path from 'path';

const client = new TNZAPI();

// ─── Example 1: Simple voice call with a single audio file ────────────────────

async function sendSimpleVoice() {
  const result = await client.Messaging.Voice.SendMessage({
    Destinations: [{ MainPhone: '+6421000001' }],
    VoiceFiles: [
      { Name: 'MessageToPeople', File: path.join(__dirname, 'audio', 'message.wav') },
    ],
  });

  console.log('Simple voice:', result);
}

// ─── Example 2: Voice call with separate live and answerphone messages ─────────

async function sendVoiceWithAnswerphone() {
  const result = await client.Messaging.Voice.SendMessage({
    Reference: 'VOICE-BLAST-001',
    Destinations: [
      { MainPhone: '+6421000001' },
      { MainPhone: '+6421000002' },
    ],
    VoiceFiles: [
      { Name: 'MessageToPeople',    File: path.join(__dirname, 'audio', 'live-message.wav') },
      { Name: 'MessageToAnswerPhones', File: path.join(__dirname, 'audio', 'voicemail.wav') },
    ],
    CallerID: '+6491000000',
    AnswerPhoneMode: AnswerPhoneMode.NDAS,
    RetryAttempts: 1,
    RetryPeriod: 5,
  });

  console.log('Voice with answerphone:', result);
}

// ─── Example 3: Voice call with keypad routing ────────────────────────────────

async function sendVoiceWithKeypad() {
  const result = await client.Messaging.Voice
    .AddRecipient({ MainPhone: '+6421000001' })
    .AddVoiceFile('MessageToPeople', path.join(__dirname, 'audio', 'menu.wav'))
    .AddKeypad(1, '+6491001001', path.join(__dirname, 'audio', 'transfer-sales.wav'))
    .AddKeypad(2, '+6491001002', path.join(__dirname, 'audio', 'transfer-support.wav'))
    .SendMessage({
      Keypads: [{ Tone: 9, Play: 'You have chosen to opt out. Goodbye.' }],
    });

  console.log('Voice with keypad:', result);
}

// ─── Example 4: Voice call to an addressbook group ────────────────────────────

async function sendVoiceToGroup() {
  const result = await client.Messaging.Voice.SendMessage({
    Reference: 'EMERGENCY-ALERT',
    Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000007' }],
    VoiceFiles: [
      { Name: 'MessageToPeople', File: path.join(__dirname, 'audio', 'emergency.wav') },
    ],
    NumberOfOperators: 5,
    WebhookCallbackURL: 'https://example.com/webhooks/voice',
    WebhookCallbackFormat: WebhookCallbackFormat.JSON,
  });

  console.log('Voice to group:', result);
}

// ─── Example 5: Single-destination shorthand ─────────────────────────────────

async function sendVoiceShorthand() {
  const result = await client.Messaging.Voice.SendMessage({
    ToNumber: '+6492345678,+6493456789',
    VoiceFiles: [
      { Name: 'MessageToPeople', File: path.join(__dirname, 'audio', 'message.wav') },
    ],
  });

  console.log('Shorthand voice call:', result);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await sendSimpleVoice();
  await sendVoiceWithAnswerphone();
  await sendVoiceWithKeypad();
  await sendVoiceToGroup();
  await sendVoiceShorthand();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});