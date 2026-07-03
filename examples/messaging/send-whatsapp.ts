/**
 * WhatsApp Messaging Examples
 *
 * Demonstrates sending WhatsApp messages via the TNZ API.
 * Run: npx ts-node examples/messaging/send-whatsapp.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI } from '../../src';
import { WebhookCallbackFormat, WhatsAppFallbackMode } from '../../src/Common/enums/MessagingEnums';

const client = new TNZAPI();

// ─── Example 1: Simple WhatsApp text message ──────────────────────────────────

async function sendSimpleWhatsApp() {
  const result = await client.Messaging.WhatsApp.SendMessage({
    Message: 'Hello from TNZ! Your order has been dispatched.',
    Destinations: [{ ToNumber: '+6421000001' }],
  });

  console.log('Simple WhatsApp:', result);
}

// ─── Example 2: WhatsApp with fallback mode ───────────────────────────────────

async function sendWhatsAppWithFallback() {
  const result = await client.Messaging.WhatsApp.SendMessage({
    Reference: 'PROMO-NOV',
    Message: 'Your exclusive offer: 20% off this weekend only.',
    Destinations: [{ ToNumber: '+6421000001' }],
    FallbackMode: WhatsAppFallbackMode.SMS,
  });

  console.log('WhatsApp with fallback:', result);
}

// ─── Example 3: WhatsApp to multiple contacts ─────────────────────────────────

async function sendBulkWhatsApp() {
  const result = await client.Messaging.WhatsApp.SendMessage({
    Reference: 'ALERT-DEC',
    Message: 'Reminder: your subscription renews in 3 days.',
    Destinations: [
      { ToNumber: '+6421000001' },
      { ToNumber: '+6421000002' },
      { ContactID: '00000000-0000-0000-0000-000000000000' },
    ],
    WebhookCallbackURL: 'https://example.com/webhooks/whatsapp',
    WebhookCallbackFormat: WebhookCallbackFormat.JSON,
  });

  console.log('Bulk WhatsApp:', result);
}

// ─── Example 4: WhatsApp via template ────────────────────────────────────────

async function sendTemplateWhatsApp() {
  const result = await client.Messaging.WhatsApp.SendMessage({
    TemplateID: '00000000-0000-0000-0000-000000000000',
    Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
  });

  console.log('Template WhatsApp:', result);
}

// ─── Example 5: Scheduled WhatsApp with custom sender number ──────────────────

async function sendScheduledWhatsApp() {
  const result = await client.Messaging.WhatsApp.SendMessage({
    Message: 'Good morning! Your daily report is ready.',
    Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000008' }],
    FromNumber: '+6491000000',
    SendTime: '2025-12-01 07:30',
    Timezone: 'New Zealand',
  });

  console.log('Scheduled WhatsApp:', result);
}

// ─── Example 6: Single-destination shorthand ─────────────────────────────────

async function sendWhatsAppShorthand() {
  const result = await client.Messaging.WhatsApp.SendMessage({
    Message: 'Your order has been dispatched.',
    ToNumber: '+64211111111,+64221111111',
  });

  console.log('Shorthand WhatsApp:', result);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await sendSimpleWhatsApp();
  await sendWhatsAppWithFallback();
  await sendBulkWhatsApp();
  await sendTemplateWhatsApp();
  await sendScheduledWhatsApp();
  await sendWhatsAppShorthand();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});