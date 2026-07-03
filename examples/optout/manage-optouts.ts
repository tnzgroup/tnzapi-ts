/**
 * Opt-Out Management Examples
 *
 * Demonstrates listing, adding, checking, and removing opt-outs via the TNZ API.
 * Run: npx ts-node examples/optout/manage-optouts.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: List all opt-outs ────────────────────────────────────────────

async function listOptOuts() {
  const result = await client.OptOut.List({
    RecordsPerPage: 20,
    Page: 1,
  });

  console.log('Opt-out list:', result);

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`Total opted-out: ${result.TotalRecords}`);
    result.OptOuts?.forEach((o) => {
      console.log(`  ${o.Destination} (${o.DestType ?? 'all'}) — added ${o.CreatedTimeLocal}`);
    });
  }
}

// ─── Example 2: Filter opt-outs by destination type ──────────────────────────

async function listOptOutsByDestType() {
  const result = await client.OptOut.List({
    DestType: 'SMS',
    RecordsPerPage: 100,
  });

  console.log('SMS opt-outs:', result);
}

// ─── Example 3: Filter opt-outs by time period ───────────────────────────────

async function listOptOutsByTimePeriod() {
  const result = await client.OptOut.List({
    TimePeriod: 30, // opt-outs created in the last 30 days
    RecordsPerPage: 50,
    Page: 1,
  });

  console.log('Time-period-filtered opt-outs:', result);
}

// ─── Example 4: Add a recipient to the opt-out list ──────────────────────────

async function addOptOut() {
  const result = await client.OptOut.Create({
    Destination: '+6421000001',
    DestType: 'SMS',
  });

  console.log('Add opt-out:', result);
}

// ─── Example 5: Check if a recipient has opted out ───────────────────────────

async function checkOptOut() {
  // OptOutID is the UUID returned from the List or Create response (result.ID)
  const result = await client.OptOut.Detail({
    OptOutID: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  });

  if (!(result instanceof ErrorResponseDTO)) {
    console.log(`${result.Destination} is opted out for ${result.DestType ?? 'all channels'}`);
  } else {
    console.log('Opt-out entry not found.');
  }
}

// ─── Example 6: Remove a recipient from the opt-out list ─────────────────────

async function removeOptOut() {
  // OptOutID is the UUID returned from the List or Create response (result.ID)
  const result = await client.OptOut.Delete({
    OptOutID: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  });

  console.log('Remove opt-out:', result);
}

// ─── Example 7: Opt-out lifecycle ────────────────────────────────────────────

async function optOutLifecycle() {
  const destination = '+6421000001';
  const destType = 'SMS';

  // Add
  const created = await client.OptOut.Create({ Destination: destination, DestType: destType });
  console.log(`${destination} added to opt-out list`);

  // Retrieve the UUID assigned by the API — only present on a success response
  const optOutId = created instanceof ErrorResponseDTO ? undefined : created.ID;

  if (optOutId) {
    // Check
    const detail = await client.OptOut.Detail({ OptOutID: optOutId });
    console.log('Is opted out:', !(detail instanceof ErrorResponseDTO));

    // Remove
    await client.OptOut.Delete({ OptOutID: optOutId });
    console.log(`${destination} removed from opt-out list`);

    // Confirm removed
    const check = await client.OptOut.Detail({ OptOutID: optOutId });
    console.log('After removal, is opted out:', !(check instanceof ErrorResponseDTO));
  }
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await listOptOuts();
  await listOptOutsByDestType();
  await listOptOutsByTimePeriod();
  await addOptOut();
  await checkOptOut();
  await removeOptOut();
  await optOutLifecycle();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});