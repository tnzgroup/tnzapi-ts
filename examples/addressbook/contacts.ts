/**
 * Addressbook Contact Examples
 *
 * Demonstrates creating, reading, updating, and deleting contacts
 * in the TNZ addressbook.
 *
 * Run: npx ts-node examples/addressbook/contacts.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Example 1: List all contacts (paginated) ────────────────────────────────

async function listContacts() {
  const result = await client.Addressbook.Contact.List({
    RecordsPerPage: 20,
    Page: 1,
  });

  console.log('Contact list:', result);
}

// ─── Example 2: Create a new contact ─────────────────────────────────────────

async function createContact() {
  const result = await client.Addressbook.Contact.Create({
    FirstName: 'Jane',
    LastName: 'Smith',
    Company: 'Acme Corp',
    MobilePhone: '+6421000001',
    EmailAddress: 'jane.smith@acme.com',
    FaxNumber: '+6491000001',
    Title: 'Ms',
    Position: 'CEO',
    Timezone: 'New Zealand',
    ViewBy: 'Account',
    EditBy: 'Account',
  });

  console.log('Created contact:', result);
  return result;
}

// ─── Example 3: Get contact detail ───────────────────────────────────────────

async function getContact(contactID: string) {
  const result = await client.Addressbook.Contact.Detail({
    ContactID: contactID,
  });

  console.log('Contact detail:', result);
}

// ─── Example 4: Update a contact ─────────────────────────────────────────────

async function updateContact(contactID: string) {
  const result = await client.Addressbook.Contact.Update({
    ContactID: contactID,
    Position: 'Managing Director',
    MobilePhone: '+6421000099',
    Custom1: 'VIP',
  });

  console.log('Updated contact:', result);
}

// ─── Example 5: Delete a contact ─────────────────────────────────────────────

async function deleteContact(contactID: string) {
  const result = await client.Addressbook.Contact.Delete({
    ContactID: contactID,
  });

  console.log('Deleted contact:', result);
}

// ─── Example 6: Full CRUD lifecycle ──────────────────────────────────────────

async function fullCRUD() {
  // Create
  const created = await client.Addressbook.Contact.Create({
    FirstName: 'Test',
    LastName: 'User',
    MobilePhone: '+6421000001',
    EmailAddress: 'test@example.com',
  });

  if (created instanceof ErrorResponseDTO || !created.Contact?.ContactID) {
    console.error('Create failed:', created);
    return;
  }

  const id = created.Contact.ContactID;
  console.log('Created:', id);

  // Read
  const detail = await client.Addressbook.Contact.Detail({ ContactID: id });
  if (!(detail instanceof ErrorResponseDTO)) {
    console.log('Read:', detail.Contact?.FirstName, detail.Contact?.LastName);
  }

  // Update
  await client.Addressbook.Contact.Update({ ContactID: id, Custom1: 'Updated' });
  console.log('Updated custom field');

  // Delete
  await client.Addressbook.Contact.Delete({ ContactID: id });
  console.log('Deleted');
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await listContacts();

  const created = await createContact();
  if (!(created instanceof ErrorResponseDTO) && created.Contact?.ContactID) {
    const id = created.Contact.ContactID;
    await getContact(id);
    await updateContact(id);
    await deleteContact(id);
  }

  await fullCRUD();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});