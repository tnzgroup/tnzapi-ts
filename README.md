# tnzapi-ts

## TypeScript Client Library for TNZ REST API v3.00

A TypeScript client library for the [TNZ REST API](https://www.tnz.co.nz/docs/restapi), covering messaging (SMS, Email, Fax, TTS, Voice, WhatsApp, RCS, Workflow), reports, actions, addressbook, and opt-out management.

All HTTP communication uses Node.js built-in `http`/`https` modules.

---

## Table of Contents

- [Installation](#installation)
- [Supported Environments & Frameworks](#supported-environments--frameworks)
- [Configuration](#configuration)
- [Quick Start](#quick-start)
- [Messaging](#messaging)
  - [SMS](#send-sms)
  - [Email](#send-email)
  - [Fax](#send-fax)
  - [TTS (Text-to-Speech)](#make-a-tts-call)
  - [Voice (Audio File)](#make-a-voice-call-audio-file)
  - [WhatsApp](#send-whatsapp-message)
  - [RCS](#send-rcs-message)
  - [Workflow](#send-workflow-message)
  - [📄 Detailed channel docs](docs/messaging.md)
  - [Using Addressbook Destinations](#using-addressbook-destinations)
  - [Builder API (AddRecipient, AddAttachment)](#builder-api-addrecipient-addattachment)
  - [Scheduled Sending](#scheduled-sending)
  - [Webhooks](#webhooks)
- [Reports](#reports)
  - [Message Status](#get-message-status)
  - [SMS Reply](#get-sms-replies)
  - [SMS Received](#get-sms-received-list)
- [Actions](#actions)
  - [Abort](#abort-a-job)
  - [Reschedule](#reschedule-a-job)
  - [Resubmit](#resubmit-a-failed-job)
  - [Pacing](#adjust-pacing)
- [Opt-Out Management](#opt-out-management)
- [Addressbook](#addressbook)
  - [Contacts](#contacts)
  - [Groups](#groups)
  - [Contact Groups](#contact-groups)
  - [Group Contacts](#group-contacts)
- [Response Structure](#response-structure)
- [Error Handling](#error-handling)
- [TypeScript Types Reference](#typescript-types-reference)

---

## Installation

```bash
npm install tnzapi-ts
```

---

## Supported Environments & Frameworks

### Runtime

`tnzapi-ts` is a **Node.js library** — it talks to the TNZ API using Node's built-in `http`/`https` modules and reads local files via `fs` (for attachments). It does **not** run in a browser: bundlers targeting the browser (webpack/Vite/CRA browser builds, plain `<script>` tags) can't resolve these Node built-ins.

- **Node.js:** 14.x or later (LTS recommended). The compiled output uses native optional chaining (`?.`), which requires Node 14+.
- **Module format:** CommonJS (`require`/`module.exports`) with generated `.d.ts` declarations. Also works from ESM projects (`"type": "module"` in `package.json`) via Node's standard CommonJS interop — `import { TNZAPI } from 'tnzapi-ts'` works either way.
- **TypeScript:** No minimum enforced; developed and tested against TypeScript 5.4+. Plain JavaScript projects (CommonJS or ESM) can use the library too — types are optional, not required.

### Frameworks

Because it's Node-only, `tnzapi-ts` works in any framework or runtime that executes JavaScript/TypeScript **server-side**:

| Framework / Runtime | Supported | Notes |
|---|---|---|
| Node.js (plain scripts, `ts-node`) | ✅ | |
| Express | ✅ | |
| Fastify | ✅ | |
| Koa | ✅ | |
| NestJS | ✅ | |
| Next.js | ✅ (server only) | API Routes, Route Handlers, Server Components, Server Actions. **Not** Client Components (`"use client"`) — those execute in the browser. |
| Remix / React Router (framework mode) | ✅ (server only) | Loaders and actions only, not browser-rendered components |
| AWS Lambda / Azure Functions / Google Cloud Functions | ✅ | Node.js runtime required |
| Electron | ✅ (main process only) | Not the renderer process, unless `nodeIntegration` is enabled |
| Browser (client-side React/Vue/Angular, plain `<script>`) | ❌ | No `fs`/`http`/`https` in the browser — bundling will fail or require broken polyfills |

---

## Configuration

### Credentials

Obtain your **Auth Token** from the TNZ Dashboard › Users › API › Auth Token.

There are two ways to provide your credentials:

---

**Option 1 — Environment file (recommended)**

Create a `.env` file in your project root (or copy from the example):

```bash
cp .env.example .env
```

`.env` contents:

```
TNZ_AUTH_TOKEN=your-auth-token-here
```

`tnzapi-ts` has zero runtime dependencies and only reads `process.env.TNZ_AUTH_TOKEN` — it does **not** load `.env` files itself. Some frameworks (Next.js, NestJS with `ConfigModule`, etc.) load `.env` into `process.env` automatically; in a plain Node.js script you need to load it yourself, e.g. with [`dotenv`](https://www.npmjs.com/package/dotenv):

```bash
npm install dotenv
```

```typescript
import 'dotenv/config';
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();
```

If `TNZ_AUTH_TOKEN` is not set, the constructor throws immediately:

```
Error: TNZ AuthToken is required. Pass it as AuthToken or set the TNZ_AUTH_TOKEN environment variable.
```

---

**Option 2 — Pass directly to the constructor**

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({
    AuthToken: "your-auth-token-here"
});
```

Both styles are equivalent — the constructor falls back to `TNZ_AUTH_TOKEN` only when `AuthToken` is not passed.

---

**Custom API URL (e.g. staging or local dev):**

```typescript
const client = new TNZAPI({
    AuthToken: "your-auth-token-here",
    URL: "https://staging-api.tnz.co.nz/api/v3.00"
});
```

Or via environment variable:

```
TNZ_API_URL=https://staging-api.tnz.co.nz/api/v3.00
```

`TNZ_API_URL` must use `https://` — the library refuses to send the `Authorization` bearer token over plain HTTP, since it would otherwise be exposed to network interception. For a local dev server without a valid certificate, use `https://` with `TNZ_UNSAFE_IGNORE_SSL=true` (see below) rather than switching to `http://`. If you genuinely need plain HTTP (e.g. a local mock server), set `TNZ_ALLOW_INSECURE_HTTP=true` — never do this outside local development.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TNZ_AUTH_TOKEN` | Yes\* | — | Bearer token from TNZ Dashboard |
| `TNZ_API_URL` | No | `https://api.tnz.co.nz/api/v3.00` | Override the base API URL. Must be `https://` unless `TNZ_ALLOW_INSECURE_HTTP` is set |
| `TNZ_UNSAFE_IGNORE_SSL` | No | — | Set to `true` to bypass TLS certificate verification (local dev with self-signed certs). Named for visibility — this disables MITM protection while still sending your real bearer token, so never set it outside local development. Also hard-fails if `NODE_ENV=production` |
| `TNZ_ALLOW_INSECURE_HTTP` | No | — | Set to `true` to allow `TNZ_API_URL`/`URL` to use plain `http://` (local development only — never in production) |

\* Required unless passed directly to the constructor.

---

## Quick Start

```typescript
import { TNZAPI } from 'tnzapi-ts';

// Reads TNZ_AUTH_TOKEN from environment automatically
const client = new TNZAPI();

// Send an SMS
const result = await client.Messaging.SMS.SendMessage({
    Message: "Hello from tnzapi-ts!",
    Destinations: [
        { ToNumber: "+64211234567" },
        { ToNumber: "+64251234567" }
    ]
});

console.log(result.Result);    // "Success"
console.log(result.MessageID); // "ID-abc123..."
```

---

## Messaging

All messaging methods return `Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO>`.

**Success response shape:**
```typescript
{
    Result: "Success",
    MessageID: string,   // Use this to track / report on the message
    JobNum?: string,
    Status?: string
}
```

### Common Parameters

All messaging calls accept these optional parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `Reference` | `string` | Your internal reference (visible in reports) |
| `MessageID` | `string` | Force a specific message ID (must be unique) |
| `SendTime` | `string` | Schedule send time — `YYYY-MM-DD HH:mm` or ISO 8601 |
| `Timezone` | `string` | Timezone for `SendTime` (e.g. `"New Zealand"`) |
| `SubAccount` | `string` | Sub-account code |
| `Department` | `string` | Department code |
| `ChargeCode` | `string` | Charge code for billing |
| `ReportTo` | `string` | Email address to receive delivery reports |
| `NotificationType` | `NotificationType` | Delivery notification type (`None`, `Webhook`, `Email`) |
| `WebhookCallbackURL` | `string` | Webhook URL for status updates |
| `WebhookCallbackFormat` | `"JSON"` \| `"XML"` \| `"POST"` \| `"GET"` | Required when `WebhookCallbackURL` is set |
| `Mode` | `"Test"` | Use `"Test"` to validate without sending |

---

### Send SMS

→ [Full parameter reference](docs/sms.md)

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.SMS.SendMessage({
    Message: "Hello! Your code is 1234.",
    Destinations: [
        { ToNumber: "+64211234567" },
        { ToNumber: "+64221234567" }
    ]
});

console.log(result.MessageID); // Track this for status reports
```

**SMS-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `Message` | `string` | The SMS body (required unless `TemplateID` is set) |
| `TemplateID` | `string (uuid)` | Pre-built template ID (alternative to `Message`) |
| `Destinations` | `ISMSDestination[]` | **Required.** Recipients |
| `ToNumber` | `string` | Single-recipient shorthand (alternative to `Destinations`); comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |
| `FallbackMode` | `SMSFallbackMode` | Fallback channel (`None`, `RCS`, `WAPP`, `Voice`) |
| `SMSEmailReply` | `string` | Email to receive SMS replies |
| `CharacterConversion` | `boolean` | Convert non-GSM characters |

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.SMS.SendMessage({
    Message: "Hello! Your code is 1234.",
    ToNumber: "+64211234567"
});
```

**With scheduling and webhook:**
```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

const result = await client.Messaging.SMS.SendMessage({
    Reference: "promo-2030-01",
    Message: "Your appointment is tomorrow at 9am.",
    SendTime: "2030-06-01 08:00",
    Timezone: "New Zealand",
    Destinations: [
        { ToNumber: "+64271234567" },
        { ToNumber: "+64281234567" }
    ],
    WebhookCallbackURL: "https://yourapp.com/webhooks/sms",
    WebhookCallbackFormat: WebhookCallbackFormat.JSON
});
```

**Test mode (validates without sending):**
```typescript
const result = await client.Messaging.SMS.SendMessage({
    Message: "Test",
    Mode: "Test",
    Destinations: [
        { ToNumber: "+64291234567" },
        { ToNumber: "+64211234568" }
    ]
});
```

---

### Send Email

→ [Full parameter reference](docs/email.md)

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.Email.SendMessage({
    FromEmail: "noreply@yourcompany.com",
    EmailSubject: "Your monthly statement",
    MessagePlain: "Please find your statement attached.",
    Destinations: [
        { EmailAddress: "alice@example.com" },
        { EmailAddress: "bob@example.com" }
    ]
});
```

**Email-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `EmailSubject` | `string` | **Required.** Email subject line |
| `MessagePlain` | `string` | Plain-text body (required if `MessageHTML`/`TemplateID` not set) |
| `MessageHTML` | `string` | HTML body (alternative to `MessagePlain`) |
| `TemplateID` | `string (uuid)` | Pre-built template ID (alternative to message body) |
| `Destinations` | `IEmailDestination[]` | **Required.** Recipients |
| `EmailAddress` | `string` | Single-recipient shorthand (alternative to `Destinations`); comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |
| `FromEmail` | `string` | Sender email address |
| `SMTPFrom` | `string` | Legacy/alternate sender field (rarely needed — prefer `FromEmail`) |
| `From` | `string` | Legacy/alternate sender field (rarely needed — prefer `FromEmail`) |
| `ReplyTo` | `string` | Reply-to email address |
| `CCEmail` | `string` | CC email address |
| `BCCEmail` | `string` | BCC email address |
| `Attachments` | `string[]` | Paths to local files to attach |

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.Email.SendMessage({
    EmailSubject: "Your monthly statement",
    MessagePlain: "Please find your statement attached.",
    EmailAddress: "customer@example.com"
});
```

**With HTML body and attachment:**
```typescript
const result = await client.Messaging.Email.SendMessage({
    FromEmail: "noreply@yourcompany.com",
    EmailSubject: "Invoice #1001",
    MessageHTML: "<h1>Invoice</h1><p>Please find your invoice attached.</p>",
    MessagePlain: "Invoice attached.",
    Attachments: ["/path/to/invoice-1001.pdf"],
    Destinations: [
        { EmailAddress: "carol@example.com" },
        { EmailAddress: "dave@example.com" }
    ]
});
```

---

### Send Fax

→ [Full parameter reference](docs/fax.md)

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.Fax.SendMessage({
    Destinations: [
        { ToNumber: "+6491234567" },
        { ToNumber: "+6492345678" }
    ],
    Attachments: ["/path/to/document.pdf"]
});
```

**Fax-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `Destinations` | `IFaxDestination[]` | **Required.** Fax numbers |
| `ToNumber` | `string` | Single-recipient shorthand (alternative to `Destinations`); comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |
| `TemplateID` | `string (uuid)` | Pre-built template ID (alternative to `Attachments`) |
| `Attachments` | `string[]` | Paths to local PDF/image files |
| `Resolution` | `FaxResolution` | Fax resolution (`Low` or `High`) |
| `CallerID` | `string` | Caller ID displayed to the recipient's fax machine |
| `CSID` | `string` | Fax header identifier string |
| `RetryAttempts` | `number` | Number of retry attempts |
| `RetryPeriod` | `number` | Minutes between retries |
| `WatermarkFolder` | `string` | TNZ watermark folder name |
| `WatermarkFirstPage` | `string` | Watermark file applied to first page |
| `WatermarkAllPages` | `string` | Watermark file applied to all pages |

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.Fax.SendMessage({
    ToNumber: "+6491234567",
    Attachments: ["/path/to/document.pdf"]
});
```

**With retry settings and watermark:**
```typescript
import { FaxResolution } from 'tnzapi-ts';

const result = await client.Messaging.Fax.SendMessage({
    Reference: "contract-signed",
    Resolution: FaxResolution.High,
    RetryAttempts: 5,
    RetryPeriod: 10,
    Destinations: [
        { ToNumber: "+6441234567" },
        { ToNumber: "+6431234567" }
    ],
    Attachments: ["/path/to/contract.pdf"]
});
```

---

### Make a TTS Call

→ [Full parameter reference](docs/tts.md)

Text-to-Speech: the API reads your message aloud to the called party.

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.TTS.SendMessage({
    MessageToPeople: "Hello, this is a reminder that your appointment is tomorrow at 9am. Press 1 to confirm.",
    Destinations: [
        { MainPhone: "+64211234567" },
        { MainPhone: "+64221234567" }
    ]
});
```

**TTS-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `MessageToPeople` | `string` | Message read when a person answers (required unless `TemplateID` set) |
| `TemplateID` | `string (uuid)` | Pre-built template ID (alternative to `MessageToPeople`) |
| `MessageToAnswerPhones` | `string` | Message left on voicemail/answerphone |
| `AnswerPhoneMode` | `AnswerPhoneMode` | Answerphone behaviour (`NDAS`, `NDAF`, `DAS`, `DAF`) |
| `Destinations` | `ITTSDestination[]` | **Required.** Phone numbers to call |
| `ToNumber` | `string` | Single-recipient shorthand (alternative to `Destinations`, resolves to `MainPhone`); comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |
| `CallerID` | `string` | Caller ID displayed to recipients |
| `Voice` | `TTSVoice` | Voice type (`Female1`, `Male1`, `Nicole`, `Russell`, etc.) |
| `RetryAttempts` | `number` | Retry attempts on no-answer |
| `RetryPeriod` | `number` | Minutes between retries |
| `NumberOfOperators` | `number` | Max simultaneous calls |
| `KeypadOptionRequired` | `boolean` | Require keypad input before proceeding |
| `EndCallMessage` | `string` | Message played before the call ends |
| `Options` | `string` | Additional call options (raw passthrough) |
| `Keypads` | `ITTSKeypad[]` | IVR keypad routing options |

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.TTS.SendMessage({
    MessageToPeople: "Hello, this is a reminder about your appointment tomorrow at 9am.",
    ToNumber: "+64211234567"
});
```

**With answerphone message and keypad routing:**
```typescript
import { TTSVoice, AnswerPhoneMode } from 'tnzapi-ts';

const result = await client.Messaging.TTS.SendMessage({
    MessageToPeople: "Press 1 to confirm your appointment. Press 2 to cancel.",
    MessageToAnswerPhones: "We called about your appointment. Please call us back.",
    Voice: TTSVoice.Nicole,
    AnswerPhoneMode: AnswerPhoneMode.DAS,
    CallerID: "+6491234567",
    RetryAttempts: 3,
    RetryPeriod: 5,
    Destinations: [
        { MainPhone: "+64271234567" },
        { MainPhone: "+64291234567" }
    ],
    Keypads: [
        { Tone: 1, RouteNumber: "+6491234567" },   // Transfer to operator on key 1
        { Tone: 2, Play: "Thank you, your appointment has been cancelled." }
    ]
});
```

---

### Make a Voice Call (Audio File)

→ [Full parameter reference](docs/voice.md)

Play a pre-recorded WAV or MP3 file to called parties.

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.Voice.SendMessage({
    Destinations: [
        { MainPhone: "+64221234567" },
        { MainPhone: "+64281234567" }
    ],
    VoiceFiles: [
        {
            Name: "MessageToPeople",       // Which part of the call this file plays for
            File: "/path/to/message.wav"   // WAV, 16-bit, 8000 Hz recommended
        }
    ]
});
```

**Voice-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `Destinations` | `IVoiceDestination[]` | **Required.** Phone numbers to call |
| `ToNumber` | `string` | Single-recipient shorthand (alternative to `Destinations`, resolves to `MainPhone`); comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |
| `TemplateID` | `string (uuid)` | Pre-built template ID (alternative to `MessageToPeople`/`VoiceFiles`) |
| `VoiceFiles` | `IVoiceFile[]` | Audio files to play. `Name` values: `MessageToPeople`, `MessageToAnswerPhones`, `CallRouteMessageToPeople`, `CallRouteMessageToOperators`, `CallRouteMessageOnWrongKey` |
| `MessageToPeople` | `string` | Optional TTS fallback if no audio file for live answer |
| `MessageToAnswerPhones` | `string` | Optional TTS fallback for answerphone |
| `AnswerPhoneMode` | `AnswerPhoneMode` | Answerphone behaviour (`NDAS`, `NDAF`, `DAS`, `DAF`) |
| `CallerID` | `string` | Caller ID shown to recipients |
| `RetryAttempts` | `number` | Retry attempts on no-answer |
| `RetryPeriod` | `number` | Minutes between retries |
| `NumberOfOperators` | `number` | Max simultaneous calls |
| `KeypadOptionRequired` | `boolean` | Require keypad input before proceeding |
| `EndCallMessage` | `string` | Message played before the call ends |
| `Options` | `string` | Additional call options (raw passthrough) |
| `Keypads` | `IVoiceKeypad[]` | IVR keypad options (can include audio `File`) |

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.Voice.SendMessage({
    ToNumber: "+64211234567",
    VoiceFiles: [
        { Name: "MessageToPeople", File: "/path/to/message.wav" }
    ]
});
```

**Multiple audio files with keypad routing:**
```typescript
const result = await client.Messaging.Voice.SendMessage({
    Destinations: [
        { MainPhone: "+64251234567" },
        { MainPhone: "+64211234568" }
    ],
    VoiceFiles: [
        { Name: "MessageToPeople",     File: "/audio/main-message.wav" },
        { Name: "MessageToAnswerPhones", File: "/audio/voicemail.wav" }
    ],
    Keypads: [
        { Tone: 1, RouteNumber: "+6491234567" },         // Transfer to number
        { Tone: 2, File: "/audio/cancelled.wav" }        // Play audio on key 2
    ]
});
```

---

### Send WhatsApp Message

→ [Full parameter reference](docs/whatsapp.md)

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.WhatsApp.SendMessage({
    Message: "Hello! Your order has been dispatched.",
    Destinations: [
        { ToNumber: "+64221234568" },
        { ToNumber: "+64211234567" }
    ]
});
```

**WhatsApp-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `Message` | `string` | Plain-text message body (required unless `TemplateID` set) |
| `TemplateID` | `string (uuid)` | Pre-approved WhatsApp template ID |
| `FallbackMode` | `WhatsAppFallbackMode` | Fallback channel if WhatsApp fails (`None`, `RCS`, `SMS`, `Voice`) |
| `Destinations` | `IWhatsAppDestination[]` | **Required.** WhatsApp-registered numbers |
| `ToNumber` | `string` | Single-recipient shorthand (alternative to `Destinations`); comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |
| `FromNumber` | `string` | WhatsApp sender number |
| `ReportTo` | `string` | Email address to receive delivery reports |
| `Attachments` | `string[]` | Paths to local media files to attach |

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.WhatsApp.SendMessage({
    Message: "Hello! Your order has been dispatched.",
    ToNumber: "+64211234567"
});
```

---

### Send RCS Message

→ [Full parameter reference](docs/rcs.md)

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.RCS.SendMessage({
    Message: "Hello [[FirstName]], your appointment is confirmed.",
    Destinations: [
        { ToNumber: "+6421000001", FirstName: "Alice" },
        { ToNumber: "+6421000002", FirstName: "Bob" }
    ]
});
```

**RCS-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `Message` | `string` | Message body (required unless `TemplateID` set) |
| `TemplateID` | `string (uuid)` | Pre-configured template ID |
| `FallbackMode` | `RCSFallbackMode` | Fallback channel if RCS unavailable (`None`) |
| `Destinations` | `IRCSDestination[]` | **Required.** Recipients with mobile numbers |
| `ToNumber` | `string` | Single-recipient shorthand (alternative to `Destinations`); comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |
| `FromNumber` | `string` | Sender ID or number |

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.RCS.SendMessage({
    Message: "Hello, your appointment is confirmed.",
    ToNumber: "+6421000001"
});
```

---

### Send Workflow Message

→ [Full parameter reference](docs/workflow.md)

Workflows are multi-channel sequences configured in the TNZ Dashboard.

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.Workflow.SendMessage({
    WorkflowTemplateID: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    Destinations: [
        { ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98" },
        { ContactID: "8000000a-f002-4007-b00a-d00000000002" }
    ]
});
```

**Workflow-specific parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `WorkflowTemplateID` | `string (uuid)` | **Required.** UUID of the workflow template from TNZ Dashboard |
| `Destinations` | `IWorkflowDestination[]` | **Required.** Use an addressbook `ContactID`/`GroupID`, or supply `ToNumber`/`EmailAddress`/`MainPhone` to create a new contact inline |
| `ToNumber` | `string` | Single-recipient shorthand (alternative to `Destinations`); comma-separated for multiple |
| `MainPhone` | `string` | Single-recipient shorthand (alternative to `Destinations`), independent of `ToNumber`; comma-separated for multiple |
| `GroupID` | `string` | Single-group shorthand (alternative to `Destinations`); comma-separated for multiple |
| `ContactID` | `string` | Single-contact shorthand (alternative to `Destinations`); comma-separated for multiple |

> **Note:** Inline destinations (`ToNumber`, `EmailAddress`, `MainPhone`) automatically create a new addressbook entry for the recipient, or update a matching existing one if a contact with that phone/email already exists in your addressbook. This also applies to the top-level `ToNumber`/`MainPhone` shorthand fields above — they resolve internally to exactly the same `Destinations: [{ ToNumber: ... }]` / `[{ MainPhone: ... }]` shape, so sending a Workflow request via shorthand without a `ContactID`/`GroupID` will create-or-update an addressbook contact, the same as writing out the `Destinations` array by hand. (`EmailAddress` is not available as a top-level shorthand for Workflow — only inside `Destinations`.)

**Single-recipient shorthand:**
```typescript
const result = await client.Messaging.Workflow.SendMessage({
    WorkflowTemplateID: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98"
});
```

---

### Using Addressbook Destinations

All messaging APIs support sending to addressbook contacts and groups instead of (or in addition to) bare phone numbers.

```typescript
// Send SMS to a specific contact in the addressbook
await client.Messaging.SMS.SendMessage({
    Message: "Hello from the addressbook!",
    Destinations: [
        { ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98" }
    ]
});

// Send to an entire group
await client.Messaging.SMS.SendMessage({
    Message: "Hello group!",
    Destinations: [
        { GroupID: "ecf323e6-c432-11f0-98a9-86ea8dc1d654" }
    ]
});

// Mix bare numbers with addressbook entries
await client.Messaging.Email.SendMessage({
    EmailSubject: "Newsletter",
    MessagePlain: "Our latest updates.",
    Destinations: [
        { EmailAddress: "direct@example.com" },
        { ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98" },
        { GroupID: "ecf323e6-c432-11f0-98a9-86ea8dc1d654" }
    ]
});
```

---

### Single Destination Shorthand

Every messaging channel also accepts a single-recipient shorthand directly on the top-level args, as
an alternative to wrapping one recipient in `Destinations: [...]`. Comma-separated values create
multiple destinations:

```typescript
// Equivalent to Destinations: [{ ToNumber: "+64211234567" }]
await client.Messaging.SMS.SendMessage({
    Message: "Hello!",
    ToNumber: "+64211234567"
});

// Comma-separated values create multiple destinations
await client.Messaging.SMS.SendMessage({
    Message: "Hello!",
    ToNumber: "+64211234567,+64221234567"
});

// GroupID works the same way, and combines additively with Destinations
await client.Messaging.SMS.SendMessage({
    Message: "Hello!",
    GroupID: "4000000b-f002-4007-b00a-c00000000005"
});

// So does ContactID — available on every channel, comma-separated for multiple
await client.Messaging.SMS.SendMessage({
    Message: "Hello!",
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98,8000000a-f002-4007-b00a-d00000000002"
});

// Email uses EmailAddress instead of ToNumber — same comma-separated behaviour
await client.Messaging.Email.SendMessage({
    EmailSubject: "Your invoice",
    MessagePlain: "Please find your invoice attached.",
    EmailAddress: "alice@example.com,bob@example.com"
});
```

The shorthand field per channel is: `ToNumber` (SMS, Fax, WhatsApp, RCS), `EmailAddress` (Email),
`ToNumber` (TTS, Voice — resolves internally to the same destination as `MainPhone`), and both
`ToNumber` and `MainPhone` (Workflow). `GroupID`/`ContactID` are available on every channel.

---

### Builder API (`AddRecipient`, `AddAttachment`)

All messaging API classes expose a builder-style API as an alternative to passing arguments to `SendMessage` directly.

> **Prefer `SendMessage({ Destinations: [...] })`** for typed destination objects. The builder API is retained for backward compatibility and is most useful for adding simple phone-number strings.

All builder methods return `this`, so calls can be chained:

```typescript
// SMS — chain recipients then send
const result = await client.Messaging.SMS
    .AddRecipient('+64211234567')
    .AddRecipient({ ToNumber: '+64221234567', FirstName: 'Jane' })
    .AddRecipient([{ ToNumber: '+64231234567' }, { ToNumber: '+64241234567' }])
    .SendMessage({ Message: 'Hello!' });

// Email — chain recipients and attachments
const result = await client.Messaging.Email
    .AddRecipient({ EmailAddress: 'user@example.com' })
    .AddAttachment('/path/to/report.pdf')
    .AddAttachment('/path/to/invoice.pdf')
    .SendMessage({ EmailSubject: 'Your documents', MessagePlain: 'See attached.' });

// TTS — chain recipients and keypads
const result = await client.Messaging.TTS
    .AddRecipient({ MainPhone: '+6421000001' })
    .AddKeypad(1, '+6491001001', 'Transferring to sales.')
    .AddKeypad(2, '+6491001002', 'Transferring to support.')
    .SendMessage({ MessageToPeople: 'Press 1 for sales, 2 for support.' });

// Voice — chain recipients, audio files, and keypads
const result = await client.Messaging.Voice
    .AddRecipient({ MainPhone: '+6421000001' })
    .AddVoiceFile('MessageToPeople', '/audio/message.wav')
    .AddKeypad(1, '+6491001001', '/audio/transfer.wav')
    .SendMessage();
```

> **Note:** `AddRecipient('+64...')` (string input) produces `{ Recipient: '...' }` internally for backward compatibility. Both the string and object forms are accepted by the API. State accumulated via builder calls is reset after each `SendMessage` call.

> **Note:** `AddAttachment` and `AddVoiceFile` check that the file exists when called. A path that doesn't resolve to a real file is not silently dropped — it's recorded, and the next `SendMessage` call returns `{ Result: "Error", ErrorMessage: ["Attachment file not found: <path>"] }` instead of sending without it.

`AddRecipient` is typed per channel, not against the cross-channel union: on `client.Messaging.SMS`, for example, it's `(recipient: string | ISMSDestination | Array<string | ISMSDestination>) => this` — passing another channel's destination type (e.g. an `IEmailDestination` to `Messaging.SMS.AddRecipient`) will fail to type-check. Each messaging class accepts string, its own destination object, or an array of either. `IMessagingDestination` (`ISMSDestination | IEmailDestination | IFaxDestination | ITTSDestination | IVoiceDestination | IWhatsAppDestination | IRCSDestination | IWorkflowDestination`) is exported as a convenience union type, not the actual parameter type of any single channel's `AddRecipient`.

---

### Scheduled Sending

Use `SendTime` and optionally `Timezone` to schedule messages:

```typescript
await client.Messaging.SMS.SendMessage({
    Message: "Good morning! Today's meeting is at 10am.",
    SendTime: "2030-12-25 08:00",
    Timezone: "New Zealand",
    Destinations: [
        { ToNumber: "+64281234567" },
        { ToNumber: "+64291234567" }
    ]
});
```

Accepted `SendTime` formats: `YYYY-MM-DD`, `YYYY-MM-DD HH:mm`, ISO 8601.

---

### Webhooks

Receive real-time delivery status updates via webhook:

```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

await client.Messaging.SMS.SendMessage({
    Message: "Hello!",
    Destinations: [
        { ToNumber: "+64251234567" },
        { ToNumber: "+64221234568" }
    ],
    WebhookCallbackURL: "https://yourapp.com/webhooks/tnz",
    WebhookCallbackFormat: WebhookCallbackFormat.JSON   // JSON | XML | POST | GET
});
```

---

## Reports

### Get Message Status

Poll the delivery status of a previously sent message.

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Reports.Status.Poll({
    MessageID: "ID-abc123",
    Channel: "sms"          // sms | email | fax | tts | voice | whatsapp | rcs | workflow
});

console.log(result.JobStatus);    // e.g. "Completed"
console.log(result.Recipients);   // Array of per-recipient delivery results
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `MessageID` | `string` | **Required.** The MessageID returned when the message was sent |
| `Channel` | `string` | Channel the message was sent on (defaults to `"sms"`) |
| `RecordsPerPage` | `number` | Recipients per page (1–999, default: 100) |
| `Page` | `number` | Page number (default: 1) |

**Response fields:**

```typescript
{
    Result: string,
    MessageID?: string,
    JobStatus?: string,       // "Completed", "Processing", "Delayed", etc.
    JobNum?: string,
    Account?: string,
    SubAccount?: string,
    Department?: string,
    Reference?: string,
    CreatedTimeLocal?: string,
    CreatedTimeUTC?: string,
    DelayedTimeLocal?: string,
    DelayedTimeUTC?: string,
    Timezone?: string,
    Count?: number,            // Total recipients
    Complete?: number,
    Success?: number,          // Successfully delivered
    Failed?: number,           // Failed deliveries
    Price?: number,
    TotalRecords?: number,
    RecordsPerPage?: number,
    PageCount?: number,
    Page?: number,
    Recipients: [
        {
            Type?: string,
            DestSeq?: number,
            Destination?: string,
            ContactID?: string,
            Status?: string,
            Result?: string,
            SentTimeLocal?: string,
            SentTimeUTC?: string,
            Price?: number
            // plus Attention, Company, Custom1-9, RemoteID
        }
    ]
}
```

---

### Get SMS Replies

Retrieve replies sent by recipients to an SMS message.

```typescript
const result = await client.Reports.SMSReply.Poll({
    MessageID: "ID-abc123",
    Page: 1,
    RecordsPerPage: 50
});

for (const recipient of result.Recipients ?? []) {
    for (const reply of recipient.SMSReplies ?? []) {
        console.log(`From ${reply.From}: ${reply.MessageText}`);
    }
}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `MessageID` | `string` | **Required.** The MessageID of the SMS that was sent |
| `RecordsPerPage` | `number` | Default: 100, max: 999 |
| `Page` | `number` | Default: 1 |

---

### Get SMS Received List

Retrieve inbound SMS messages received in a time window.

```typescript
// By time period (last N minutes)
const result = await client.Reports.SMSReceived.Poll({
    TimePeriod: 1440,        // Last 24 hours (1–1440 minutes)
    RecordsPerPage: 50,
    Page: 1
});

// By date range
const result2 = await client.Reports.SMSReceived.Poll({
    DateFrom: "2030-01-01",
    DateTo: "2030-01-31"
});

for (const msg of result.Messages ?? []) {
    console.log(`From ${msg.From}: ${msg.MessageText}`);
}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `TimePeriod` | `number` | Minutes to look back (1–1440). Used if `DateFrom`/`DateTo` not set |
| `DateFrom` | `string` | Start date — ISO 8601 or `YYYY-MM-DD`. Must be supplied together with `DateTo` |
| `DateTo` | `string` | End date — ISO 8601 or `YYYY-MM-DD`. Must be supplied together with `DateFrom` |
| `RecordsPerPage` | `number` | Default: 100, max: 999 |
| `Page` | `number` | Default: 1 |

Supplying only one of `DateFrom`/`DateTo` is a validation error — it does not fall back to `TimePeriod`.

---

## Actions

Actions operate on messages that have already been submitted. All require `MessageID` and `Channel`.

Channels used across these actions: `sms`, `email`, `fax`, `tts`, `voice`. `Abort` and `Reschedule` accept any non-empty `Channel` value client-side (no allow-list enforced by the SDK); `Resubmit` and `Pacing` enforce the specific channel restrictions noted below.

---

### Abort a Job

Cancel a pending or delayed message before it is sent.

```typescript
const result = await client.Actions.Abort.SendRequest({
    MessageID: "ID-abc123",
    Channel: "sms"
});
```

---

### Reschedule a Job

Change the send time of a delayed (scheduled) message.

```typescript
const result = await client.Actions.Reschedule.SendRequest({
    MessageID: "ID-abc123",
    Channel: "email",
    SendTime: "2030-06-15 09:00"   // Must be a parseable date (YYYY-MM-DD HH:mm or ISO 8601); the API rejects times in the past
});
```

---

### Resubmit a Failed Job

Retry a message that previously failed delivery.

> Supported channels: `email`, `fax`, `tts`, `voice` only. SMS resubmit is not supported.

```typescript
const result = await client.Actions.Resubmit.SendRequest({
    MessageID: "ID-abc123",
    Channel: "email"
});

// Optionally set a new send time
const result2 = await client.Actions.Resubmit.SendRequest({
    MessageID: "ID-abc123",
    Channel: "tts",
    SendTime: "2030-06-15 10:00"
});
```

---

### Adjust Pacing

Change the number of concurrent operators (simultaneous outbound calls) on an active TTS or voice job.

> Supported channels: `tts`, `voice`.

```typescript
const result = await client.Actions.Pacing.SendRequest({
    MessageID: "ID-abc123",
    Channel: "tts",
    NumberOfOperators: 5    // Number of simultaneous calls
});
```

---

## Opt-Out Management

Manage your opt-out list (suppression list) for recipients who have requested not to be contacted.

### List Opt-Outs

```typescript
const result = await client.OptOut.List({
    RecordsPerPage: 50,
    Page: 1
});

for (const entry of result.OptOuts ?? []) {
    console.log(`${entry.Destination} (${entry.DestType}) opted out on ${entry.CreatedTimeLocal}`);
}
```

**Optional filter parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `DestType` | `string` | Filter by destination type (`SMS`, `Email`, `Voice`, `Fax`) |
| `TimePeriod` | `number` | Return results created in the past _x_ days |
| `ContactID` | `string` | Filter by ContactID |

### Add Opt-Out

```typescript
const result = await client.OptOut.Create({
    Destination: "+64211234567",
    DestType: "SMS",             // SMS | Email | Voice | Fax
    ContactID: "a1b2c3d4-...",   // optional — link to an existing Addressbook contact
    StopMessage: "STOP",         // optional — the opt-out message detected
    Notes: "Requested via SMS reply"  // optional — free-form notes
});

const optoutId = result.ID;     // UUID — use for Detail/Delete
```

**Optional parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `Department` | `string` | The department the opt-out entry applies to |
| `SubAccount` | `string` | The sub-account the opt-out entry applies to |
| `ContactID` | `string` | Link to an existing Addressbook contact |
| `StopMessage` | `string` | The opt-out message detected |
| `Notes` | `string` | Free-form notes |

### Get Opt-Out Detail

```typescript
const result = await client.OptOut.Detail({
    OptOutID: "a1b2c3d4-e5f6-7890-1234-567890abcdef"  // UUID from List or Create
});

console.log(result.Destination);      // The opted-out destination
console.log(result.DestType);         // Channel type (SMS, Email, etc.)
console.log(result.CreatedTimeLocal); // When the opt-out was added
```

### Remove Opt-Out

```typescript
const result = await client.OptOut.Delete({
    OptOutID: "a1b2c3d4-e5f6-7890-1234-567890abcdef"  // UUID from List or Create
});
```

---

## Addressbook

### Contacts

#### List Contacts

```typescript
const result = await client.Addressbook.Contact.List({
    RecordsPerPage: 50,
    Page: 1
});

for (const contact of result.Contacts ?? []) {
    console.log(`${contact.FirstName} ${contact.LastName} — ${contact.MobilePhone}`);
}
```

#### Get Contact Detail

```typescript
const result = await client.Addressbook.Contact.Detail({
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98"
});

console.log(result.Contact?.EmailAddress);
```

#### Create Contact

```typescript
const result = await client.Addressbook.Contact.Create({
    Title: "Mr",
    Company: "Acme Corp",
    FirstName: "John",
    LastName: "Smith",
    Position: "Manager",
    MobilePhone: "+64211234567",
    EmailAddress: "john.smith@acme.com",
    FaxNumber: "+6491234567",
    ViewBy: "Account",    // Account | Subaccount | Department | No
    EditBy: "Account"
});

console.log(result.Contact?.ContactID);  // Save this GUID
```

**Available contact fields:**

| Field | Type | Description |
|-------|------|-------------|
| `Title` | `string` | e.g. `"Mr"`, `"Mrs"`, `"Dr"` |
| `Company` | `string` | Company name |
| `FirstName` | `string` | First name |
| `LastName` | `string` | Last name |
| `Position` | `string` | Job title |
| `Attention` | `string` | Attention line |
| `RecipDepartment` | `string` | Recipient's department |
| `StreetAddress` | `string` | Street address |
| `Suburb` | `string` | Suburb |
| `City` | `string` | City |
| `State` | `string` | State / province |
| `Country` | `string` | Country |
| `Postcode` | `string` | Postcode / ZIP |
| `MainPhone` | `string` | Main phone |
| `DirectPhone` | `string` | Direct phone |
| `MobilePhone` | `string` | Mobile number |
| `AltPhone1` | `string` | Alternate phone 1 |
| `AltPhone2` | `string` | Alternate phone 2 |
| `FaxNumber` | `string` | Fax number |
| `EmailAddress` | `string` | Email address |
| `WebAddress` | `string` | Website URL |
| `Custom1`–`Custom4` | `string` | Custom fields |
| `ViewBy` | `string` | Visibility: `Account`, `Subaccount`, `Department`, `No` |
| `EditBy` | `string` | Edit access: `Account`, `Subaccount`, `Department`, `No` |

#### Update Contact

```typescript
const result = await client.Addressbook.Contact.Update({
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98",
    MobilePhone: "+64219876543",
    EmailAddress: "new-email@acme.com"
    // Only fields you supply will be updated
});
```

#### Delete Contact

```typescript
const result = await client.Addressbook.Contact.Delete({
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98"
});
```

---

### Groups

#### List Groups

```typescript
const result = await client.Addressbook.Group.List({
    RecordsPerPage: 50,
    Page: 1
});

for (const group of result.Groups ?? []) {
    console.log(`${group.GroupName} (${group.GroupCode})`);
}
```

#### Get Group Detail

```typescript
const result = await client.Addressbook.Group.Detail({
    GroupCode: "MY-GROUP"
});
```

#### Create Group

```typescript
const result = await client.Addressbook.Group.Create({
    GroupName: "VIP Customers",
    ViewEditBy: "Account"   // Account | Subaccount | Department | No
});

console.log(result.Group?.GroupID);    // Save the GUID
console.log(result.Group?.GroupCode);  // Auto-generated code
```

#### Update Group

```typescript
const result = await client.Addressbook.Group.Update({
    GroupCode: "MY-GROUP",
    GroupName: "VIP Customers 2025",
    ViewEditBy: "Subaccount"
});
```

#### Delete Group

```typescript
const result = await client.Addressbook.Group.Delete({
    GroupCode: "MY-GROUP"
});
```

---

### Contact Groups

Manage which groups a contact belongs to.

#### List Groups for a Contact

```typescript
const result = await client.Addressbook.ContactGroup.List({
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98",
    RecordsPerPage: 50,
    Page: 1
});
```

#### Get Contact–Group Membership Detail

```typescript
const result = await client.Addressbook.ContactGroup.Detail({
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98",
    GroupCode: "MY-GROUP"
});
```

#### Add Contact to a Group

```typescript
const result = await client.Addressbook.ContactGroup.Create({
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98",
    GroupCode: "MY-GROUP"
});
```

#### Remove Contact from a Group

```typescript
const result = await client.Addressbook.ContactGroup.Delete({
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98",
    GroupCode: "MY-GROUP"
});
```

---

### Group Contacts

Manage contacts within a group (the inverse view of Contact Groups).

#### List Contacts in a Group

```typescript
const result = await client.Addressbook.GroupContact.List({
    GroupCode: "MY-GROUP",
    RecordsPerPage: 50,
    Page: 1
});
```

#### Get Group–Contact Membership Detail

```typescript
const result = await client.Addressbook.GroupContact.Detail({
    GroupCode: "MY-GROUP",
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98"
});
```

#### Add Contact to a Group (from group side)

```typescript
const result = await client.Addressbook.GroupContact.Create({
    GroupCode: "MY-GROUP",
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98"
});
```

#### Remove Contact from a Group (from group side)

```typescript
const result = await client.Addressbook.GroupContact.Delete({
    GroupCode: "MY-GROUP",
    ContactID: "cc5c3871-0d29-11f1-95bd-ae5f86698b98"
});
```

---

## Response Structure

All API calls return one of two shapes:

### Success

```typescript
// Messaging
{
    Result: "Success",
    MessageID: string,
    JobNum?: string,
    Status?: string
}

// Reports — Status
{
    Result: "Success",
    MessageID?: string,
    JobStatus?: string,
    Count?: number,
    Success?: number,
    Failed?: number,
    Recipients: RecipientDTO[]
}

// Addressbook — Contact
{
    Result: "Success",
    Contact: {
        ContactID: string,
        FirstName: string,
        LastName: string,
        MobilePhone: string,
        EmailAddress: string,
        // ...all contact fields
    }
}
```

### Error

```typescript
{
    Result: "Error",
    ErrorMessage: string[]   // One or more human-readable error descriptions
}
```

---

## Error Handling

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI();

const result = await client.Messaging.SMS.SendMessage({
    Message: "Hello!",
    Destinations: [
        { ToNumber: "+64211234568" },
        { ToNumber: "+64271234567" }
    ]
});

if (result.Result === "Success") {
    console.log("Sent! MessageID:", result.MessageID);
} else {
    console.error("API error:", result.ErrorMessage.join(", "));
}
```

> **Note:** Check `result.Result === "Success"` (not `=== "Error"`) to get correct TypeScript narrowing — `Result` can be `"Error"`, `"Failed"`, or `"Unauthorized"` on a failed response, so only the `"Success"` check narrows both branches. `instanceof ErrorResponseDTO` works too, if you'd rather check the class directly.

**Common validation errors (caught before any API call):**

| Error | Cause |
|-------|-------|
| `Missing AuthToken` | No token provided in constructor or environment |
| `Missing Message or TemplateID` | SMS/WhatsApp/RCS body is empty and no template specified |
| `Missing EmailSubject` | Email subject is empty |
| `Missing MessagePlain, MessageHTML or TemplateID` | Email has no plain-text or HTML body and no template specified |
| `Missing MessageToPeople or TemplateID` | TTS call has no message and no template |
| `Missing MessageToPeople contents, VoiceFiles, or TemplateID` | Voice call has no message, audio, or template |
| `Missing WorkflowTemplateID` | Workflow template ID not provided |
| `Empty Destination(s)` | No recipients in `Destinations` array |
| `Invalid ToNumber - must be mobile number - {number}` | SMS recipient fails mobile number validation |
| `Invalid Recipient - must be phone number - {number}` | Fax/TTS/Voice recipient fails phone validation |
| `Invalid ToNumber - must be phone number - {number}` | WhatsApp/RCS recipient fails phone validation |
| `Invalid EmailAddress - must be email address - {address}` | Email recipient fails email format validation |
| `Unable to parse SendTime. Use YYYY-MM-DD hh:mm format.` | `SendTime` is not a recognised date format |
| `Only Mode=Test is allowed` | Invalid value for `Mode` (only `"Test"` is accepted) |
| `Missing or invalid WebhookCallbackFormat - JSON, XML, POST or GET` | `WebhookCallbackURL` set but format missing or invalid |

---

## TypeScript Types Reference

All interfaces and DTOs below are exported from the package root, so they can be imported directly for typing wrapper functions, mocks, or app-level request objects:

```typescript
import { ISMSArgs, IEmailArgs, MessagingApiSuccessResponseDTO, ErrorResponseDTO } from 'tnzapi-ts';
```

### ITNZAuthArgs

```typescript
interface ITNZAuthArgs {
    AuthToken?: string;   // Bearer token
    URL?: string;         // Override API base URL
}
```

### Messaging Response

```typescript
class MessagingApiSuccessResponseDTO {
    Result: string;
    MessageID?: string;
    JobNum?: string;
    Status?: string;
}
```

### ErrorResponseDTO

```typescript
class ErrorResponseDTO {
    Result: string;          // "Error"
    ErrorMessage: string[];
}
```

### Enums

```typescript
import {
    WebhookCallbackFormat,   // JSON | XML | POST | GET
    NotificationType,        // None | Webhook | Email
    AnswerPhoneMode,         // NDAS | NDAF | DAS | DAF
    TTSVoice,                // Female1 | Male1 | Nicole | Russell | Amy | Brian | Emma
    FaxResolution,           // Low | High
    SMSFallbackMode,         // None | RCS | WAPP | Voice
    WhatsAppFallbackMode,    // None | RCS | SMS | Voice
    RCSFallbackMode,         // None
} from 'tnzapi-ts';
```

### ISMSArgs

```typescript
interface ISMSDestination {
    ToNumber?: string;
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string; Custom2?: string; Custom3?: string; Custom4?: string;
    Custom5?: string; Custom6?: string; Custom7?: string; Custom8?: string; Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

interface ISMSArgs {
    Reference?: string;
    Message?: string;           // required unless TemplateID is set
    TemplateID?: string;
    FallbackMode?: SMSFallbackMode;
    Destinations?: ISMSDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    SMSEmailReply?: string;
    CharacterConversion?: boolean;
    ReportTo?: string;
    NotificationType?: NotificationType;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
    Attachments?: string[];
}
```

### IEmailArgs

```typescript
interface IEmailDestination {
    EmailAddress?: string;
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string; Custom2?: string; Custom3?: string; Custom4?: string;
    Custom5?: string; Custom6?: string; Custom7?: string; Custom8?: string; Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

interface IEmailArgs {
    Reference?: string;
    EmailSubject: string;
    MessagePlain?: string;      // required unless MessageHTML or TemplateID is set
    MessageHTML?: string;
    TemplateID?: string;
    FromEmail?: string;
    SMTPFrom?: string;          // legacy/alternate sender field
    From?: string;              // legacy/alternate sender field
    ReplyTo?: string;
    CCEmail?: string;
    BCCEmail?: string;
    Destinations?: IEmailDestination[];
    EmailAddress?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    ReportTo?: string;
    NotificationType?: NotificationType;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
    Attachments?: string[];
}
```

### IFaxArgs

```typescript
interface IFaxDestination {
    ToNumber?: string;
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string; Custom2?: string; Custom3?: string; Custom4?: string;
    Custom5?: string; Custom6?: string; Custom7?: string; Custom8?: string; Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

interface IFaxArgs {
    Reference?: string;
    TemplateID?: string;        // required unless Attachments is provided
    Resolution?: FaxResolution;
    CallerID?: string;
    CSID?: string;
    RetryAttempts?: number;
    RetryPeriod?: number;
    WatermarkFolder?: string;
    WatermarkFirstPage?: string;
    WatermarkAllPages?: string;
    Destinations?: IFaxDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    ReportTo?: string;
    NotificationType?: NotificationType;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
    Attachments?: string[];
}
```

### ITTSArgs

```typescript
interface ITTSDestination {
    MainPhone?: string;
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Custom5?: string;
    Custom6?: string;
    Custom7?: string;
    Custom8?: string;
    Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

interface ITTSKeypad {
    Tone: number;           // integer 0–9
    RouteNumber?: string;
    Play?: string;
    PlaySection?: string;
}

interface ITTSArgs {
    Reference?: string;
    MessageToPeople?: string;       // required unless TemplateID is set
    TemplateID?: string;
    MessageToAnswerPhones?: string;
    AnswerPhoneMode?: AnswerPhoneMode;
    Voice?: TTSVoice;
    CallerID?: string;
    RetryAttempts?: number;
    RetryPeriod?: number;
    NumberOfOperators?: number;
    KeypadOptionRequired?: boolean;
    CallRouteMessageOnWrongKey?: string;
    CallRouteMessageToPeople?: string;
    CallRouteMessageToOperators?: string;
    EndCallMessage?: string;
    Options?: string;
    Keypads?: ITTSKeypad[];
    Destinations?: ITTSDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    ReportTo?: string;
    NotificationType?: NotificationType;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
}
```

### IVoiceArgs

```typescript
interface IVoiceDestination {
    MainPhone?: string;
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Custom5?: string;
    Custom6?: string;
    Custom7?: string;
    Custom8?: string;
    Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

interface IVoiceKeypad {
    Tone: number;           // integer 0–9
    RouteNumber?: string;
    Play?: string;
    PlayFile?: string;      // local audio file path played on this keypress
    PlaySection?: string;
    File?: string;          // local audio file path
}

interface IVoiceFile {
    Name: string;   // e.g. 'MessageToPeople', 'MessageToAnswerPhones'
    File: string;   // local file path
}

interface IVoiceArgs {
    Reference?: string;
    MessageToPeople?: string;
    TemplateID?: string;
    MessageToAnswerPhones?: string;
    AnswerPhoneMode?: AnswerPhoneMode;
    VoiceFiles?: IVoiceFile[];
    CallerID?: string;
    RetryAttempts?: number;
    RetryPeriod?: number;
    NumberOfOperators?: number;
    KeypadOptionRequired?: boolean;
    CallRouteMessageOnWrongKey?: string;
    CallRouteMessageToPeople?: string;
    CallRouteMessageToOperators?: string;
    EndCallMessage?: string;
    Options?: string;
    Keypads?: IVoiceKeypad[];
    Destinations?: IVoiceDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    ReportTo?: string;
    NotificationType?: NotificationType;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
}
```

### IWhatsAppArgs

```typescript
interface IWhatsAppDestination {
    ToNumber?: string;
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Custom5?: string;
    Custom6?: string;
    Custom7?: string;
    Custom8?: string;
    Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

interface IWhatsAppArgs {
    Reference?: string;
    Message?: string;           // required unless TemplateID is set
    TemplateID?: string;
    FallbackMode?: WhatsAppFallbackMode;
    FromNumber?: string;
    Destinations?: IWhatsAppDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    ReportTo?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    NotificationType?: NotificationType;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
    Attachments?: string[];
}
```

### IRCSArgs

```typescript
interface IRCSDestination {
    ToNumber?: string;
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Custom5?: string;
    Custom6?: string;
    Custom7?: string;
    Custom8?: string;
    Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

interface IRCSArgs {
    Reference?: string;
    Message?: string;           // required unless TemplateID is set
    TemplateID?: string;
    FallbackMode?: RCSFallbackMode;
    FromNumber?: string;
    Destinations?: IRCSDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    ReportTo?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    NotificationType?: NotificationType;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
}
```

### IWorkflowArgs

```typescript
interface IWorkflowDestination {
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
    ToNumber?: string;       // creates a new addressbook contact inline
    EmailAddress?: string;   // creates a new addressbook contact inline
    MainPhone?: string;      // creates a new addressbook contact inline
    Recipient?: string;      // generic fallback used by AddRecipient(string)
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Custom5?: string;
    Custom6?: string;
    Custom7?: string;
    Custom8?: string;
    Custom9?: string;
}

interface IWorkflowArgs {
    Reference?: string;
    WorkflowTemplateID: string;
    Destinations?: IWorkflowDestination[];
    ToNumber?: string;
    MainPhone?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
}
```

### IMessagingDestination

```typescript
type IMessagingDestination =
    | ISMSDestination
    | IEmailDestination
    | IFaxDestination
    | ITTSDestination
    | IVoiceDestination
    | IWhatsAppDestination
    | IRCSDestination
    | IWorkflowDestination;
```

### IStatusArgs / ISMSReplyArgs / ISMSReceivedArgs

```typescript
interface IStatusArgs {
    MessageID: string;
    Channel?: string;
    RecordsPerPage?: number;
    Page?: number;
}

interface ISMSReplyArgs {
    MessageID: string;
    RecordsPerPage?: number;
    Page?: number;
}

interface ISMSReceivedArgs {
    TimePeriod?: number;
    DateFrom?: string;
    DateTo?: string;
    RecordsPerPage?: number;
    Page?: number;
}
```

### IAbortArgs / IResubmitArgs / IRescheduleArgs / IPacingArgs

```typescript
interface IAbortArgs {
    MessageID: string;
    Channel: string;
}

interface IResubmitArgs {
    MessageID: string;
    Channel: string;
    SendTime?: string;
}

interface IRescheduleArgs {
    MessageID: string;
    Channel: string;
    SendTime: string;
}

interface IPacingArgs {
    MessageID: string;
    Channel: string;
    NumberOfOperators: number;
}
```

### IContactArgs

```typescript
interface IContactFields {
    Title?: string; Company?: string; FirstName?: string; LastName?: string;
    Position?: string; Attention?: string; RecipDepartment?: string;
    StreetAddress?: string; Suburb?: string; City?: string; State?: string;
    Country?: string; Postcode?: string; MainPhone?: string; DirectPhone?: string;
    MobilePhone?: string; AltPhone1?: string; AltPhone2?: string; FaxNumber?: string;
    EmailAddress?: string; WebAddress?: string;
    Custom1?: string; Custom2?: string; Custom3?: string; Custom4?: string;
    Timezone?: string; ViewBy?: string; EditBy?: string;
}

interface IContactCreateArgs extends IContactFields {}
interface IContactUpdateArgs extends IContactFields { ContactID: string; }
interface IContactDetailArgs { ContactID: string; }
interface IContactDeleteArgs { ContactID: string; }
interface IContactListArgs { RecordsPerPage?: number; Page?: number; }
```

### IGroupArgs

```typescript
interface IGroupFields {
    GroupName?: string;
    ViewEditBy?: string;   // Account | Subaccount | Department | No
    SubAccount?: string;
    Department?: string;
}

interface IGroupCreateArgs extends IGroupFields {}
interface IGroupUpdateArgs extends IGroupFields { GroupID?: string; GroupCode?: string; }
interface IGroupDetailArgs { GroupID?: string; GroupCode?: string; }
interface IGroupDeleteArgs { GroupID?: string; GroupCode?: string; }
interface IGroupListArgs { RecordsPerPage?: number; Page?: number; }
```

### IContactGroupArgs / IGroupContactArgs

```typescript
interface IContactGroupArgs {
    ContactID?: string;
    Contact?: ContactModel;
    GroupID?: string;
    GroupCode?: string;
    Group?: GroupModel;
}
interface IContactGroupListArgs {
    ContactID?: string;
    Contact?: ContactModel;
    RecordsPerPage?: number;
    Page?: number;
}

interface IGroupContactArgs {
    GroupID?: string;
    GroupCode?: string;
    Group?: GroupModel;
    ContactID?: string;
    Contact?: ContactModel;
}
interface IGroupContactListArgs {
    GroupID?: string;
    GroupCode?: string;
    Group?: GroupModel;
    RecordsPerPage?: number;
    Page?: number;
}
```

### IOptOutArgs

```typescript
interface IOptOutCreateArgs {
    Destination: string;
    DestType: string;
    Department?: string;
    SubAccount?: string;
    ContactID?: string;
    StopMessage?: string;
    Notes?: string;
}
interface IOptOutDetailArgs { OptOutID: string; }
interface IOptOutDeleteArgs { OptOutID: string; }
interface IOptOutListArgs {
    RecordsPerPage?: number;
    Page?: number;
    DestType?: string;
    TimePeriod?: number;
    ContactID?: string;
}
```

---

## Development & Testing

### Setting Up Environment Files

`jest.setup.js` loads environment files in this order, each overriding the previous:

| File | Purpose |
|------|---------|
| `.env` | Default environment — used in your application |
| `.env.local` | Per-developer override — e.g. your personal `TNZ_AUTH_TOKEN` (gitignored, not committed) |
| `.env.test` | Test-specific overrides (test recipient numbers, message IDs, etc.) |

**Step 1 — Create `.env` or `.env.local`:**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
TNZ_AUTH_TOKEN=your-auth-token-here
TNZ_API_URL=https://api.tnz.co.nz/api/v3.00
```

**Step 2 — Create `.env.test`** (for integration tests only):

```bash
cp .env.example .env.test
```

Edit `.env.test` with test-specific values:

```
TNZ_AUTH_TOKEN=your-auth-token-here

# Shared test recipient — used by SMS, TTS, Voice, WhatsApp, and RCS tests
TNZ_TEST_MOBILE=+6421000001

TNZ_TEST_EMAIL=test@example.com
TNZ_TEST_FAX=+6491000001

# For workflow and addressbook tests
TNZ_TEST_CONTACT_ID=00000000-0000-0000-0000-000000000000
TNZ_TEST_WORKFLOW_TEMPLATE_ID=00000000-0000-0000-0000-000000000000
TNZ_TEST_GROUP_ID=00000000-0000-0000-0000-000000000000

# For action/report tests
TNZ_TEST_MESSAGE_ID=ID123456
TNZ_TEST_MESSAGE_CHANNEL=sms

# Optional: bypass SSL for local dev API server
# TNZ_UNSAFE_IGNORE_SSL=true
# TNZ_API_URL=https://localhost:5001/api/v3.00
```

> `.env.test` values override `.env.local`, which overrides `.env`, during test runs. All three files are gitignored — never commit credentials.

### Running Tests

```bash
npm run build   # Compile TypeScript to dist/
npm run test    # Run full test suite (unit + integration)

# Run only unit tests
npm run test:unit
# equivalent: npx jest --selectProjects unit

# Run only integration tests
npm run test:integration
# equivalent: npx jest --selectProjects integration

# Run a specific test file
npx jest tests/unit/messaging/smsApi.spec.ts
npx jest tests/integration/messaging/sms.spec.ts
```

Integration tests send real messages to the numbers configured in `.env.test`. Unit tests mock the HTTP layer and do not require valid credentials.

---

## Getting Help

If you need help installing or using the library, please check the [TNZ Contact](https://www.tnz.co.nz/About/Contact/) page.