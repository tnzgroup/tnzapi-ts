# Email

Send HTML or plain-text emails with optional attachments via the TNZ REST API.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Your order has shipped',
  MessagePlain: 'Your order is on its way.',
  MessageHTML: '<p>Your order is on its way.</p>',
  EmailAddress: 'alice@example.com',
});

console.log(result.MessageID);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `EmailSubject` | `string` | Yes | Email subject line. |
| `MessagePlain` | `string` | No* | Plain-text message body. Also accepted as `Message`. |
| `MessageHTML` | `string` | No* | HTML message body. |
| `TemplateID` | `string (uuid)` | No* | Pre-configured template ID (alternative to message body). |
| `Destinations` | `IEmailDestination[]` | Yes† | One or more recipients. |
| `From` | `string` | No | Sender display name (e.g. `'My Company'`). |
| `FromEmail` | `string` | No | Sender email address. |
| `SMTPFrom` | `string` | No | SMTP envelope sender address (overrides `FromEmail` at transport level). |
| `CCEmail` | `string` | No | CC email address. |
| `BCCEmail` | `string` | No | BCC email address (not visible to recipients). |
| `ReplyTo` | `string` | No | Reply-to address. |
| `Reference` | `string` | No | Internal reference returned in reports and webhooks. |
| `SendTime` | `string` | No | Schedule delivery: `'YYYY-MM-DD HH:mm'` in the given `Timezone`. |
| `Timezone` | `string` | No | Windows Timezone name for `SendTime` (e.g. `'New Zealand'`, `'AUS Eastern'`). |
| `SubAccount` | `string` | No | Sub-account code for billing separation. |
| `Department` | `string` | No | Department code. |
| `ChargeCode` | `string` | No | Charge code. |
| `MessageID` | `string` | No | Supply your own message ID. |
| `ReportTo` | `string` | No | Email address to receive delivery reports. |
| `WebhookCallbackURL` | `string` | No | URL for delivery status callbacks. |
| `WebhookCallbackFormat` | `WebhookCallbackFormat` | No | `JSON`, `XML`, `POST`, or `GET`. |
| `NotificationType` | `NotificationType` | No | `None`, `Webhook`, or `Email`. |
| `Attachments` | `string[]` | No | Local file paths to attach. The SDK reads each file and sends it as base64 to the API. |
| `Mode` | `'Test'` | No | Validate without sending. |

*At least one of `MessagePlain`, `MessageHTML`, or `TemplateID` is required.  
†Alternatively, use the top-level shorthand `EmailAddress: 'user@example.com'` for a single recipient (comma-separated for multiple, e.g. `'a@example.com,b@example.com'`). `GroupID` and `ContactID` work the same way as top-level shorthands.

## Destination fields (`IEmailDestination`)

| Field | Description |
|-------|-------------|
| `EmailAddress` | Recipient email address. |
| `Recipient` | Generic fallback used by the `AddRecipient(string)` builder method. |
| `Attention` | Personalisation token `[[Attention]]`. |
| `FirstName` | `[[FirstName]]` |
| `LastName` | `[[LastName]]` |
| `Company` | `[[Company]]` |
| `Custom1`–`Custom9` | `[[Custom1]]` … `[[Custom9]]` |
| `ContactID` | UUID of an addressbook contact. Sends to that contact instead of specifying `EmailAddress`. |
| `GroupID` | UUID of an addressbook group. Sends to all members of that group. |
| `GroupCode` | Group lookup by code. |

## Code samples

### Single recipient shorthand

```typescript
const result = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Your invoice',
  MessagePlain: 'Please find your invoice attached.',
  EmailAddress: 'customer@example.com',
});

// Comma-separated values create multiple destinations
const bulk = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Your invoice',
  MessagePlain: 'Please find your invoice attached.',
  EmailAddress: 'alice@example.com,bob@example.com',
});

// GroupID and ContactID work the same way as top-level shorthands
const toGroup = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Your invoice',
  MessagePlain: 'Please find your invoice attached.',
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

const toContact = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Your invoice',
  MessagePlain: 'Please find your invoice attached.',
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});
```

### HTML + plain-text with attachment

```typescript
import path from 'path';

const result = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Your invoice',
  MessagePlain: 'Please find your invoice attached.',
  MessageHTML: '<p>Please find your invoice attached.</p>',
  FromEmail: 'billing@yourcompany.com',
  Destinations: [{ EmailAddress: 'customer@example.com' }],
  Attachments: [path.join(__dirname, 'invoice.pdf')],
});
```

### Full sender fields

```typescript
const result = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Hello from us',
  MessagePlain: 'Hi there.',
  From: 'My Company',
  FromEmail: 'noreply@mycompany.com',
  SMTPFrom: 'smtp@mycompany.com',
  ReplyTo: 'support@mycompany.com',
  CCEmail: 'manager@mycompany.com',
  Destinations: [{ EmailAddress: 'customer@example.com' }],
});
```

### Personalised bulk send with scheduling

```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

const result = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Hello [[FirstName]]',
  MessageHTML: '<p>Hi [[FirstName]], welcome to [[Company]]!</p>',
  Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000002' }],
  SendTime: '2027-01-01 08:00',
  Timezone: 'New Zealand',
  WebhookCallbackURL: 'https://yourapp.example.com/webhooks/email',
  WebhookCallbackFormat: WebhookCallbackFormat.JSON,
});
```

### Template send to a contact

```typescript
const result = await client.Messaging.Email.SendMessage({
  EmailSubject: 'Your monthly statement',
  TemplateID: '11111111-2222-3333-4444-555555555555',
  Destinations: [{ ContactID: '8000000a-f002-4007-b00a-d00000000001' }],
});
```

### Builder pattern

```typescript
const msg = client.Messaging.Email;
msg.AddRecipient({ EmailAddress: 'alice@example.com', FirstName: 'Alice' });
msg.AddRecipient({ EmailAddress: 'bob@example.com',   FirstName: 'Bob' });
msg.AddAttachment('/path/to/report.pdf');

const result = await msg.SendMessage({
  EmailSubject: 'Monthly Report',
  MessagePlain: 'Hi [[FirstName]], see attached.',
});
```

## Response

```typescript
{
  Result: 'Success' | 'Failed' | 'Error' | 'Unauthorized',
  MessageID: 'P1ABCDE',
  JobNum: '1234',
  Status: 'Queued',
}
```

## See also

- [README — Email](../README.md#email)
- [TypeScript interface source](../src/Api/Messaging/interfaces/IEmailArgs.ts)
- [More examples](../samples/messaging/send-email.ts)