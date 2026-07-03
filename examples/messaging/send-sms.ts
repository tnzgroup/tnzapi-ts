/**
 * SMS Messaging Examples
 *
 * Demonstrates sending SMS messages via the TNZ API.
 * Run: npx ts-node examples/messaging/send-sms.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI } from '../../src';
import { WebhookCallbackFormat, SMSFallbackMode } from '../../src/Common/enums/MessagingEnums';

const client = new TNZAPI();

// ─── Example 1: Simple SMS to a single recipient ─────────────────────────────

async function sendSimpleSMS() {
  const result = await client.Messaging.SMS.SendMessage({
    Message: 'Hello from TNZ!',
    Destinations: [{ ToNumber: '+6421000001' }],
  });

  console.log('Simple SMS:', result);
}

// ─── Example 2: SMS with reference and scheduled send time ───────────────────

async function sendScheduledSMS() {
  const result = await client.Messaging.SMS.SendMessage({
    Reference: 'MyApp-Notification-001',
    Message: 'Your appointment is confirmed for tomorrow at 10am.',
    Destinations: [
      { ToNumber: '+6421000001' },
      { ToNumber: '+6421000002' },
    ],
    SendTime: '2025-12-01 09:00',
    Timezone: 'New Zealand',
  });

  console.log('Scheduled SMS:', result);
}

// ─── Example 3: SMS to an addressbook group ──────────────────────────────────

async function sendSMSToGroup() {
  const result = await client.Messaging.SMS.SendMessage({
    Reference: 'Newsletter-Dec',
    Message: 'Special offer just for you! Reply STOP to opt out.',
    Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000005' }],
    WebhookCallbackURL: 'https://example.com/webhooks/sms',
    WebhookCallbackFormat: WebhookCallbackFormat.JSON,
  });

  console.log('Group SMS:', result);
}

// ─── Example 4: SMS to an addressbook contact ────────────────────────────────

async function sendSMSToContact() {
  const result = await client.Messaging.SMS.SendMessage({
    Message: 'Hi there, your order has shipped!',
    Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000000' }],
    SubAccount: 'ecommerce',
    Department: 'fulfilment',
    ChargeCode: 'ORD-9876',
  });

  console.log('Contact SMS:', result);
}

// ─── Example 5: SMS with inline personalisation fields ───────────────────────

async function sendPersonalisedSMS() {
  const result = await client.Messaging.SMS.SendMessage({
    Message: 'Hi [[FirstName]], your invoice for [[Custom1]] is ready.',
    Destinations: [
      {
        ToNumber: '+6421000001',
        FirstName: 'Jane',
        LastName: 'Smith',
        Company: 'Acme Ltd',
        Custom1: '$42.00',
      },
    ],
    FallbackMode: SMSFallbackMode.Voice,
  });

  console.log('Personalised SMS:', result);
}

// ─── Example 6: SMS via template ─────────────────────────────────────────────

async function sendTemplateSMS() {
  const result = await client.Messaging.SMS.SendMessage({
    TemplateID: '00000000-0000-0000-0000-000000000000',
    Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
  });

  console.log('Template SMS:', result);
}

// ─── Example 7: Test mode (no actual send) ───────────────────────────────────

async function sendSMSTestMode() {
  const result = await client.Messaging.SMS.SendMessage({
    Message: 'This will not be delivered.',
    Destinations: [{ ToNumber: '+6421000001' }],
    Mode: 'Test',
  });

  console.log('Test mode SMS:', result);
}

// ─── Example 8: Builder pattern ──────────────────────────────────────────────

async function sendSMSBuilderPattern() {
  const result = await client.Messaging.SMS
    .AddRecipient('+6421000001')
    .AddRecipient({ ToNumber: '+6421000002', FirstName: 'Jane' })
    .AddRecipient([{ ToNumber: '+6421000003' }, { ToNumber: '+6421000004' }])
    .SendMessage({ Message: 'Hello from the builder pattern!' });

  console.log('Builder pattern SMS:', result);
}

// ─── Example 9: Single-destination shorthand ─────────────────────────────────

async function sendSMSShorthand() {
  const result = await client.Messaging.SMS.SendMessage({
    Message: 'Hello via shorthand!',
    ToNumber: '+6421000001,+6421000002',
  });

  console.log('Shorthand SMS:', result);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await sendSimpleSMS();
  await sendScheduledSMS();
  await sendSMSToGroup();
  await sendSMSToContact();
  await sendPersonalisedSMS();
  await sendTemplateSMS();
  await sendSMSTestMode();
  await sendSMSBuilderPattern();
  await sendSMSShorthand();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});