/**
 * Workflow Messaging Examples
 *
 * Demonstrates sending messages via a Workflow template via the TNZ API.
 * Workflow templates are configured in the TNZ Dashboard and define
 * a multi-channel sequence (e.g., SMS → Email → Voice).
 *
 * Run: npx ts-node samples/messaging/send-workflow.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN             - your API bearer token
 *   TNZ_WORKFLOW_TEMPLATE_ID   - UUID of the workflow template
 */

import { TNZAPI, WebhookCallbackFormat } from '../../src';

const client = new TNZAPI();

const workflowTemplateID = process.env.TNZ_WORKFLOW_TEMPLATE_ID ?? '00000000-0000-0000-0000-000000000000';

// ─── Example 1: Send workflow to an addressbook contact ───────────────────────

async function sendWorkflowToContact() {
  const result = await client.Messaging.Workflow.SendMessage({
    WorkflowTemplateID: workflowTemplateID,
    Destinations: [{ ContactID: '00000000-0000-0000-0000-000000000000' }],
  });

  console.log('Workflow to contact:', result);
}

// ─── Example 2: Send workflow with reference and scheduling ───────────────────

async function sendScheduledWorkflow() {
  const result = await client.Messaging.Workflow.SendMessage({
    Reference: 'ONBOARDING-001',
    WorkflowTemplateID: workflowTemplateID,
    Destinations: [
      { ContactID: '00000000-0000-0000-0000-000000000001' },
      { ContactID: '00000000-0000-0000-0000-000000000002' },
    ],
    SendTime: '2025-12-01 09:00',
    Timezone: 'New Zealand',
  });

  console.log('Scheduled workflow:', result);
}

// ─── Example 3: Send workflow to a group ─────────────────────────────────────

async function sendWorkflowToGroup() {
  const result = await client.Messaging.Workflow.SendMessage({
    Reference: 'PROMO-CAMPAIGN',
    WorkflowTemplateID: workflowTemplateID,
    Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000009' }],
    WebhookCallbackURL: 'https://example.com/webhooks/workflow',
    WebhookCallbackFormat: WebhookCallbackFormat.JSON,
    SubAccount: 'marketing',
    ChargeCode: 'CAMP-2024-Q4',
  });

  console.log('Workflow to group:', result);
}

// ─── Example 4: Inline new contact (auto-created in addressbook) ─────────────

async function sendWorkflowToInlineContact() {
  const result = await client.Messaging.Workflow.SendMessage({
    WorkflowTemplateID: workflowTemplateID,
    Destinations: [{
      ToNumber: '+6421000001',
      EmailAddress: 'alice@example.com',
      FirstName: 'Alice',
      LastName: 'Smith',
    }],
  });

  console.log('Workflow to inline contact:', result);
}

// ─── Example 5: Single-destination shorthand ─────────────────────────────────

async function sendWorkflowShorthand() {
  const result = await client.Messaging.Workflow.SendMessage({
    WorkflowTemplateID: workflowTemplateID,
    ToNumber: '+6421000001',
    MainPhone: '+6491000001',
  });

  console.log('Workflow shorthand:', result);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await sendWorkflowToContact();
  await sendScheduledWorkflow();
  await sendWorkflowToGroup();
  await sendWorkflowToInlineContact();
  await sendWorkflowShorthand();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});