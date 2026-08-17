/**
 * Addressbook Group Examples
 *
 * Demonstrates creating, reading, updating, and deleting groups,
 * and managing group membership (ContactGroup / GroupContact).
 *
 * Run: npx ts-node samples/addressbook/groups.ts
 *
 * Required env vars:
 *   TNZ_AUTH_TOKEN  - your API bearer token
 */

import { TNZAPI, ErrorResponseDTO } from '../../src';

const client = new TNZAPI();

// ─── Group CRUD ───────────────────────────────────────────────────────────────

async function listGroups() {
  const result = await client.Addressbook.Group.List({ RecordsPerPage: 20, Page: 1 });
  console.log('Groups:', result);
}

async function createGroup() {
  const result = await client.Addressbook.Group.Create({
    GroupName: 'VIP Customers',
    ViewEditBy: 'Account',
  });
  console.log('Created group:', result);
  return result;
}

async function getGroup(groupCode: string) {
  const result = await client.Addressbook.Group.Detail({ GroupCode: groupCode });
  console.log('Group detail:', result);
}

async function updateGroup(groupCode: string) {
  const result = await client.Addressbook.Group.Update({
    GroupCode: groupCode,
    GroupName: 'VIP Customers (Updated)',
  });
  console.log('Updated group:', result);
}

async function deleteGroup(groupCode: string) {
  const result = await client.Addressbook.Group.Delete({ GroupCode: groupCode });
  console.log('Deleted group:', result);
}

// ─── ContactGroup: List/manage groups a contact belongs to ───────────────────

async function listContactGroups(contactID: string) {
  const result = await client.Addressbook.ContactGroup.List({ ContactID: contactID });
  console.log('Groups for contact:', result);
}

async function addContactToGroup(contactID: string, groupCode: string) {
  const result = await client.Addressbook.ContactGroup.Create({ ContactID: contactID, GroupCode: groupCode });
  console.log('Added contact to group:', result);
}

async function removeContactFromGroup(contactID: string, groupCode: string) {
  const result = await client.Addressbook.ContactGroup.Delete({ ContactID: contactID, GroupCode: groupCode });
  console.log('Removed contact from group:', result);
}

// ─── GroupContact: List/manage contacts belonging to a group ─────────────────

async function listGroupContacts(groupCode: string) {
  const result = await client.Addressbook.GroupContact.List({ GroupCode: groupCode });
  console.log('Contacts in group:', result);
}

async function addContactToGroupViaGroupContact(groupCode: string, contactID: string) {
  const result = await client.Addressbook.GroupContact.Create({ GroupCode: groupCode, ContactID: contactID });
  console.log('Added (via GroupContact):', result);
}

// ─── Example: Full group lifecycle ───────────────────────────────────────────

async function fullGroupLifecycle() {
  // Create a group
  const group = await client.Addressbook.Group.Create({ GroupName: 'Demo Group' });
  if (group instanceof ErrorResponseDTO || !group.Group?.GroupCode) {
    console.error('Group creation failed:', group);
    return;
  }

  const groupCode = group.Group.GroupCode;
  console.log('Created group:', groupCode);

  // Create a contact
  const contact = await client.Addressbook.Contact.Create({
    FirstName: 'Demo',
    LastName: 'User',
    MobilePhone: '+6421000001',
  });
  if (contact instanceof ErrorResponseDTO || !contact.Contact?.ContactID) {
    console.error('Contact creation failed:', contact);
    await client.Addressbook.Group.Delete({ GroupCode: groupCode });
    return;
  }

  const contactID = contact.Contact.ContactID;
  console.log('Created contact:', contactID);

  // Add contact to group
  await client.Addressbook.GroupContact.Create({ GroupCode: groupCode, ContactID: contactID });
  console.log('Added contact to group');

  // List group members
  const members = await client.Addressbook.GroupContact.List({ GroupCode: groupCode });
  if (!(members instanceof ErrorResponseDTO)) {
    console.log('Group members:', members.TotalRecords);
  }

  // Remove contact from group
  await client.Addressbook.GroupContact.Delete({ GroupCode: groupCode, ContactID: contactID });
  console.log('Removed contact from group');

  // Cleanup
  await client.Addressbook.Contact.Delete({ ContactID: contactID });
  await client.Addressbook.Group.Delete({ GroupCode: groupCode });
  console.log('Cleanup complete');
}

// ─── Run all examples ────────────────────────────────────────────────────────

(async () => {
  await listGroups();
  await fullGroupLifecycle();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});