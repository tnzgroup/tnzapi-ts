import { resolveFallbackMode } from './fallback-mode';

const SMS_ALLOWED = { Voice: 'Voice', RCS: 'RCS', WhatsApp: 'WAPP' };

describe('resolveFallbackMode', () => {
    it('returns undefined for an empty/undefined selection', () => {
        expect(resolveFallbackMode(undefined, SMS_ALLOWED)).toEqual({ ok: true, value: undefined });
        expect(resolveFallbackMode([], SMS_ALLOWED)).toEqual({ ok: true, value: undefined });
    });

    it('maps a single supported value through the allowed table', () => {
        expect(resolveFallbackMode(['WhatsApp'], SMS_ALLOWED)).toEqual({ ok: true, value: ['WAPP'] });
    });

    it('maps multiple supported values through the allowed table, preserving selection order', () => {
        expect(resolveFallbackMode(['WhatsApp', 'Voice'], SMS_ALLOWED)).toEqual({ ok: true, value: ['WAPP', 'Voice'] });
    });

    it('rejects a value unsupported on this channel', () => {
        expect(resolveFallbackMode(['Carrier'], SMS_ALLOWED)).toEqual({
            ok: false,
            error: "Unsupported FallbackMode 'Carrier' for this channel.",
        });
    });

    it('rejects the whole selection if any one value is unsupported, even alongside valid ones', () => {
        expect(resolveFallbackMode(['Voice', 'Carrier'], SMS_ALLOWED)).toEqual({
            ok: false,
            error: "Unsupported FallbackMode 'Carrier' for this channel.",
        });
    });
});
