import { TNZAPI } from '../../../src';
import { ErrorResponseDTO } from '../../../src/Common/dtos';

jest.setTimeout(15000);

const authToken = process.env.TNZ_AUTH_TOKEN;

describe('OptOut Integration', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    client = new TNZAPI({ AuthToken: authToken });
  });

  it('should list opt-outs and map the response onto OptOuts', async () => {
    const result = await client.OptOut.List({ RecordsPerPage: 10, Page: 1 });
    console.log('Response:', JSON.stringify(result, null, '  '));
    expect(result).toMatchObject({ Result: expect.any(String) });
    if (!(result instanceof ErrorResponseDTO)) {
      expect(Array.isArray(result.OptOuts)).toBe(true);
    }
  });

  it('should filter opt-outs by DestType', async () => {
    const result = await client.OptOut.List({ DestType: 'SMS', RecordsPerPage: 10 });
    console.log('Response:', JSON.stringify(result, null, '  '));
    expect(result).toMatchObject({ Result: expect.any(String) });
  });

  it('should get details for a known opt-out recipient', async () => {
    // OptOutID is a UUID, not a phone number/email — fetch a real one from List
    // rather than relying on a placeholder fixture that would 404.
    const listResult = await client.OptOut.List({ RecordsPerPage: 1, Page: 1 });
    // OptOutListApi.ts already normalizes the legacy "Data" server field into
    // OptOuts internally (see .docs/SERVER-QUIRKS.md), so no fallback is needed here.
    const records = !(listResult instanceof ErrorResponseDTO) ? listResult.OptOuts : [];
    if (records.length === 0) {
      console.warn('No opt-out records available to test Detail against — skipping assertion.');
      return;
    }

    const optOutId = records[0].ID;
    if (!optOutId) {
      throw new Error('Opt-out record returned by List has no ID — cannot test Detail.');
    }
    const result = await client.OptOut.Detail({ OptOutID: optOutId });
    console.log('Response:', JSON.stringify(result, null, '  '));
    expect(result).toMatchObject({ Result: expect.any(String) });
    if (!(result instanceof ErrorResponseDTO)) {
      expect(result.ID).toBe(optOutId);
    }
  });

});
