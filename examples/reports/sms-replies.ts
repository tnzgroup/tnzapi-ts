/**
 * SMS Reply Report Examples
 *
 * Demonstrates retrieving SMS replies for a sent message via the TNZ API.
 * Run: npx ts-node examples/reports/sms-replies.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: Get all replies for a message ─────────────────────────────────

async function getSMSReplies() {
  const result = await client.Reports.SMSReply.Poll({
    MessageID: 'ID123456',
  });

  console.log('SMS replies:', result);
}

// ─── Example 2: Get replies with pagination ───────────────────────────────────

async function getSMSRepliesPaged() {
  const result = await client.Reports.SMSReply.Poll({
    MessageID: 'ID123456',
    RecordsPerPage: 25,
    Page: 1,
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Page ${result.Page} of ${result.PageCount} (${result.TotalRecords} total replies)`);

    result.Recipients?.forEach((recipient) => {
      console.log(`\nReplies from ${recipient.Destination}:`);
      recipient.SMSReplies?.forEach((reply) => {
        console.log(`  [${reply.ReceivedTimeLocal}] ${reply.From}: "${reply.MessageText}"`);
      });
    });
  } else {
    console.error('Error:', result.ErrorMessage);
  }
}

// ─── Example 3: Fetch all pages ───────────────────────────────────────────────

async function getAllSMSReplies() {
  let page = 1;
  let totalPages = 1;
  const allReplies: any[] = [];

  do {
    const result = await client.Reports.SMSReply.Poll({
      MessageID: 'ID123456',
      RecordsPerPage: 100,
      Page: page,
    });

    if (result instanceof ErrorResponseDTO) {
      console.error('Error fetching page', page, result.ErrorMessage);
      break;
    }

    totalPages = result.PageCount ?? 1;
    result.Recipients?.forEach((r) => allReplies.push(...(r.SMSReplies ?? [])));
    page++;
  } while (page <= totalPages);

  console.log(`Fetched ${allReplies.length} total replies`);
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await getSMSReplies();
  await getSMSRepliesPaged();
  await getAllSMSReplies();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});