import { TNZAPI } from '../../../src';

const authToken = process.env.TNZ_AUTH_TOKEN;
const testContactID = process.env.TNZ_TEST_CONTACT_ID ?? '00000000-0000-0000-0000-000000000000';
const testWorkflowTemplateID = process.env.TNZ_TEST_WORKFLOW_TEMPLATE_ID ?? '00000000-0000-0000-0000-000000000000';

describe('Workflow Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    if (!process.env.TNZ_TEST_WORKFLOW_TEMPLATE_ID) console.warn('TNZ_TEST_WORKFLOW_TEMPLATE_ID not set — using null GUID fallback.');
    if (!process.env.TNZ_TEST_CONTACT_ID) console.warn('TNZ_TEST_CONTACT_ID not set — using null GUID fallback.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should send a Workflow message', async () => {
    const data = await client.Messaging.Workflow.SendMessage({
      WorkflowTemplateID: testWorkflowTemplateID,
      Destinations: [{ ContactID: testContactID }],
    });
    console.log('Response:', JSON.stringify(data, null, '  '));
    expect(data).toMatchObject({ Result: expect.any(String) });
  }, 15000);

});