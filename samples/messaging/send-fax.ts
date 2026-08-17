/**
 * Fax Messaging Examples
 *
 * Demonstrates sending fax messages via the TNZ API.
 * Run: npx ts-node samples/messaging/send-fax.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI } from '../../src';
import { FaxResolution, WebhookCallbackFormat } from '../../src/Common/enums/MessagingEnums';
import path from 'path';

const client = new TNZAPI();

// ─── Example 1: Simple fax with a PDF attachment ─────────────────────────────

async function sendSimpleFax() {
  const result = await client.Messaging.Fax.SendMessage({
    Destinations: [{ ToNumber: '+6491000001' }],
    Attachments: [path.join(__dirname, 'document.pdf')],
  });

  console.log('Simple fax:', result);
}

// ─── Example 2: Fax with resolution and CSID ─────────────────────────────────

async function sendFaxHighResolution() {
  const result = await client.Messaging.Fax.SendMessage({
    Reference: 'CONTRACT-2024',
    Destinations: [{ ToNumber: '+6491000002' }],
    Attachments: [path.join(__dirname, 'contract.pdf')],
    Resolution: FaxResolution.High,
    CSID: 'My Company Fax',
  });

  console.log('High resolution fax:', result);
}

// ─── Example 3: Fax with retry settings ──────────────────────────────────────

async function sendFaxWithRetry() {
  const result = await client.Messaging.Fax.SendMessage({
    Destinations: [{ ToNumber: '+6491000003' }],
    Attachments: [path.join(__dirname, 'report.pdf')],
    RetryAttempts: 3,
    RetryPeriod: 5,
  });

  console.log('Fax with retry:', result);
}

// ─── Example 4: Fax with watermark ───────────────────────────────────────────

async function sendFaxWithWatermark() {
  const result = await client.Messaging.Fax.SendMessage({
    Destinations: [{ ToNumber: '+6491000004' }],
    Attachments: [path.join(__dirname, 'document.pdf')],
    WatermarkFolder: 'Folder01',
    WatermarkFirstPage: 'Cover.ps',
    WatermarkAllPages: 'Watermark.docx',
  });

  console.log('Fax with watermark:', result);
}

// ─── Example 5: Scheduled fax to multiple recipients ─────────────────────────

async function sendScheduledFax() {
  const result = await client.Messaging.Fax.SendMessage({
    Reference: 'BULK-FAX-001',
    Destinations: [
      { ToNumber: '+6491000001' },
      { ToNumber: '+6491000002' },
    ],
    Attachments: [path.join(__dirname, 'newsletter.pdf')],
    SendTime: '2025-12-01 09:00',
    Timezone: 'New Zealand',
    WebhookCallbackURL: 'https://example.com/webhooks/fax',
    WebhookCallbackFormat: WebhookCallbackFormat.JSON,
  });

  console.log('Scheduled fax:', result);
}

// ─── Example 6: Builder pattern ──────────────────────────────────────────────

async function sendFaxBuilderPattern() {
  const result = await client.Messaging.Fax
    .AddRecipient({ ToNumber: '+6491000001' })
    .AddRecipient({ ToNumber: '+6491000002' })
    .AddAttachment(path.join(__dirname, 'document.pdf'))
    .SendMessage({ Resolution: FaxResolution.High });

  console.log('Builder pattern fax:', result);
}

// ─── Example 7: Single-destination shorthand ─────────────────────────────────

async function sendFaxShorthand() {
  const result = await client.Messaging.Fax.SendMessage({
    Attachments: [path.join(__dirname, 'document.pdf')],
    ToNumber: '+6491000001,+6491000002',
  });

  console.log('Shorthand fax:', result);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await sendSimpleFax();
  await sendFaxHighResolution();
  await sendFaxWithRetry();
  await sendFaxWithWatermark();
  await sendScheduledFax();
  await sendFaxBuilderPattern();
  await sendFaxShorthand();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});