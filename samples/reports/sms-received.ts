/**
 * SMS Received Report Examples
 *
 * Demonstrates retrieving inbound SMS messages received on your TNZ number.
 * Run: npx ts-node samples/reports/sms-received.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: Get inbound SMS from the last 60 minutes ──────────────────────

async function getRecentInbound() {
  const result = await client.Reports.SMSReceived.Poll({
    TimePeriod: 60,
  });

  console.log('Recent inbound SMS:', result);
}

// ─── Example 2: Get inbound SMS for a date range ──────────────────────────────

async function getInboundByDateRange() {
  const result = await client.Reports.SMSReceived.Poll({
    DateFrom: '2025-11-01',
    DateTo: '2025-11-30',
    RecordsPerPage: 100,
    Page: 1,
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Found ${result.TotalRecords} inbound messages`);
    result.Messages?.forEach((msg) => {
      console.log(`  [${msg.ReceivedTimeLocal}] From ${msg.From}: "${msg.MessageText}"`);
    });
  } else {
    console.error('Error:', result.ErrorMessage);
  }
}

// ─── Example 3: Page through all inbound messages ────────────────────────────

async function getAllInboundMessages() {
  let page = 1;
  let totalPages = 1;
  const messages: any[] = [];

  do {
    const result = await client.Reports.SMSReceived.Poll({
      TimePeriod: 1440,  // last 24 hours
      RecordsPerPage: 100,
      Page: page,
    });

    if (result instanceof ErrorResponseDTO) {
      console.error('Error on page', page, result.ErrorMessage);
      break;
    }

    totalPages = result.PageCount ?? 1;
    messages.push(...(result.Messages ?? []));
    page++;
  } while (page <= totalPages);

  console.log(`Total inbound SMS in last 24h: ${messages.length}`);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await getRecentInbound();
  await getInboundByDateRange();
  await getAllInboundMessages();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});