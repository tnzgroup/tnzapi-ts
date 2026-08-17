# Fax

Send fax messages with PDF or TIFF attachments via the TNZ REST API.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';
import path from 'path';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.Fax.SendMessage({
  Attachments: [path.join(__dirname, 'document.pdf')],
  ToNumber: '+6491000001',
});

console.log(result.MessageID);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Attachments` | `string[]` | Yes* | Local file paths to fax (PDF, TIFF, DOC, etc.). The SDK reads each file and sends it as base64 to the API. |
| `TemplateID` | `string (uuid)` | Yes* | Pre-configured fax template ID (alternative to `Attachments`). |
| `Destinations` | `IFaxDestination[]` | Yes† | One or more recipients. |
| `Resolution` | `FaxResolution` | No | `'Low'` (default) or `'High'`. |
| `CallerID` | `string` | No | Outbound fax number (ANI) displayed on the recipient's caller ID. |
| `CSID` | `string` | No | Calling Subscriber ID text shown in the fax header. Max 30 characters. |
| `WatermarkFolder` | `string` | No | Watermark folder name on the TNZ platform (not a local filesystem path). |
| `WatermarkFirstPage` | `string` | No | Watermark file name on the TNZ platform to apply to the first page only. |
| `WatermarkAllPages` | `string` | No | Watermark file name on the TNZ platform to apply to all pages. |
| `RetryAttempts` | `number` | No | Number of retry attempts on failure. Maximum: 5. |
| `RetryPeriod` | `number` | No | Minutes between retry attempts. Maximum: 60. |
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

*Either `Attachments` or `TemplateID` is required.  
†Alternatively, use the top-level shorthand `ToNumber: '+6491000001'` for a single recipient (comma-separated for multiple). `GroupID` and `ContactID` work the same way as top-level shorthands.

## Destination fields (`IFaxDestination`)

| Field | Description |
|-------|-------------|
| `ToNumber` | Recipient fax number in E.164 format (e.g. `'+6491000001'`). |
| `Recipient` | Generic fallback used by the `AddRecipient(string)` builder method. |
| `Attention` | Personalisation token `[[Attention]]`. |
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
const result = await client.Messaging.Fax.SendMessage({
  Attachments: ['/path/to/document.pdf'],
  ToNumber: '+6491000001',
});

// GroupID and ContactID work the same way as top-level shorthands
const toGroup = await client.Messaging.Fax.SendMessage({
  Attachments: ['/path/to/document.pdf'],
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

const toContact = await client.Messaging.Fax.SendMessage({
  Attachments: ['/path/to/document.pdf'],
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});
```

### High resolution with CSID and retry settings

```typescript
import { FaxResolution } from 'tnzapi-ts';

const result = await client.Messaging.Fax.SendMessage({
  Attachments: ['/path/to/contract.pdf'],
  Destinations: [{ ToNumber: '+6491000001', Attention: 'Accounts Payable' }],
  Resolution: FaxResolution.High,
  CSID: 'MY COMPANY FAX',
  RetryAttempts: 3,
  RetryPeriod: 5,
});
```

### Watermark on all pages

```typescript
const result = await client.Messaging.Fax.SendMessage({
  Attachments: ['/path/to/document.pdf'],
  Destinations: [{ ToNumber: '+6491000001' }],
  WatermarkAllPages: 'Confidential Watermark',
});
```

### Scheduled bulk send with webhook

```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

const result = await client.Messaging.Fax.SendMessage({
  Attachments: ['/path/to/newsletter.pdf'],
  Destinations: [
    { ToNumber: '+6491000001', Company: 'Acme Ltd' },
    { ToNumber: '+6491000002', Company: 'Globex Corp' },
  ],
  SendTime: '2027-01-01 09:00:00',
  Timezone: 'New Zealand',
  WebhookCallbackURL: 'https://yourapp.example.com/webhooks/fax',
  WebhookCallbackFormat: WebhookCallbackFormat.JSON,
});
```

### Builder pattern

```typescript
const msg = client.Messaging.Fax;
msg.AddRecipient({ ToNumber: '+6491000001', Company: 'Acme Ltd' });
msg.AddRecipient({ ToNumber: '+6491000002', Company: 'Globex Corp' });
msg.AddAttachment('/path/to/document.pdf');

const result = await msg.SendMessage({ Reference: 'bulk-fax-run-1' });
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

- [README — Fax](../README.md#fax)
- [TypeScript interface source](../src/Api/Messaging/interfaces/IFaxArgs.ts)
- [More examples](../samples/messaging/send-fax.ts)