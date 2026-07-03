/**
 * Text-to-Speech (TTS) Messaging Examples
 *
 * Demonstrates sending TTS voice calls via the TNZ API.
 * Run: npx ts-node examples/messaging/send-tts.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI } from '../../src';
import { TTSVoice, AnswerPhoneMode, WebhookCallbackFormat } from '../../src/Common/enums/MessagingEnums';

const client = new TNZAPI();

// ─── Example 1: Simple TTS call ───────────────────────────────────────────────

async function sendSimpleTTS() {
  const result = await client.Messaging.TTS.SendMessage({
    MessageToPeople: 'Hello, this is a message from My Company. Your appointment is confirmed.',
    Destinations: [{ MainPhone: '+6421000001' }],
  });

  console.log('Simple TTS:', result);
}

// ─── Example 2: TTS with answerphone message ──────────────────────────────────

async function sendTTSWithAnswerphone() {
  const result = await client.Messaging.TTS.SendMessage({
    Reference: 'APPT-REMINDER-001',
    MessageToPeople: 'Hello, you have an appointment tomorrow at 2pm. Press 1 to confirm or 2 to cancel.',
    MessageToAnswerPhones: 'Hello, this is a reminder that you have an appointment tomorrow at 2pm. Please call us on 09 000 0000.',
    Destinations: [
      { MainPhone: '+6421000001' },
      { MainPhone: '+6421000002' },
    ],
    CallerID: '+6491000000',
    Voice: TTSVoice.Female1,
    AnswerPhoneMode: AnswerPhoneMode.NDAS,
  });

  console.log('TTS with answerphone:', result);
}

// ─── Example 3: TTS with keypad interaction ───────────────────────────────────

async function sendTTSWithKeypad() {
  const result = await client.Messaging.TTS
    .AddRecipient({ MainPhone: '+6421000001' })
    .AddKeypad(1, '+6491000001', 'Transferring you to sales.')
    .AddKeypad(2, '+6491000002', 'Transferring you to support.')
    .AddKeypad(3, '', 'Sorry we missed you. Please call us back on 09 000 0000.')
    .SendMessage({
      MessageToPeople: 'Press 1 to speak to sales, press 2 to speak to support, or press 3 to leave a message.',
      KeypadOptionRequired: true,
      CallRouteMessageOnWrongKey: 'Sorry, invalid option. Please try again.',
      CallRouteMessageToPeople: 'Connecting you now.',
      CallRouteMessageToOperators: 'Incoming TTS call.',
    });

  console.log('TTS with keypad:', result);
}

// ─── Example 4: TTS with retry and operator settings ─────────────────────────

async function sendTTSWithRetry() {
  const result = await client.Messaging.TTS.SendMessage({
    MessageToPeople: 'Important: your account requires attention. Please call us on 09 000 0000.',
    Destinations: [
      { MainPhone: '+6421000001' },
      { MainPhone: '+6421000002' },
      { MainPhone: '+6421000003' },
    ],
    RetryAttempts: 2,
    RetryPeriod: 10,
    NumberOfOperators: 2,
    WebhookCallbackURL: 'https://example.com/webhooks/tts',
    WebhookCallbackFormat: WebhookCallbackFormat.JSON,
  });

  console.log('TTS with retry:', result);
}

// ─── Example 5: Scheduled TTS blast ──────────────────────────────────────────

async function sendScheduledTTS() {
  const result = await client.Messaging.TTS.SendMessage({
    Reference: 'MORNING-CALL',
    MessageToPeople: 'Good morning. This is your daily briefing from HQ.',
    Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000006' }],
    SendTime: '2025-12-01 08:00',
    Timezone: 'New Zealand',
    Voice: TTSVoice.Male1,
  });

  console.log('Scheduled TTS:', result);
}

// ─── Example 6: TTS via template ─────────────────────────────────────────────

async function sendTemplateTTS() {
  const result = await client.Messaging.TTS.SendMessage({
    TemplateID: '00000000-0000-0000-0000-000000000000',
    Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
  });

  console.log('Template TTS:', result);
}

// ─── Example 7: Single-destination shorthand ─────────────────────────────────

async function sendTTSShorthand() {
  const result = await client.Messaging.TTS.SendMessage({
    MessageToPeople: 'Hello, this is a call from Company One.',
    ToNumber: '+64211111111,+64221111111',
  });

  console.log('Shorthand TTS:', result);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await sendSimpleTTS();
  await sendTTSWithAnswerphone();
  await sendTTSWithKeypad();
  await sendTTSWithRetry();
  await sendScheduledTTS();
  await sendTemplateTTS();
  await sendTTSShorthand();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});