# Voice

Deliver pre-recorded audio calls via the TNZ REST API. The SDK accepts local WAV file paths and encodes them to base64 before sending.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.Voice.SendMessage({
  VoiceFiles: [{ Name: 'MessageToPeople', File: '/path/to/message.wav' }],
  ToNumber: '+6421000001',
});

console.log(result.MessageID);
```

> **Note:** `VoiceFiles` is an SDK convenience feature. The SDK reads each WAV file, base64-encodes it, and assigns the data to the named field (e.g. `MessageToPeople`). The API itself receives base64-encoded strings in those fields directly — `VoiceFiles` is not an API parameter.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `VoiceFiles` | `IVoiceFile[]` | Yes* | SDK convenience: local WAV file paths mapped to named audio fields (see below). |
| `MessageToPeople` | `string` | Yes* | Base64-encoded WAV audio for the live-answer message (set directly or via `VoiceFiles`). |
| `MessageToAnswerPhones` | `string` | No | Base64-encoded WAV for answering machines. |
| `TemplateID` | `string (uuid)` | Yes* | Pre-configured template ID (alternative to audio data). |
| `Destinations` | `IVoiceDestination[]` | Yes† | One or more recipients. |
| `CallerID` | `string` | No | Number shown on the recipient's caller ID display. |
| `AnswerPhoneMode` | `AnswerPhoneMode` | No | How to handle answering machines. Default: `NDAS`. |
| `RetryAttempts` | `number` | No | Retry attempts on no-answer. Maximum: 5. |
| `RetryPeriod` | `number` | No | Minutes between retries. Maximum: 60. |
| `NumberOfOperators` | `number` | No | Live operators available for keypad call-routing. Minimum: 1. Default: 99999. |
| `KeypadOptionRequired` | `boolean` | No | Require a keypad press to confirm the recipient heard the message. Default: `false`. |
| `CallRouteMessageToPeople` | `string` | No | Base64-encoded WAV played before connecting the caller to an operator. |
| `CallRouteMessageToOperators` | `string` | No | Base64-encoded WAV played to the operator before the caller is connected. |
| `CallRouteMessageOnWrongKey` | `string` | No | Base64-encoded WAV played on wrong key press. |
| `EndCallMessage` | `string` | No | Base64-encoded WAV audio played at the end of the call, after all other messages. |
| `Options` | `string` | No | Advanced voice options: recording survey responses, IVR, DTMF capture, etc. Contact TNZ for supported values. |
| `Keypads` | `IVoiceKeypad[]` | No | Keypad routing rules (see below). |
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

*At least one of `VoiceFiles`/`MessageToPeople` or `TemplateID` is required.  
†Alternatively, use the top-level shorthand `ToNumber: '+6421000001'` for a single recipient (comma-separated for multiple) — internally resolves to a `MainPhone` destination, same as if you'd written `Destinations: [{ MainPhone: '+6421000001' }]`. `GroupID` and `ContactID` work the same way as top-level shorthands.

## VoiceFile fields (`IVoiceFile`) — SDK convenience

Each entry maps a local WAV file to a named audio field on the API request.

| Field | Type | Description |
|-------|------|-------------|
| `Name` | `string` | Target field. Must be one of: `MessageToPeople`, `MessageToAnswerPhones`, `CallRouteMessageToPeople`, `CallRouteMessageToOperators`, `CallRouteMessageOnWrongKey`. |
| `File` | `string` | Absolute path to a WAV file. The SDK reads and base64-encodes it. |

## Destination fields (`IVoiceDestination`)

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

## Keypad routing (`IVoiceKeypad`)

| Field | Type | Description |
|-------|------|-------------|
| `Tone` | `integer` | DTMF key: 0–9. |
| `RouteNumber` | `string` | Phone number to connect the caller to on this key. |
| `Play` | `string` | TTS text or audio URL to play when this key is pressed. |
| `PlaySection` | `string` | Named section to play: `Main`, `AnswerPhone`, or `WrongKey`. |
| `PlayFile` | `string` | Base64-encoded WAV audio to play when this key is pressed. |
| `File` | `string` | SDK convenience: local WAV file path. Encoded to base64 and sent as `PlayFile`. |

## Code samples

### Single recipient shorthand

```typescript
const result = await client.Messaging.Voice.SendMessage({
  VoiceFiles: [{ Name: 'MessageToPeople', File: '/path/to/message.wav' }],
  ToNumber: '+6421000001',
});

// GroupID and ContactID work the same way as top-level shorthands
const toGroup = await client.Messaging.Voice.SendMessage({
  VoiceFiles: [{ Name: 'MessageToPeople', File: '/path/to/message.wav' }],
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

const toContact = await client.Messaging.Voice.SendMessage({
  VoiceFiles: [{ Name: 'MessageToPeople', File: '/path/to/message.wav' }],
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});
```

### Separate live and answerphone audio

```typescript
import { AnswerPhoneMode } from 'tnzapi-ts';

const result = await client.Messaging.Voice.SendMessage({
  VoiceFiles: [
    { Name: 'MessageToPeople',       File: '/audio/live-answer.wav' },
    { Name: 'MessageToAnswerPhones', File: '/audio/answerphone.wav' },
  ],
  Destinations: [{ MainPhone: '+6421000001' }],
  CallerID: '+6491234567',
  AnswerPhoneMode: AnswerPhoneMode.DAS,
  RetryAttempts: 2,
  RetryPeriod: 5,
});
```

### Keypad routing with builder pattern

```typescript
const msg = client.Messaging.Voice;
msg.AddVoiceFile({ Name: 'MessageToPeople', File: '/audio/menu.wav' });
msg.AddVoiceFile({ Name: 'CallRouteMessageToPeople', File: '/audio/connecting.wav' });
msg.AddRecipient('+6421000001');

const result = await msg.SendMessage({
  KeypadOptionRequired: true,
  NumberOfOperators: 2,
  Keypads: [
    { Tone: 1, RouteNumber: '+6498765432' },
    { Tone: 2, File: '/audio/callback-confirm.wav' },
  ],
});
```

### Send to a group

```typescript
const result = await client.Messaging.Voice.SendMessage({
  VoiceFiles: [{ Name: 'MessageToPeople', File: '/audio/staff-notice.wav' }],
  Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000002' }],
  NumberOfOperators: 1,
  SendTime: '2027-01-01T08:00:00',
  Timezone: 'New Zealand',
});
```

## AnswerPhoneMode values

| Value | Behaviour |
|-------|-----------|
| `NDAS` | No detect, always speak (default). |
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

- [README — Voice](../README.md#voice)
- [TypeScript interface source](../src/Api/Messaging/interfaces/IVoiceArgs.ts)
- [More examples](../samples/messaging/send-voice.ts)