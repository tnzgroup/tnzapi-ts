# TTS (Text-to-Speech)

Deliver voice calls with synthesised speech via the TNZ REST API. The API converts your text to audio and dials each recipient.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.TTS.SendMessage({
  MessageToPeople: 'Hello, this is a reminder about your appointment tomorrow.',
  ToNumber: '+6421000001',
});

console.log(result.MessageID);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `MessageToPeople` | `string` | Yes* | Message read when a live person answers. Supports `[[FirstName]]` etc. |
| `MessageToAnswerPhones` | `string` | No | Message read when an answering machine is detected. |
| `TemplateID` | `string (uuid)` | Yes* | Pre-configured template ID (alternative to `MessageToPeople`). |
| `Destinations` | `ITTSDestination[]` | Yes† | One or more recipients. |
| `Voice` | `TTSVoice` | No | Synthesised voice. Default: `Female1`. Options: `Female1`, `Male1`, `Nicole`, `Russell`, `Amy`, `Brian`, `Emma`. |
| `CallerID` | `string` | No | Number shown on the recipient's caller ID display. |
| `AnswerPhoneMode` | `AnswerPhoneMode` | No | How to handle answering machines. Default: `NDAS`. |
| `RetryAttempts` | `number` | No | Retry attempts on no-answer. Maximum: 5. |
| `RetryPeriod` | `number` | No | Minutes between retries. Maximum: 60. |
| `NumberOfOperators` | `number` | No | Live operators available for keypad call-routing. Minimum: 1. Default: 99999. |
| `KeypadOptionRequired` | `boolean` | No | Require recipient to press a key to confirm the message. Default: `false`. |
| `CallRouteMessageToPeople` | `string` | No | Message played before connecting the caller to an operator. |
| `CallRouteMessageToOperators` | `string` | No | Message played to the operator before the caller is connected. |
| `CallRouteMessageOnWrongKey` | `string` | No | Message played when the wrong keypad key is pressed. |
| `EndCallMessage` | `string` | No | TTS text played at the end of the call, after all other messages. |
| `Options` | `string` | No | Advanced voice options: recording survey responses, IVR, DTMF capture, etc. Contact TNZ for supported values. |
| `Keypads` | `ITTSKeypad[]` | No | Keypad routing rules (see below). |
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

*Either `MessageToPeople` or `TemplateID` is required.  
†Alternatively, use the top-level shorthand `ToNumber: '+6421000001'` for a single recipient (comma-separated for multiple) — internally resolves to a `MainPhone` destination, same as if you'd written `Destinations: [{ MainPhone: '+6421000001' }]`. `GroupID` and `ContactID` work the same way as top-level shorthands.

## Destination fields (`ITTSDestination`)

| Field | Description |
|-------|-------------|
| `MainPhone` | Recipient phone number in E.164 format (e.g. `'+6421000001'`). |
| `Recipient` | Generic fallback used by the `AddRecipient(string)` builder method. |
| `Attention` | `[[Attention]]` |
| `FirstName` | `[[FirstName]]` |
| `LastName` | `[[LastName]]` |
| `Company` | `[[Company]]` |
| `Custom1`–`Custom9` | `[[Custom1]]` … `[[Custom9]]` |
| `ContactID` | UUID of an addressbook contact. Sends to that contact instead of specifying `MainPhone`. |
| `GroupID` | UUID of an addressbook group. Sends to all members of that group. |
| `GroupCode` | Group lookup by code. |

## Keypad routing (`ITTSKeypad`)

| Field | Type | Description |
|-------|------|-------------|
| `Tone` | `integer` | DTMF key: 0–9. |
| `RouteNumber` | `string` | Phone number to connect the caller to when this key is pressed. |
| `Play` | `string` | TTS text to play when this key is pressed (instead of routing). |
| `PlaySection` | `string` | Named section to play: `Main`, `AnswerPhone`, or `WrongKey`. |

## Code samples

### Single recipient shorthand

```typescript
const result = await client.Messaging.TTS.SendMessage({
  MessageToPeople: 'Hello, this is a reminder about your appointment tomorrow.',
  ToNumber: '+6421000001',
});

// GroupID and ContactID work the same way as top-level shorthands
const toGroup = await client.Messaging.TTS.SendMessage({
  MessageToPeople: 'Hello, this is a reminder about your appointment tomorrow.',
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

const toContact = await client.Messaging.TTS.SendMessage({
  MessageToPeople: 'Hello, this is a reminder about your appointment tomorrow.',
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});
```

### With voice, answerphone message, and CallerID

```typescript
import { TTSVoice, AnswerPhoneMode } from 'tnzapi-ts';

const result = await client.Messaging.TTS.SendMessage({
  MessageToPeople: 'Hello, this is a notification from Acme Ltd.',
  MessageToAnswerPhones: 'Hi, we tried to reach you. Please call us back on 0800 123 456.',
  Voice: TTSVoice.Female1,
  CallerID: '+6491234567',
  AnswerPhoneMode: AnswerPhoneMode.DAS,
  Destinations: [{ MainPhone: '+6421000001' }],
});
```

### Keypad routing with builder pattern

```typescript
import { TTSVoice } from 'tnzapi-ts';

const msg = client.Messaging.TTS;
msg.AddRecipient('+6421000001');

const result = await msg.SendMessage({
  MessageToPeople: 'Press 1 to confirm your appointment, or press 2 to cancel.',
  Voice: TTSVoice.Female1,
  KeypadOptionRequired: true,
  CallRouteMessageToPeople: 'Connecting you to our team now.',
  CallRouteMessageToOperators: 'Incoming appointment call.',
  CallRouteMessageOnWrongKey: 'Sorry, that was not a valid option. Please try again.',
  NumberOfOperators: 2,
  Keypads: [
    { Tone: 1, Play: 'Thank you, your appointment is confirmed.' },
    { Tone: 2, RouteNumber: '+6498765432' },
  ],
});
```

### Retry and bulk send

```typescript
const result = await client.Messaging.TTS.SendMessage({
  MessageToPeople: 'Critical alert: action required.',
  Destinations: [
    { MainPhone: '+6421000001' },
    { MainPhone: '+6421000002' },
  ],
  RetryAttempts: 3,
  RetryPeriod: 5,
  NumberOfOperators: 1,
});
```

### Scheduled send to a group

```typescript
const result = await client.Messaging.TTS.SendMessage({
  MessageToPeople: 'Staff meeting at 2pm today in the main boardroom.',
  Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000002' }],
  SendTime: '2027-01-01T08:00:00',
  Timezone: 'New Zealand',
});
```

## AnswerPhoneMode values

| Value | Behaviour |
|-------|-----------|
| `NDAS` | No detect, always speak — treats all answers as live (default). |
| `NDAF` | No detect, always fax. |
| `DAS` | Detect and speak — plays `MessageToAnswerPhones` on machines. |
| `DAF` | Detect and fax. |

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

- [README — TTS](../README.md#tts-text-to-speech)
- [TypeScript interface source](../src/Api/Messaging/interfaces/ITTSArgs.ts)
- [More examples](../examples/messaging/send-tts.ts)