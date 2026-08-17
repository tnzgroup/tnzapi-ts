# Workflow

Trigger a pre-configured multi-channel workflow for one or more contacts via the TNZ REST API. Workflows are defined in your TNZ account and can chain SMS, Email, Voice, and other channels in sequence.

→ [Common parameters & authentication](../README.md#common-parameters)

## Quick example

```typescript
import { TNZAPI } from 'tnzapi-ts';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

const result = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});

console.log(result.MessageID);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `WorkflowTemplateID` | `string (uuid)` | **Yes** | UUID of the workflow template to trigger. |
| `Destinations` | `IWorkflowDestination[]` | Yes† | One or more contacts to run the workflow for. |
| `Reference` | `string` | No | Internal reference returned in reports and webhooks. |
| `SendTime` | `string` | No | Schedule workflow start: `'YYYY-MM-DDTHH:mm:ss'` in the given `Timezone`. |
| `Timezone` | `string` | No | Windows Timezone name for `SendTime` (e.g. `'New Zealand'`, `'AUS Eastern'`). |
| `SubAccount` | `string` | No | Sub-account code for billing separation. |
| `Department` | `string` | No | Department code. |
| `ChargeCode` | `string` | No | Charge code. |
| `MessageID` | `string` | No | Supply your own message ID. |
| `WebhookCallbackURL` | `string` | No | URL for delivery status callbacks. |
| `WebhookCallbackFormat` | `WebhookCallbackFormat` | No | `JSON`, `XML`, `POST`, or `GET`. |
| `Mode` | `'Test'` | No | Validate without triggering. |

†Alternatively, use the top-level shorthand `ContactID: '8000000a-f002-4007-b00a-d00000000001'` or `GroupID: '4000000b-f002-4007-b00a-c00000000002'` for a single target — `ToNumber` and `MainPhone` also work as top-level shorthands (unlike other channels, these are two distinct fields here, not aliases of each other). All accept comma-separated values for multiple targets.

> **Note:** Workflow does not support `ReportTo`, `NotificationType`, or `Attachments`.

## Destination fields (`IWorkflowDestination`)

Destinations can reference existing addressbook contacts/groups, or specify a new contact inline — the API will create an addressbook entry automatically, or update a matching existing one if a contact with that phone/email already exists.

| Field | Description |
|-------|-------------|
| `ContactID` | UUID of an existing addressbook contact. |
| `GroupID` | UUID of an addressbook group. Runs the workflow for all members. |
| `GroupCode` | Group lookup by code. |
| `ToNumber` | Mobile number for a new or inline contact. |
| `EmailAddress` | Email address for a new or inline contact. |
| `MainPhone` | Phone number for a new or inline contact. |
| `Recipient` | Generic fallback used by the `AddRecipient(string)` builder method. |
| `Attention` | Personalisation token override `[[Attention]]`. |
| `FirstName` | Override `[[FirstName]]` for this recipient. |
| `LastName` | Override `[[LastName]]`. |
| `Company` | Override `[[Company]]`. |
| `Custom1`–`Custom9` | Override `[[Custom1]]` … `[[Custom9]]`. |

## Code samples

### Single target shorthand

```typescript
// ContactID shorthand
const result = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  ContactID: '8000000a-f002-4007-b00a-d00000000001',
});

// GroupID shorthand — runs the workflow for every member of the group
const toGroup = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  GroupID: '4000000b-f002-4007-b00a-c00000000002',
});

// ToNumber and MainPhone are independent shorthands — combine them to run the
// workflow for both a raw phone destination and a raw voice destination
const combined = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  ToNumber: '+6421000001',
  MainPhone: '+6491000001',
});
```

> **Note:** `ToNumber`/`MainPhone` shorthand resolves internally to the same `Destinations: [{ ToNumber: ... }]` / `[{ MainPhone: ... }]` shape as writing the array by hand — so using either without a `ContactID`/`GroupID` creates a new addressbook contact for that recipient, or updates a matching existing one if a contact with that phone/email already exists, exactly like the inline destination fields below. `EmailAddress` is not available as a top-level shorthand for Workflow (only `ToNumber`/`MainPhone`/`GroupID`/`ContactID` are) — it only works inside the `Destinations` array, as shown next.

### Multiple recipients

```typescript
const result = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  Destinations: [
    { ContactID: '8000000a-f002-4007-b00a-d00000000001' },
    { ContactID: '8000000a-f002-4007-b00a-d00000000002' },
  ],
});
```

### Inline new contact (auto-created or updated in addressbook)

```typescript
const result = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  Destinations: [{
    ToNumber: '+6421000001',
    EmailAddress: 'alice@example.com',
    FirstName: 'Alice',
    LastName: 'Smith',
  }],
});
```

### Scheduled send to multiple contacts

```typescript
const result = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  Destinations: [
    { ContactID: '8000000a-f002-4007-b00a-d00000000001' },
    { ContactID: '8000000a-f002-4007-b00a-d00000000002' },
    { ContactID: '8000000a-f002-4007-b00a-d00000000003' },
  ],
  SendTime: '2027-01-01T09:00:00',
  Timezone: 'New Zealand',
});
```

### Send to an entire group with webhook and billing codes

```typescript
import { WebhookCallbackFormat } from 'tnzapi-ts';

const result = await client.Messaging.Workflow.SendMessage({
  WorkflowTemplateID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000002' }],
  SubAccount: 'SALES',
  ChargeCode: 'Q4_CAMPAIGN',
  WebhookCallbackURL: 'https://yourapp.example.com/webhooks/workflow',
  WebhookCallbackFormat: WebhookCallbackFormat.JSON,
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

- [README — Workflow](../README.md#workflow)
- [TypeScript interface source](../src/Api/Messaging/interfaces/IWorkflowArgs.ts)
- [More examples](../samples/messaging/send-workflow.ts)