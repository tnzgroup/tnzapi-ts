# RCS (Rich Communication Services)

Send RCS messages to mobile numbers via the TNZ REST API. RCS is an enhanced messaging channel that supports rich content; messages fall back to the server-configured fallback channel when RCS is unavailable on the recipient's device.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.RCS.SendMessage({
  Message: 'Hello, your appointment is confirmed.',
  ToNumber: '+6421000001',
});

console.log(result.MessageID);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message` | `string` | Yes* | Message body. Supports personalisation tokens `[[FirstName]]`, `[[Custom1]]`, etc. |
| `TemplateID` | `string (uuid)` | Yes* | Pre-configured template ID (alternative to `Message`). |
| `Destinations` | `IRCSDestination[]` | Yes† | One or more recipients. |
| `FallbackMode` | `RCSFallbackMode` | No | Fallback channel if RCS is unavailable. Default: `None`. |
| `FromNumber` | `string` | No | Sender ID or number (if your account supports multiple). |
| `Reference` | `string` | No | Internal reference returned in reports and webhooks. |
| `SendTime` | `string` | No | Schedule delivery: `'YYYY-MM-DDTHH:mm:ss'` in the given `Timezone`. |
| `Timezone` | `string` | No | Windows Timezone name for `SendTime` (e.g. `'New Zealand'`, `'AUS Eastern'`). |
| `SubAccount` | `string` | No | Sub-account code for billing separation. |
| `Department` | `string` | No | Department code. |
| `ChargeCode` | `string` | No | Charge code. |
| `MessageID` | `string` | No | Supply your own message ID. |
| `ReportTo` | `string` | No | Email address to receive delivery reports. |
| `WebhookCallbackURL` | `string` | No | URL for delivery status callbacks. |
| `WebhookCallbackFormat` | `WebhookCallbackFormat` | No | `JSON`, `XML`, `POST`, or `GET`. |
| `NotificationType` | `NotificationType` | No | `None`, `Webhook`, or `Email`. |
| `Mode` | `'Test'` | No | Validate without sending. |

*Either `Message` or `TemplateID` is required.  
†Alternatively, use the top-level shorthand `ToNumber: '+6421000001'` for a single recipient (comma-separated for multiple). `GroupID` and `ContactID` work the same way as top-level shorthands.

## Destination fields (`IRCSDestination`)

| Field | Description |
|-------|-------------|
| `ToNumber` | Recipient mobile number in E.164 format (e.g. `'+6421000001'`). |
| `Recipient` | Generic fallback used by the `AddRecipient(string)` builder method. |
| `Attention` | `[[Attention]]` |
| `FirstName` | `[[FirstName]]` |
| `LastName` | `[[LastName]]` |
| `Company` | `[[Company]]` |
| `Custom1`–`Custom9` | `[[Custom1]]` … `[[Custom9]]` |
| `ContactID` | UUID of an addressbook contact. Sends to that contact instead of specifying `ToNumber`. |
| `GroupID` | UUID of an addressbook group. Sends to all members of that group. |
| `GroupCode` | Group lookup by code. |

## Code samples

### Single recipient shorthand

```typescript
const result = await client.Messaging.RCS.SendMessage({
  Message: 'Hello, your appointment is confirmed.',
  ToNumber: '+6421000001',
});

// GroupID and ContactID work the same way as top-level shorthands
const toGroup = await client.Messaging.RCS.SendMessage({
  Message: 'Hello, your appointment is confirmed.',
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

const toContact = await client.Messaging.RCS.SendMessage({
  Message: 'Hello, your appointment is confirmed.',
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});
```

### Personalised send

```typescript
const result = await client.Messaging.RCS.SendMessage({
  Message: 'Hi [[FirstName]], your order [[Custom1]] has shipped.',
  Destinations: [{ ToNumber: '+6421000001', FirstName: 'Alice', Custom1: 'ORD-9912' }],
});
```

### Bulk send with webhook

```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

const result = await client.Messaging.RCS.SendMessage({
  Message: 'Hi [[FirstName]], your renewal is due on [[Custom1]].',
  Destinations: [
    { ToNumber: '+6421000001', FirstName: 'Alice', Custom1: '2027-03-31' },
    { ContactID: '8000000a-f002-4007-b00a-d00000000002' },
    { GroupID: '4000000b-f002-4007-b00a-c00000000002' },
  ],
  WebhookCallbackURL: 'https://yourapp.example.com/webhooks/rcs',
  WebhookCallbackFormat: WebhookCallbackFormat.JSON,
});
```

### Scheduled send to a group

```typescript
const result = await client.Messaging.RCS.SendMessage({
  Message: 'Staff meeting at 9am today.',
  Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000002' }],
  SendTime: '2027-01-01T09:00:00',
  Timezone: 'New Zealand',
});
```

### Builder pattern

```typescript
const msg = client.Messaging.RCS;
msg.AddRecipient('+6421000001');
msg.AddRecipient({ ToNumber: '+6421000002', FirstName: 'Bob' });

const result = await msg.SendMessage({
  Message: 'Hello [[FirstName]], this is a test.',
  Reference: 'rcs-batch-1',
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

- [README — RCS](../README.md#send-rcs-message)
- [TypeScript interface source](../src/Api/Messaging/interfaces/IRCSArgs.ts)
- [More examples](../samples/messaging/send-rcs.ts)