# WhatsApp

Send WhatsApp messages with optional SMS, RCS, or Voice fallback via the TNZ REST API.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Hello! Your order has shipped.',
  ToNumber: '+6421000001',
});

console.log(result.MessageID);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message` | `string` | Yes* | Message body. Supports personalisation tokens `[[FirstName]]`, `[[Custom1]]`, etc. |
| `TemplateID` | `string (uuid)` | Yes* | Pre-configured template ID (UUID format). Alternative to `Message`. |
| `Destinations` | `IWhatsAppDestination[]` | Yes† | One or more recipients. |
| `FallbackMode` | `string` | No | Fallback channel(s) if WhatsApp delivery fails. Can be a single value or comma-separated list: `None`, `RCS`, `SMS`, `Voice` (e.g. `'SMS, Voice'`). |
| `FromNumber` | `string` | No | WhatsApp sender number (if your account supports multiple). |
| `Reference` | `string` | No | Internal reference returned in reports and webhooks. |
| `SendTime` | `string` | No | Schedule delivery: `'YYYY-MM-DDTHH:mm:ss'` in the given `Timezone`. |
| `Timezone` | `string` | No | Windows Timezone name for `SendTime` (e.g. `'New Zealand'`, `'AUS Eastern'`). |
| `SubAccount` | `string` | No | Sub-account code for billing separation. |
| `Department` | `string` | No | Department code. |
| `ChargeCode` | `string` | No | Charge code. |
| `MessageID` | `string` | No | Supply your own message ID. |
| `WebhookCallbackURL` | `string` | No | URL for delivery status callbacks. |
| `WebhookCallbackFormat` | `WebhookCallbackFormat` | No | `JSON`, `XML`, `POST`, or `GET`. |
| `NotificationType` | `NotificationType` | No | `None`, `Webhook`, or `Email`. |
| `ReportTo` | `string` | No | Email address to receive delivery reports. |
| `Attachments` | `string[]` | No | Local file paths to attach. The SDK reads each file and sends it as base64 to the API. |
| `Mode` | `'Test'` | No | Validate without sending. |

*Either `Message` or `TemplateID` is required.  
†Alternatively, use the top-level shorthand `ToNumber: '+6421000001'` for a single recipient (comma-separated for multiple). `GroupID` and `ContactID` work the same way as top-level shorthands.

## Destination fields (`IWhatsAppDestination`)

| Field | Description |
|-------|-------------|
| `ToNumber` | Recipient WhatsApp number in E.164 format (e.g. `'+6421000001'`). |
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
const result = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Your order has been dispatched.',
  ToNumber: '+6421000001',
});

// GroupID and ContactID work the same way as top-level shorthands
const toGroup = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Your order has been dispatched.',
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

const toContact = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Your order has been dispatched.',
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});
```

### With SMS fallback

```typescript
const result = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Your verification code is [[Custom1]].',
  Destinations: [{ ToNumber: '+6421000001', Custom1: '483921' }],
  FallbackMode: 'SMS',
});
```

### Multi-channel fallback (SMS then Voice)

```typescript
const result = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Critical alert.',
  Destinations: [{ ToNumber: '+6421000001' }],
  FallbackMode: 'SMS, Voice',
});
```

### Bulk send to multiple recipients with webhook

```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

const result = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Hi [[FirstName]], your renewal is due on [[Custom1]].',
  Destinations: [
    { ToNumber: '+6421000001', FirstName: 'Alice', Custom1: '2025-12-31' },
    { ContactID: '8000000a-f002-4007-b00a-d00000000002' },
    { GroupID: '4000000b-f002-4007-b00a-c00000000002' },
  ],
  WebhookCallbackURL: 'https://yourapp.example.com/webhooks/whatsapp',
  WebhookCallbackFormat: WebhookCallbackFormat.JSON,
});
```

### Scheduled send to a group with specific sender number

```typescript
const result = await client.Messaging.WhatsApp.SendMessage({
  Message: 'Office closed today.',
  Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000003' }],
  FromNumber: '+6491234567',
  SendTime: '2027-01-01T07:00:00',
  Timezone: 'New Zealand',
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

- [README — WhatsApp](../README.md#whatsapp)
- [TypeScript interface source](../src/Api/Messaging/interfaces/IWhatsAppArgs.ts)
- [More examples](../examples/messaging/send-whatsapp.ts)