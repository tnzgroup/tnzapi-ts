import { toSdkCommonFields } from './common-field-mapping';

describe('toSdkCommonFields', () => {
    it('translates TemplateId, WebhookCallbackUrl, and passes ChargeCode through unchanged', () => {
        const result = toSdkCommonFields({
            TemplateId: 'tmpl-1',
            WebhookCallbackUrl: 'https://example.com/hook',
            WebhookCallbackFormat: 'JSON',
            ChargeCode: 'CC-1',
            Reference: 'ref-1',
        });
        expect(result).toMatchObject({
            TemplateID: 'tmpl-1',
            WebhookCallbackURL: 'https://example.com/hook',
            WebhookCallbackFormat: 'JSON',
            ChargeCode: 'CC-1',
            Reference: 'ref-1',
        });
    });

    it('maps SendMode=Test to Mode=Test', () => {
        expect(toSdkCommonFields({ SendMode: 'Test' })).toMatchObject({ Mode: 'Test' });
    });

    it('maps SendMode=Live (and undefined) to an omitted Mode', () => {
        expect(toSdkCommonFields({ SendMode: 'Live' }).Mode).toBeUndefined();
        expect(toSdkCommonFields({}).Mode).toBeUndefined();
    });
});
