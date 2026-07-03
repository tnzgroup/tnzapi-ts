# Messaging

Send messages across eight channels via `client.Messaging.<Channel>.SendMessage(args)`.

| Channel | Doc | Description |
|---------|-----|-------------|
| SMS | [sms.md](sms.md) | Text messages with optional RCS/Voice fallback |
| Email | [email.md](email.md) | HTML/plain-text email with attachments |
| Fax | [fax.md](fax.md) | PDF/TIFF fax with watermark and retry |
| TTS | [tts.md](tts.md) | Text-to-speech voice calls with keypad routing |
| Voice | [voice.md](voice.md) | Pre-recorded audio calls with keypad routing |
| WhatsApp | [whatsapp.md](whatsapp.md) | WhatsApp messages with SMS/RCS/Voice fallback |
| RCS | [rcs.md](rcs.md) | Rich Communication Services messages |
| Workflow | [workflow.md](workflow.md) | Multi-channel workflow sequences |

## Common parameters

All channels share these parameters. See [README — Common Parameters](../README.md#common-parameters) for the full table.

| Parameter | Type | Description |
|-----------|------|-------------|
| `Reference` | `string` | Your internal reference, echoed back in reports and webhooks. |
| `SendTime` | `string` | Scheduled send time: `'YYYY-MM-DDTHH:mm:ss'` in the given `Timezone`. |
| `Timezone` | `string` | Windows Timezone name (e.g. `'New Zealand'`, `'AUS Eastern'`). |
| `SubAccount` | `string` | Billing sub-account code. |
| `Department` | `string` | Department code. |
| `ChargeCode` | `string` | Charge code. |
| `MessageID` | `string` | Custom message ID (auto-generated if omitted). |
| `WebhookCallbackURL` | `string` | Delivery status webhook endpoint. |
| `WebhookCallbackFormat` | `WebhookCallbackFormat` | Webhook payload format: `JSON`, `XML`, `POST`, `GET`. |
| `NotificationType` | `NotificationType` | `None`, `Webhook`, or `Email`. |
| `Mode` | `'Test'` | Dry-run — validates without sending. |

> `ReportTo` is supported by SMS, Email, Fax, TTS, Voice, and WhatsApp. It is **not** available on Workflow.

## Common destination fields

All destinations support addressbook lookups alongside channel-specific fields:

| Field | Description |
|-------|-------------|
| `ContactID` | Send to a specific addressbook contact. |
| `GroupID` | Send to all members of an addressbook group. |
| `GroupCode` | Group lookup by code. |
| `Recipient` | Generic fallback used by the `AddRecipient(string)` builder method. |
| `FirstName` | Personalisation token `[[FirstName]]`. |
| `LastName` | `[[LastName]]` |
| `Company` | `[[Company]]` |
| `Attention` | `[[Attention]]` |
| `Custom1`–`Custom9` | `[[Custom1]]` … `[[Custom9]]` — arbitrary per-recipient values. |

## Builder pattern

Every channel supports a fluent `AddRecipient` / `AddAttachment` builder as an alternative to passing arrays in `SendMessage`:

```typescript
const msg = client.Messaging.SMS;
msg.AddRecipient('+6421000001');
msg.AddRecipient({ ToNumber: '+6421000002', FirstName: 'Bob' });
msg.AddRecipient(['+6421000003', '+6421000004']); // array form

const result = await msg.SendMessage({ Message: 'Hello [[FirstName]]!' });
```

Voice additionally supports `AddVoiceFile`. Email and Fax support `AddAttachment`. TTS and Voice support `AddKeypad`.

`AddRecipient` is typed per channel — `client.Messaging.SMS.AddRecipient(...)` only accepts a string, an `ISMSDestination`, or an array of either; passing another channel's destination shape (e.g. `{ EmailAddress: ... }` on SMS) is a compile-time error.

## Response shape

All `SendMessage` calls return the same success/error shape:

```typescript
{
  Result: 'Success' | 'Failed' | 'Error' | 'Unauthorized',
  MessageID: string,   // e.g. 'P1ABCDE'
  JobNum: string,
  Status: string,      // e.g. 'Queued'
}
```

## Authentication

```typescript
import { TNZAPI } from 'tnzapi-ts';

// From constructor
const client = new TNZAPI({ AuthToken: 'your-token' });

// Or from environment variable TNZ_AUTH_TOKEN
const client = new TNZAPI();
```

See [README — Authentication](../README.md#authentication) for details.