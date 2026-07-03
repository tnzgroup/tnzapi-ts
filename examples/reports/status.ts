/**
 * Status Report Examples
 *
 * Demonstrates polling the delivery status of a sent message via the TNZ API.
 * Run: npx ts-node examples/reports/status.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: Poll SMS status ───────────────────────────────────────────────

async function pollSMSStatus() {
  const result = await client.Reports.Status.Poll({
    MessageID: 'ID123456',
    Channel: 'sms',
  });

  console.log('SMS status:', result);
}

// ─── Example 2: Poll email status with pagination ─────────────────────────────

async function pollEmailStatus() {
  const result = await client.Reports.Status.Poll({
    MessageID: 'ID123456',
    Channel: 'email',
    RecordsPerPage: 50,
    Page: 1,
  });

  console.log('Email status:', result);

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Total recipients: ${result.TotalRecords}`);
    console.log(`Success: ${result.Success} / Failed: ${result.Failed}`);
    result.Recipients?.forEach((r) => {
      console.log(`  ${r.Destination} → ${r.Status}`);
    });
  }
}

// ─── Example 3: Poll fax status ───────────────────────────────────────────────

async function pollFaxStatus() {
  const result = await client.Reports.Status.Poll({
    MessageID: 'ID123456',
    Channel: 'fax',
  });

  console.log('Fax status:', result);
}

// ─── Example 4: Poll voice/TTS status ────────────────────────────────────────

async function pollVoiceStatus() {
  const result = await client.Reports.Status.Poll({
    MessageID: 'ID123456',
    Channel: 'tts',
  });

  console.log('TTS status:', result);
}

// ─── Example 5: Poll status and handle errors ────────────────────────────────

async function pollWithErrorHandling() {
  const result = await client.Reports.Status.Poll({
    MessageID: 'ID123456',
    Channel: 'sms',
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Message ${result.MessageID} - Status: ${result.JobStatus}`);
    console.log(`Price: $${result.Price}`);
  } else {
    console.error('Error fetching status:', result.ErrorMessage);
  }
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await pollSMSStatus();
  await pollEmailStatus();
  await pollFaxStatus();
  await pollVoiceStatus();
  await pollWithErrorHandling();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});