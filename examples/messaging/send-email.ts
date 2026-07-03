/**
 * Email Messaging Examples
 *
 * Demonstrates sending email messages via the TNZ API.
 * Run: npx ts-node examples/messaging/send-email.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI } from '../../src';
import { WebhookCallbackFormat } from '../../src/Common/enums/MessagingEnums';
import path from 'path';

const client = new TNZAPI();

// ─── Example 1: Plain-text email ─────────────────────────────────────────────

async function sendPlainTextEmail() {
  const result = await client.Messaging.Email.SendMessage({
    EmailSubject: 'Hello from TNZ',
    MessagePlain: 'This is a plain-text email sent via the TNZ API.',
    Destinations: [{ EmailAddress: 'recipient@example.com' }],
  });

  console.log('Plain-text email:', result);
}

// ─── Example 2: HTML email ───────────────────────────────────────────────────

async function sendHTMLEmail() {
  const result = await client.Messaging.Email.SendMessage({
    EmailSubject: 'Your monthly statement',
    MessageHTML: `
      <html>
        <body>
          <h1>Statement for November</h1>
          <p>Please find your statement attached.</p>
          <p>Total due: <strong>$42.00</strong></p>
        </body>
      </html>
    `,
    MessagePlain: 'Statement for November. Total due: $42.00.',
    Destinations: [{ EmailAddress: 'customer@example.com' }],
    FromEmail: 'billing@mycompany.com',
    ReplyTo: 'support@mycompany.com',
    Reference: 'STMT-2024-11',
  });

  console.log('HTML email:', result);
}

// ─── Example 3: Email with attachment ────────────────────────────────────────

async function sendEmailWithAttachment() {
  const attachmentPath = path.join(__dirname, 'invoice.pdf');

  const result = await client.Messaging.Email.SendMessage({
    EmailSubject: 'Invoice #1234',
    MessagePlain: 'Please find your invoice attached.',
    Destinations: [{ EmailAddress: 'client@example.com' }],
    Attachments: [attachmentPath],
  });

  console.log('Email with attachment:', result);
}

// ─── Example 4: Email to multiple recipients ─────────────────────────────────

async function sendBulkEmail() {
  const result = await client.Messaging.Email.SendMessage({
    EmailSubject: 'Important system update',
    MessagePlain: 'We will be performing maintenance on Sunday 2am-4am NZST.',
    Destinations: [
      { EmailAddress: 'alice@example.com' },
      { EmailAddress: 'bob@example.com' },
      { GroupID: '4000000b-f002-4007-b00a-c00000000004' },
    ],
    SendTime: '2025-11-28 18:00',
    Timezone: 'New Zealand',
    WebhookCallbackURL: 'https://example.com/webhooks/email',
    WebhookCallbackFormat: WebhookCallbackFormat.JSON,
  });

  console.log('Bulk email:', result);
}

// ─── Example 5: Email with personalisation and all sender fields ──────────────

async function sendPersonalisedEmail() {
  const result = await client.Messaging.Email.SendMessage({
    EmailSubject: 'Hello [[FirstName]]',
    MessagePlain: 'Hi [[FirstName]], welcome to [[Company]]!',
    Destinations: [
      {
        EmailAddress: 'jane@example.com',
        FirstName: 'Jane',
        LastName: 'Smith',
        Company: 'Acme Ltd',
      },
    ],
    From: 'My Company',
    FromEmail: 'noreply@mycompany.com',
    ReplyTo: 'support@mycompany.com',
    CCEmail: 'archive@mycompany.com',
    SMTPFrom: 'bounce@mycompany.com',
  });

  console.log('Personalised email:', result);
}

// ─── Example 6: Email via template ───────────────────────────────────────────

async function sendTemplateEmail() {
  const result = await client.Messaging.Email.SendMessage({
    EmailSubject: 'Your welcome email',
    TemplateID: '00000000-0000-0000-0000-000000000000',
    Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000001' }],
    SubAccount: 'onboarding',
  });

  console.log('Template email:', result);
}

// ─── Example 7: Builder pattern ──────────────────────────────────────────────

async function sendEmailBuilderPattern() {
  const result = await client.Messaging.Email
    .AddRecipient({ EmailAddress: 'alice@example.com' })
    .AddRecipient({ EmailAddress: 'bob@example.com', FirstName: 'Bob' })
    .AddAttachment(path.join(__dirname, 'report.pdf'))
    .AddAttachment(path.join(__dirname, 'invoice.pdf'))
    .SendMessage({
      EmailSubject: 'Your documents',
      MessagePlain: 'Please find your documents attached.',
    });

  console.log('Builder pattern email:', result);
}

// ─── Example 8: Single-destination shorthand ─────────────────────────────────

async function sendEmailShorthand() {
  const result = await client.Messaging.Email.SendMessage({
    EmailSubject: 'Your invoice',
    MessagePlain: 'Please find your invoice attached.',
    EmailAddress: 'alice@example.com,bob@example.com',
  });

  console.log('Shorthand email:', result);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await sendPlainTextEmail();
  await sendHTMLEmail();
  await sendEmailWithAttachment();
  await sendBulkEmail();
  await sendPersonalisedEmail();
  await sendTemplateEmail();
  await sendEmailBuilderPattern();
  await sendEmailShorthand();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});