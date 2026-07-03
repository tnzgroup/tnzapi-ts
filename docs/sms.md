# SMS

Send text messages to one or more recipients via the TNZ REST API.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.SMS.SendMessage({
  Message: 'Hello [[FirstName]], your order is ready.',
  Destinations: [{ ToNumber: '+6421000001', FirstName: 'Alice' }],
});

console.log(result.MessageID); // e.g. "P1ABCDE"
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message` | `string` | Yes* | Message body. Supports personalisation tokens `[[FirstName]]`, `[[Custom1]]`, etc. |
| `TemplateID` | `string (uuid)` | Yes* | Pre-configured message template ID (alternative to `Message`). |
| `Destinations` | `ISMSDestination[]` | Yes† | One or more recipients. |
| `Reference` | `string` | No | Your internal reference, returned in reports and webhooks. |
| `FromNumber` | `string` | No | Sender ID shown on the recipient's device (E.164 without leading `+`). Overridden for NZ. |
| `SendTime` | `string` | No | Schedule delivery: `'YYYY-MM-DDTHH:mm:ss'` in the given `Timezone`. |
| `Timezone` | `string` | No | Windows Timezone name for `SendTime` (e.g. `'New Zealand'`, `'AUS Eastern'`). |
| `SubAccount` | `string` | No | Sub-account code for billing separation. |
| `Department` | `string` | No | Department code. |
| `ChargeCode` | `string` | No | Charge code. |
| `MessageID` | `string` | No | Supply your own message ID (otherwise auto-generated). |
| `ReportTo` | `string` | No | Email address to receive delivery reports. |
| `WebhookCallbackURL` | `string` | No | URL for delivery status callbacks. |
| `WebhookCallbackFormat` | `WebhookCallbackFormat` | No | Callback format: `JSON`, `XML`, `POST`, or `GET`. |
| `NotificationType` | `NotificationType` | No | `None`, `Webhook`, or `Email`. |
| `FallbackMode` | `SMSFallbackMode` | No | Fallback channel if SMS fails: `None` (default), `Voice`, `RCS`, or `WAPP` (WhatsApp). Accepts a single value or comma-separated list. |
| `SMSEmailReply` | `string` | No | Email address to receive SMS replies. |
| `CharacterConversion` | `boolean` | No | Convert characters outside the GSM character set automatically. |
| `Attachments` | `string[]` | No | Local file paths for MMS attachments. The SDK reads each file and sends it as base64 to the API. |
| `Mode` | `'Test'` | No | Validate the request without sending. |

*Either `Message` or `TemplateID` must be provided.  
†Alternatively, use the top-level shorthand `ToNumber: '+6421000001'` for a single recipient without wrapping in an array (comma-separated for multiple, e.g. `'+6421000001,+6421000002'`). `GroupID` and `ContactID` work the same way as top-level shorthands.

## Destination fields (`ISMSDestination`)

| Field | Description |
|-------|-------------|
| `ToNumber` | Destination phone number in E.164 format (e.g. `'+6421000001'`). |
| `Recipient` | Generic fallback used by the `AddRecipient(string)` builder method. |
| `Attention` | Personalisation token `[[Attention]]`. |
| `FirstName` | `[[FirstName]]` |
| `LastName` | `[[LastName]]` |
| `Company` | `[[Company]]` |
| `Custom1`–`Custom9` | `[[Custom1]]` … `[[Custom9]]` — arbitrary per-recipient values. |
| `ContactID` | UUID of an addressbook contact. Sends to that contact instead of specifying `ToNumber`. |
| `GroupID` | UUID of an addressbook group. Sends to all members of that group. |
| `GroupCode` | Alternative group lookup by code. |

## Code samples

### Personalised message to multiple recipients

```typescript
const result = await client.Messaging.SMS.SendMessage({
  Message: 'Hi [[FirstName]], your appointment is on [[Custom1]].',
  Destinations: [
    { ToNumber: '+6421000001', FirstName: 'Alice', Custom1: 'Monday 3pm' },
    { ToNumber: '+6421000002', FirstName: 'Bob',   Custom1: 'Tuesday 10am' },
  ],
});
```

### Single recipient shorthand

```typescript
const result = await client.Messaging.SMS.SendMessage({
  Message: 'Office closed today.',
  ToNumber: '+6421000001',
});

// Comma-separated values create multiple destinations
const bulk = await client.Messaging.SMS.SendMessage({
  Message: 'Office closed today.',
  ToNumber: '+6421000001,+6421000002',
});

// GroupID and ContactID work the same way as top-level shorthands
const toGroup = await client.Messaging.SMS.SendMessage({
  Message: 'Office closed today.',
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

const toContact = await client.Messaging.SMS.SendMessage({
  Message: 'Office closed today.',
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});
```

### Send to an addressbook group

```typescript
const result = await client.Messaging.SMS.SendMessage({
  Message: 'Office closed today.',
  Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000002' }],
});
```

### Scheduled send with webhook

```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

const result = await client.Messaging.SMS.SendMessage({
  Message: 'Your reminder.',
  Destinations: [{ ToNumber: '+6421000001' }],
  SendTime: '2027-01-01T09:00:00',
  Timezone: 'New Zealand',
  WebhookCallbackURL: 'https://yourapp.example.com/webhooks/sms',
  WebhookCallbackFormat: WebhookCallbackFormat.JSON,
});
```

### Voice fallback

```typescript
import { SMSFallbackMode } from 'tnzapi-ts';

const result = await client.Messaging.SMS.SendMessage({
  Message: 'Critical alert: server down.',
  Destinations: [{ ToNumber: '+6421000001' }],
  FallbackMode: SMSFallbackMode.Voice,
});
```

### Builder pattern (AddRecipient)

```typescript
const msg = client.Messaging.SMS;
msg.AddRecipient('+6421000001');
msg.AddRecipient({ ToNumber: '+6421000002', FirstName: 'Bob' });

const result = await msg.SendMessage({
  Message: 'Hello [[FirstName]]!',
});
```

### Test mode (validate without sending)

```typescript
const result = await client.Messaging.SMS.SendMessage({
  Message: 'Test.',
  Destinations: [{ ToNumber: '+6421000001' }],
  Mode: 'Test',
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

- [README — SMS](../README.md#sms)
- [TypeScript interface source](../src/Api/Messaging/interfaces/ISMSArgs.ts)
- [More examples](../examples/messaging/send-sms.ts)